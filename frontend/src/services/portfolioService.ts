/**
 * Portfolio Service
 * Manages portfolio data, generation, and synchronization
 */

import { 
  PortfolioProject, 
  PortfolioUser, 
  ResumeData, 
  PortfolioStats, 
  PortfolioSettings,
  PortfolioGenerationOptions,
  LinkedInPost,
  GitHubIntegration,
  DemoLink,
  PortfolioExport,
  PortfolioAnalytics
} from '@/types/portfolio';
import AIDescriptionGenerator, { ProjectData, GenerationOptions } from './aiDescriptionGenerator';

class PortfolioService {
  private static instance: PortfolioService;
  private API_BASE_URL: string;
  private aiGenerator: AIDescriptionGenerator;

  private constructor() {
    this.API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    this.aiGenerator = AIDescriptionGenerator.getInstance();
  }

  public static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  /**
   * Convert project data to portfolio project
   */
  public async convertProjectToPortfolio(
    projectData: ProjectData,
    userId: string,
    options: GenerationOptions = {
      tone: 'professional',
      length: 'medium',
      focus: 'impact',
      targetAudience: 'recruiter',
      industry: 'technology'
    }
  ): Promise<PortfolioProject> {
    try {
      // Generate AI analysis
      const aiAnalysis = await this.aiGenerator.generateProfessionalDescription(projectData, options);
      const projectAnalysis = await this.aiGenerator.analyzeProjectImpact(projectData);
      const outcomes = await this.aiGenerator.generateProjectOutcomes(projectData);

      // Create portfolio project
      const portfolioProject: PortfolioProject = {
        id: `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title: projectData.title,
        professionalDescription: aiAnalysis.professionalDescription,
        technicalDescription: projectData.description,
        techStack: projectData.techStack,
        outcomes: outcomes,
        githubUrl: undefined, // Will be set later
        liveUrl: undefined, // Will be set later
        screenshots: [], // Will be populated later
        skillsLearned: aiAnalysis.skillTags,
        industryRelevance: aiAnalysis.industryRelevance,
        completionDate: new Date(),
        timeSpent: projectData.timeSpent,
        difficultyLevel: projectData.difficultyLevel,
        projectType: projectData.projectType as any,
        status: 'completed',
        tags: aiAnalysis.keywords,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to backend
      await this.savePortfolioProject(portfolioProject);

      return portfolioProject;
    } catch (error) {
      console.error('Failed to convert project to portfolio:', error);
      throw new Error('Portfolio conversion failed');
    }
  }

  /**
   * Save portfolio project to backend
   */
  public async savePortfolioProject(project: PortfolioProject): Promise<PortfolioProject> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/portfolio/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error(`Failed to save portfolio project: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to save portfolio project:', error);
      throw error;
    }
  }

  /**
   * Get user's portfolio projects
   */
  public async getPortfolioProjects(userId: string, options: {
    limit?: number;
    offset?: number;
    featured?: boolean;
    difficulty?: string[];
    technologies?: string[];
  } = {}): Promise<PortfolioProject[]> {
    try {
      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append('limit', options.limit.toString());
      if (options.offset) queryParams.append('offset', options.offset.toString());
      if (options.featured !== undefined) queryParams.append('featured', options.featured.toString());
      if (options.difficulty) queryParams.append('difficulty', options.difficulty.join(','));
      if (options.technologies) queryParams.append('technologies', options.technologies.join(','));

      const response = await fetch(`${this.API_BASE_URL}/portfolio/projects/${userId}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio projects: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch portfolio projects:', error);
      return [];
    }
  }

  /**
   * Get portfolio project by ID
   */
  public async getPortfolioProject(projectId: string): Promise<PortfolioProject | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/portfolio/projects/single/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio project: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch portfolio project:', error);
      return null;
    }
  }

  /**
   * Update portfolio project
   */
  public async updatePortfolioProject(projectId: string, updates: Partial<PortfolioProject>): Promise<PortfolioProject> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/portfolio/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update portfolio project: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update portfolio project:', error);
      throw error;
    }
  }

  /**
   * Delete portfolio project
   */
  public async deletePortfolioProject(projectId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/portfolio/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to delete portfolio project:', error);
      return false;
    }
  }

  /**
   * Get user's portfolio profile
   */
  public async getPortfolioUser(userId: string): Promise<PortfolioUser | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/portfolio/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch portfolio user:', error);
      return null;
    }
  }

  /**
   * Update user's portfolio profile
   */
  public async updatePortfolioUser(userId: string, updates: Partial<PortfolioUser>): Promise<PortfolioUser> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/portfolio/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update portfolio user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update portfolio user:', error);
      throw error;
    }
  }

  /**
   * Generate resume data
   */
  public async generateResumeData(userId: string, options: PortfolioGenerationOptions = {
    includePersonalInfo: true,
    includeContactInfo: true,
    includeSocialLinks: true,
    includeSkills: true,
    includeExperience: true,
    includeEducation: true,
    includeCertifications: true,
    includeAchievements: true,
    projectLimit: 10,
    featuredOnly: false
  }): Promise<ResumeData> {
    try {
      const [user, projects] = await Promise.all([
        this.getPortfolioUser(userId),
        this.getPortfolioProjects(userId, {
          limit: options.projectLimit,
          featured: options.featuredOnly,
          difficulty: options.difficultyFilter,
          technologies: options.technologyFilter
        })
      ]);

      if (!user) {
        throw new Error('User not found');
      }

      const resumeData: ResumeData = {
        personalInfo: {
          name: user.displayName,
          email: options.includeContactInfo ? user.email : '',
          location: user.location,
          website: user.website,
          linkedin: user.linkedinUrl,
          github: user.githubUsername
        },
        summary: user.bio,
        experience: [], // Will be populated from user data
        education: [], // Will be populated from user data
        skills: {
          technical: user.skills,
          soft: [], // Will be populated from analysis
          languages: user.languages
        },
        projects: projects,
        certifications: user.certifications.map(cert => ({
          id: `cert_${Date.now()}`,
          name: cert,
          issuer: 'Unknown',
          issueDate: new Date(),
          url: undefined
        })),
        achievements: [] // Will be populated from project analysis
      };

      return resumeData;
    } catch (error) {
      console.error('Failed to generate resume data:', error);
      throw error;
    }
  }

  /**
   * Get portfolio statistics
   */
  public async getPortfolioStats(userId: string): Promise<PortfolioStats> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/portfolio/stats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch portfolio stats:', error);
      return this.generateFallbackStats();
    }
  }

  /**
   * Generate LinkedIn post for project
   */
  public async generateLinkedInPost(projectId: string): Promise<LinkedInPost> {
    try {
      const project = await this.getPortfolioProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const projectData: ProjectData = {
        title: project.title,
        description: project.technicalDescription,
        techStack: project.techStack,
        files: [], // Not needed for LinkedIn post
        timeSpent: project.timeSpent,
        difficultyLevel: project.difficultyLevel,
        projectType: project.projectType
      };

      const linkedInContent = await this.aiGenerator.generateLinkedInPost(projectData);

      const linkedInPost: LinkedInPost = {
        id: `linkedin_${Date.now()}`,
        projectId,
        content: linkedInContent.content,
        hashtags: linkedInContent.hashtags,
        mediaUrls: linkedInContent.mediaSuggestions,
        published: false,
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0
        }
      };

      return linkedInPost;
    } catch (error) {
      console.error('Failed to generate LinkedIn post:', error);
      throw error;
    }
  }

  /**
   * Integrate GitHub repository
   */
  public async integrateGitHubRepository(projectId: string, repositoryUrl: string): Promise<GitHubIntegration> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/portfolio/github/integrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({
          projectId,
          repositoryUrl
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to integrate GitHub repository: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to integrate GitHub repository:', error);
      throw error;
    }
  }

  /**
   * Add demo link for project
   */
  public async addDemoLink(projectId: string, demoData: Omit<DemoLink, 'id' | 'projectId' | 'createdAt'>): Promise<DemoLink> {
    try {
      const demoLink: DemoLink = {
        id: `demo_${Date.now()}`,
        projectId,
        ...demoData,
        createdAt: new Date()
      };

      const response = await fetch(`${this.API_BASE_URL}/portfolio/demo-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify(demoLink),
      });

      if (!response.ok) {
        throw new Error(`Failed to add demo link: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to add demo link:', error);
      throw error;
    }
  }

  /**
   * Export portfolio data
   */
  public async exportPortfolio(userId: string, options: PortfolioExport): Promise<Blob> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/portfolio/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({
          userId,
          ...options
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to export portfolio: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Failed to export portfolio:', error);
      throw error;
    }
  }

  /**
   * Get portfolio analytics
   */
  public async getPortfolioAnalytics(userId: string): Promise<PortfolioAnalytics> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/portfolio/analytics/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch portfolio analytics:', error);
      return this.generateFallbackAnalytics();
    }
  }

  /**
   * Generate fallback statistics
   */
  private generateFallbackStats(): PortfolioStats {
    return {
      totalProjects: 0,
      completedProjects: 0,
      totalHoursSpent: 0,
      averageProjectDuration: 0,
      mostUsedTechnologies: [],
      skillDistribution: [],
      monthlyActivity: []
    };
  }

  /**
   * Generate fallback analytics
   */
  private generateFallbackAnalytics(): PortfolioAnalytics {
    return {
      views: 0,
      uniqueVisitors: 0,
      timeOnPage: 0,
      bounceRate: 0,
      topProjects: [],
      trafficSources: [],
      deviceBreakdown: [],
      geographicData: []
    };
  }
}

export default PortfolioService;
