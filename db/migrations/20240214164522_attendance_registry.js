/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable('attendance_registry', (table) => {
            table.increments('id');
            table.integer('course_id').unsigned()
                .references('courses.id')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
            ;
            table.integer('room_id').unsigned()
                .references('rooms.id')
                .onUpdate('CASCADE')
                .onDelete('SET NULL')
            ;
            table.date('date');
            table.boolean('open').defaultTo(false);
            table.boolean('finalized').defaultTo(false);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('attendance_registry');
};
