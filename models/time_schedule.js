import knex from '../db/db.js';
import { Util } from '../util.js';

export class TimeSchedule {
    static #deserialize(res) {
        if (!res) {
            return null;
        }
        const timeSchedule = new TimeSchedule();
        for (const [key, val] of Object.entries(res)) {
            timeSchedule[key] = val;
        }
        timeSchedule['day'] = Util.dowToDay(timeSchedule.dow);
        return timeSchedule;
    }

    static async getAll() {
        const res = await knex()
            .select('time_schedules.*', 'courses.name AS course_name', 'rooms.name AS room_name')
            .from('time_schedules')
                .innerJoin('courses', 'time_schedules.course_id', '=', 'courses.id')
                .leftJoin('rooms', 'courses.room_id', '=', 'rooms.id')
            ;
        if (!res) {
            return [];
        }
        return res.map(row => TimeSchedule.#deserialize(row));
    }

    static async deleteInsertBatch(data) {
        console.log(data);
        await knex.transaction(async trx => {
            await trx('time_schedules').del();
            await knex('time_schedules').insert(data);
        });
    }
}