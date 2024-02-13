import knex from '../db/db.js';

export class Attendance {
    static #deserialize(res) {
        if (!res) {
            return null;
        }
        const attendance = new Attendance();
        for (const [key, val] of Object.entries(res)) {
            attendance[key] = val;
        }
        attendance['datetime_str'] = (new Date(attendance.datetime).toLocaleString(
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
        ;
        return res.map(row => Attendance.#deserialize(row));
    }

    static async getTodayAttendance(room_id, course_id, student_ldap_id=null) {
        const res = await knex.select()
            .from('attendance')
            .where('room_id', room_id)
            .andWhere('course_id', course_id)
            .andWhereRaw('datetime::date = CURRENT_DATE')
            .modify((queryBuilder) => {
                if (student_ldap_id) {
                    queryBuilder.andWhere('student_ldap_id', student_ldap_id);
                }
            })
        ;
        return res.map(row => Attendance.#deserialize(row));
    }

    static async getTodayOccupiedSeats(room_id, course_id) {
        const allTodayAttendance = await Attendance.getTodayAttendance(room_id, course_id);
        const occupiedSeats = {};
        allTodayAttendance.forEach(attendanceRecord => {
            occupiedSeats[attendanceRecord.seat_index] = 1;
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
        return Attendance.get(insertedId);
    }
}
