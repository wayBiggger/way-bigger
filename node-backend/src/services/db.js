const { Pool } = require('pg');
const dayjs = require('dayjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS generated_projects (
      id SERIAL PRIMARY KEY,
      level TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      tech_stack TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      outcome TEXT NOT NULL,
      generated_on TIMESTAMP NOT NULL,
      valid_till TIMESTAMP NOT NULL
    );
  `);
}

async function wipeOrExpireOldProjects() {
  // Mark expired by setting valid_till < now, or delete. We'll delete for simplicity.
  await pool.query('DELETE FROM generated_projects WHERE valid_till < NOW()');
}

async function insertProject(project) {
  const { level, title, description, tech_stack, difficulty, outcome, validDays = 31 } = project;
  const generated_on = dayjs().toDate();
  const valid_till = dayjs(generated_on).add(validDays, 'day').toDate();
  const result = await pool.query(
    `INSERT INTO generated_projects(level, title, description, tech_stack, difficulty, outcome, generated_on, valid_till)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [level, title, description, tech_stack, difficulty, outcome, generated_on, valid_till]
  );
  return result.rows[0];
}

async function getActiveProjectsByLevel(level) {
  const result = await pool.query(
    `SELECT id, title, description, tech_stack, difficulty, outcome
     FROM generated_projects
     WHERE level = $1 AND valid_till >= NOW()
     ORDER BY id DESC`,
    [level]
  );
  return result.rows;
}

module.exports = {
  pool,
  initDb,
  wipeOrExpireOldProjects,
  insertProject,
  getActiveProjectsByLevel,
};


