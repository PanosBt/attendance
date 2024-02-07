import knex from '../db/db.js';

export class User {

    constructor(id, username, password, name, email, role, ldap_id) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.name = name;
        this.email = email;
        this.role = role;
        this.ldap_id = ldap_id;
    }

    static #deserialize(res) {
        if (!res) {
            return null;
        }
        return new User(
            res.id,
            res.username,
            res.password,
            res.name,
            res.email,
            res.role,
            res.ldap_id
        );
    }

    static async getAll() {
        const users = [];
        const res = await knex.select().from('users');
        if (!res) {
            return users;
        }
        for (const row of res) {
            users.push(User.#deserialize(row));
        }
        return users;
    };

    static async getById(id) {
        const res = await knex.first().from('users').where('id', id);
        return User.#deserialize(res);
    }

    static async getByUsername(username) {
        const res = await knex.first().from('users').where('username', username);
        return User.#deserialize(res);
    }
};
