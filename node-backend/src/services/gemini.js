const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

function buildPrompt(level, domain = 'web-development') {
  const domainPrompts = {
    'web-development': 'Focus on web applications, websites, and web-based tools using HTML, CSS, JavaScript, React, Node.js, Python, PHP, etc.',
    'ai-ml': 'Focus on artificial intelligence, machine learning, data science, and AI-powered applications using Python, TensorFlow, PyTorch, scikit-learn, etc.',
    'mobile': 'Focus on mobile applications for iOS and Android using React Native, Flutter, Swift, Kotlin, etc.',
    'cybersecurity': 'Focus on security tools, penetration testing, encryption, network security, and ethical hacking using Python, C++, Go, etc.',
    'creative': 'Focus on creative applications, games, multimedia, design tools, and artistic projects using Unity, Unreal Engine, Processing, etc.'
  };

  return [
    'You are an expert curriculum designer generating student software project ideas.',
    'Rules:',
    '- Always suggest projects with real-world applications.',
    '- Include title, short description, tech stack (comma-separated), difficulty rating, expected outcome.',
    '- Beginner → simple CRUD apps or basic implementations.',
    '- Intermediate → integrations (APIs, ML models, teamwork).',
    '- Advanced → scalable systems, AI, cloud-native, cybersecurity.',
    `- Domain focus: ${domainPrompts[domain] || domainPrompts['web-development']}`,
    'Output must be strict JSON array of 10 objects with keys:',
    '{"title","description","tech_stack","difficulty","outcome"}.',
    `Target level: ${level}, Domain: ${domain}.`,
  ].join('\n');
}

async function generateProjects(level, domain = 'web-development') {
  if (!genAI) {
    throw new Error('Google API key not provided');
  }
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = buildPrompt(level, domain);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  // Attempt to parse JSON; if Markdown fenced, strip.
  const json = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/,'');
  let ideas;
  try {
    ideas = JSON.parse(json);
  } catch (e) {
    // Try to locate first and last bracket
    const start = json.indexOf('[');
    const end = json.lastIndexOf(']');
    ideas = JSON.parse(json.slice(start, end + 1));
  }
  if (!Array.isArray(ideas)) throw new Error('Gemini did not return an array');
  return ideas.map(i => ({
    title: String(i.title || '').trim(),
    description: String(i.description || '').trim(),
    tech_stack: String(i.tech_stack || '').trim(),
    difficulty: String(i.difficulty || '').trim(),
    outcome: String(i.outcome || '').trim(),
    domain: domain, // Add domain to each project
  }));
}

module.exports = { generateProjects };


