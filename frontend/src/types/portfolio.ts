/**
 * Portfolio Types and Interfaces
 * Defines the structure for portfolio projects and related data
 */

export interface PortfolioProject {
  id: string;
  userId: string;
  title: string;
  professionalDescription: string; // AI-generated for resumes
  technicalDescription: string;    // Original technical details
  techStack: string[];
  outcomes: string[];              // "Improved performance by 40%"
  githubUrl?: string;
  liveUrl?: string;
  screenshots: string[];
  skillsLearned: string[];
  industryRelevance: string;
  completionDate: Date;
  timeSpent: number; // in hours
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  projectType: 'web' | 'mobile' | 'desktop' | 'data-science' | 'ai-ml' | 'game' | 'other';
  status: 'in-progress' | 'completed' | 'archived';
  tags: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  avatar?: string;
  location?: string;
  website?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  skills: string[];
  experience: string;
  education: string;
  certifications: string[];
  languages: string[];
  availability: 'available' | 'busy' | 'unavailable';
  publicProfile: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  projects: PortfolioProject[];
  certifications: Certification[];
  achievements: string[];
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string[];
  achievements: string[];
  technologies: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  honors?: string[];
  relevantCoursework: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  url?: string;
}

export interface PortfolioStats {
  totalProjects: number;
  completedProjects: number;
  totalHoursSpent: number;
  averageProjectDuration: number;
  mostUsedTechnologies: Array<{
    technology: string;
    count: number;
    percentage: number;
  }>;
  skillDistribution: Array<{
    skill: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    projects: number;
  }>;
  monthlyActivity: Array<{
    month: string;
    projectsCompleted: number;
    hoursSpent: number;
  }>;
}

export interface ProjectAnalysis {
  complexityScore: number;
  businessImpact: string;
  technicalChallenges: string[];
  learningOutcomes: string[];
  industryRelevance: string;
  marketability: number;
  suggestedImprovements: string[];
  similarProjects: string[];
}

export interface PortfolioSettings {
  theme: 'modern' | 'minimal' | 'creative' | 'professional';
  colorScheme: string;
  layout: 'grid' | 'list' | 'timeline';
  showContactInfo: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  customDomain?: string;
  seoTitle?: string;
  seoDescription?: string;
  customCss?: string;
}

export interface PortfolioGenerationOptions {
  includePersonalInfo: boolean;
  includeContactInfo: boolean;
  includeSocialLinks: boolean;
  includeSkills: boolean;
  includeExperience: boolean;
  includeEducation: boolean;
  includeCertifications: boolean;
  includeAchievements: boolean;
  projectLimit?: number;
  featuredOnly: boolean;
  difficultyFilter?: ('beginner' | 'intermediate' | 'advanced')[];
  technologyFilter?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface LinkedInPost {
  id: string;
  projectId: string;
  content: string;
  hashtags: string[];
  mediaUrls: string[];
  scheduledDate?: Date;
  published: boolean;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface GitHubIntegration {
  repositoryUrl: string;
  lastSync: Date;
  commits: number;
  stars: number;
  forks: number;
  languages: Array<{
    name: string;
    percentage: number;
  }>;
  readmeContent?: string;
  issues: number;
  pullRequests: number;
}

export interface DemoLink {
  id: string;
  projectId: string;
  url: string;
  type: 'live-demo' | 'video-demo' | 'screenshot' | 'documentation';
  title: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface PortfolioExport {
  format: 'pdf' | 'docx' | 'html' | 'json';
  includeProjects: boolean;
  includeContactInfo: boolean;
  includeSkills: boolean;
  includeExperience: boolean;
  includeEducation: boolean;
  customSections: string[];
  styling: {
    font: string;
    fontSize: number;
    colorScheme: string;
    layout: string;
  };
}

export interface AIAnalysisResult {
  professionalDescription: string;
  businessImpact: string;
  technicalChallenges: string[];
  learningOutcomes: string[];
  industryRelevance: string;
  suggestedImprovements: string[];
  keywords: string[];
  skillTags: string[];
  difficultyAssessment: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate: number;
  marketability: number;
}

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  category: 'resume' | 'portfolio' | 'linkedin' | 'github';
  preview: string;
  template: any;
  customizable: boolean;
  price: number;
  features: string[];
}

export interface PortfolioAnalytics {
  views: number;
  uniqueVisitors: number;
  timeOnPage: number;
  bounceRate: number;
  topProjects: Array<{
    projectId: string;
    views: number;
    clicks: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    percentage: number;
  }>;
  geographicData: Array<{
    country: string;
    visitors: number;
  }>;
}

export default PortfolioProject;
