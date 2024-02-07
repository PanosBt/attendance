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

    static async getActiveCourses(student_ldap_id) {
        const time_now = (new Date()).toLocaleTimeString();
        const res = await knex()
            .select(
                'courses.*',
                'time_schedules.time_from',
                'time_schedules.time_to',
                'rooms.name AS room_name',
                'users.name AS professor_name'
            )
            .from('courses')
                .innerJoin('courses_students', 'courses.id', '=', 'courses_students.course_id')
                .innerJoin('time_schedules', 'courses.id', '=', 'time_schedules.course_id')
                .innerJoin('rooms', 'courses.room_id', '=', 'rooms.id')
                .innerJoin('users', 'courses.professor_id', '=', 'users.id')
            .where('courses_students.student_ldap_id', '=', student_ldap_id)
            .andWhere('courses_students.is_active', '=', 'TRUE')
            .andWhereRaw('time_schedules.dow = EXTRACT(isodow from CURRENT_DATE)')
            .andWhere('time_schedules.time_from', '<=', time_now)
            .andWhere('time_schedules.time_to', '>=', time_now)
        ;
        const courses = [];
        if (!res) {
            return courses;
        }
        for (const row of res) {
            courses.push(Course.#deserialize(row));
        }
        return courses;
    }
}
