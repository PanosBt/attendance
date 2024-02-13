/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .alterTable('courses_students', (table) => {
            table.unique(['course_id', 'student_ldap_id']);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .alterTable('courses_students', (table) => {
            table.dropUnique(['course_id', 'student_ldap_id']);
        });
};
