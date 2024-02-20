import knex from '../db.js';

export class SecretaryLDAPUser {
    static #deserialize(res) {
        if (!res) {
            return null;
        }
        const secLDAPUser = new SecretaryLDAPUser();
        for (const [key, val] of Object.entries(res)) {
            secLDAPUser[key] = val;
        }
        return secLDAPUser;
    };

    static async get(id) {
        const res = await knex.first().from('secretary_users').where('id', id);
        return SecretaryLDAPUser.#deserialize(res);
    }

    static async getByLdapId(ldap_id) {
        const res = await knex.first().from('secretary_users').where('ldap_id', ldap_id);
        return SecretaryLDAPUser.#deserialize(res);
    }

    static async getAll() {
        const res = await knex().select().from('secretary_users').orderBy('id', 'desc');
        if (!res) {
            return [];
        }
        return res.map(row => SecretaryLDAPUser.#deserialize(row));
    }

    static async create(ldap_id) {
        try {
            const insertedIdArr = await knex().insert({ldap_id: ldap_id }, 'id').into('secretary_users');
            return await SecretaryLDAPUser.get(insertedIdArr[0].id);
        } catch (err) {
            return null;
        }
    }

    async delete() {
        try {
            await knex('secretary_users')
                .where('id', this.id)
                .del();
            return true;
        } catch (err) {
            return false;
        }
    }
}
