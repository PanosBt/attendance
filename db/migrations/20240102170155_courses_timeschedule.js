/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable('courses', (table) => {
            table.increments('id');
            table.integer('professor_id').unsigned()
                .references('users.id')
                .onUpdate('CASCADE')
                .onDelete('SET NULL')
            ;
            table.string('year_season', 20);
            table.integer('semester').unsigned();
            table.integer('room_id').unsigned()
                .references('rooms.id')
                .onUpdate('CASCADE')
                .onDelete('SET NULL')
            ;
            table.string('name');
        })
        .createTable('time_schedules', (table) => {
            table.increments('id');
            table.integer('course_id').unsigned()
                .references('courses.id')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
            ;
            table.integer('dow').unsigned().comment('day of week: 1-7 => Monday-Sunday');
            table.time('time_from');
            table.time('time_to');
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('time_schedules')
        .dropTableIfExists('courses');
};
