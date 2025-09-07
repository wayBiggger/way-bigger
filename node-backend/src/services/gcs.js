const { Storage } = require('@google-cloud/storage');
const path = require('path');

class GCSProjectStorage {
  constructor() {
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
    this.bucketName = process.env.GCS_BUCKET_NAME || 'waybigger-projects';
    this.bucket = this.storage.bucket(this.bucketName);
  }

  async ensureBucketExists() {
    try {
      const [exists] = await this.bucket.exists();
      if (!exists) {
        await this.bucket.create({
          location: 'US',
          storageClass: 'STANDARD'
        });
        console.log(`Bucket ${this.bucketName} created.`);
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      throw error;
    }
  }

  async storeProjects(level, projects) {
    try {
      await this.ensureBucketExists();
      
      const fileName = `projects/${level}.json`;
      const file = this.bucket.file(fileName);
      
      const data = JSON.stringify(projects, null, 2);
      
      await file.save(data, {
        metadata: {
          contentType: 'application/json',
          cacheControl: 'public, max-age=3600'
        }
      });
      
      console.log(`Stored ${projects.length} ${level} projects in GCS`);
      return true;
    } catch (error) {
      console.error(`Error storing ${level} projects:`, error);
      return false;
    }
  }

  async getProjects(level) {
    try {
      const fileName = `projects/${level}.json`;
      const file = this.bucket.file(fileName);
      
      const [exists] = await file.exists();
      if (!exists) {
        console.log(`No projects found for level: ${level}`);
        return null;
      }
      
      const [data] = await file.download();
      const projects = JSON.parse(data.toString());
      
      console.log(`Retrieved ${projects.length} ${level} projects from GCS`);
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

  async deleteProjects(level) {
    try {
      const fileName = `projects/${level}.json`;
      const file = this.bucket.file(fileName);
      
      await file.delete();
      console.log(`Deleted ${level} projects from GCS`);
      return true;
    } catch (error) {
      console.error(`Error deleting ${level} projects:`, error);
      return false;
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
}

module.exports = new GCSProjectStorage();
