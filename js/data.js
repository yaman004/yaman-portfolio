// All content comes from Yaman's resume (public/Yaman_Choudhary_Resume.pdf).

const OWNER = {
  name: 'YAMAN CHOUDHARY',
  roles: ['FULL STACK DEVELOPER', 'UI DEVELOPER', 'AI DEVELOPER'],
  headline: 'Full Stack Developer (MERN) | AI/LLM Integration',
  location: 'Jaipur, Rajasthan, India',
  phone: '+91-8233202884',
  phoneHref: 'tel:+918233202884',
  whatsapp: 'https://wa.me/918233202884',
  gmailCompose: 'https://mail.google.com/mail/?view=cm&fs=1&to=choudharyyaman004@gmail.com',
  email: 'choudharyyaman004@gmail.com',
  github: 'https://github.com/yaman004',
  repos: 'https://github.com/yaman004?tab=repositories',
  linkedin: 'https://www.linkedin.com/in/yaman004',
  resumeFile: 'Yaman_Choudhary_Resume.pdf',
  summary:
    'Full Stack Developer specializing in the MERN stack with hands-on internship experience shipping production web applications across three companies, including AI-focused execution work. Proven ability to integrate LLM/OpenAI APIs into full-stack products, including an autonomous AI agent platform with permissioned tool execution and human-in-the-loop approval. Comfortable owning a feature end to end — frontend, API, database, and deployment. Available to join immediately.',
}

const SECTIONS = [
  { key: 'profile', path: '/profile', label: 'PROFILE', desc: 'Switch between identities and review your character stats.', objective: 'Review the character profile' },
  { key: 'missions', path: '/missions', label: 'MISSIONS', desc: 'Every project, played as a mission. Accept one to see how it went down.', objective: 'Accept a mission' },
  { key: 'skills', path: '/skills', label: 'SKILLS', desc: 'Special ability, stats and the full inventory of tools.', objective: 'Inspect the inventory' },
  { key: 'projects', path: '/projects', label: 'PROJECTS', desc: 'The project gallery. Filter by tech and open the briefing.', objective: 'Browse the project gallery' },
  { key: 'experience', path: '/experience', label: 'EXPERIENCE', desc: 'Work history as completed missions.', objective: 'Check the mission history' },
  { key: 'education', path: '/education', label: 'EDUCATION', desc: 'Degree, school record and certifications.', objective: 'Read the character record' },
  { key: 'contact', path: '/contact', label: 'CONTACT', desc: 'Pick up the phone. Call, email or message.', objective: 'Get in touch' },
  { key: 'map', path: '/map', label: 'MAP', desc: 'Explore the city. Every district hides a project.', objective: 'Set a waypoint' },
  { key: 'resume', path: '/resume', label: 'RESUME', desc: 'Open the full document, or download the PDF.', objective: 'Open the resume' },
]

const sectionByPath = (p) => SECTIONS.find((s) => s.path === p)

/* ------------------------------ MAP WORLD ------------------------------ */
const WORLD = { w: 1000, h: 640 }

const NODES = {
  H: [440, 360], J1: [440, 230], J3: [560, 360], J4: [680, 300], J5: [680, 150],
  J6: [680, 470], J7: [300, 360], J8: [300, 500], J9: [560, 470],
  D: [560, 300], V: [480, 110], AP: [840, 470], B: [190, 500], I: [800, 150], P: [455, 560], HW: [900, 310], HL: [270, 90],
}
const EDGES = [
  ['H', 'J1'], ['H', 'J3'], ['H', 'J7'], ['J3', 'D'], ['J3', 'J9'], ['D', 'J4'],
  ['J1', 'V'], ['J1', 'D'], ['J4', 'J5'], ['J5', 'I'], ['J4', 'J6'], ['J6', 'AP'],
  ['J9', 'J6'], ['J7', 'J8'], ['J8', 'B'], ['J8', 'J9'], ['V', 'J5'],
  ['J8', 'P'], ['P', 'J9'], ['J4', 'HW'], ['V', 'HL'],
]

const DISTRICTS = [
  { id: 'downtown', name: 'DOWNTOWN', x: 500, y: 255, w: 190, h: 120, node: 'D' },
  { id: 'vinewood', name: 'VINEWOOD', x: 380, y: 50, w: 230, h: 100, node: 'V' },
  { id: 'airport', name: 'AIRPORT', x: 770, y: 410, w: 190, h: 120, node: 'AP' },
  { id: 'beach', name: 'BEACH', x: 130, y: 440, w: 130, h: 120, node: 'B' },
  { id: 'industrial', name: 'INDUSTRIAL AREA', x: 730, y: 90, w: 170, h: 120, node: 'I' },
  { id: 'port', name: 'PORT OF LOS SANTOS', x: 380, y: 515, w: 150, h: 80, node: 'P' },
  { id: 'highway', name: 'SANDY HIGHWAY', x: 810, y: 255, w: 150, h: 110, node: 'HW' },
  { id: 'hills', name: 'THE HILLS', x: 195, y: 40, w: 150, h: 100, node: 'HL' },
  { id: 'home', name: 'HOME BASE', x: 380, y: 320, w: 120, h: 80, node: 'H' },
]

// where the player stands for every route (drives minimap + HUD location)
const PLAYER_SPOTS = {
  '/': { node: 'H', place: 'HOME BASE', rot: 0 },
  '/profile': { node: 'H', place: 'HOME BASE', rot: -12 },
  '/missions': { node: 'D', place: 'DOWNTOWN', rot: 14 },
  '/projects': { node: 'J4', place: 'DOWNTOWN', rot: -18 },
  '/skills': { node: 'J7', place: 'WEST SIDE', rot: 24 },
  '/experience': { node: 'J1', place: 'MIRROR PARK', rot: -8 },
  '/education': { node: 'J9', place: 'RICHMAN', rot: 18 },
  '/contact': { node: 'J3', place: 'STRAWBERRY', rot: -22 },
  '/map': { node: 'H', place: 'HOME BASE', rot: 0 },
  '/resume': { node: 'J6', place: 'LA MESA', rot: 10 },
}

/* ------------------------------ MISSIONS ------------------------------ */
const PROJECTS = [
  {
    id: 'taskos', n: 1, title: 'TASKOS', subtitle: 'Task Operating System', type: 'FULL STACK / AI AGENT',
    difficulty: 5, status: 'COMPLETED', district: 'downtown', cat: 'AI', repo: 'https://github.com/yaman004/Taskos',
    tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Socket.IO'],
    desc: 'An AI digital-employee platform. It plans multi-step missions and executes them autonomously through permissioned tool calls, with a human-in-the-loop approval flow and a live execution trace streamed to the frontend over Socket.IO.',
    objectives: ['Plan multi-step missions with an AI agent', 'Execute autonomously via permissioned tool calls', 'Add a human-in-the-loop approval flow', 'Stream a live execution trace over Socket.IO'],
  },
  {
    id: 'forge', n: 2, title: 'FORGE AI', subtitle: 'Multi-Agent AI Software Engineer', type: 'MULTI-AGENT / AI',
    difficulty: 5, status: 'COMPLETED', district: 'industrial', cat: 'AI', repo: 'https://github.com/yaman004/forge-Ai',
    tech: ['LangGraph', 'CrewAI', 'AutoGen'],
    desc: 'A multi-agent AI software engineer made of a Planner, Coder, Tester, Reviewer and Debugger, orchestrated with LangGraph, CrewAI and AutoGen.',
    objectives: ['Split the work across Planner, Coder, Tester, Reviewer and Debugger agents', 'Orchestrate the agents with LangGraph, CrewAI and AutoGen'],
  },
  {
    id: 'interview', n: 3, title: 'AI INTERVIEW COACH', subtitle: 'Mock interviews, graded by AI', type: 'FULL STACK / AI',
    difficulty: 4, status: 'COMPLETED', district: 'vinewood', cat: 'AI', repo: 'https://github.com/yaman004/AI-Interview-Coach',
    tech: ['React.js', 'Node.js', 'OpenAI API', 'MongoDB'],
    desc: 'An AI-powered mock interview platform. It integrates the OpenAI API with speech-to-text to capture spoken responses and generate AI-driven performance evaluations.',
    objectives: ['Capture spoken answers with speech-to-text', 'Integrate the OpenAI API', 'Generate AI-driven performance evaluations'],
  },
  {
    id: 'jobportal', n: 4, title: 'SMART JOB PORTAL', subtitle: 'with AI Match Score', type: 'FULL STACK / AI',
    difficulty: 3, status: 'COMPLETED', district: 'airport', cat: 'Full Stack', repo: 'https://github.com/yaman004/Smart-Job-Portal-with-AI-Match-Score',
    tech: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express.js'],
    desc: 'A full-stack job portal with CRUD listings and applications, plus a custom AI skill-matching engine that maps candidate profiles to job requirements and delivers personalised match scores from 0 to 100.',
    objectives: ['Build CRUD listings and applications', 'Create a custom AI skill-matching engine', 'Deliver personalised match scores (0–100)'],
  },
  {
    id: 'gesture', n: 5, title: 'GESTURE CHATBOT', subtitle: 'Marcus, controlled by hand gestures', type: 'COMPUTER VISION / AI',
    difficulty: 4, status: 'COMPLETED', district: 'beach', cat: 'AI', repo: 'https://github.com/yaman004/gesture-chatbot',
    tech: ['JavaScript', 'MediaPipe Hands', 'HTML5', 'CSS3'],
    desc: 'A browser-based chatbot that uses real-time computer vision (MediaPipe Hands) with a gesture-to-intent-to-response pipeline, confidence scoring and cooldown debouncing across six gestures.',
    objectives: ['Track hands in real time with MediaPipe', 'Map gesture to intent to response', 'Add confidence scoring and cooldown debouncing', 'Support six distinct gestures'],
  },
  {
    id: 'drowsiness', n: 6, title: 'DRIVER DROWSINESS', subtitle: 'Detection', type: 'COMPUTER VISION',
    difficulty: 4, status: 'COMPLETED', district: 'highway', cat: 'AI', repo: 'https://github.com/yaman004/driver-drowsiness-detection',
    tech: ['Computer Vision', 'Facial Landmarks'],
    desc: 'Real-time driver fatigue monitoring using computer vision and facial landmark analysis.',
    objectives: ['Monitor the driver in real time', 'Analyse facial landmarks to detect fatigue'],
  },
  {
    id: 'cloudhost', n: 7, title: 'S3 + CLOUDFRONT', subtitle: 'Static Web Hosting', type: 'CLOUD / AWS',
    difficulty: 3, status: 'COMPLETED', district: 'port', cat: 'Cloud', repo: 'https://github.com/yaman004/Static-Web-Hosting-Using-S3-and-CloudFront',
    tech: ['AWS S3', 'AWS CloudFront'],
    desc: 'Static web hosting on Amazon S3, delivered worldwide through the CloudFront CDN.',
    objectives: ['Host a static site on Amazon S3', 'Serve it through CloudFront'],
  },
]

const CLASSIFIED = {
  id: 'classified', n: 0, title: 'CLASSIFIED', subtitle: 'You are standing inside it', type: 'FULL STACK / EXPERIENCE',
  difficulty: 5, status: 'CLEARANCE GRANTED', district: 'hills', cat: 'Full Stack', hidden: true, repo: 'https://github.com/yaman004',
  tech: ['React', 'Vite', 'Tailwind CSS', 'GSAP', 'Framer Motion', 'Lenis', 'Web Audio API'],
  desc: 'This portfolio. A playable-style interface with a procedural city, a pannable map with routing, a phone, an achievement system and a fully synthesized sound engine. No audio files, no images, no game assets.',
  objectives: ['Build a cinematic game-style interface', 'Synthesize every sound with the Web Audio API', 'Route waypoints across a hand-built city graph', 'Keep it fast, responsive and accessible'],
}

const ALL_MISSIONS = [...PROJECTS, CLASSIFIED]
const projectById = (id) => ALL_MISSIONS.find((p) => p.id === id)

/* ------------------------------ SKILLS ------------------------------ */
const STATS_SPECIAL = { label: 'SPECIAL ABILITY', name: 'FULL STACK DEVELOPMENT', value: 88 }
const STAT_BARS = [
  { label: 'FULL STACK DEVELOPMENT', value: 88 },
  { label: 'FRONTEND', value: 90 },
  { label: 'BACKEND', value: 82 },
  { label: 'AI DEVELOPMENT', value: 74 },
  { label: 'PROBLEM SOLVING', value: 84 },
  { label: 'UI/UX', value: 78 },
]

const INVENTORY = [
  { cat: 'LANGUAGES', name: 'JavaScript', rarity: 'LEGENDARY', lvl: 9, note: 'Daily driver across frontend and backend.' },
  { cat: 'LANGUAGES', name: 'Python', rarity: 'RARE', lvl: 6, note: 'Data science coursework and scripting.' },
  { cat: 'LANGUAGES', name: 'SQL', rarity: 'RARE', lvl: 6, note: 'Relational queries alongside MySQL.' },
  { cat: 'FRONTEND', name: 'React.js', rarity: 'LEGENDARY', lvl: 9, note: 'Component-driven UIs, hooks and state.' },
  { cat: 'FRONTEND', name: 'Redux', rarity: 'EPIC', lvl: 7, note: 'Predictable global state.' },
  { cat: 'FRONTEND', name: 'Next.js', rarity: 'RARE', lvl: 6, note: 'Routing and server rendering.' },
  { cat: 'FRONTEND', name: 'HTML5', rarity: 'EPIC', lvl: 8, note: 'Semantic, accessible markup.' },
  { cat: 'FRONTEND', name: 'CSS3', rarity: 'EPIC', lvl: 8, note: 'Layouts, animation and polish.' },
  { cat: 'FRONTEND', name: 'Responsive Design', rarity: 'EPIC', lvl: 8, note: 'Mobile-first, every screen size.' },
  { cat: 'BACKEND', name: 'Node.js', rarity: 'LEGENDARY', lvl: 8, note: 'Servers, tooling and real-time.' },
  { cat: 'BACKEND', name: 'Express.js', rarity: 'LEGENDARY', lvl: 8, note: 'REST APIs and middleware.' },
  { cat: 'BACKEND', name: 'REST APIs', rarity: 'EPIC', lvl: 8, note: 'Clean resource design.' },
  { cat: 'BACKEND', name: 'Auth & Authorization', rarity: 'EPIC', lvl: 7, note: 'Protected routes and permissions.' },
  { cat: 'BACKEND', name: 'CRUD Design', rarity: 'EPIC', lvl: 8, note: 'Data flows end to end.' },
  { cat: 'DATABASES', name: 'MongoDB', rarity: 'LEGENDARY', lvl: 8, note: 'Document modelling for MERN apps.' },
  { cat: 'DATABASES', name: 'MySQL', rarity: 'RARE', lvl: 6, note: 'Relational schemas and joins.' },
  { cat: 'AI / ML', name: 'OpenAI API', rarity: 'EPIC', lvl: 8, note: 'LLM features shipped into products.' },
  { cat: 'AI / ML', name: 'LLM Features', rarity: 'EPIC', lvl: 7, note: 'Agents, evaluation and tool calls.' },
  { cat: 'AI / ML', name: 'OpenCV', rarity: 'RARE', lvl: 5, note: 'Computer vision basics.' },
  { cat: 'AI / ML', name: 'MediaPipe', rarity: 'RARE', lvl: 6, note: 'Hand tracking in the browser.' },
  { cat: 'TOOLS', name: 'Git', rarity: 'EPIC', lvl: 8, note: 'Branches, merges, clean history.' },
  { cat: 'TOOLS', name: 'GitHub', rarity: 'EPIC', lvl: 8, note: 'Collaboration and CI.' },
  { cat: 'TOOLS', name: 'Postman', rarity: 'RARE', lvl: 7, note: 'API testing.' },
  { cat: 'TOOLS', name: 'VS Code', rarity: 'RARE', lvl: 9, note: 'Home base editor.' },
  { cat: 'TOOLS', name: 'Socket.IO', rarity: 'RARE', lvl: 6, note: 'Live execution traces.' },
  { cat: 'TOOLS', name: 'Vercel', rarity: 'RARE', lvl: 7, note: 'Frontend deployment.' },
  { cat: 'TOOLS', name: 'Render', rarity: 'RARE', lvl: 7, note: 'Backend deployment.' },
]

/* ------------------------------ EXPERIENCE ------------------------------ */
const EXPERIENCE = [
  {
    id: 'flo', company: 'FLO', role: 'JUNIOR AI EXECUTIVE', period: 'MAY 2026 – SEP 2026', place: 'Jaipur, Rajasthan',
    objectives: ['Supported AI-driven initiatives in a production business environment', 'Applied full-stack and LLM integration skills', 'Collaborated with cross-functional teams', 'Delivered AI-assisted features and workflows'],
  },
  {
    id: 'cynbit', company: 'CYNBIT TECHNOLOGIES PVT. LTD.', role: 'FULL STACK DEVELOPER', period: 'APR 2025 – SEP 2025', place: 'Jaipur, Rajasthan',
    objectives: ['Developed and deployed MERN stack applications end to end', 'Built responsive React.js frontends', 'Built scalable Node.js / Express.js backends', 'Worked with REST APIs and MongoDB', 'Collaborated under Agile practices', 'Designed, built and debugged full-stack features'],
  },
  {
    id: 'regex', company: 'REGEX SOFTWARE', role: 'WEB DEVELOPER', period: 'JUN 2024 – AUG 2024', place: 'Jaipur, Rajasthan',
    objectives: ['Engineered responsive web apps with React.js and Node.js', 'Translated requirements into functional UI components', 'Optimized key features through iterative debugging', 'Improved load performance and user experience'],
  },
]

/* ------------------------------ EDUCATION ------------------------------ */
const EDUCATION = [
  { id: 'btech', title: 'B.TECH, COMPUTER SCIENCE ENGINEERING', school: 'POORNIMA COLLEGE OF ENGINEERING', years: '2022 – 2026', place: 'Jaipur, Rajasthan', stat: 'CGPA', value: 7.6, max: 10, shown: '7.6 / 10' },
  { id: 'hs', title: 'SENIOR SECONDARY (12TH, RBSE)', school: 'SAINT LAWRENCE SR. SEC. SCHOOL', years: '2021', place: 'Jaipur, Rajasthan', stat: 'PERCENTAGE', value: 88.4, max: 100, shown: '88.40%' },
]
const CERTS = [
  { name: 'ReactJS & Redux', by: 'Udemy' },
  { name: 'Node.js with Express & MongoDB', by: 'Udemy' },
  { name: 'Python for Data Science', by: 'XIE' },
  { name: 'MongoDB Basics', by: 'MongoDB' },
  { name: 'Cybersecurity Analyst Job Simulation', by: 'TATA' },
]

/* ------------------------------ CHARACTERS ------------------------------ */
const CHARACTERS = [
  {
    id: 'yaman', name: 'YAMAN', tag: 'THE ALL-ROUNDER', accent: '#f5b01c', sky: 0, zoom: 1,
    desc: 'Owns a feature end to end: frontend, API, database and deployment. Calm under a deadline, fast to ship, always learning.',
    stats: { CODING: 86, 'UI/UX': 78, 'PROBLEM SOLVING': 84, AI: 74, 'FULL STACK': 88, CREATIVITY: 76 },
  },
  {
    id: 'developer', name: 'DEVELOPER', tag: 'THE BUILDER', accent: '#3ec9ff', sky: 1, zoom: 1.12,
    desc: 'Lives in the terminal. Designs REST APIs, models data in MongoDB and wires LLMs into real products with proper permissions.',
    stats: { CODING: 92, 'UI/UX': 62, 'PROBLEM SOLVING': 90, AI: 80, 'FULL STACK': 90, CREATIVITY: 62 },
  },
  {
    id: 'creator', name: 'CREATOR', tag: 'THE DESIGNER', accent: '#ff6aa8', sky: 2, zoom: 1.2,
    desc: 'Cares how it feels. Turns ideas into polished, responsive interfaces, from gesture-controlled bots to cinematic UI.',
    stats: { CODING: 72, 'UI/UX': 92, 'PROBLEM SOLVING': 72, AI: 78, 'FULL STACK': 68, CREATIVITY: 96 },
  },
]

/* ------------------------------ ACHIEVEMENTS ------------------------------ */
const ACHIEVEMENTS = [
  { id: 'first_mission', name: 'FIRST MISSION', desc: 'Viewed the first project.', core: true },
  { id: 'code_criminal', name: 'CODE CRIMINAL', desc: 'Opened the GitHub section.', core: true },
  { id: 'explorer', name: 'EXPLORER', desc: 'Visited every portfolio section.', core: true },
  { id: 'full_stack', name: 'FULL STACK', desc: 'Viewed all development projects.', core: true },
  { id: 'hundred', name: '100%', desc: 'Completed the portfolio.', core: false },
  { id: 'cheat_code', name: 'OLD SCHOOL', desc: 'Entered the cheat code.', secret: true },
  { id: 'dev_mode', name: 'UNDER THE HOOD', desc: 'Enabled developer mode.', secret: true },
  { id: 'gta', name: 'WHEELMAN', desc: 'Typed the vehicle cheat.', secret: true },
  { id: 'classified', name: 'TOP SECRET', desc: 'Discovered the classified project.', secret: true },
]

const TIPS = [
  'Press M at any time to open the map.',
  'Press P to pull out your phone.',
  'Use the number keys 1–9 to jump between sections.',
  'Set a waypoint on the map to route to any project.',
  'Some districts hide more than they show.',
  'Cinematic travel can be turned off in Phone → Settings.',
  'Esc always takes you back.',
  'Try the old cheat code. You know the one.',
  'Click the logo five times if you are curious how it is built.',
  'Every sound here is generated live. Nothing is downloaded.',
]

/* ------------------------------ RESUME DOCUMENT ------------------------------ */
const RESUME = {
  skills: [
    ['Languages', 'JavaScript, Python, SQL'],
    ['Frontend', 'React.js, Redux, Next.js, HTML5, CSS3, Responsive Web Design'],
    ['Backend', 'Node.js, Express.js, REST APIs, Authentication & Authorization, CRUD Design'],
    ['Databases', 'MongoDB, MySQL'],
    ['AI / ML', 'OpenAI API Integration, LLM-powered features, OpenCV'],
    ['Tools & Deployment', 'Git, GitHub, Postman, VS Code, Vercel, Render'],
  ],
  experience: [
    { role: 'Junior AI Executive', org: 'Flo (Jaipur, Rajasthan)', period: 'May 2026 – Sep 2026', bullets: ['Supported AI-driven initiatives, applying full-stack and LLM integration skills in a production business environment.', 'Collaborated with cross-functional teams to deliver AI-assisted features and workflows.'] },
    { role: 'Full Stack Developer', org: 'Cynbit Technologies Pvt. Ltd. (Jaipur, Rajasthan)', period: 'Apr 2025 – Sep 2025', bullets: ['Developed and deployed MERN stack applications end to end — responsive React.js frontends and scalable Node.js/Express.js backends shipped as production-ready features.', 'Collaborated under Agile practices to design, build, and debug full-stack features using JavaScript, REST APIs, and MongoDB.'] },
    { role: 'Web Developer', org: 'Regex Software (Jaipur, Rajasthan)', period: 'Jun 2024 – Aug 2024', bullets: ['Engineered responsive web applications using React.js and Node.js, translating requirements into functional UI components.', 'Optimized key application features through iterative debugging, improving load performance and user experience.'] },
  ],
  projects: [
    { name: 'TaskOS — Task Operating System', tech: 'React.js, Node.js, Express.js, MongoDB, Socket.IO', bullet: 'AI digital-employee platform: plans multi-step missions and executes them autonomously via permissioned tool calls, with a human-in-the-loop approval flow and a live execution trace streamed to the frontend over Socket.IO.' },
    { name: 'AI Interview Coach', tech: 'React.js, Node.js, OpenAI API, MongoDB', bullet: 'AI-powered mock interview platform integrating the OpenAI API with speech-to-text to capture spoken responses and generate AI-driven performance evaluations.' },
    { name: 'Smart Job Portal with AI Match Score', tech: 'HTML, CSS, JavaScript, Node.js, Express.js', bullet: 'Full-stack job portal with CRUD listings/applications and an AI-powered skill-matching engine generating personalized job recommendations.' },
    { name: 'Marcus — Gesture-Based AI Chatbot', tech: 'JavaScript, MediaPipe Hands, HTML5, CSS3', bullet: 'Browser-based chatbot using real-time computer vision (MediaPipe Hands) with a gesture-to-intent-to-response pipeline, confidence scoring, and cooldown debouncing across six gestures.' },
  ],
}
const resumeUrl = './'+OWNER.resumeFile
