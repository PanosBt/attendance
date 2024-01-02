/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable('users', (table) => {
            table.increments('id');
            table.string('username', 20).notNullable();
            table.string('password', 255).notNullable();
            table.string('name', 255).notNullable();
            table.string('email', 40).notNullable();
            table.string('role', 100).notNullable();
        })
        .createTable('rooms', (table) => {
            table.increments('id');
            table.string('name', 255).notNullable();
            table.text('layout').nullable();
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('users')
        .dropTableIfExists('rooms');
};
