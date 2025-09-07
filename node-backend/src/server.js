const express = require('express');
const projectsRouter = require('./routes/projects');

async function startServer() {
  const app = express();
  app.use(express.json());

  // Add CORS headers
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (origin.includes('localhost:3000') || origin.includes('localhost:3001') || origin.includes('localhost:3002'))) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/projects', projectsRouter);

  const port = process.env.PORT || 4000;
  return new Promise((resolve) => {
    app.listen(port, () => {
      /* eslint-disable no-console */
      console.log(`Server running on http://localhost:${port}`);
      /* eslint-enable no-console */
      resolve();
    });
  });
}

module.exports = { startServer };


