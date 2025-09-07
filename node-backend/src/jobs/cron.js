const cron = require('node-cron');
const { wipeOrExpireOldProjects, initDb } = require('../services/db');
const { generateAllLevels } = require('../services/generator');

function scheduleMonthlyJob() {
  // Run at 00:00 on day-of-month 1.
  cron.schedule('0 0 1 * *', async () => {
    /* eslint-disable no-console */
    console.log('[CRON] Monthly regeneration started');
    try {
      await initDb();
      await wipeOrExpireOldProjects();
      await generateAllLevels();
      console.log('[CRON] Monthly regeneration completed');
    } catch (err) {
      console.error('[CRON] Error during regeneration', err);
    }
    /* eslint-enable no-console */
  });
}

module.exports = { scheduleMonthlyJob };


