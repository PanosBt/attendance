import knex from '../db/db.js';

export class Room {

    // TODO improve / DRY
    static #deserialize(res) {
        if (!res) {
            return null;
        }
        const course = new Room();
        for (const [key, val] of Object.entries(res)) {
            if (key == 'layout') {
                course[key] = JSON.parse(val);
            } else {
                course[key] = val;
            }
        }
        return course;
    }

    static async getAll() {
        const res = await knex().select().from('rooms').orderBy('id');
        if (!res) {
            return [];
        }
        return res.map(row => Room.#deserialize(row));
    }

    static async get(id) {
        const res = await knex.first().from('rooms').where('id', id);
        return Room.#deserialize(res);
    }

    static async getByName(name) {
        const res = await knex.first().from('rooms').where('name', name);
        return Room.#deserialize(res);
    }

    static async create(roomName, layout) {
        try {
            const insertedIdArr = await knex()
                .insert(
                    {name: roomName, layout: JSON.stringify(layout)},
                    'id'
                )
                .into('rooms');
            return Room.get(insertedIdArr[0].id);
        } catch (err) {
            return null;
        }
    }

    async update() {
        try {
            await knex('rooms')
                .where('id', this.id)
                .update({
                    name: this.name,
                    layout: JSON.stringify(this.layout)
                });
            return true;
        } catch (err) {
            return false;
        }
    }

    async delete() {
        try {
            await knex('rooms')
                .where('id', this.id)
                .del();
            return true;
        } catch (err) {
            return false;
        }
    }
}