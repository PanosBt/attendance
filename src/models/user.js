import knex from '../db.js';

export class User {
    static #deserialize(res) {
        if (!res) {
            return null;
        }
        const user = new User();
        for (const [key, val] of Object.entries(res)) {
            user[key] = val;
        }
        return user;
    };

    static async getAll() {
        const res = await knex().select().from('users').orderBy('id', 'desc');
        if (!res) {
            return [];
        }
        return res.map(row => User.#deserialize(row));
    };

    static async getById(id) {
        const res = await knex.first().from('users').where('id', id);
        return User.#deserialize(res);
    }

    static async getByUsername(username) {
        const res = await knex.first().from('users').where('username', username);
        return User.#deserialize(res);
    }

    static async create(username, password, ldap_id, name, role) {
        try {
            const insertedIdArr = await knex()
                .insert(
                    {
                        username: username,
                        password: password,
                        ldap_id: ldap_id,
                        name: name,
                        role: role
                    },
                    'id'
                )
                .into('users');
            return await User.getById(insertedIdArr[0].id);
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async updatePass() {
        try {
            await knex('users')
                .where('id', this.id)
                .update({ password: this.password });
            return true;
        } catch (err) {
            return false;
        }
    }

    async delete() {
        try {
            await knex('users')
                .where('id', this.id)
                .del();
            return true;
        } catch (err) {
            return false;
        }
    }
};
