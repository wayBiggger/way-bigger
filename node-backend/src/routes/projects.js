const express = require('express');
const { getActiveProjectsByLevel } = require('../services/db');
const { generateForLevel, generateAllDomainsForLevel } = require('../services/generator');
const gcsStorage = require('../services/gcs');
const localStorage = require('../services/localStorage');

const router = express.Router();

// Get project statistics from local storage
router.get('/stats', async (req, res) => {
  try {
    const stats = await localStorage.getProjectStats();
    res.json(stats);
  } catch (err) {
    console.error('Error getting project stats:', err);
    res.status(500).json({ error: 'Failed to get project statistics' });
  }
});

// Get all projects from local storage
router.get('/all', async (req, res) => {
  try {
    const allProjects = await localStorage.getAllProjects();
    res.json(allProjects);
  } catch (err) {
    console.error('Error getting all projects:', err);
    res.status(500).json({ error: 'Failed to get all projects' });
  }
});

// Project templates for each domain and difficulty level
function getProjectTemplates(domain, level) {
  const templates = {
    'web-development': {
      beginner: [
        { title: "Personal Portfolio Website", description: "Build a responsive portfolio website showcasing your projects and skills", tech_stack: "HTML, CSS, JavaScript, React", outcome: "A professional portfolio site to showcase your work" },
        { title: "Todo List App", description: "Create a task management application with add, edit, delete functionality", tech_stack: "JavaScript, HTML, CSS, Local Storage", outcome: "A fully functional todo application" },
        { title: "Weather Dashboard", description: "Build a weather app that fetches data from a weather API", tech_stack: "JavaScript, API Integration, CSS", outcome: "A real-time weather information dashboard" },
        { title: "Simple Calculator", description: "Build a basic calculator with arithmetic operations and clean UI", tech_stack: "JavaScript, HTML, CSS", outcome: "A functional calculator application" },
        { title: "Random Quote Generator", description: "Create an app that displays random inspirational quotes", tech_stack: "JavaScript, HTML, CSS, JSON", outcome: "An inspirational quote display app" },
        { title: "Color Palette Generator", description: "Build a tool to generate and preview color palettes", tech_stack: "JavaScript, CSS, Canvas API", outcome: "A creative color palette tool" },
        { title: "Password Generator", description: "Create a secure password generator with customizable options", tech_stack: "JavaScript, HTML, CSS", outcome: "A secure password generation tool" },
        { title: "BMI Calculator", description: "Build a body mass index calculator with health recommendations", tech_stack: "JavaScript, HTML, CSS", outcome: "A health assessment calculator" },
        { title: "Unit Converter", description: "Create a multi-unit converter for length, weight, temperature", tech_stack: "JavaScript, HTML, CSS", outcome: "A versatile unit conversion tool" },
        { title: "Stopwatch Timer", description: "Build a stopwatch and timer application with lap functionality", tech_stack: "JavaScript, HTML, CSS", outcome: "A precise timing application" }
      ],
      intermediate: [
        { title: "E-commerce Product Catalog", description: "Build a product catalog with search, filtering, and shopping cart", tech_stack: "React, Node.js, MongoDB, Express", outcome: "A full-stack e-commerce application" },
        { title: "Real-time Chat Application", description: "Create a chat app with real-time messaging using WebSockets", tech_stack: "Socket.io, Node.js, React, JWT", outcome: "A real-time messaging platform" },
        { title: "API Integration Dashboard", description: "Build a dashboard that integrates multiple APIs and displays data", tech_stack: "React, REST APIs, Chart.js, Axios", outcome: "A comprehensive data visualization dashboard" },
        { title: "Blog Management System", description: "Create a full-featured blog with admin panel and user authentication", tech_stack: "React, Node.js, PostgreSQL, JWT", outcome: "A complete blog management platform" },
        { title: "Task Management Board", description: "Build a Kanban-style task management board with drag-and-drop", tech_stack: "React, Redux, HTML5 Drag API", outcome: "A collaborative project management tool" },
        { title: "Social Media Dashboard", description: "Create a dashboard to manage multiple social media accounts", tech_stack: "React, Node.js, Social Media APIs", outcome: "A unified social media management platform" },
        { title: "File Upload System", description: "Build a secure file upload system with progress tracking", tech_stack: "React, Node.js, Multer, AWS S3", outcome: "A robust file management system" },
        { title: "User Authentication System", description: "Create a complete auth system with registration, login, and password reset", tech_stack: "React, Node.js, JWT, bcrypt", outcome: "A secure authentication platform" },
        { title: "Data Visualization Tool", description: "Build an interactive data visualization tool with multiple chart types", tech_stack: "React, D3.js, Chart.js, CSV Parser", outcome: "A powerful data analysis tool" },
        { title: "Content Management System", description: "Create a CMS with rich text editor and media management", tech_stack: "React, Node.js, MongoDB, Quill.js", outcome: "A flexible content management platform" }
      ],
      advanced: [
        { title: "Microservices Architecture", description: "Design and implement a microservices architecture with Docker", tech_stack: "Docker, Kubernetes, Node.js, PostgreSQL, Redis", outcome: "A scalable microservices application" },
        { title: "Real-time Analytics Platform", description: "Build a platform for real-time data processing and analytics", tech_stack: "Apache Kafka, Apache Spark, Python, React, D3.js", outcome: "A high-performance analytics platform" },
        { title: "Distributed System", description: "Create a distributed system with load balancing and fault tolerance", tech_stack: "Docker, Nginx, Redis, PostgreSQL, Node.js", outcome: "A resilient distributed application" },
        { title: "Performance Monitoring Tool", description: "Build a comprehensive application performance monitoring system", tech_stack: "Node.js, WebSockets, MongoDB, Grafana", outcome: "A professional APM solution" },
        { title: "API Gateway", description: "Create an API gateway with rate limiting, authentication, and routing", tech_stack: "Node.js, Express, Redis, JWT, Rate Limiting", outcome: "A production-ready API gateway" },
        { title: "Event Sourcing System", description: "Implement an event sourcing architecture with CQRS pattern", tech_stack: "Node.js, PostgreSQL, EventStore, CQRS", outcome: "A scalable event-driven architecture" },
        { title: "Multi-tenant SaaS Platform", description: "Build a multi-tenant SaaS application with tenant isolation", tech_stack: "Node.js, PostgreSQL, Redis, Docker, Kubernetes", outcome: "A scalable multi-tenant platform" },
        { title: "Real-time Collaboration Tool", description: "Create a real-time collaborative editing platform", tech_stack: "WebSockets, Operational Transform, React, Node.js", outcome: "A collaborative editing platform" },
        { title: "Blockchain Integration", description: "Integrate blockchain technology with smart contracts", tech_stack: "Web3.js, Solidity, Node.js, Ethereum", outcome: "A blockchain-integrated application" },
        { title: "Machine Learning Pipeline", description: "Build an end-to-end ML pipeline with model training and deployment", tech_stack: "Python, TensorFlow, Docker, Kubernetes, React", outcome: "A complete ML operations platform" }
      ]
    },
    'ai-ml': {
      beginner: [
        { title: "Image Classification Model", description: "Build a simple image classifier using pre-trained models", tech_stack: "Python, TensorFlow, OpenCV, NumPy", outcome: "An image classification system" },
        { title: "Text Sentiment Analyzer", description: "Create a sentiment analysis tool for social media posts", tech_stack: "Python, NLTK, scikit-learn, Pandas", outcome: "A sentiment analysis application" },
        { title: "Recommendation System", description: "Build a basic recommendation engine using collaborative filtering", tech_stack: "Python, scikit-learn, Pandas, NumPy", outcome: "A recommendation system" },
        { title: "Spam Email Detector", description: "Create a spam detection system using machine learning", tech_stack: "Python, scikit-learn, NLTK, Pandas", outcome: "An email spam filter" },
        { title: "Stock Price Predictor", description: "Build a simple stock price prediction model", tech_stack: "Python, Pandas, scikit-learn, Matplotlib", outcome: "A stock prediction tool" },
        { title: "Handwriting Recognition", description: "Create a system to recognize handwritten digits", tech_stack: "Python, TensorFlow, OpenCV, MNIST", outcome: "A handwriting recognition system" },
        { title: "Fake News Detector", description: "Build a model to detect fake news articles", tech_stack: "Python, NLTK, scikit-learn, Pandas", outcome: "A fake news detection system" },
        { title: "Customer Segmentation", description: "Create a customer segmentation model using clustering", tech_stack: "Python, scikit-learn, Pandas, Matplotlib", outcome: "A customer analytics tool" },
        { title: "Language Translator", description: "Build a simple language translation tool", tech_stack: "Python, Transformers, Hugging Face", outcome: "A language translation system" },
        { title: "Chatbot", description: "Create a basic chatbot using NLP techniques", tech_stack: "Python, NLTK, TensorFlow, Flask", outcome: "An intelligent chatbot" }
      ],
      intermediate: [
        { title: "Computer Vision Pipeline", description: "Build a complete computer vision pipeline for object detection", tech_stack: "Python, OpenCV, YOLO, TensorFlow", outcome: "A computer vision system" },
        { title: "Natural Language Processing API", description: "Create an NLP API with multiple text processing features", tech_stack: "Python, spaCy, FastAPI, Docker", outcome: "A comprehensive NLP service" },
        { title: "Time Series Forecasting", description: "Build a time series forecasting model for business metrics", tech_stack: "Python, Prophet, ARIMA, Pandas", outcome: "A forecasting system" },
        { title: "Deep Learning Model", description: "Create a deep neural network for complex pattern recognition", tech_stack: "Python, TensorFlow, Keras, NumPy", outcome: "A deep learning model" },
        { title: "ML Model Deployment", description: "Deploy a machine learning model as a web service", tech_stack: "Python, Flask, Docker, AWS, scikit-learn", outcome: "A production ML service" },
        { title: "Data Pipeline", description: "Build an ETL pipeline for machine learning data processing", tech_stack: "Python, Apache Airflow, Pandas, PostgreSQL", outcome: "A data processing pipeline" },
        { title: "A/B Testing Framework", description: "Create a statistical framework for A/B testing ML models", tech_stack: "Python, scipy, Pandas, Jupyter", outcome: "An A/B testing platform" },
        { title: "Feature Engineering Tool", description: "Build an automated feature engineering system", tech_stack: "Python, Pandas, scikit-learn, Featuretools", outcome: "A feature engineering platform" },
        { title: "Model Monitoring System", description: "Create a system to monitor ML model performance in production", tech_stack: "Python, Prometheus, Grafana, MLflow", outcome: "A model monitoring platform" },
        { title: "AutoML Platform", description: "Build an automated machine learning platform", tech_stack: "Python, TPOT, Auto-sklearn, Flask", outcome: "An automated ML platform" }
      ],
      advanced: [
        { title: "AI-Powered Recommendation System", description: "Build a sophisticated recommendation engine using deep learning", tech_stack: "Python, TensorFlow, PyTorch, PostgreSQL, FastAPI", outcome: "An intelligent recommendation system" },
        { title: "Computer Vision Platform", description: "Create a comprehensive computer vision platform with multiple models", tech_stack: "Python, OpenCV, YOLO, Detectron2, Docker", outcome: "A computer vision platform" },
        { title: "Natural Language Understanding", description: "Build an advanced NLU system with multiple language support", tech_stack: "Python, Transformers, BERT, spaCy, FastAPI", outcome: "A multilingual NLU system" },
        { title: "Reinforcement Learning Agent", description: "Create an RL agent for complex decision-making tasks", tech_stack: "Python, OpenAI Gym, PyTorch, Stable Baselines", outcome: "An intelligent RL agent" },
        { title: "Federated Learning System", description: "Build a federated learning system for privacy-preserving ML", tech_stack: "Python, PyTorch, TensorFlow Federated, Docker", outcome: "A federated learning platform" },
        { title: "MLOps Pipeline", description: "Create a complete MLOps pipeline with CI/CD for ML models", tech_stack: "Python, MLflow, Kubeflow, Docker, Kubernetes", outcome: "A production MLOps platform" },
        { title: "Real-time ML Inference", description: "Build a real-time ML inference system with low latency", tech_stack: "Python, TensorFlow Serving, Redis, FastAPI", outcome: "A real-time ML service" },
        { title: "Multi-modal AI System", description: "Create an AI system that processes text, images, and audio", tech_stack: "Python, Transformers, OpenCV, librosa, PyTorch", outcome: "A multi-modal AI platform" },
        { title: "AI Ethics Framework", description: "Build a framework for ethical AI with bias detection and fairness", tech_stack: "Python, Fairlearn, SHAP, scikit-learn", outcome: "An ethical AI framework" },
        { title: "Quantum Machine Learning", description: "Explore quantum machine learning algorithms and applications", tech_stack: "Python, Qiskit, Cirq, TensorFlow Quantum", outcome: "A quantum ML research platform" }
      ]
    },
    'mobile': {
      beginner: [
        { title: "Mobile Expense Tracker", description: "Create a mobile app to track daily expenses and budgets", tech_stack: "React Native, JavaScript, AsyncStorage, Charts", outcome: "A functional mobile expense tracking app" },
        { title: "Weather Mobile App", description: "Build a weather app with location-based forecasts", tech_stack: "React Native, JavaScript, Weather API, Geolocation", outcome: "A location-aware weather app" },
        { title: "Todo Mobile App", description: "Create a mobile task management application", tech_stack: "React Native, JavaScript, AsyncStorage", outcome: "A mobile task management app" },
        { title: "Photo Gallery App", description: "Build a mobile photo gallery with camera integration", tech_stack: "React Native, JavaScript, Camera API, Image Picker", outcome: "A mobile photo management app" },
        { title: "Notes Mobile App", description: "Create a note-taking app with rich text editing", tech_stack: "React Native, JavaScript, AsyncStorage, Rich Text", outcome: "A mobile note-taking application" },
        { title: "Fitness Tracker", description: "Build a simple fitness tracking mobile app", tech_stack: "React Native, JavaScript, Health API, Charts", outcome: "A mobile fitness tracking app" },
        { title: "QR Code Scanner", description: "Create a QR code scanner mobile app", tech_stack: "React Native, JavaScript, Camera API, QR Scanner", outcome: "A QR code scanning app" },
        { title: "Currency Converter", description: "Build a mobile currency conversion app", tech_stack: "React Native, JavaScript, Exchange Rate API", outcome: "A mobile currency converter" },
        { title: "Flashcard App", description: "Create a mobile flashcard learning app", tech_stack: "React Native, JavaScript, AsyncStorage, Animations", outcome: "A mobile learning app" },
        { title: "Timer App", description: "Build a mobile timer and stopwatch app", tech_stack: "React Native, JavaScript, Notifications", outcome: "A mobile timing application" }
      ],
      intermediate: [
        { title: "Social Media Mobile App", description: "Create a social media app with posts, likes, and comments", tech_stack: "React Native, Node.js, MongoDB, Socket.io", outcome: "A social media mobile platform" },
        { title: "E-commerce Mobile App", description: "Build a mobile e-commerce app with shopping cart and payments", tech_stack: "React Native, Node.js, Stripe, MongoDB", outcome: "A mobile e-commerce platform" },
        { title: "Real-time Chat Mobile App", description: "Create a mobile chat app with real-time messaging", tech_stack: "React Native, Socket.io, Node.js, Push Notifications", outcome: "A real-time mobile chat app" },
        { title: "Food Delivery Mobile App", description: "Build a food delivery app with restaurant listings and orders", tech_stack: "React Native, Node.js, MongoDB, Maps API", outcome: "A food delivery mobile platform" },
        { title: "Ride Sharing Mobile App", description: "Create a ride-sharing app with location tracking", tech_stack: "React Native, Node.js, Maps API, Real-time Location", outcome: "A ride-sharing mobile platform" },
        { title: "Fitness Social App", description: "Build a social fitness app with workout sharing", tech_stack: "React Native, Node.js, MongoDB, Camera API", outcome: "A social fitness mobile platform" },
        { title: "Language Learning App", description: "Create a mobile language learning app with gamification", tech_stack: "React Native, Node.js, Audio API, Gamification", outcome: "A language learning mobile platform" },
        { title: "Event Management App", description: "Build a mobile app for event discovery and management", tech_stack: "React Native, Node.js, MongoDB, Calendar API", outcome: "An event management mobile platform" },
        { title: "Meditation App", description: "Create a mobile meditation and wellness app", tech_stack: "React Native, Audio API, Timer, Progress Tracking", outcome: "A wellness mobile platform" },
        { title: "News Mobile App", description: "Build a mobile news aggregator with personalization", tech_stack: "React Native, Node.js, News API, Personalization", outcome: "A personalized news mobile platform" }
      ],
      advanced: [
        { title: "AR Mobile Application", description: "Create an augmented reality mobile app with 3D objects", tech_stack: "React Native, ARCore, ARKit, Three.js", outcome: "An AR mobile application" },
        { title: "IoT Mobile Dashboard", description: "Build a mobile dashboard for IoT device management", tech_stack: "React Native, Node.js, MQTT, Real-time Data", outcome: "An IoT mobile management platform" },
        { title: "Blockchain Mobile Wallet", description: "Create a mobile cryptocurrency wallet with trading features", tech_stack: "React Native, Web3.js, Blockchain APIs, Security", outcome: "A mobile blockchain wallet" },
        { title: "AI-Powered Mobile App", description: "Build a mobile app with integrated AI features", tech_stack: "React Native, TensorFlow Lite, AI APIs, On-device ML", outcome: "An AI-powered mobile application" },
        { title: "Cross-platform Mobile App", description: "Create a cross-platform app with native performance", tech_stack: "Flutter, Dart, Native Modules, Platform Channels", outcome: "A high-performance cross-platform app" },
        { title: "Mobile Game Development", description: "Build a mobile game with physics and multiplayer features", tech_stack: "Unity, C#, Multiplayer, Game Physics", outcome: "A mobile multiplayer game" },
        { title: "Healthcare Mobile App", description: "Create a HIPAA-compliant healthcare mobile application", tech_stack: "React Native, Node.js, HIPAA Compliance, Security", outcome: "A secure healthcare mobile platform" },
        { title: "Fintech Mobile App", description: "Build a mobile financial services application", tech_stack: "React Native, Node.js, Banking APIs, Security", outcome: "A mobile fintech platform" },
        { title: "Enterprise Mobile App", description: "Create an enterprise mobile app with offline capabilities", tech_stack: "React Native, Node.js, Offline Sync, Enterprise Security", outcome: "An enterprise mobile platform" },
        { title: "Mobile DevOps Platform", description: "Build a mobile app deployment and monitoring platform", tech_stack: "React Native, CI/CD, Analytics, Crash Reporting", outcome: "A mobile DevOps platform" }
      ]
    },
    'cybersecurity': {
      beginner: [
        { title: "Password Manager", description: "Create a secure password manager with encryption", tech_stack: "Python, Cryptography, SQLite, Tkinter", outcome: "A secure password management tool" },
        { title: "Network Scanner", description: "Build a network vulnerability scanner", tech_stack: "Python, Scapy, Nmap, Network Analysis", outcome: "A network security scanner" },
        { title: "Log Analyzer", description: "Create a tool to analyze security logs for threats", tech_stack: "Python, Pandas, Regex, Log Analysis", outcome: "A security log analysis tool" },
        { title: "Encryption Tool", description: "Build a file encryption and decryption tool", tech_stack: "Python, Cryptography, File I/O, AES", outcome: "A file encryption application" },
        { title: "Firewall Monitor", description: "Create a firewall rule monitoring tool", tech_stack: "Python, Network Monitoring, iptables, Logging", outcome: "A firewall monitoring system" },
        { title: "Security Headers Checker", description: "Build a tool to check website security headers", tech_stack: "Python, Requests, Security Headers, Web Scraping", outcome: "A web security assessment tool" },
        { title: "Malware Detector", description: "Create a basic malware detection system", tech_stack: "Python, Machine Learning, File Analysis, YARA", outcome: "A malware detection system" },
        { title: "VPN Client", description: "Build a simple VPN client application", tech_stack: "Python, OpenVPN, Network Security, Tunneling", outcome: "A VPN client application" },
        { title: "Security Audit Tool", description: "Create a tool for basic security auditing", tech_stack: "Python, Security Testing, Vulnerability Assessment", outcome: "A security audit tool" },
        { title: "Hash Generator", description: "Build a tool to generate and verify file hashes", tech_stack: "Python, Hashing Algorithms, File Integrity", outcome: "A file integrity verification tool" }
      ],
      intermediate: [
        { title: "Intrusion Detection System", description: "Build an IDS to detect network intrusions", tech_stack: "Python, Machine Learning, Network Monitoring, Snort", outcome: "An intrusion detection system" },
        { title: "Security Information System", description: "Create a SIEM for security event management", tech_stack: "Python, Elasticsearch, Logstash, Kibana, Security Analytics", outcome: "A security information management system" },
        { title: "Penetration Testing Framework", description: "Build a framework for automated penetration testing", tech_stack: "Python, Metasploit, Nmap, Vulnerability Scanning", outcome: "A penetration testing platform" },
        { title: "Threat Intelligence Platform", description: "Create a platform for threat intelligence gathering", tech_stack: "Python, Threat Feeds, Data Analysis, Machine Learning", outcome: "A threat intelligence system" },
        { title: "Security Orchestration Tool", description: "Build a SOAR platform for security automation", tech_stack: "Python, Automation, API Integration, Workflow Engine", outcome: "A security orchestration platform" },
        { title: "Vulnerability Management System", description: "Create a system for vulnerability assessment and management", tech_stack: "Python, Vulnerability Databases, Risk Assessment, Reporting", outcome: "A vulnerability management platform" },
        { title: "Security Compliance Checker", description: "Build a tool for security compliance auditing", tech_stack: "Python, Compliance Frameworks, Policy Management, Reporting", outcome: "A compliance management system" },
        { title: "Incident Response Platform", description: "Create a platform for security incident response", tech_stack: "Python, Incident Management, Workflow, Notification System", outcome: "An incident response platform" },
        { title: "Security Training Platform", description: "Build a platform for cybersecurity training and awareness", tech_stack: "Python, Educational Content, Gamification, Progress Tracking", outcome: "A security training platform" },
        { title: "Cryptographic Library", description: "Create a library for cryptographic operations", tech_stack: "Python, Cryptography, Key Management, Digital Signatures", outcome: "A cryptographic toolkit" }
      ],
      advanced: [
        { title: "Blockchain Voting System", description: "Create a secure voting system using blockchain technology", tech_stack: "Solidity, Web3.js, React, Ethereum, Smart Contracts", outcome: "A decentralized voting platform" },
        { title: "Zero Trust Security Architecture", description: "Build a zero trust security framework", tech_stack: "Python, Identity Management, Micro-segmentation, Continuous Verification", outcome: "A zero trust security platform" },
        { title: "Advanced Persistent Threat Detection", description: "Create an APT detection and response system", tech_stack: "Python, Machine Learning, Behavioral Analysis, Threat Hunting", outcome: "An APT detection system" },
        { title: "Quantum Cryptography System", description: "Build a quantum-resistant cryptographic system", tech_stack: "Python, Quantum Computing, Post-Quantum Cryptography, Security", outcome: "A quantum-resistant security system" },
        { title: "Security AI Platform", description: "Create an AI-powered security platform", tech_stack: "Python, Machine Learning, Deep Learning, Security Analytics", outcome: "An AI-powered security platform" },
        { title: "Honeypot Network", description: "Build a sophisticated honeypot network for threat research", tech_stack: "Python, Network Simulation, Threat Intelligence, Data Collection", outcome: "A threat research honeypot network" },
        { title: "Security Automation Platform", description: "Create a comprehensive security automation platform", tech_stack: "Python, Automation, Orchestration, API Integration, Workflow", outcome: "A security automation platform" },
        { title: "Privacy-Preserving Analytics", description: "Build a platform for privacy-preserving data analytics", tech_stack: "Python, Differential Privacy, Homomorphic Encryption, Data Analysis", outcome: "A privacy-preserving analytics platform" },
        { title: "Security Mesh Architecture", description: "Create a security mesh for distributed systems", tech_stack: "Python, Microservices, Service Mesh, Security Policies", outcome: "A security mesh platform" },
        { title: "Cyber Threat Hunting Platform", description: "Build an advanced threat hunting and investigation platform", tech_stack: "Python, Threat Intelligence, Behavioral Analysis, Investigation Tools", outcome: "A threat hunting platform" }
      ]
    },
    'creative': {
      beginner: [
        { title: "Digital Art Generator", description: "Create a tool to generate digital art using algorithms", tech_stack: "Python, PIL, NumPy, Random Generation", outcome: "A digital art creation tool" },
        { title: "Music Composer", description: "Build a simple music composition tool", tech_stack: "Python, MIDI, Music Theory, Audio Processing", outcome: "A music composition application" },
        { title: "Story Generator", description: "Create a creative writing assistant", tech_stack: "Python, NLP, Text Generation, Creative Writing", outcome: "A creative writing tool" },
        { title: "Color Palette Generator", description: "Build a tool to generate harmonious color palettes", tech_stack: "JavaScript, Color Theory, CSS, Web Design", outcome: "A color palette generation tool" },
        { title: "Logo Designer", description: "Create a simple logo design tool", tech_stack: "JavaScript, Canvas API, SVG, Design Principles", outcome: "A logo design application" },
        { title: "Pattern Generator", description: "Build a tool to generate geometric patterns", tech_stack: "Python, Matplotlib, Geometry, Pattern Design", outcome: "A pattern generation tool" },
        { title: "Typography Tool", description: "Create a tool for typography experimentation", tech_stack: "JavaScript, Web Fonts, CSS, Typography", outcome: "A typography design tool" },
        { title: "Animation Creator", description: "Build a simple animation creation tool", tech_stack: "JavaScript, Canvas API, Animation, Keyframes", outcome: "An animation creation tool" },
        { title: "Photo Filter App", description: "Create a photo editing and filtering application", tech_stack: "Python, OpenCV, PIL, Image Processing", outcome: "A photo editing application" },
        { title: "3D Model Viewer", description: "Build a 3D model viewer and manipulator", tech_stack: "JavaScript, Three.js, WebGL, 3D Graphics", outcome: "A 3D model viewing tool" }
      ],
      intermediate: [
        { title: "Game Development Engine", description: "Create a 2D game engine with physics and collision detection", tech_stack: "C++, OpenGL, SDL2, Lua, Game Physics", outcome: "A custom game development engine" },
        { title: "Video Editing Software", description: "Build a video editing application with effects and transitions", tech_stack: "Python, OpenCV, FFmpeg, Video Processing", outcome: "A video editing platform" },
        { title: "3D Modeling Software", description: "Create a 3D modeling and sculpting tool", tech_stack: "C++, OpenGL, 3D Graphics, Mesh Processing", outcome: "A 3D modeling application" },
        { title: "Audio Production Studio", description: "Build a digital audio workstation", tech_stack: "Python, Audio Processing, MIDI, Real-time Audio", outcome: "An audio production platform" },
        { title: "Interactive Art Installation", description: "Create an interactive digital art installation", tech_stack: "JavaScript, Sensors, Arduino, Interactive Design", outcome: "An interactive art platform" },
        { title: "Virtual Reality Experience", description: "Build a VR experience with immersive interactions", tech_stack: "Unity, C#, VR SDK, 3D Graphics, Interaction Design", outcome: "A VR experience platform" },
        { title: "Augmented Reality App", description: "Create an AR application with object recognition", tech_stack: "Unity, ARCore, ARKit, Computer Vision, 3D Graphics", outcome: "An AR application platform" },
        { title: "Motion Graphics Tool", description: "Build a tool for creating motion graphics and animations", tech_stack: "JavaScript, Canvas API, Animation, Keyframe Animation", outcome: "A motion graphics platform" },
        { title: "Digital Sculpting Tool", description: "Create a digital sculpting application", tech_stack: "C++, OpenGL, 3D Graphics, Sculpting Algorithms", outcome: "A digital sculpting platform" },
        { title: "Generative Art Platform", description: "Build a platform for creating generative art", tech_stack: "Python, Processing, Algorithmic Art, Creative Coding", outcome: "A generative art platform" }
      ],
      advanced: [
        { title: "AI Art Generator", description: "Create an AI-powered art generation system", tech_stack: "Python, GANs, TensorFlow, Computer Vision, Creative AI", outcome: "An AI art generation platform" },
        { title: "Procedural Content Generator", description: "Build a system for procedural content generation", tech_stack: "C++, Algorithms, Procedural Generation, Game Development", outcome: "A procedural content platform" },
        { title: "Real-time Rendering Engine", description: "Create a real-time 3D rendering engine", tech_stack: "C++, Vulkan, OpenGL, Ray Tracing, Graphics Programming", outcome: "A real-time rendering engine" },
        { title: "Virtual Production Studio", description: "Build a virtual production and filmmaking platform", tech_stack: "C++, Unreal Engine, Real-time Rendering, Virtual Cinematography", outcome: "A virtual production platform" },
        { title: "Haptic Feedback System", description: "Create a haptic feedback system for immersive experiences", tech_stack: "C++, Hardware Integration, Real-time Systems, Sensory Design", outcome: "A haptic feedback platform" },
        { title: "Neural Style Transfer", description: "Build a neural style transfer system for artistic effects", tech_stack: "Python, Deep Learning, Computer Vision, Style Transfer", outcome: "A neural style transfer platform" },
        { title: "Interactive Storytelling Platform", description: "Create a platform for interactive and branching narratives", tech_stack: "JavaScript, Narrative Design, User Experience, Storytelling", outcome: "An interactive storytelling platform" },
        { title: "Digital Twin Creator", description: "Build a system for creating digital twins of physical objects", tech_stack: "Python, 3D Scanning, Computer Vision, Digital Twin Technology", outcome: "A digital twin creation platform" },
        { title: "Immersive Sound Design", description: "Create a spatial audio and sound design platform", tech_stack: "Python, Audio Processing, Spatial Audio, 3D Sound", outcome: "A spatial audio platform" },
        { title: "Creative AI Assistant", description: "Build an AI assistant for creative professionals", tech_stack: "Python, NLP, Computer Vision, Creative AI, Workflow Automation", outcome: "A creative AI assistant platform" }
      ]
    }
  };
  
  return templates[domain]?.[level.toLowerCase()] || templates[domain]?.beginner || [];
}

router.get('/:level', async (req, res) => {
  try {
    const { level } = req.params;
    
    // First try to get projects from local storage
    let projects = await localStorage.getProjects(level);
    
    // If no projects in local storage, try GCS
    if (!projects || projects.length === 0) {
      console.log(`No projects found in local storage for ${level}, trying GCS...`);
      projects = await gcsStorage.getProjects(level);
    }
    
    // If no projects in GCS, try database
    if (!projects || projects.length === 0) {
      console.log(`No projects found in GCS for ${level}, trying database...`);
      const dbProjects = await getActiveProjectsByLevel(level);
      if (dbProjects && dbProjects.length > 0) {
        projects = dbProjects.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          tech_stack: p.tech_stack,
          difficulty: p.difficulty,
          outcome: p.outcome
        }));
      }
    }
    
    // If still no projects, generate mock data
    if (!projects || projects.length === 0) {
      console.log(`No projects found for ${level}, generating mock data...`);
      
      // Generate 50 projects per domain for the requested level
      const domains = ['web-development', 'ai-ml', 'mobile', 'cybersecurity', 'creative'];
      projects = [];
      let projectId = 1;
      
      domains.forEach(domain => {
        for (let i = 0; i < 50; i++) {
          const projectTemplates = getProjectTemplates(domain, level);
          const template = projectTemplates[i % projectTemplates.length];
          
          projects.push({
            id: projectId++,
            title: `${template.title} ${i + 1}`,
            description: template.description,
            tech_stack: template.tech_stack,
            difficulty: level,
            outcome: template.outcome,
            domain: domain
          });
        }
      });
      
      // Store the generated projects in local storage for future use
      await localStorage.storeProjects(level, projects);
    }
    
    
    res.json(projects);
  } catch (err) {
    console.error(`Error fetching projects for ${level}:`, err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Test endpoint to generate projects for all domains
router.post('/generate/:level', async (req, res) => {
  try {
    const { level } = req.params;
    
    
    const projects = await generateAllDomainsForLevel(level);
    
    // If no projects were generated (due to rate limiting), use mock data
    if (!projects || projects.length === 0) {
      console.log('No projects generated, using mock data fallback');
      
      // Generate 50 projects per domain for the requested level
      const domains = ['web-development', 'ai-ml', 'mobile', 'cybersecurity', 'creative'];
      const mockProjects = [];
      let projectId = 1;
      
      domains.forEach(domain => {
        for (let i = 0; i < 50; i++) {
          const projectTemplates = getProjectTemplates(domain, level);
          const template = projectTemplates[i % projectTemplates.length];
          
          mockProjects.push({
            id: projectId++,
            title: `${template.title} ${i + 1}`,
            description: template.description,
            tech_stack: template.tech_stack,
            difficulty: level,
            outcome: template.outcome,
            domain: domain
          });
        }
      });
      
      // Store mock projects in local storage
      await localStorage.storeProjects(level, mockProjects);
      
      res.json({ 
        message: `Generated ${mockProjects.length} mock projects for ${level} across all domains (API rate limited)`,
        projects: mockProjects
      });
      return;
    }
    
    // Store generated projects in local storage
    await localStorage.storeProjects(level, projects);
    
    res.json({ 
      message: `Generated ${projects.length} projects for ${level} across all domains`,
      projects: projects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        tech_stack: p.tech_stack,
        difficulty: p.difficulty,
        outcome: p.outcome,
        domain: p.domain
      }))
    });
  } catch (err) {
    console.error('Generation error:', err);
    
    // If it's a rate limit error, set flag and return mock data
    if (err.status === 429) {
      process.env.RATE_LIMITED = 'true';
      console.log('Rate limited detected, switching to mock data mode');
      
      const mockProjects = [
        {
          id: 1,
          title: "Personal Portfolio Website",
          description: "Build a responsive portfolio website showcasing your projects and skills",
          tech_stack: "HTML, CSS, JavaScript, React",
          difficulty: req.params.level,
          outcome: "A professional portfolio site to showcase your work",
          domain: "web-development"
        },
        {
          id: 2,
          title: "Todo List App",
          description: "Create a task management application with add, edit, delete functionality",
          tech_stack: "JavaScript, HTML, CSS, Local Storage",
          difficulty: req.params.level,
          outcome: "A fully functional todo application",
          domain: "web-development"
        }
      ];
      
      res.json({ 
        message: `Generated ${mockProjects.length} mock projects for ${req.params.level} (API rate limited)`,
        projects: mockProjects
      });
      return;
    }
    
    res.status(500).json({ error: err.message });
  }
});

// Delete projects for a specific level
router.delete('/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const success = await localStorage.deleteProjects(level);
    
    if (success) {
      res.json({ message: `Deleted all ${level} projects from local storage` });
    } else {
      res.status(500).json({ error: 'Failed to delete projects' });
    }
  } catch (err) {
    console.error('Error deleting projects:', err);
    res.status(500).json({ error: 'Failed to delete projects' });
  }
});

module.exports = router;


