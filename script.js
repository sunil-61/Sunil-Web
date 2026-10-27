/* Portfolio interactions + offline intent-matching assistant.
   This assistant uses local keyword/fuzzy matching and curated profile facts; it is not a live LLM. */
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  // Loader and scroll progress
  window.addEventListener('load', () => setTimeout(() => $('#pageLoader')?.classList.add('done'), 350));
  const progress = $('#scrollProgress');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true }); updateProgress();
  $('#year').textContent = new Date().getFullYear();

  // Mobile navigation
  const menuToggle = $('#menuToggle'), mainNav = $('#mainNav');
  menuToggle?.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.innerHTML = open ? '<i class="ri-close-line"></i>' : '<i class="ri-menu-3-line"></i>';
  });
  $$('#mainNav a').forEach(a => a.addEventListener('click', () => {
    mainNav.classList.remove('open'); menuToggle?.setAttribute('aria-expanded','false');
    if (menuToggle) menuToggle.innerHTML = '<i class="ri-menu-3-line"></i>';
  }));

  // Reveal animations
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    revealItems.forEach(el => observer.observe(el));
  } else revealItems.forEach(el => el.classList.add('visible'));

  // Project filters
  const filters = $$('#projectFilters [data-filter]');
  const projects = $$('#projectGrid [data-category]');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.toggle('active', b === btn));
    projects.forEach(card => card.classList.toggle('hidden', btn.dataset.filter !== 'all' && card.dataset.category !== btn.dataset.filter));
  }));

  // Skill tabs
  const skillSets = {
    data: ['Python','SQL','Pandas','NumPy','Statistics','Data Analysis','Data Visualization','Microsoft Power BI','Matplotlib','Seaborn','Snowflake','Excel / dashboards'],
    ai: ['Artificial Intelligence','Machine Learning','Deep Learning','Natural Language Processing (NLP)','Scikit-learn','TensorFlow','Generative AI','Streamlit','Model evaluation','Data preprocessing'],
    dev: ['PHP','HTML5','CSS','JavaScript','C','Git','GitHub','FastAPI','MySQL / SQL','REST APIs','AJAX','Bootstrap','WAMP','Jupyter','Linux'],
    cloud: ['Amazon Web Services (AWS)','Amazon EC2','AWS Lambda','Docker','Apache Kafka','Hadoop','Apache Spark','Cloud deployment','Development tools']
  };
  const skillChips = $('#skillChips'), skillCount = $('#skillCount');
  function renderSkills(key) {
    skillChips.innerHTML = '';
    const items = skillSets[key] || skillSets.data;
    skillCount.textContent = `01 — ${String(items.length).padStart(2,'0')}`;
    items.forEach((name, i) => {
      const chip = document.createElement('span');
      chip.className = 'skill-chip'; chip.textContent = name; chip.style.animationDelay = `${i*28}ms`;
      skillChips.appendChild(chip);
    });
  }
  renderSkills('data');
  $$('.skill-tab').forEach(btn => btn.addEventListener('click', () => {
    $$('.skill-tab').forEach(b => b.classList.toggle('active', b === btn)); renderSkills(btn.dataset.skill);
  }));

  // Contact form opens a prefilled email; this static site does not store form submissions.
  $('#contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#contactName').value.trim(), email = $('#contactEmail').value.trim(), message = $('#contactMessage').value.trim();
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`Hi Sunil,\n\n${message}\n\nFrom: ${name}\nEmail: ${email}`);
    window.location.href = `mailto:technical.programmer.sunil@gmail.com?subject=${subject}&body=${body}`;
    showToast('Opening your email app…');
  });

  // Assistant UI
  const launcher = $('#chatLauncher'), chatWindow = $('#chatWindow'), closeChat = $('#chatClose');
  const chatForm = $('#chatForm'), chatInput = $('#chatInput'), messages = $('#chatMessages');
  function toggleChat(open) {
    chatWindow.classList.toggle('open', open);
    chatWindow.setAttribute('aria-hidden', String(!open));
    launcher.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('chat-open', open && window.innerWidth < 500);
    if (open) setTimeout(() => chatInput.focus(), 150);
  }
  launcher.addEventListener('click', () => toggleChat(!chatWindow.classList.contains('open')));
  closeChat.addEventListener('click', () => toggleChat(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleChat(false); });
  $$('.quick-prompts button').forEach(btn => btn.addEventListener('click', () => ask(btn.dataset.prompt)));

  function addMessage(text, who='bot') {
    const row = document.createElement('div'); row.className = `message ${who === 'user' ? 'user-message' : 'bot-message'}`;
    const avatar = document.createElement('div'); avatar.className = 'message-avatar'; avatar.textContent = who === 'user' ? 'YOU' : 'AI';
    const content = document.createElement('div'); content.className = 'message-content';
    const p = document.createElement('p'); p.textContent = text;
    const time = document.createElement('span'); time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    content.append(p,time); row.append(avatar,content); messages.appendChild(row); messages.scrollTop = messages.scrollHeight;
    return row;
  }
  function normalize(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9+#.\s]/g,' ').replace(/\s+/g,' ').trim();
  }
  // Basic typo tolerance: token-level edit distance for common intent keywords.
  function editDistance(a,b) {
    if (Math.abs(a.length-b.length)>2) return 99;
    const dp = Array.from({length:a.length+1},(_,i)=>[i]);
    for(let j=0;j<=b.length;j++) dp[0][j]=j;
    for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++)
      dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
    return dp[a.length][b.length];
  }
  const intentTerms = {
    about: ['about','sunil','who','introduce','profile','background','tell me','yourself','bio','kon','kaun','bta','bata','bare me'],
    education: ['education','bca','mca','college','university','degree','study','studied','sgpa','qualification','padhai','college'],
    experience: ['experience','internship','intern','regex','software','web developer','job','work','career','employment','top tech','role','kaam'],
    skills: ['skill','skills','tech stack','technology','technologies','tools','python','sql','machine learning','deep learning','power bi','aws','fastapi','php','data analysis','what can','know'],
    projects: ['project','projects','built','build','portfolio work','github repo','repository','demo','work sample','kaam','banaya','banaye','ltms','human care','diabetes','chatbot','safescan','operating system','dashboard','library','calculator'],
    contact: ['contact','email','phone','mobile','call','reach','linkedin','github','whatsapp','connect','number','mail','sampark'],
    resume: ['resume','résumé','cv','download cv','download resume'],
    location: ['location','city','based','live','from','jaipur','rajasthan','where'],
    interests: ['interest','hobby','hobbies','travel','music','ai','ml','like','passion','pasand'],
    achievements: ['achievement','award','rank','competition','certificate','certification','course','accomplishment']
  };
  const answers = {
    about: "Sunil Jat is an aspiring Data Scientist based in Jaipur, Rajasthan. He has a BCA from Suyash College, Rashmi (affiliated with MLSU, Udaipur), with an overall SGPA of 8.3, and is pursuing an MCA focused on Artificial Intelligence at RTU, Kota. His interests include data analysis, machine learning, AI and web development.",
    education: "Sunil completed his BCA at Suyash College, Rashmi, affiliated with Mohanlal Sukhadia University (MLSU), Udaipur, with an overall SGPA of 8.3 (July 2023–July 2026). He is pursuing an MCA focused on Artificial Intelligence at Rajasthan Technical University (RTU), Kota (July 2026–July 2028).",
    experience: "Sunil's profile lists a Data Science Internship at Regex Software starting June 2026; the end date/current status still needs confirmation. He also works part-time as a Web Developer at Top Tech IT Solution in Bhiwara, Rajasthan, listed from August 2025; the exact current dates can be confirmed with Sunil.",
    skills: "Sunil's listed toolkit includes Python, SQL, Pandas, NumPy, statistics, data analysis, data visualization, Power BI, Matplotlib, Seaborn, Scikit-learn, TensorFlow, AI, machine learning, deep learning, NLP, Generative AI, PHP, HTML, CSS, JavaScript, FastAPI, Git, GitHub, Docker, AWS, EC2, Lambda, Kafka, Hadoop and Spark. The list shows technologies, not a claim of expert proficiency in every tool.",
    projects: "Featured projects include: (1) Human Care / Diabetes Prediction — Streamlit demo; (2) WhatsApp Chatbot — NLP/API concept; (3) SafeScan Detector — security-focused file/URL scanning concept; (4) Student Performance Dashboard — Power BI; (5) Operating System Simulation; (6) Library Management System; (7) Logistics & Transport Management System (LTMS) for Chetak Enterprises, deployed and ongoing; and (8) Calculator. Project links are available in the Projects section.",
    contact: "You can contact Sunil at technical.programmer.sunil@gmail.com or +91 8690625461. LinkedIn: linkedin.com/in/sunil-jat61/ . GitHub: github.com/sunil-61 . The Contact section has clickable links.",
    resume: "Use the “Resume” or “Download résumé” button in the header/hero to download the included resume.pdf. It is a starter resume based on currently confirmed information; update dates and add certificates or verified achievements when available.",
    location: "Sunil is based in Jaipur, Rajasthan, India.",
    interests: "Sunil's stated interests include AI, machine learning, travelling and listening to music. Professionally, he is interested in data science, practical AI applications, data analysis and web development.",
    achievements: "Specific awards, certificates and competition results have not yet been verified, so this portfolio does not invent any. It highlights confirmed education, experience and projects instead. Sunil can add verified certifications or achievements later."
  };
  const intentTokens = {};
  Object.entries(intentTerms).forEach(([intent, terms]) => intentTokens[intent] = terms.map(normalize));
  function scoreIntent(query, intent) {
    const q = normalize(query), words = q.split(' ');
    let score = 0;
    for (const term of intentTokens[intent]) {
      if (!term) continue;
      if (q.includes(term)) score += term.includes(' ') ? 4 : 2;
      else {
        const tWords = term.split(' ');
        for (const tw of tWords) {
          if (tw.length < 4) continue;
          if (words.some(w => w === tw || (w.length >= 4 && editDistance(w,tw) <= (w.length >= 7 ? 2 : 1)))) score += 1;
        }
      }
    }
    return score;
  }
  function getAnswer(query) {
    const q = normalize(query);
    if (!q) return "Type a question about Sunil's profile, education, skills, experience, projects or contact details.";
    if (/(hi|hello|hey|hii|namaste|good morning|good evening|hola)\b/.test(q) && q.split(' ').length < 6)
      return "Hey there! 👋 I'm Sunil's portfolio assistant. Ask me about his education, skills, internship, projects, or how to contact him.";
    const scored = Object.keys(intentTerms).map(k => [k,scoreIntent(q,k)]).sort((a,b)=>b[1]-a[1]);
    const [best, score] = scored[0];
    if (score > 0) {
      if (best === 'projects' && /(ltms|logistic|transport|chetak)/.test(q)) return "LTMS (Logistics & Transport Management System) is a deployed, ongoing project for Chetak Enterprises. It supports vehicle availability, booking management, owner/driver workflows, bidding, notifications and trip monitoring. Stack: PHP, MySQL, PDO, HTML, CSS, JavaScript, AJAX and Bootstrap. Website: https://chetak-enterprises.in/";
      if (best === 'projects' && /(chatbot|whatsapp)/.test(q)) return "The WhatsApp Chatbot is a project using NLP and an API-based conversational response flow. Repository: https://github.com/sunil-61/whatsapp-chatbot";
      if (best === 'projects' && /(human|diabetes|health|care)/.test(q)) return "The Human Care / Diabetes Prediction project explores diabetes prediction and health-related insights. Live demo: https://diabetes-prediction-project-hitbebqnbdzpdlhbcfhmct.streamlit.app/";
      if (best === 'projects' && /(safe|scan|virus|link|security)/.test(q)) return "SafeScan Detector is a security-focused project for inspecting files and URLs, flagging suspicious activity and keeping scan history. Repository: https://github.com/sunil-61/SafeScan-Smart-Virus-Link-Detector";
      return answers[best];
    }
    // Helpful fallback for loosely phrased or mixed questions.
    if (/(hire|hireable|job|opportunit|collaborat|available|work with)/.test(q)) return "Sunil is open to learning, collaboration and opportunities related to data science, AI and software development. You can reach him at technical.programmer.sunil@gmail.com or through his LinkedIn profile.";
    if (/(thank|thanks|thx|shukriya|dhanyavad)/.test(q)) return "You're welcome! 😊 Want to know about Sunil's projects, skills, education or experience?";
    return "I may not have matched that wording exactly, but I can help with Sunil's education, internship, web development experience, technical skills, projects, location, résumé or contact details. Try asking something like “what has he built?”, “tell me about his data science internship”, or “how can I contact him?”";
  }
  function ask(text) {
    const value = (text || '').trim(); if (!value) return;
    addMessage(value, 'user'); chatInput.value = '';
    const typing = document.createElement('div'); typing.className = 'message bot-message';
    typing.innerHTML = '<div class="message-avatar">AI</div><div class="message-content"><div class="typing-dots"><i></i><i></i><i></i></div></div>';
    messages.appendChild(typing); messages.scrollTop = messages.scrollHeight;
    // Short local response delay for conversational feel; no external API/network call.
    setTimeout(() => { typing.remove(); addMessage(getAnswer(value), 'bot'); }, 350 + Math.min(value.length * 5, 350));
  }
  chatForm.addEventListener('submit', e => { e.preventDefault(); ask(chatInput.value); });
  function showToast(text) {
    const toast = $('#toast'); toast.textContent = text; toast.classList.add('show');
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
  }
})();
