const { Sequelize } = require('sequelize');

/**
 * Creates a new table named 'users' in the database with the specified columns.
 *
 * @param {Object} options - The options object.
 * @param {SequelizeQueryInterface} options.queryInterface - The Sequelize query interface.
 * @return {Promise<void>} A promise that resolves when the table is created.
 */
async function up( queryInterface ) {
  await queryInterface.createTable('Users', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    balance: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10000,
    },
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE,
  },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
    },
  });

  // balance can't be negative, so we add a balance constraint.
  await queryInterface.addConstraint('Users', {
    type: 'check',
    fields: [ 'balance' ],
    where: {
      balance: {
        [Sequelize.Op.gte]: 0
      }
    }
  });
}

async function down({context: queryInterface}) {
  await queryInterface.dropTable('users');
}

module.exports = { up, down };