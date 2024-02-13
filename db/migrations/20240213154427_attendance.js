/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable('attendance', (table) => {
            table.increments('id');
            table.string('student_ldap_id');
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
            table.string('seat_index');
            table.dateTime('datetime');
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('attendance');
};
