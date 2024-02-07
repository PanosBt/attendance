const bcrypt = require('bcrypt');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
    await knex('courses').del();
    await knex('time_schedules').del();

    const pass = await bcrypt.hash('test', 10);

    const prof_insered_id = await knex('users').insert(
        {
            username: 'professor1',
            password: pass,
            name: 'test',
            email: 'test@test.com',
            role: 'professor'
        },
        ['id']
    );

    const room_insered_id = await knex('rooms').insert(
      {
          name: 'room3'
      },
      ['id']
  );

    const course_inserted_id = await knex('courses').insert(
        {
            professor_id: prof_insered_id[0].id,
            year_season: '2023-2024',
            semester: 1,
            room_id: room_insered_id[0].id,
            name: 'Test course'
        },
        ['id']
    );

    await knex('time_schedules').insert({
        course_id: course_inserted_id[0].id,
        dow: 1,
        time_from: '12:00',
        time_to: '15:00'
    });
};
