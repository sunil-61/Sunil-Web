(() => {
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>$('#preloader')?.classList.add('done'),120),{once:true});setTimeout(()=>$('#preloader')?.classList.add('done'),950);
$('#year').textContent=new Date().getFullYear();
const progress=$('#progress');function onScroll(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max?scrollY/max*100:0)+'%'}addEventListener('scroll',onScroll,{passive:true});onScroll();
// Nav
const nav=$('#nav'), menu=$('#mobileMenu');menu.addEventListener('click',()=>{nav.classList.toggle('open');menu.innerHTML=nav.classList.contains('open')?'<i class="ri-close-line"></i>':'<i class="ri-menu-4-line"></i>'});$$('#nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.innerHTML='<i class="ri-menu-4-line"></i>'}));
// Reveal as elements enter viewport
const reveals=$$('.reveal-up,.reveal-zoom');if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});reveals.forEach(el=>io.observe(el))}else reveals.forEach(el=>el.classList.add('visible'));
// Project filters
$$('.filter').forEach(btn=>btn.addEventListener('click',()=>{$$('.filter').forEach(b=>b.classList.toggle('active',b===btn));$$('.project-card').forEach(card=>card.classList.toggle('filtered-out',btn.dataset.filter!=='all'&&card.dataset.kind!==btn.dataset.filter))}));
// Skill tabs
const skills={data:['Python','SQL','Pandas','NumPy','Statistics','Data Analysis','Data Visualization','Microsoft Power BI','Matplotlib','Seaborn','Snowflake','Dashboards'],ai:['Artificial Intelligence','Machine Learning','Deep Learning','Natural Language Processing (NLP)','Scikit-learn','TensorFlow','Generative AI','Streamlit','Model evaluation','Data preprocessing'],dev:['PHP','HTML5','CSS','JavaScript','C','Git','GitHub','FastAPI','MySQL','REST APIs','AJAX','Bootstrap','WAMP','Jupyter','Linux'],cloud:['Amazon Web Services (AWS)','Amazon EC2','AWS Lambda','Docker','Apache Kafka','Hadoop','Apache Spark','Snowflake','Linux','Development tools']};
const skillLabels={data:'DATA & BI',ai:'AI & MACHINE LEARNING',dev:'DEVELOPMENT',cloud:'CLOUD & TOOLS'};
function drawSkills(key){const box=$('#stackChips');box.replaceChildren();skills[key].forEach((s,i)=>{const el=document.createElement('span');el.className='stack-chip';el.textContent=s;el.style.animationDelay=(i*35)+'ms';box.appendChild(el)});$('#stackLabel').textContent=skillLabels[key];$('#stackCount').textContent=skills[key].length+' TOOLS'}
drawSkills('data');$$('.stack-tab').forEach(b=>b.addEventListener('click',()=>{$$('.stack-tab').forEach(x=>x.classList.toggle('active',x===b));drawSkills(b.dataset.stack)}));
// Contact form is mailto-based; no submissions are stored.
$('#contactForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#cname').value.trim(),email=$('#cemail').value.trim(),message=$('#cmessage').value.trim();location.href='mailto:technical.programmer.sunil@gmail.com?subject='+encodeURIComponent('Portfolio contact from '+name)+'&body='+encodeURIComponent(message+'\n\nFrom: '+name+'\nEmail: '+email);toast('Opening your email app…')});
function toast(s){const el=$('#toast');el.textContent=s;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2500)}
// Lightweight particle field, automatically reduced on small screens.
const canvas=$('#particles'),ctx=canvas.getContext('2d');let pts=[],raf;
function setupParticles(){const dpr=Math.min(devicePixelRatio||1,1.5),w=canvas.width=innerWidth*dpr,h=canvas.height=Math.min(innerHeight*1.15,1050)*dpr;canvas.style.width=innerWidth+'px';canvas.style.height=Math.min(innerHeight*1.15,1050)+'px';ctx.setTransform(dpr,0,0,dpr,0,0);pts=Array.from({length:innerWidth<650?12:32},()=>({x:Math.random()*innerWidth,y:Math.random()*Math.min(innerHeight*1.15,1050),r:Math.random()*1.4+.3,v:Math.random()*.22+.06,p:Math.random()*6.28}))}
function drawParticles(){if(document.hidden){raf=requestAnimationFrame(drawParticles);return}ctx.clearRect(0,0,innerWidth,Math.min(innerHeight*1.15,1050));pts.forEach((p,i)=>{p.y-=p.v;p.p+=.012;if(p.y<0){p.y=Math.min(innerHeight*1.15,1050);p.x=Math.random()*innerWidth}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(198,255,94,${.25+.3*Math.sin(p.p)})`;ctx.fill();if(innerWidth>650){for(let j=i+1;j<pts.length;j++){const q=pts[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);if(d<95){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=`rgba(166,140,255,${.09*(1-d/95)})`;ctx.stroke()}}}});raf=requestAnimationFrame(drawParticles)}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){setupParticles();drawParticles();addEventListener('resize',()=>{cancelAnimationFrame(raf);setupParticles();drawParticles()})}
// Portfolio copilot: explicit profile facts, fuzzy keyword scoring and transparent fallback.
// It's a local FAQ bot, not a generative AI service. It does not transmit user messages.
const launch=$('#assistantLaunch'),panel=$('#assistant'),close=$('#assistantClose'),form=$('#assistantForm'),input=$('#assistantQuestion'),msgs=$('#assistantMessages');
function toggle(open){panel.classList.toggle('open',open);panel.setAttribute('aria-hidden',String(!open));launch.setAttribute('aria-expanded',String(open));if(open)setTimeout(()=>input.focus(),120)}
launch.addEventListener('click',()=>toggle(!panel.classList.contains('open')));close.addEventListener('click',()=>toggle(false));document.addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false)});
$$('.suggestions button').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.question)));
const profile={
about:"Sunil Jat is an aspiring Data Scientist based in Jaipur, Rajasthan, India. He completed a BCA from Suyash College, Rashmi (affiliated with MLSU, Udaipur), with an overall SGPA of 8.3. He is pursuing an MCA focused on Artificial Intelligence at Rajasthan Technical University (RTU), Kota. His interests include AI, machine learning, data analysis, travelling and music.",
education:"Sunil completed his BCA at Suyash College, Rashmi, affiliated with Mohanlal Sukhadia University (MLSU), Udaipur, with an overall SGPA of 8.3 (July 2023–July 2026). He is pursuing an MCA with an Artificial Intelligence focus at RTU, Kota (July 2026–July 2028).",
experience:"Sunil's profile lists a Data Science Intern role at Regex Software starting June 2026; the internship end date/current status is not confirmed. He also works part-time as a Web Developer at Top Tech IT Solution in Bhiwara, Rajasthan, listed from August 2025; the end date is not confirmed.",
skills:"Listed skills include Python, SQL, Pandas, NumPy, statistics, data analysis, data visualization, Power BI, Matplotlib, Seaborn, Scikit-learn, TensorFlow, AI, machine learning, deep learning, NLP, Generative AI, PHP, HTML5, CSS, JavaScript, FastAPI, Git, GitHub, Docker, AWS, EC2, Lambda, Kafka, Hadoop, Spark, Snowflake, Jupyter and Linux. This is a technology list, not a claim of expert proficiency in each tool.",
projects:"Sunil's projects include the AI-Driven Human Care System, Advanced Student Performance Analytics Dashboard, SafeScan AI-Based Threat Detection System, Intelligent WhatsApp Automation System, Suyash College Management Portal, AI-Based Predictive Modeling System, Online Library Management System, Sales Performance Analytics Dashboard, Operating System Simulation, Calculator, and the deployed ongoing LTMS for Chetak Enterprises. Open the Projects section for descriptions and available links.",
contact:"You can contact Sunil by email at technical.programmer.sunil@gmail.com, call +91 8690625461, or WhatsApp at https://wa.me/918690625461. LinkedIn: https://www.linkedin.com/in/sunil-jat61/ . GitHub: https://github.com/sunil-61 .",
location:"Sunil is based in Jaipur, Rajasthan, India.",
resume:"Use the Resume button to download Sunil's supplied resume PDF. It includes education, technical skills, soft skills, achievements and project summaries.",
achievements:"Sunil's resume lists a college tech showcase featuring an Arduino radar system and an AI speech robot, 250+ coding problems solved across platforms including LeetCode, and courses in HTML (Mindluster), Python for Data Science, and Java (Learntube). The resume also notes strong academic performance; no specific competition rank is claimed here.",
ltms:"LTMS stands for Logistics & Transport Management System, developed for Chetak Enterprises. It is deployed and ongoing, with vehicle availability, booking management, owner/driver workflows, bidding, notifications and trip monitoring. Technologies include PHP, MySQL, PDO, HTML, CSS, JavaScript, AJAX and Bootstrap. Website: https://chetak-enterprises.in/",
chatbot:"The WhatsApp Chatbot project uses NLP and an API-driven conversational response flow. Repository: https://github.com/sunil-61/whatsapp-chatbot",
human:"The Human Care / Diabetes Prediction project explores diabetes prediction and health-related insights. Live demo: https://diabetes-prediction-project-hitbebqnbdzpdlhbcfhmct.streamlit.app/",
safescan:"SafeScan Detector is a security-focused project for inspecting files and URLs, flagging suspicious activity and recording scan history. Repository: https://github.com/sunil-61/SafeScan-Smart-Virus-Link-Detector"
};
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9+#.\s]/g,' ').replace(/\s+/g,' ').trim()}
function distance(a,b){if(Math.abs(a.length-b.length)>2)return 9;let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let cur=[i];for(let j=1;j<=b.length;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=cur}return prev[b.length]}
const intents={
about:['about sunil','who is sunil','tell me about','introduce','profile','background','yourself','bio','who are you','sunil jat','kaun hai','batao sunil','bare me','tell me about sunil'],
education:['education','bca','mca','college','university','degree','study','studied','sgpa','qualification','padhai','graduated','course'],
experience:['experience','internship','intern','regex','software internship','web developer','job','work history','career','employment','top tech','role','kaam','currently working'],
skills:['skill','skills','tech stack','technology','tools','python','sql','machine learning','deep learning','power bi','aws','fastapi','php','data analysis','programming language','what can he do','know'],
projects:['project','projects','built','build','github repo','repository','demo','work sample','portfolio work','banaya','banaye','ltms','logistic','transport','chetak','human care','diabetes','chatbot','safescan','operating system','dashboard','library','calculator','college portal','predictive modeling','sales dashboard','what has he made'],
contact:['contact','email','phone','mobile','call','reach','linkedin','github','whatsapp','connect','number','mail','sampark','contact details'],
location:['location','city','based','live','from','jaipur','rajasthan','where'],
resume:['resume','cv','download resume','download cv'],
achievements:['achievement','award','rank','competition','certificate','certification','course','accomplishment'],
ltms:['ltms','logistics','transport system','chetak','vehicle availability','bidding'],
chatbot:['whatsapp chatbot','chatbot project','nlp chatbot'],
human:['human care','diabetes prediction','diabetes project'],
safescan:['safescan','safe scan','virus detector','link detector','security scanner']
};
function score(q,key){let s=0;const tokens=norm(q).split(' ');for(const phrase of intents[key]){const p=norm(phrase);if(norm(q).includes(p)){s+=p.includes(' ')?5:3;continue}for(const w of p.split(' ')){if(w.length<4)continue;if(tokens.some(t=>t===w||(t.length>=4&&distance(t,w)<= (w.length>7?2:1))))s+=1}}return s}
let lastTopic='about';
function answer(q){
 const n=norm(q), raw=q.toLowerCase().trim();
 if(!n)return"Ask me anything about Sunil's profile — education, internship, web development work, projects, tech stack, resume, or contact. Hindi/Hinglish and casual spelling are welcome.";
 if(/^(hi|hello|hey|hii+|heyy+|namaste|hola|good morning|good evening|good afternoon)\b/.test(n))return"Hey! 👋 Welcome to Sunil's portfolio. I can walk you through his education, Regex Software internship, web development work, projects, skills, or contact details. Hindi/Hinglish mein bhi pooch sakte ho. What are you curious about?";
 if(/\b(thanks|thank you|thx|shukriya|dhanyavad|thankyou)\b/.test(n))return"You're welcome! 😊 Want me to go deeper into a project, his technical stack, or his experience?";
 if(/\b(bye|goodbye|see you|tata)\b/.test(n))return"Thanks for stopping by! If you'd like to connect with Sunil, email technical.programmer.sunil@gmail.com or message him on LinkedIn.";
 if(/\b(tell me more|more details|explain more|aur batao|aur btao|detail me|details please|go on|continue|what else|and then|iska aur)\b/.test(n)){return ({about:profile.about,education:profile.education,experience:profile.experience,skills:profile.skills,projects:profile.projects,contact:profile.contact,ltms:profile.ltms,chatbot:profile.chatbot,human:profile.human,safescan:profile.safescan})[lastTopic]||profile.about}
 if(/\b(whatsapp|call|phone|mobile|number|contact|email|mail|linkedin|github|reach him|sampark|baat kar)\b/.test(n)){lastTopic='contact';return profile.contact}
 if(/\b(ltms|logistic|logistics|transport|chetak|bidding|vehicle availability|trip monitoring)\b/.test(n)){lastTopic='ltms';return profile.ltms}
 if(/\b(whatsapp chatbot|chatbot|nlp bot|bot project)\b/.test(n)){lastTopic='chatbot';return profile.chatbot}
 if(/\b(human care|diabetes|health project|healthcare)\b/.test(n)){lastTopic='human';return profile.human}
 if(/\b(safescan|safe scan|virus detector|link detector|security scanner)\b/.test(n)){lastTopic='safescan';return profile.safescan}
 if(/\b(certificates?|certifications?|awards?|achievements?|competition|prizes?)\b/.test(n)){lastTopic='achievements';return profile.achievements+" If you share a verified certificate or award later, it can be added to the portfolio."}
 if(/\b(hire|hiring|job opening|opportunity|collaborate|available for work|recruit|employ)\b/.test(n)){lastTopic='contact';return"Sunil is interested in opportunities related to data science, AI/ML, analytics and software development. To discuss a role or collaboration, email technical.programmer.sunil@gmail.com or connect on LinkedIn: https://www.linkedin.com/in/sunil-jat61/ ."}
 if(/\b(what can you do|help|options|what should i ask|kya puch|kya pooch)\b/.test(n))return"Try any of these: “Tell me about Sunil”, “What is his education?”, “Which tools does he use?”, “Explain the LTMS project”, “What did he build with AI?”, or “How can I contact him?” You can ask in casual Hinglish too.";
 if(/\b(kyu hire|why hire|hire sunil|sunil ko hire|why should i hire|strengths|strong points|what makes him|candidate)\b/.test(n)){lastTopic='experience';return"Why consider Sunil? He combines a BCA foundation (8.3 overall SGPA), ongoing MCA studies focused on AI, a Data Science internship at Regex Software, and part-time web development experience. His portfolio includes an ongoing deployed logistics platform plus AI, analytics and software projects. He is interested in learning, building practical solutions and growing in data science / AI-ML roles. Contact: technical.programmer.sunil@gmail.com or LinkedIn https://www.linkedin.com/in/sunil-jat61/ ."}
 if(/\b(kya kya|kya aata|kya janta|what all|all skills|saari skills|tech stack)\b/.test(n)){lastTopic='skills';return profile.skills}
 if(/\b(resume|cv|biodata)\b/.test(n)){lastTopic='resume';return profile.resume+" Download using the RESUME button in the top navigation or hero section."}
 if(/\b(english|hindi|language|languages|interest|hobby|hobbies)\b/.test(n)){lastTopic='about';return"Sunil speaks Hindi and English. His interests include Artificial Intelligence, Machine Learning, travel and listening to music."}
 let scores=Object.keys(intents).map(k=>[k,score(n,k)]).sort((a,b)=>b[1]-a[1]);
 if(scores[0][1]>=2){lastTopic=scores[0][0];return profile[lastTopic]||profile.about}
 // Topic hints make short, typo-heavy and mixed-language questions easier to route.
 if(/\b(padhai|qualification|degree|college|university|bca|mca|sgpa|marks|study|studied|graduat|education)\b/.test(n)){lastTopic='education';return profile.education}
 if(/\b(kaun|kon|who|sunil|intro|introduction|bare me|baare me|about)\b/.test(n)){lastTopic='about';return profile.about}
 if(/\b(kaam|work|job|intern|internship|regex|developer|experience|company)\b/.test(n)){lastTopic='experience';return profile.experience}
 if(/\b(skill|skills|tech|technology|python|sql|machine learning|data science|power bi|aws|php)\b/.test(n)){lastTopic='skills';return profile.skills}
 if(/\b(project|projects|banaya|banaye|built|github|demo|portfolio)\b/.test(n)){lastTopic='projects';return profile.projects}
 return"I want to give you an accurate answer rather than make something up. I can help with Sunil's BCA/MCA education, Regex Software internship, part-time web development, Python/SQL/AI skills, featured projects (including LTMS), resume, or contact links. Try a short question like “Sunil ki education kya hai?” or “Explain LTMS project”. For anything not listed, email technical.programmer.sunil@gmail.com.";
}
function addMessage(text,who='bot'){const row=document.createElement('div');row.className='chat-message '+who;const icon=document.createElement('span');icon.className='msg-icon';icon.textContent=who==='user'?'YOU':'SJ';const body=document.createElement('div');body.className='msg-body';const p=document.createElement('p');p.textContent=text;const t=document.createElement('small');t.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});body.append(p,t);row.append(icon,body);msgs.append(row);msgs.scrollTop=msgs.scrollHeight;return row}
function ask(q){q=(q||'').trim();if(!q)return;addMessage(q,'user');input.value='';const wait=document.createElement('div');wait.className='chat-message bot';wait.innerHTML='<span class="msg-icon">SJ</span><div class="msg-body"><div class="typing-dots"><i></i><i></i><i></i></div></div>';msgs.append(wait);msgs.scrollTop=msgs.scrollHeight;setTimeout(()=>{wait.remove();addMessage(answer(q));},250+Math.min(q.length*4,300))}
form.addEventListener('submit',e=>{e.preventDefault();ask(input.value)});$$('.suggestions button').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.question)));
})();
