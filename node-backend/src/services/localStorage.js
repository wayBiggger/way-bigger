const fs = require('fs');
const path = require('path');

class LocalProjectStorage {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log('Created data directory:', this.dataDir);
    }
  }

  getFilePath(level) {
    return path.join(this.dataDir, `${level}.json`);
  }

  async storeProjects(level, projects) {
    try {
      const filePath = this.getFilePath(level);
      const data = JSON.stringify(projects, null, 2);
      
      fs.writeFileSync(filePath, data);
      console.log(`Stored ${projects.length} ${level} projects to ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Error storing ${level} projects:`, error);
      return false;
    }
  }

  async getProjects(level) {
    try {
      const filePath = this.getFilePath(level);
      
      if (!fs.existsSync(filePath)) {
        console.log(`No projects found for level: ${level}`);
        return null;
      }
      
      const data = fs.readFileSync(filePath, 'utf8');
      const projects = JSON.parse(data);
      
      console.log(`Retrieved ${projects.length} ${level} projects from local storage`);
      return projects;
    } catch (error) {
      console.error(`Error retrieving ${level} projects:`, error);
      return null;
    }
  }

  async getAllProjects() {
    try {
      const levels = ['beginner', 'intermediate', 'advanced'];
      const allProjects = {};
      
      for (const level of levels) {
        const projects = await this.getProjects(level);
        if (projects) {
          allProjects[level] = projects;
        }
      }
      
      return allProjects;
    } catch (error) {
      console.error('Error retrieving all projects:', error);
      return {};
    }
  }

  async getProjectStats() {
    try {
      const levels = ['beginner', 'intermediate', 'advanced'];
      const stats = {};
      
      for (const level of levels) {
        const projects = await this.getProjects(level);
        stats[level] = projects ? projects.length : 0;
      }
      
      stats.total = Object.values(stats).reduce((sum, count) => sum + count, 0);
      return stats;
    } catch (error) {
      console.error('Error getting project stats:', error);
      return { beginner: 0, intermediate: 0, advanced: 0, total: 0 };
    }
  }

  async deleteProjects(level) {
    try {
      const filePath = this.getFilePath(level);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted ${level} projects from local storage`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error deleting ${level} projects:`, error);
      return false;
    }
  }

  async clearAllProjects() {
    try {
      const levels = ['beginner', 'intermediate', 'advanced'];
      let deleted = 0;
      
      for (const level of levels) {
        if (await this.deleteProjects(level)) {
          deleted++;
        }
      }
      
      console.log(`Cleared ${deleted} project files`);
      return deleted > 0;
    } catch (error) {
      console.error('Error clearing all projects:', error);
      return false;
    }
  }
}

module.exports = new LocalProjectStorage();
