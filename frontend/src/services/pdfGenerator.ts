/**
 * PDF Generator Service
 * Generates professional PDF resumes and portfolio documents
 */

import { ResumeData, PortfolioProject, PortfolioExport } from '@/types/portfolio';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

class PDFGenerator {
  private static instance: PDFGenerator;

  private constructor() {}

  public static getInstance(): PDFGenerator {
    if (!PDFGenerator.instance) {
      PDFGenerator.instance = new PDFGenerator();
    }
    return PDFGenerator.instance;
  }

  /**
   * Generate PDF resume from resume data
   */
  public async generateResumePDF(resumeData: ResumeData, options: {
    format?: 'A4' | 'Letter';
    orientation?: 'portrait' | 'landscape';
    theme?: 'modern' | 'classic' | 'minimal';
    includePhoto?: boolean;
    photoUrl?: string;
  } = {}): Promise<Blob> {
    const {
      format = 'A4',
      orientation = 'portrait',
      theme = 'modern',
      includePhoto = false,
      photoUrl
    } = options;

    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    // Set theme colors
    const colors = this.getThemeColors(theme);
    
    // Add header
    this.addHeader(doc, resumeData, colors, includePhoto, photoUrl);
    
    // Add sections
    this.addSummary(doc, resumeData.summary, colors);
    this.addExperience(doc, resumeData.experience, colors);
    this.addEducation(doc, resumeData.education, colors);
    this.addSkills(doc, resumeData.skills, colors);
    this.addProjects(doc, resumeData.projects, colors);
    this.addCertifications(doc, resumeData.certifications, colors);
    this.addAchievements(doc, resumeData.achievements, colors);

    // Add footer
    this.addFooter(doc, colors);

    return doc.output('blob');
  }

  /**
   * Generate portfolio PDF
   */
  public async generatePortfolioPDF(projects: PortfolioProject[], userInfo: any, options: PortfolioExport): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'A4'
    });

    const colors = this.getThemeColors(options.styling?.colorScheme || 'modern');

    // Add cover page
    this.addCoverPage(doc, userInfo, colors);

    // Add projects
    projects.forEach((project, index) => {
      if (index > 0) {
        doc.addPage();
      }
      this.addProjectPage(doc, project, colors);
    });

    return doc.output('blob');
  }

  /**
   * Generate LinkedIn-ready project description
   */
  public generateLinkedInDescription(project: PortfolioProject): string {
    const hashtags = project.tags.slice(0, 5).map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
    
    return `🚀 Just completed my ${project.title} project!

${project.professionalDescription}

Key highlights:
${project.outcomes.slice(0, 3).map(outcome => `✅ ${outcome}`).join('\n')}

Technologies used: ${project.techStack.join(', ')}

${project.githubUrl ? `🔗 GitHub: ${project.githubUrl}` : ''}
${project.liveUrl ? `🌐 Live Demo: ${project.liveUrl}` : ''}

${hashtags}

#coding #programming #${project.projectType} #${project.techStack[0] || 'development'}`;
  }

  /**
   * Generate GitHub README content
   */
  public generateGitHubReadme(project: PortfolioProject): string {
    return `# ${project.title}

${project.professionalDescription}

## 🚀 Features

${project.outcomes.map(outcome => `- ${outcome}`).join('\n')}

## 🛠️ Technologies Used

${project.techStack.map(tech => `- ${tech}`).join('\n')}

## 📸 Screenshots

${project.screenshots.map((screenshot, index) => 
  `![Screenshot ${index + 1}](${screenshot})`
).join('\n')}

## 🚀 Getting Started

### Prerequisites

- Node.js (if applicable)
- Any other dependencies

### Installation

1. Clone the repository
\`\`\`bash
git clone ${project.githubUrl}
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Run the application
\`\`\`bash
npm start
\`\`\`

## 📝 Project Details

- **Difficulty Level**: ${project.difficultyLevel}
- **Time Spent**: ${project.timeSpent} hours
- **Project Type**: ${project.projectType}
- **Completion Date**: ${new Date(project.completionDate).toLocaleDateString()}

## 🔗 Links

${project.liveUrl ? `- [Live Demo](${project.liveUrl})` : ''}
${project.githubUrl ? `- [GitHub Repository](${project.githubUrl})` : ''}

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created as part of my portfolio development journey.

---

*This project was completed as part of my learning and portfolio development process.*`;
  }

  private getThemeColors(theme: string) {
    const themes = {
      modern: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
        text: '#1e293b',
        light: '#f8fafc',
        border: '#e2e8f0'
      },
      classic: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#000000',
        text: '#000000',
        light: '#ffffff',
        border: '#cccccc'
      },
      minimal: {
        primary: '#374151',
        secondary: '#9ca3af',
        accent: '#6b7280',
        text: '#111827',
        light: '#ffffff',
        border: '#e5e7eb'
      }
    };
    
    return themes[theme as keyof typeof themes] || themes.modern;
  }

  private addHeader(doc: jsPDF, resumeData: ResumeData, colors: any, includePhoto: boolean, photoUrl?: string) {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add photo if included
    if (includePhoto && photoUrl) {
      try {
        doc.addImage(photoUrl, 'JPEG', pageWidth - 30, 20, 25, 25);
      } catch (error) {
        console.warn('Could not add photo to PDF:', error);
      }
    }

    // Name
    doc.setFontSize(24);
    doc.setTextColor(colors.primary);
    doc.text(resumeData.personalInfo.name, 20, 30);

    // Contact information
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary);
    
    const contactInfo = [
      resumeData.personalInfo.email,
      resumeData.personalInfo.phone,
      resumeData.personalInfo.location,
      resumeData.personalInfo.website,
      resumeData.personalInfo.linkedin,
      resumeData.personalInfo.github
    ].filter(Boolean).join(' • ');

    doc.text(contactInfo, 20, 40);

    // Add line separator
    doc.setDrawColor(colors.border);
    doc.line(20, 45, pageWidth - 20, 45);
  }

  private addSummary(doc: jsPDF, summary: string, colors: any) {
    doc.setFontSize(14);
    doc.setTextColor(colors.primary);
    doc.text('Professional Summary', 20, 60);

    doc.setFontSize(10);
    doc.setTextColor(colors.text);
    const splitSummary = doc.splitTextToSize(summary, 170);
    doc.text(splitSummary, 20, 70);
  }

  private addExperience(doc: jsPDF, experience: any[], colors: any) {
    if (experience.length === 0) return;

    let yPosition = 90;
    
    doc.setFontSize(14);
    doc.setTextColor(colors.primary);
    doc.text('Professional Experience', 20, yPosition);
    yPosition += 10;

    experience.forEach((exp, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Company and position
      doc.setFontSize(12);
      doc.setTextColor(colors.text);
      doc.text(`${exp.position} at ${exp.company}`, 20, yPosition);
      
      // Dates
      doc.setFontSize(10);
      doc.setTextColor(colors.secondary);
      const dates = exp.current ? 
        `${exp.startDate} - Present` : 
        `${exp.startDate} - ${exp.endDate}`;
      doc.text(dates, 20, yPosition + 6);

      // Description
      doc.setFontSize(9);
      doc.setTextColor(colors.text);
      const description = exp.description.join(' • ');
      const splitDesc = doc.splitTextToSize(description, 170);
      doc.text(splitDesc, 20, yPosition + 15);

      yPosition += 25 + (splitDesc.length * 4);
    });
  }

  private addEducation(doc: jsPDF, education: any[], colors: any) {
    if (education.length === 0) return;

    let yPosition = 200;
    
    doc.setFontSize(14);
    doc.setTextColor(colors.primary);
    doc.text('Education', 20, yPosition);
    yPosition += 10;

    education.forEach((edu) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Degree and institution
      doc.setFontSize(12);
      doc.setTextColor(colors.text);
      doc.text(`${edu.degree} in ${edu.field}`, 20, yPosition);
      doc.text(edu.institution, 20, yPosition + 6);

      // Dates and location
      doc.setFontSize(10);
      doc.setTextColor(colors.secondary);
      const dates = edu.current ? 
        `${edu.startDate} - Present` : 
        `${edu.startDate} - ${edu.endDate}`;
      doc.text(`${dates} • ${edu.location}`, 20, yPosition + 12);

      yPosition += 20;
    });
  }

  private addSkills(doc: jsPDF, skills: any, colors: any) {
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 250;

    doc.setFontSize(14);
    doc.setTextColor(colors.primary);
    doc.text('Skills', 20, yPosition);
    yPosition += 10;

    // Technical skills
    if (skills.technical.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(colors.text);
      doc.text('Technical:', 20, yPosition);
      doc.text(skills.technical.join(', '), 50, yPosition);
      yPosition += 8;
    }

    // Soft skills
    if (skills.soft.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(colors.text);
      doc.text('Soft Skills:', 20, yPosition);
      doc.text(skills.soft.join(', '), 70, yPosition);
      yPosition += 8;
    }

    // Languages
    if (skills.languages.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(colors.text);
      doc.text('Languages:', 20, yPosition);
      doc.text(skills.languages.join(', '), 70, yPosition);
    }
  }

  private addProjects(doc: jsPDF, projects: PortfolioProject[], colors: any) {
    if (projects.length === 0) return;

    let yPosition = 20;
    let currentPage = 1;

    projects.forEach((project, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
        currentPage++;
      }

      if (index > 0) {
        yPosition += 10;
      }

      // Project title
      doc.setFontSize(12);
      doc.setTextColor(colors.primary);
      doc.text(project.title, 20, yPosition);

      // Technologies
      doc.setFontSize(9);
      doc.setTextColor(colors.secondary);
      doc.text(`Technologies: ${project.techStack.join(', ')}`, 20, yPosition + 6);

      // Description
      doc.setFontSize(9);
      doc.setTextColor(colors.text);
      const description = project.professionalDescription;
      const splitDesc = doc.splitTextToSize(description, 170);
      doc.text(splitDesc, 20, yPosition + 12);

      // Links
      if (project.githubUrl || project.liveUrl) {
        doc.setFontSize(8);
        doc.setTextColor(colors.accent);
        const links = [];
        if (project.githubUrl) links.push(`GitHub: ${project.githubUrl}`);
        if (project.liveUrl) links.push(`Live: ${project.liveUrl}`);
        doc.text(links.join(' • '), 20, yPosition + 12 + (splitDesc.length * 4) + 5);
      }

      yPosition += 20 + (splitDesc.length * 4) + 10;
    });
  }

  private addCertifications(doc: jsPDF, certifications: any[], colors: any) {
    if (certifications.length === 0) return;

    let yPosition = 20;
    
    doc.setFontSize(14);
    doc.setTextColor(colors.primary);
    doc.text('Certifications', 20, yPosition);
    yPosition += 10;

    certifications.forEach((cert) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(10);
      doc.setTextColor(colors.text);
      doc.text(`${cert.name} - ${cert.issuer}`, 20, yPosition);
      
      doc.setFontSize(9);
      doc.setTextColor(colors.secondary);
      doc.text(`Issued: ${cert.issueDate}`, 20, yPosition + 6);

      yPosition += 15;
    });
  }

  private addAchievements(doc: jsPDF, achievements: string[], colors: any) {
    if (achievements.length === 0) return;

    let yPosition = 20;
    
    doc.setFontSize(14);
    doc.setTextColor(colors.primary);
    doc.text('Key Achievements', 20, yPosition);
    yPosition += 10;

    achievements.forEach((achievement) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(9);
      doc.setTextColor(colors.text);
      doc.text(`• ${achievement}`, 20, yPosition);
      yPosition += 6;
    });
  }

  private addCoverPage(doc: jsPDF, userInfo: any, colors: any) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(colors.light);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Title
    doc.setFontSize(32);
    doc.setTextColor(colors.primary);
    doc.text('Portfolio', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });

    // Subtitle
    doc.setFontSize(18);
    doc.setTextColor(colors.secondary);
    doc.text(`by ${userInfo.displayName || 'Developer'}`, pageWidth / 2, pageHeight / 2, { align: 'center' });

    // Date
    doc.setFontSize(12);
    doc.setTextColor(colors.text);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
  }

  private addProjectPage(doc: jsPDF, project: PortfolioProject, colors: any) {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Project title
    doc.setFontSize(20);
    doc.setTextColor(colors.primary);
    doc.text(project.title, 20, 30);

    // Project type and difficulty
    doc.setFontSize(12);
    doc.setTextColor(colors.secondary);
    doc.text(`${project.projectType} • ${project.difficultyLevel} • ${project.timeSpent}h`, 20, 40);

    // Description
    doc.setFontSize(11);
    doc.setTextColor(colors.text);
    const description = doc.splitTextToSize(project.professionalDescription, 170);
    doc.text(description, 20, 55);

    // Technologies
    doc.setFontSize(12);
    doc.setTextColor(colors.primary);
    doc.text('Technologies Used', 20, 80);
    
    doc.setFontSize(10);
    doc.setTextColor(colors.text);
    doc.text(project.techStack.join(', '), 20, 90);

    // Outcomes
    if (project.outcomes.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(colors.primary);
      doc.text('Key Outcomes', 20, 110);
      
      doc.setFontSize(10);
      doc.setTextColor(colors.text);
      project.outcomes.forEach((outcome, index) => {
        doc.text(`• ${outcome}`, 20, 120 + (index * 6));
      });
    }

    // Links
    if (project.githubUrl || project.liveUrl) {
      doc.setFontSize(12);
      doc.setTextColor(colors.primary);
      doc.text('Links', 20, 160);
      
      doc.setFontSize(10);
      doc.setTextColor(colors.accent);
      if (project.githubUrl) {
        doc.text(`GitHub: ${project.githubUrl}`, 20, 170);
      }
      if (project.liveUrl) {
        doc.text(`Live Demo: ${project.liveUrl}`, 20, 180);
      }
    }
  }

  private addFooter(doc: jsPDF, colors: any) {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(8);
    doc.setTextColor(colors.secondary);
    doc.text('Generated by Way Bigger Portfolio Generator', pageWidth / 2, pageHeight - 10, { align: 'center' });
  }
}

export default PDFGenerator;
