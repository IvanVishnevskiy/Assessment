const cluster = require('cluster');
const { Sequelize, User } = require('../database/db');
const express = require('express');
const app = express();
app.use(express.json());

/**
 * Runs the server with multiple workers. If the current process is the master process,
 * it forks a new worker for each available CPU core. If the current process is a worker
 * process, it sets up an Express app to handle requests and updates the balance of a user
 * in the database
 *
 * @return {void}
 */
const runServer = () => {
  // Run the server with multiple workers
  const numCPUs = require('os').cpus().length;
  if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', worker => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    app.use((req, res, next) => {
      // Use the same instance of express for all requests
      req.locals = { app };
      next();
    });
    app.post('/api/users/:userId/changeBalance', async (req, res) => {
      const userId = req.params.userId;
      const amount = parseInt(req.body.amount);

      if (isNaN(amount) || amount === 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      // Update the balance of the user in the database. If this results in an error, return it.
      // It would be better to return the error message instead of a generic error message, but that's not the scope of this exercise.
      try {
        await User.update({
          balance: Sequelize.literal(`balance ${ amount >= 0 ? '+' : '-'} ${Math.abs(amount)}`),
        }, {
          where: {
            id: userId,
          },
        });
      }
      catch(e) {
        return res.status(200).json({ error: e.original.detail });   
      }
      return res.status(200).json({ error: null });
    });

    app.listen(3000, () => {
      console.log(`Worker process ${process.pid} is listening on port 3000`);
    });
  }
}

module.exports = { runServer };