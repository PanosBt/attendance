import knex from '../db/db.js';

export class Participation {
    static #deserialize(res) {
        if (!res) {
            return null;
        }
        const participation = new Participation();
        for (const [key, val] of Object.entries(res)) {
            participation[key] = val;
        }
        return participation;
    }

    static async getAll() {
        const res = await knex()
            .select('courses_students.*', 'courses.name AS course_name',)
            .from('courses_students')
                .innerJoin('courses', 'courses_students.course_id', '=', 'courses.id')
        ;
        if (!res) {
            return [];
        }
        return res.map(row => Participation.#deserialize(row));
    }

    static async insertBatch(data) {
        await knex('courses_students')
            .insert(data)
            .onConflict(['course_id', 'student_ldap_id']).merge()
        ;
    }
}
