/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .alterTable('courses', (table) => {
            table.dropForeign('professor_ldap_id');
        })
        .alterTable('courses_students', (table) => {
            table.dropForeign('student_ldap_id');
        })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {

};
