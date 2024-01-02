import knex from '../db/db.js';

export class User {

    constructor(id, username, password, name, email, role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    static async getAll() {
        const users = [];
        const res = await knex.select().from('users');
        if (!res) {
            return users;
        }
        for (const row of res) {
            users.push(new User(
                row.id,
                row.username,
                row.password,
                row.name,
                row.email,
                row.role
            ));
        }
        return users;
    };
};
