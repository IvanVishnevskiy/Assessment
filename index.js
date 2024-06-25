const { Sequelize, sequelize } = require('./database/db');
const express = require('express');
const { runMigrations } = require('./database/migrate');
const { User } = require('./database/db');
const cluster = require('cluster');

const start = async () => {
  await runMigrations();

  // Add user with id 1 if not exists
  const [ user, created ] = await User.findOrCreate({ where: { id: 1, } });
  if (!user) {
    await User.create({ id: 1 });
  } else if (user && !created) {
    // reset user balance to 10000 for easier testing
    await User.update({ balance: 10000 }, { where: { id: 1 } });
  }

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

const runServers = () => {
  // Run the server with multiple workers
  const numCPUs = require('os').cpus().length;
  if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', worker => {
      console.log(`worker ${worker.process.pid} died`);
    });
    start()
  } else {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      // Use the same instance of express for all requests
      req.locals = { app };
      next();
    });
    app.post('/api/users/:userId/changeBalance', async (req, res, next) => {
      const userId = req.params.userId;
      const amount = parseInt(req.body.amount);

      if (isNaN(amount) || amount === 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }


      try {
        await User.update({
          balance: Sequelize.literal(`balance ${ amount >= 0 ? '+' : '-'} ${Math.abs(amount)}`),
        }, {
          where: {
            id: userId,
          },
        });
        res.status(200).json({ error: null });
      }
      catch(e) {
        res.status(200).json({ error: e.original.detail });   
      }
      console.log('running next')
      next();
    });

    app.listen(3000, err => {
      if(err) {
        console.log('Express error!', err)
      }
      console.log(`Worker process ${process.pid} is listening on port 3000`);
    });
  }
}

runServers();