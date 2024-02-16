const bcrypt = require('bcrypt');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
    await Promise.all([knex('users').del(), knex('rooms').del()]);
    const pass = await bcrypt.hash('test', 10);
    const users = [];
    for (const role of ['student', 'professor', 'secretary', 'admin']) {
        users.push({
            username: role,
            password: pass,
            name: `${role}${role != 'admin' ? ' test' : ''}`,
            role: role,
            ldap_id: role
        })
    }
    await Promise.all([
        knex('users').insert(users),
        knex('rooms').insert([{name: 'room1'}, {name: 'room2'}])
    ]);
};
