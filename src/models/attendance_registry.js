import knex from '../db.js';

export class AttendanceRegistry {
    static #deserialize(res) {
        if (!res) {
            return null;
        }
        const attendanceRegistry = new AttendanceRegistry();
        for (const [key, val] of Object.entries(res)) {
            attendanceRegistry[key] = val;
        }
        attendanceRegistry['date_str'] = (new Date(attendanceRegistry.date).toLocaleString(
            'el-GR',
            {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
            }
        ));
        return attendanceRegistry;
    }

    static async get(id) {
        const res = await knex
            .first(
                'attendance_registry.*',
                'courses.professor_ldap_id AS professor_ldap_id',
                'courses.name AS course_name',
                'rooms.name AS room_name'
            )
            .from('attendance_registry')
                .innerJoin('courses', 'attendance_registry.course_id', 'courses.id')
                .innerJoin('rooms', 'attendance_registry.room_id', 'rooms.id')
            .where('attendance_registry.id', id)
        ;
        return AttendanceRegistry.#deserialize(res);
    }

    static async getByCourseRoomDate(course_id, room_id, dateStr='') {
        const res = await knex().first()
            .from('attendance_registry')
            .where('course_id', course_id)
            .andWhere('room_id', room_id)
            .modify((queryBuilder) => {
                if (dateStr === '') {
                    queryBuilder.andWhereRaw('date = CURRENT_DATE');
                } else {
                    queryBuilder.andWhere('date', dateStr);
                }
            })
        ;
        return AttendanceRegistry.#deserialize(res);
    }

    static async getByCourse(course_id) {
        const res = await knex()
            .select('attendance_registry.*', 'rooms.name AS room_name')
            .from('attendance_registry')
                .innerJoin('rooms', 'attendance_registry.room_id', '=', 'rooms.id')
            .where('attendance_registry.course_id', course_id)
            .orderBy('attendance_registry.date', 'desc')
        ;
        if (!res) {
            return [];
        }
        return res.map(row => AttendanceRegistry.#deserialize(row));
    }

    static async create(course_id, room_id) {
        let insertedId = null;
        try {
            await knex.transaction(async trx => {
                const insertedIdArr = await trx()
                    .insert(
                        {
                            course_id: course_id,
                            room_id: room_id,
                            date: knex.raw('CURRENT_DATE')
                        },
                        'id'
                    )
                    .into('attendance_registry');
                ;
                insertedId = insertedIdArr[0].id;
            });
        } catch (err) {
        }
        return await AttendanceRegistry.get(insertedId);
    }

    async update() {
        try {
            await knex('attendance_registry')
                .where('id', this.id)
                .update({
                    course_id: this.course_id,
                    room_id: this.room_id,
                    date: this.date,
                    open: this.open,
                    finalized: this.finalized,
                });
            return true;
        } catch (err) {
            return false;
        }
    }

}
