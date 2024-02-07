/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .alterTable('users', (table) => {
            table.string('ldap_id').nullable().unique();
        })
        .createTable('courses_students', (table) => {
            table.increments('id');
            table.integer('course_id').unsigned()
                .references('courses.id')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
            ;
            table.string('student_ldap_id')
                .references('users.ldap_id')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
            ;
            table.boolean('is_active');
        })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('courses_students')
};
