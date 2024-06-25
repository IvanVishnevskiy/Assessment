const { Model, Sequelize } = require('sequelize');

/**
 * Initializes a Sequelize model for a User.
 *
 * @param {Object} sequelize - The Sequelize instance.
 * @param {Object} DataTypes - The Sequelize data types.
 * @return {Object} The initialized User model.
 */
module.exports = (sequelize, DataTypes) => {
  class User extends Model {}
  User.init({
    id: DataTypes.integer,
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
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};