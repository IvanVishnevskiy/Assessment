// const db = require('./db');
const { sequelize, Sequelize } = require('./db');
const { Umzug, SequelizeStorage } = require('umzug');

async function runMigrations() {
  const umzug = new Umzug({
    migrations: {
      glob: ['./migrations/*.js', { cwd: __dirname }],
      resolve: ({ name, path, context }) => {
        // adjust the migration parameters Umzug will
        // pass to migration methods, this is done because 
        // Sequilize-CLI generates migrations that require 
        // two parameters be passed to the up and down methods
        // but by default Umzug will only pass the first
        const migration = require(path || '')
        return {
            name,
            up: async () => migration.up(context, Sequelize),
            down: async () => migration.down(context, Sequelize),
        }
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  await (async () => {
      try {
          await sequelize.authenticate()
          await umzug.up()
          console.log('Connection established and migrations run.')
      } catch (error) {
          console.error('Unable to connect to the database:', error)
      }
  })()
}

module.exports = { runMigrations };