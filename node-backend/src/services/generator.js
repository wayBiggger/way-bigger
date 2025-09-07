const { generateProjects } = require('./gemini');
const { insertProject } = require('./db');
const { isTooSimilar, upsertProjectVector } = require('./embeddings');

async function generateForLevel(level, domain = 'web-development') {
  const ideas = await generateProjects(level, domain);
  const accepted = [];
  for (const idea of ideas) {
    const candidateText = `${idea.title} ${idea.description} ${idea.tech_stack}`;
    const tooSimilar = await isTooSimilar(candidateText, level, 0.85);
    if (tooSimilar) continue;
    const saved = await insertProject({ level, ...idea, validDays: 31 });
    await upsertProjectVector(saved.id, level, idea);
    accepted.push(saved);
  }
  return accepted;
}

async function generateAllDomainsForLevel(level) {
  const domains = ['web-development', 'ai-ml', 'mobile', 'cybersecurity', 'creative'];
  const allProjects = [];
  
  for (const domain of domains) {
    try {
      const domainProjects = await generateForLevel(level, domain);
      allProjects.push(...domainProjects);
      
      // Add delay to avoid rate limiting (15 requests per minute for free tier)
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
    } catch (error) {
      console.error(`Error generating projects for ${domain}:`, error);
      // If rate limited, wait longer before next domain
      if (error.status === 429) {
        console.log(`Rate limited, waiting 30 seconds before next domain...`);
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
      }
    }
  }
  
  return allProjects;
}

async function generateAllLevels() {
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const results = {};
  for (const lvl of levels) {
    results[lvl] = await generateForLevel(lvl);
  }
  return results;
}

module.exports = { generateForLevel, generateAllDomainsForLevel, generateAllLevels };


