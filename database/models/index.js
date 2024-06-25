'use strict';


// This file imports all the models in the models directory and exports them
// through db + it exports sequelize. The models are then used in other parts of the application to
// interact with the database.

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize({
  dialect: 'postgres',
  username: 'postgres',
  password: 'admin',
  database: 'assessment',
  host: '127.0.0.1',
  logging: false,
  ssl: true,
  dialectOptions: {
    clientMinMessages: 'notice',
  },
})

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
