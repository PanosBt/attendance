/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.raw(`
        CREATE UNIQUE INDEX seat_course_room_date_index
        ON attendance(seat_index, course_id, room_id, date_trunc('day', datetime AT TIME ZONE 'GMT'))
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .alterTable('attendance', (table) => {
            table.dropIndex('', 'seat_course_room_date_index');
        });
};
