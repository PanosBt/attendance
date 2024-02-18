const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '.env')});

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    client: 'postgresql',
    connection: {
        host: process.env.NODE_ENV == 'production' ? 'host.docker.internal' : 'localhost',
        database: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.NODE_ENV == 'production' ? 5432 : 5434,
        timezone: 'EET'
    },
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        tableName: 'knex_migrations'
    }
};
