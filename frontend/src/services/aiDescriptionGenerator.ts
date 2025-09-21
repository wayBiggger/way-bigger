/**
 * AI Description Generator Service
 * Converts technical project details into professional business language
 */

import { PortfolioProject, AIAnalysisResult, ProjectAnalysis } from '@/types/portfolio';

export interface ProjectData {
  title: string;
  description: string;
  techStack: string[];
  files: Array<{
    name: string;
    content: string;
    language: string;
  }>;
  timeSpent: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  projectType: string;
}

export interface GenerationOptions {
  tone: 'professional' | 'casual' | 'technical' | 'business';
  length: 'short' | 'medium' | 'long';
  focus: 'achievements' | 'process' | 'impact' | 'learning';
  targetAudience: 'recruiter' | 'technical' | 'manager' | 'client';
  industry: string;
}

class AIDescriptionGenerator {
  private static instance: AIDescriptionGenerator;
  private API_BASE_URL: string;

  private constructor() {
    this.API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
  }

  public static getInstance(): AIDescriptionGenerator {
    if (!AIDescriptionGenerator.instance) {
      AIDescriptionGenerator.instance = new AIDescriptionGenerator();
    }
    return AIDescriptionGenerator.instance;
  }

  /**
   * Generate professional description for a project
   */
  public async generateProfessionalDescription(
    projectData: ProjectData,
    options: GenerationOptions = {
      tone: 'professional',
      length: 'medium',
      focus: 'impact',
      targetAudience: 'recruiter',
      industry: 'technology'
    }
  ): Promise<AIAnalysisResult> {
    try {
      const prompt = this.buildPrompt(projectData, options);
      
      const response = await fetch(`${this.API_BASE_URL}/ai/generate-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({
          prompt,
          projectData,
          options
        }),
      });

      if (!response.ok) {
        throw new Error(`AI generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return this.parseAIResponse(result);
    } catch (error) {
      console.error('AI description generation failed:', error);
      return this.generateFallbackDescription(projectData, options);
    }
  }

  /**
   * Generate multiple variations of project descriptions
   */
  public async generateMultipleDescriptions(
    projectData: ProjectData,
    variations: GenerationOptions[]
  ): Promise<AIAnalysisResult[]> {
    const promises = variations.map(options => 
      this.generateProfessionalDescription(projectData, options)
    );
    
    return Promise.all(promises);
  }

  /**
   * Analyze project for business impact and outcomes
   */
  public async analyzeProjectImpact(projectData: ProjectData): Promise<ProjectAnalysis> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/ai/analyze-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({ projectData }),
      });

      if (!response.ok) {
        throw new Error(`Project analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      return this.parseProjectAnalysis(result);
    } catch (error) {
      console.error('Project analysis failed:', error);
      return this.generateFallbackAnalysis(projectData);
    }
  }

  /**
   * Generate LinkedIn-ready post content
   */
  public async generateLinkedInPost(projectData: ProjectData): Promise<{
    content: string;
    hashtags: string[];
    mediaSuggestions: string[];
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/ai/generate-linkedin-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({ projectData }),
      });

      if (!response.ok) {
        throw new Error(`LinkedIn post generation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LinkedIn post generation failed:', error);
      return this.generateFallbackLinkedInPost(projectData);
    }
  }

  /**
   * Generate resume bullet points
   */
  public async generateResumeBullets(projectData: ProjectData): Promise<string[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/ai/generate-resume-bullets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({ projectData }),
      });

      if (!response.ok) {
        throw new Error(`Resume bullets generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.bullets || [];
    } catch (error) {
      console.error('Resume bullets generation failed:', error);
      return this.generateFallbackResumeBullets(projectData);
    }
  }

  /**
   * Generate project outcomes and metrics
   */
  public async generateProjectOutcomes(projectData: ProjectData): Promise<string[]> {
    const outcomes: string[] = [];
    
    // Analyze code complexity
    const complexityScore = this.calculateComplexityScore(projectData);
    if (complexityScore > 70) {
      outcomes.push(`Developed a complex ${projectData.projectType} application with ${projectData.techStack.length} technologies`);
    } else if (complexityScore > 40) {
      outcomes.push(`Built an intermediate-level ${projectData.projectType} project demonstrating solid technical skills`);
    } else {
      outcomes.push(`Created a ${projectData.projectType} project showcasing fundamental programming concepts`);
    }

    // Analyze time investment
    if (projectData.timeSpent > 20) {
      outcomes.push(`Invested ${projectData.timeSpent}+ hours in comprehensive project development`);
    } else if (projectData.timeSpent > 10) {
      outcomes.push(`Completed project development in ${projectData.timeSpent} hours`);
    } else {
      outcomes.push(`Delivered project within ${projectData.timeSpent} hours demonstrating efficiency`);
    }

    // Analyze tech stack diversity
    if (projectData.techStack.length > 5) {
      outcomes.push(`Integrated ${projectData.techStack.length} different technologies for full-stack development`);
    } else if (projectData.techStack.length > 2) {
      outcomes.push(`Utilized ${projectData.techStack.length} technologies to create a robust solution`);
    }

    // Analyze project type
    switch (projectData.projectType) {
      case 'web':
        outcomes.push('Delivered a responsive web application with modern user interface');
        break;
      case 'mobile':
        outcomes.push('Developed a mobile application with cross-platform compatibility');
        break;
      case 'data-science':
        outcomes.push('Applied data science techniques to extract meaningful insights');
        break;
      case 'ai-ml':
        outcomes.push('Implemented machine learning algorithms for intelligent functionality');
        break;
      case 'game':
        outcomes.push('Created an interactive game with engaging user experience');
        break;
    }

    return outcomes;
  }

  /**
   * Build AI prompt for description generation
   */
  private buildPrompt(projectData: ProjectData, options: GenerationOptions): string {
    const { tone, length, focus, targetAudience, industry } = options;
    
    let prompt = `Generate a professional project description for a ${projectData.projectType} project with the following details:

Project Title: ${projectData.title}
Description: ${projectData.description}
Technologies: ${projectData.techStack.join(', ')}
Time Spent: ${projectData.timeSpent} hours
Difficulty: ${projectData.difficultyLevel}

Requirements:
- Tone: ${tone}
- Length: ${length}
- Focus: ${focus}
- Target Audience: ${targetAudience}
- Industry: ${industry}

Please generate:
1. A professional description highlighting business impact
2. Technical challenges overcome
3. Learning outcomes achieved
4. Industry relevance
5. Suggested improvements
6. Relevant keywords for ATS systems
7. Skill tags for portfolio categorization

Format the response as JSON with the following structure:
{
  "professionalDescription": "string",
  "businessImpact": "string",
  "technicalChallenges": ["string"],
  "learningOutcomes": ["string"],
  "industryRelevance": "string",
  "suggestedImprovements": ["string"],
  "keywords": ["string"],
  "skillTags": ["string"],
  "difficultyAssessment": "beginner|intermediate|advanced",
  "timeEstimate": number,
  "marketability": number
}`;

    return prompt;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(response: any): AIAnalysisResult {
    try {
      if (typeof response === 'string') {
        response = JSON.parse(response);
      }
      
      return {
        professionalDescription: response.professionalDescription || '',
        businessImpact: response.businessImpact || '',
        technicalChallenges: response.technicalChallenges || [],
        learningOutcomes: response.learningOutcomes || [],
        industryRelevance: response.industryRelevance || '',
        suggestedImprovements: response.suggestedImprovements || [],
        keywords: response.keywords || [],
        skillTags: response.skillTags || [],
        difficultyAssessment: response.difficultyAssessment || 'intermediate',
        timeEstimate: response.timeEstimate || 0,
        marketability: response.marketability || 0
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.generateFallbackDescription({} as ProjectData, {} as GenerationOptions);
    }
  }

  /**
   * Parse project analysis response
   */
  private parseProjectAnalysis(response: any): ProjectAnalysis {
    try {
      if (typeof response === 'string') {
        response = JSON.parse(response);
      }
      
      return {
        complexityScore: response.complexityScore || 0,
        businessImpact: response.businessImpact || '',
        technicalChallenges: response.technicalChallenges || [],
        learningOutcomes: response.learningOutcomes || [],
        industryRelevance: response.industryRelevance || '',
        marketability: response.marketability || 0,
        suggestedImprovements: response.suggestedImprovements || [],
        similarProjects: response.similarProjects || []
      };
    } catch (error) {
      console.error('Failed to parse project analysis:', error);
      return this.generateFallbackAnalysis({} as ProjectData);
    }
  }

  /**
   * Calculate project complexity score
   */
  private calculateComplexityScore(projectData: ProjectData): number {
    let score = 0;
    
    // Base score from difficulty level
    switch (projectData.difficultyLevel) {
      case 'beginner': score += 20; break;
      case 'intermediate': score += 50; break;
      case 'advanced': score += 80; break;
    }
    
    // Add score for tech stack diversity
    score += Math.min(projectData.techStack.length * 5, 25);
    
    // Add score for time investment
    score += Math.min(projectData.timeSpent * 2, 30);
    
    // Add score for project type complexity
    switch (projectData.projectType) {
      case 'web': score += 10; break;
      case 'mobile': score += 15; break;
      case 'data-science': score += 20; break;
      case 'ai-ml': score += 25; break;
      case 'game': score += 15; break;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Generate fallback description when AI fails
   */
  private generateFallbackDescription(projectData: ProjectData, options: GenerationOptions): AIAnalysisResult {
    // Generate simple outcomes synchronously for fallback
    const outcomes = [
      `Developed a ${projectData.projectType} project using ${projectData.techStack.join(', ')}`,
      `Demonstrated technical proficiency and problem-solving skills`
    ];
    
    return {
      professionalDescription: `Developed a ${projectData.projectType} project using ${projectData.techStack.join(', ')}. ${outcomes[0] || 'Demonstrated technical proficiency and problem-solving skills.'}`,
      businessImpact: `Created a functional ${projectData.projectType} solution that showcases technical capabilities and project management skills.`,
      technicalChallenges: [
        `Integrated multiple technologies: ${projectData.techStack.join(', ')}`,
        `Implemented project within ${projectData.timeSpent} hour timeframe`,
        `Applied ${projectData.difficultyLevel} level programming concepts`
      ],
      learningOutcomes: [
        `Gained hands-on experience with ${projectData.techStack.join(', ')}`,
        `Developed problem-solving and debugging skills`,
        `Learned project planning and time management`
      ],
      industryRelevance: `This project demonstrates skills relevant to ${options.industry || 'technology'} industry positions.`,
      suggestedImprovements: [
        'Add unit tests for better code quality',
        'Implement error handling and logging',
        'Add documentation and code comments',
        'Consider performance optimization'
      ],
      keywords: projectData.techStack.concat(['project', 'development', 'programming', 'software']),
      skillTags: projectData.techStack,
      difficultyAssessment: projectData.difficultyLevel,
      timeEstimate: projectData.timeSpent,
      marketability: this.calculateComplexityScore(projectData)
    };
  }

  /**
   * Generate fallback project analysis
   */
  private generateFallbackAnalysis(projectData: ProjectData): ProjectAnalysis {
    return {
      complexityScore: this.calculateComplexityScore(projectData),
      businessImpact: `Demonstrates technical proficiency in ${projectData.techStack.join(', ')} and project delivery capabilities.`,
      technicalChallenges: [
        'Technology integration',
        'Code organization and structure',
        'Testing and debugging'
      ],
      learningOutcomes: [
        'Technical skill development',
        'Problem-solving abilities',
        'Project management experience'
      ],
      industryRelevance: 'Relevant for software development and technology roles',
      marketability: this.calculateComplexityScore(projectData),
      suggestedImprovements: [
        'Add comprehensive testing',
        'Improve code documentation',
        'Implement error handling',
        'Add performance monitoring'
      ],
      similarProjects: []
    };
  }

  /**
   * Generate fallback LinkedIn post
   */
  private generateFallbackLinkedInPost(projectData: ProjectData): {
    content: string;
    hashtags: string[];
    mediaSuggestions: string[];
  } {
    return {
      content: `🚀 Just completed my ${projectData.title} project! 

Built using ${projectData.techStack.join(', ')} - this ${projectData.projectType} project took ${projectData.timeSpent} hours to develop and really challenged my ${projectData.difficultyLevel} level skills.

Key learnings:
✅ ${projectData.techStack.slice(0, 3).join(', ')} integration
✅ Problem-solving and debugging
✅ Project planning and execution

Always excited to tackle new challenges and continue growing as a developer! 💻

#coding #programming #${projectData.projectType} #${projectData.techStack[0] || 'development'}`,
      hashtags: [
        'coding',
        'programming',
        projectData.projectType,
        ...projectData.techStack.slice(0, 3),
        'development',
        'learning'
      ],
      mediaSuggestions: [
        'Project screenshot',
        'Code snippet',
        'Architecture diagram',
        'Demo video'
      ]
    };
  }

  /**
   * Generate fallback resume bullets
   */
  private generateFallbackResumeBullets(projectData: ProjectData): string[] {
    const bullets: string[] = [];
    
    bullets.push(`Developed ${projectData.title} using ${projectData.techStack.join(', ')}`);
    
    if (projectData.timeSpent > 10) {
      bullets.push(`Invested ${projectData.timeSpent} hours in comprehensive project development and testing`);
    }
    
    bullets.push(`Applied ${projectData.difficultyLevel} level programming concepts and best practices`);
    
    if (projectData.techStack.length > 2) {
      bullets.push(`Integrated multiple technologies to create a robust ${projectData.projectType} solution`);
    }
    
    return bullets;
  }
}

export default AIDescriptionGenerator;
