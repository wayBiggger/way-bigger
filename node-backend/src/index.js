require('dotenv').config();
const { startServer } = require('./server');

(async () => {
  await startServer();
})();


