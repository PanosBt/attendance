/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .alterTable('attendance_registry', (table) => {
            table.unique(['course_id', 'room_id', 'date']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .alterTable('attendance_registry', (table) => {
            table.dropUnique(['course_id', 'room_id', 'date']);
    });
};
