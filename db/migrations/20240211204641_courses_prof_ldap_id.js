/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .alterTable('courses', (table) => {
            table.dropForeign('professor_id');
            table.renameColumn('professor_id', 'professor_ldap_id');
        })
        .alterTable('courses', (table) => {
            table.string('professor_ldap_id').alter();
            table.foreign('professor_ldap_id')
                .references('users.ldap_id')
                .onUpdate('CASCADE')
                .onDelete('SET NULL');
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .alterTable('courses', (table) => {
            table.dropForeign('professor_ldap_id');
            table.renameColumn('professor_ldap_id', 'professor_id');
        })
        .alterTable('courses', (table) => {
            table.integer('professor_id').unsigned()
                .references('users.id')
                .onUpdate('CASCADE')
                .onDelete('SET NULL')
                .alter();
        });
};
