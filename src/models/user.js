import knex from '../db.js';

export class User {
    constructor(username, name, role, ldap_id, local_user) {
        this.username = username;
        this.name = name;
        this.role = role;
        this.ldap_id = ldap_id;
        this.local_user = local_user;
    }

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

    static ldapTitleToRole(ldapTitle) {
        if (ldapTitle.toLowerCase().includes('φοιτητ')) {
            return 'student';
        }
        if (
            ldapTitle.toLowerCase().includes('καθηγ') ||
            ldapTitle.toLowerCase().includes('λέκτορα') ||
            ldapTitle.toLowerCase().includes('λεκτορα') ||
            ldapTitle.toLowerCase().includes('διδακ')
        ) {
            return 'professor';
        }
        return '';
    }

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
