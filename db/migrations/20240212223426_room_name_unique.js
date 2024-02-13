/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .alterTable('rooms', (table) => {
            table.unique('name');
        }
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
      return knex.schema
        .alterTable('rooms', (table) => {
            table.dropUnique('name');
        }
    );
};
