import knex from '../db/db.js';

export class Room {
    static #deserialize(res) {
        if (!res) {
            return null;
        }
        const room = new Room();
        for (const [key, val] of Object.entries(res)) {
            if (key == 'layout') {
                room[key] = JSON.parse(val);
            } else {
                room[key] = val;
            }
        }
        return room;
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
            return await Room.get(insertedIdArr[0].id);
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