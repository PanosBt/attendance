import knex from '../db.js';

export class Attendance {
    static #deserialize(res) {
        if (!res) {
            return null;
        }
        const attendance = new Attendance();
        for (const [key, val] of Object.entries(res)) {
            attendance[key] = val;
        }
        attendance.datetime_str = (new Date(attendance.datetime).toLocaleString(
            'el-GR',
            {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23'
            }
        ));
        let seatParts = attendance.seat_index.split('_');
        attendance.seat_desc = `Σειρά ${parseInt(seatParts[0]) + 1} - Θέση ${parseInt(seatParts[1])}`;
        attendance.seat_desc_short = `Σ:${parseInt(seatParts[0]) + 1} Θ:${parseInt(seatParts[1])}`;
        return attendance;
    }

    static async get(id) {
        const res = await knex.first().from('attendance').where('id', id);
        return Attendance.#deserialize(res);
    }

    static async getByStudentLdapId(student_ldap_id) {
        const res = await knex
            .select(
                'attendance.*',
                'courses.name AS course_name',
                'rooms.name AS room_name'
            )
            .from('attendance')
                .innerJoin('courses', 'attendance.course_id', '=', 'courses.id')
                .innerJoin('rooms', 'attendance.room_id', '=', 'rooms.id')
            .where('student_ldap_id', student_ldap_id)
            .orderBy('attendance.datetime', 'desc')
            .limit(50)
        ;
        if (!res) {
            return [];
        }
        return res.map(row => Attendance.#deserialize(row));
    }

    static async getCourseAttendance(room_id, course_id, student_ldap_id=null, dateStr='') {
        const res = await knex
            .select('attendance.*', 'users.name AS student_name')
            .from('attendance')
                .leftJoin('users', 'attendance.student_ldap_id', '=', 'users.ldap_id')
            .where('room_id', room_id)
            .andWhere('course_id', course_id)
            .modify((queryBuilder) => {
                if (dateStr === '') {
                    queryBuilder.andWhereRaw('datetime::date = CURRENT_DATE');
                } else {
                    queryBuilder.andWhereRaw('datetime::date = ?', dateStr);
                }
                if (student_ldap_id) {
                    queryBuilder.andWhere('student_ldap_id', student_ldap_id);
                }
            })
        ;
        if (!res) {
            return [];
        }
        return res.map(row => Attendance.#deserialize(row));
    }

    static async getByAttendanceRegistry(attendance_registry_id) {
        const res = await knex
            .select('attendance.*', 'users.name AS student_name')
            .from('attendance')
                .innerJoin('attendance_registry', function() {
                    this
                        .on('attendance_registry.course_id', 'attendance.course_id')
                        .andOn('attendance_registry.room_id', 'attendance.room_id')
                        .andOn(knex.raw('attendance_registry.date = attendance.datetime::date'))
                })
                .leftJoin('users', 'attendance.student_ldap_id', 'users.ldap_id')
            .where('attendance_registry.id', attendance_registry_id)
        ;
        if (!res) {
            return [];
        }
        return res.map(row => Attendance.#deserialize(row));
    }

    static async getOccupiedSeats(room_id, course_id, dateStr='') {
        const attendance = await Attendance.getCourseAttendance(room_id, course_id, null, dateStr);
        const occupiedSeats = {
            total: attendance.length
        };
        attendance.forEach(attendanceRecord => {
            occupiedSeats[attendanceRecord.seat_index] = {
                student_ldap_id: attendanceRecord.student_ldap_id,
                student_name: attendanceRecord.student_name ?? '',
                datetime_str: attendanceRecord.datetime_str,
                attendance_record_id: attendanceRecord.id
            };
        });
        return occupiedSeats;
    }

    static async create(student_ldap_id, course_id, room_id, seat_index) {
        let insertedId = null;
        try {
            await knex.transaction(async trx => {
                const insertedIdArr = await trx()
                    .insert(
                        {
                            student_ldap_id: student_ldap_id,
                            course_id: course_id,
                            room_id: room_id,
                            seat_index: seat_index,
                            datetime: knex.fn.now()
                        },
                        'id'
                    )
                    .into('attendance')
                ;
                insertedId = insertedIdArr[0].id;
            });
        } catch (err) {
        }
        return await Attendance.get(insertedId);
    }

    async delete() {
        try {
            await knex('attendance')
                .where('id', this.id)
                .del();
            return true;
        } catch (err) {
            return false;
        }
    }
}
