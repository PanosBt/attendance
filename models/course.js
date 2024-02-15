import knex from '../db/db.js';

export class Course {
    static #deserialize(res) {
        if (!res) {
            return null;
        }
        const course = new Course();
        for (const [key, val] of Object.entries(res)) {
            course[key] = val;
        }
        return course;
    }

    static async get(id) {
        const res = await knex().first().from('courses').where('id', id);
        if (res) {
            return Course.#deserialize(res);
        }
        return null;
    }

    static async getByName(name) {
        const res = await knex.first().from('courses').where('name', name);
        return Course.#deserialize(res);
    }

    static async getByProfessorLdapId(professor_ldap_id, course_id = null) {
        const res = await knex
            .select('courses.*', 'rooms.name AS room_name')
            .from('courses')
                .innerJoin('rooms', 'courses.room_id', '=', 'rooms.id')
            .where('professor_ldap_id', professor_ldap_id)
            .modify((queryBuilder) => {
                if (course_id) {
                    queryBuilder.andWhere('courses.id', course_id);
                }
            })
            .orderBy('semester');
        if (!res) {
            return [];
        }
        return res.map(row => Course.#deserialize(row));
    }

    static async getAll() {
        const res = await knex()
            .select('courses.*', 'users.name AS professor_name', 'rooms.name AS room_name')
            .from('courses')
                .leftJoin('users', 'courses.professor_ldap_id', '=', 'users.ldap_id')
                .leftJoin('rooms', 'courses.room_id', '=', 'rooms.id')
            ;
        if (!res) {
            return [];
        }
        return res.map(row => Course.#deserialize(row));
    }

    static async getActiveCourses(ldap_id, course_id = null, user_role='student') {
        const time_now = (new Date()).toLocaleTimeString();
        const res = await knex()
            .select(
                'courses.*',
                'time_schedules.time_from',
                'time_schedules.time_to',
                'rooms.name AS room_name',
                'users.name AS professor_name',
                'attendance_registry.finalized AS attendances_finalized'
            )
            .from('courses')
                .innerJoin('time_schedules', 'courses.id', '=', 'time_schedules.course_id')
                .innerJoin('rooms', 'courses.room_id', '=', 'rooms.id')
                .innerJoin('users', 'courses.professor_ldap_id', '=', 'users.ldap_id')
                .leftJoin('attendance_registry', function() {
                    this
                        .on('attendance_registry.course_id', 'courses.id')
                        .andOn('attendance_registry.room_id', 'rooms.id')
                        .andOn(knex.raw('attendance_registry.date = CURRENT_DATE'))
                })
                .modify((queryBuilder) => {
                    if (user_role == 'student') {
                        queryBuilder.innerJoin('courses_students', 'courses.id', '=', 'courses_students.course_id');
                        queryBuilder.where('courses_students.student_ldap_id', ldap_id);
                    } else { // professor
                        queryBuilder.where('courses.professor_ldap_id', ldap_id);
                    }

                })
                .andWhereRaw('time_schedules.dow = EXTRACT(isodow from CURRENT_DATE)')
                .andWhere('time_schedules.time_from', '<=', time_now)
                .andWhere('time_schedules.time_to', '>=', time_now)
                .modify((queryBuilder) => {
                    if (course_id) {
                        queryBuilder.andWhere('courses.id', '=', course_id);
                    }
                })
            ;
        if (!res) {
            return [];
        }
        return res.map(row => Course.#deserialize(row));
    }

    static async deleteInsertBatch(data) {
        await knex.transaction(async trx => {
            await trx('courses').del();
            await trx('courses').insert(data);
        });
    }
}
