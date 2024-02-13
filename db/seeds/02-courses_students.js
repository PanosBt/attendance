const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
    await knex('courses_students').del();

    const pass = await bcrypt.hash('test', 10);

    const prof_inserted_ldap_id = await knex('users').insert(
        {
            username: 'professor2',
            password: pass,
            name: 'Test',
            email: 'test@test.com',
            role: 'professor',
            ldap_id: 'professor2'
        },
        ['ldap_id']
    );

    const room_insered_id = await knex('rooms').insert(
        {
            name: 'room4'
        },
        ['id']
    );

    const course2_inserted_id = await knex('courses').insert(
        {
            professor_ldap_id: prof_inserted_ldap_id[0].ldap_id,
            year_season: '2023-2024',
            semester: 2,
            room_id: room_insered_id[0].id,
            name: 'Test course 2'
        },
        ['id']
    );

    const course3_inserted_id = await knex('courses').insert(
        {
            professor_ldap_id: prof_inserted_ldap_id[0].ldap_id,
            year_season: '2023-2024',
            semester: 4,
            room_id: room_insered_id[0].id,
            name: 'Test course 3'
        },
        ['id']
    );

    for (const n of Array(7).keys()) {
        await knex('time_schedules').insert({
            course_id: course2_inserted_id[0].id,
            dow: n + 1,
            time_from: '00:01',
            time_to: '23:59'
        });
        await knex('time_schedules').insert({
            course_id: course3_inserted_id[0].id,
            dow: n + 1,
            time_from: '00:01',
            time_to: '23:59'
        });
    }

    const ldap_id = 'it21471';

    await knex('users').insert(
        {
            username: 'it21471',
            password: pass,
            name: 'Panos',
            email: 'it21471@test.com',
            role: 'student',
            ldap_id: ldap_id
        },
        ['id']
    );

    await knex('courses_students').insert(
        {
            course_id: course2_inserted_id[0].id,
            student_ldap_id: ldap_id,
            is_active: true,
        },
        ['id']
    );

    await knex('courses_students').insert(
        {
            course_id: course3_inserted_id[0].id,
            student_ldap_id: ldap_id,
            is_active: true,
        },
        ['id']
    );
};
