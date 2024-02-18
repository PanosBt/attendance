const bcrypt = require('bcrypt');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    await knex('users').del()
    const pass = await bcrypt.hash('admin', 10);
    await knex('users').insert([
        {
            username: 'admin',
            password: pass,
            name: 'Admin',
            role: 'admin'
        }
    ]);
};
