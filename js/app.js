/* ============================================================
   FitForge · APP (auth, wizard, modals/tools, timers, boot)
   ============================================================ */

/* ===== AUTH ===== */
function showAuth(){document.getElementById('auth').classList.add('show');renderAuth();}
function authError(m){const e=document.getElementById('authErr');e.textContent=m;e.classList.add('show');}
function clearErr(){document.getElementById('authErr').classList.remove('show');}
function renderAuth(){
  document.getElementById('segLogin').classList.toggle('active',authMode==='login');
  document.getElementById('segSignup').classList.toggle('active',authMode==='signup');
  document.getElementById('authForm').innerHTML=`
    ${authMode==='signup'?`<div class="field"><label>Name</label><input id="a-name" type="text" placeholder="Your name" /></div><div class="field"><label>Phone Number</label><input id="a-phone" type="tel" inputmode="tel" placeholder="03xx-xxxxxxx" /></div>`:''}
    <div class="field"><label>Email</label><input id="a-email" type="email" placeholder="you@email.com" autocomplete="username" /></div>
    <div class="field"><label>Password</label><input id="a-pass" type="password" placeholder="At least 6 characters" autocomplete="current-password" /></div>
    <button class="big-btn" id="authGo">${authMode==='login'?'🔓 Login':'🚀 Create Account'}</button>
    <button class="link-btn" id="authSwitch">${authMode==='login'?"New here? Create an account":'Already have an account? Login'}</button>
    <p style="text-align:center;color:var(--muted);font-size:11px;margin-top:14px;line-height:1.5">☁️ Your data syncs securely to the cloud — login on any device.</p>`;
  document.getElementById('authGo').onclick=doAuth;
  document.getElementById('authSwitch').onclick=()=>{authMode=authMode==='login'?'signup':'login';clearErr();renderAuth();};
}
document.getElementById('segLogin').onclick=()=>{authMode='login';clearErr();renderAuth();};
document.getElementById('segSignup').onclick=()=>{authMode='signup';clearErr();renderAuth();};
function doAuth(){
  clearErr();
  const email=(document.getElementById('a-email').value||'').trim().toLowerCase();
  const pass=document.getElementById('a-pass').value||'';
  if(authMode==='signup'){
    pendingName=(document.getElementById('a-name').value||'').trim();
    pendingPhone=(document.getElementById('a-phone').value||'').trim();
    if(!pendingName)return authError('Enter your name');
    if(pendingPhone.replace(/\D/g,'').length<7)return authError('Enter a valid phone number');
  }
  if(!email||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return authError('Enter a valid email');
  if(pass.length<6)return authError('Password must be at least 6 characters');
  if(!auth)return authError('No internet (Firebase not loaded)');
  const btn=document.getElementById('authGo');btn.disabled=true;const oldT=btn.textContent;btn.textContent='⏳ ...';
  const fail=e=>{btn.disabled=false;btn.textContent=oldT;authError(fbErr(e));};
  if(authMode==='signup'){auth.createUserWithEmailAndPassword(email,pass).then(cred=>{try{cred.user.sendEmailVerification();}catch(_){}}).catch(fail);}
  else{auth.signInWithEmailAndPassword(email,pass).catch(fail);}
}
function fbErr(e){const c=(e&&e.code)||'';if(c.includes('email-already-in-use'))return 'Email already registered — please Login';if(c.includes('invalid-email'))return 'Invalid email';if(c.includes('weak-password'))return 'Weak password (6+ chars)';if(c.includes('user-not-found'))return 'No account found — Sign Up';if(c.includes('wrong-password')||c.includes('invalid-credential'))return 'Wrong email or password';if(c.includes('network'))return 'Check your internet';if(c.includes('too-many'))return 'Too many tries — wait a bit';if(c.includes('operation-not-allowed')||c.includes('configuration-not-found'))return 'Enable Email/Password auth in Firebase';return (e&&e.message)||'Something went wrong';}
function logout(){if(auth)auth.signOut();}

/* ===== WIZARD ===== */
let wz={},wzStep=1,finishWizardOverride=false;
function startWizard(){wz={name:pendingName||(profile&&profile.name)||'',phone:pendingPhone||(profile&&profile.phone)||'',gender:'male',goal:'recomp',experience:'intermediate',days:6,activity:'light'};wzStep=1;document.getElementById('wizard').classList.add('show');renderWizard();}
function renderWizard(){
  ['d1','d2','d3'].forEach((d,i)=>document.getElementById(d).classList.toggle('on',i<wzStep));
  const t=document.getElementById('wzTitle'),s=document.getElementById('wzSub'),b=document.getElementById('wzBody'),nav=document.getElementById('wzNav');
  const opt=(key,arr)=>arr.map(o=>`<button class="opt ${wz[key]==o.v?'sel':''}" data-k="${key}" data-v="${o.v}">${o.t}</button>`).join('');
  if(wzStep===1){t.textContent="About You";s.textContent="Your body details — used to calculate your targets";
    b.innerHTML=`<div class="form-card"><div class="field"><label>Name</label><input id="w-name" type="text" value="${wz.name||''}" placeholder="Your name" /></div><div class="field"><label>Phone Number</label><input id="w-phone" type="tel" inputmode="tel" value="${wz.phone||''}" placeholder="03xx-xxxxxxx" /></div><div class="field"><label>Gender</label><div class="opt-row">${opt('gender',[{v:'male',t:'Male'},{v:'female',t:'Female'}])}</div></div><div class="field"><label>Age (years)</label><input id="w-age" type="number" inputmode="numeric" value="${wz.age||''}" placeholder="25" /></div><div class="grid2"><div class="field"><label>Height (cm)</label><input id="w-height" type="number" inputmode="decimal" value="${wz.height||''}" placeholder="178" /></div><div class="field"><label>Weight (kg)</label><input id="w-weight" type="number" inputmode="decimal" value="${wz.weight||''}" placeholder="88" /></div></div></div>`;
  }else if(wzStep===2){t.textContent="Your Goal";s.textContent="What do you want? (diet + workout adapt to this)";
    b.innerHTML=Object.keys(GOALS).map(k=>{const g=GOALS[k];return `<div class="goal-card ${wz.goal===k?'sel':''}" data-goal="${k}"><div class="gc-emoji">${g.emoji}</div><div class="gc-t"><b>${g.label}</b><span>${g.desc}</span></div><div class="gc-tick"></div></div>`;}).join('');
  }else{t.textContent="Training Setup";s.textContent="Pick your experience and days per week";
    b.innerHTML=`<div class="form-card"><div class="field"><label>Experience Level</label><div class="opt-row">${opt('experience',[{v:'beginner',t:'Beginner'},{v:'intermediate',t:'Intermediate'},{v:'advanced',t:'Advanced'}])}</div></div><div class="field"><label>Days per week</label><div class="opt-row">${opt('days',[{v:3,t:'3 Day'},{v:4,t:'4 Day'},{v:5,t:'5 Day'},{v:6,t:'6 Day'}])}</div></div><div class="field"><label>Daily activity (job/routine)</label><div class="opt-row">${opt('activity',[{v:'sedentary',t:'Desk'},{v:'light',t:'Light'},{v:'active',t:'Active'}])}</div></div></div>`;
  }
  nav.innerHTML=`${wzStep>1?'<button class="big-btn sec" id="wzBack">← Back</button>':''}<button class="big-btn" id="wzNext">${wzStep<3?'Next →':'✓ Create My Plan'}</button>`;
  b.querySelectorAll('.opt').forEach(x=>x.onclick=()=>{let v=x.dataset.v;if(x.dataset.k==='days')v=+v;wz[x.dataset.k]=v;renderWizard();});
  b.querySelectorAll('.goal-card').forEach(x=>x.onclick=()=>{wz.goal=x.dataset.goal;renderWizard();});
  const bk=document.getElementById('wzBack');if(bk)bk.onclick=()=>{saveWzStep();wzStep--;renderWizard();};
  document.getElementById('wzNext').onclick=()=>{if(!saveWzStep())return;if(wzStep<3){wzStep++;renderWizard();}else finishWizard();};
}
function saveWzStep(){if(wzStep===1){wz.name=(document.getElementById('w-name').value||'').trim();wz.phone=(document.getElementById('w-phone').value||'').trim();wz.age=document.getElementById('w-age').value;wz.height=document.getElementById('w-height').value;wz.weight=document.getElementById('w-weight').value;if(!wz.phone||wz.phone.replace(/\D/g,'').length<7){showToast('Enter a valid phone number');return false;}if(!wz.age||!wz.height||!wz.weight){showToast('Fill age, height, weight');return false;}if(+wz.height<100||+wz.height>250){showToast('Enter height in cm (e.g. 178)');return false;}}return true;}
function finishWizard(){
  if(finishWizardOverride){profile={name:wz.name,phone:wz.phone,gender:wz.gender,age:wz.age,height:wz.height,weight:wz.weight,activity:wz.activity};LS.set(uk('profile'),profile);finishWizardOverride=false;document.getElementById('wizard').classList.remove('show');rebuildPLAN();setView('profile');showToast('Updated');return;}
  profile={name:wz.name,phone:wz.phone,gender:wz.gender,age:wz.age,height:wz.height,weight:wz.weight,activity:wz.activity};
  LS.set(uk('profile'),profile);
  const plan={id:newId(),name:GOALS[wz.goal].label+" Plan",goal:wz.goal,experience:wz.experience,days:wz.days};
  plans=[Object.assign({},AM_META),plan];activePlanId=AM_META.id;LS.set(uk('plans'),plans);LS.set(uk('active'),activePlanId);
  document.getElementById('wizard').classList.remove('show');rebuildPLAN();currentView='home';currentDay=0;bootUI();showToast('Plan ready 💪');
}

/* ===== GENERIC MODAL ===== */
const modal=document.getElementById('modal'),modalBox=document.getElementById('modalBox');
function openModal(html){modalBox.innerHTML=html;modal.classList.add('open');}
function closeModal(){modal.classList.remove('open');}
modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
function modalHead(title){return `<div class="mh"><h3>${title}</h3><button class="mx" onclick="closeModal()">×</button></div>`;}

/* ===== TOOLS (1RM + Plate) ===== */
function openTools(){
  openModal(`${modalHead('🧮 Tools')}
    <div class="section-title" style="margin-top:0">1-Rep Max Calculator</div>
    <div class="grid2"><input id="rmW" type="number" inputmode="decimal" placeholder="Weight (kg)" style="background:var(--bg-2);border:1px solid var(--border);color:var(--text);border-radius:11px;padding:12px;font-weight:700;text-align:center"/><input id="rmR" type="number" inputmode="numeric" placeholder="Reps" style="background:var(--bg-2);border:1px solid var(--border);color:var(--text);border-radius:11px;padding:12px;font-weight:700;text-align:center"/></div>
    <button class="ghost-btn" id="rmCalc">Calculate 1RM</button>
    <div id="rmOut"></div>
    <div class="section-title">Plate Calculator</div>
    <div class="grid2"><input id="plT" type="number" inputmode="decimal" placeholder="Target (kg)" style="background:var(--bg-2);border:1px solid var(--border);color:var(--text);border-radius:11px;padding:12px;font-weight:700;text-align:center"/><input id="plB" type="number" inputmode="decimal" value="20" placeholder="Bar (kg)" style="background:var(--bg-2);border:1px solid var(--border);color:var(--text);border-radius:11px;padding:12px;font-weight:700;text-align:center"/></div>
    <button class="ghost-btn" id="plCalc">Show Plates</button>
    <div id="plOut"></div>`);
  document.getElementById('rmCalc').onclick=()=>{const w=+document.getElementById('rmW').value,r=+document.getElementById('rmR').value;if(!w||!r){showToast('Enter weight & reps');return;}const m=oneRM(w,r);document.getElementById('rmOut').innerHTML=`<div class="calc-out">Estimated 1RM<br><b>${m} kg</b></div><div style="font-size:12px;color:var(--muted);line-height:1.7">90% → ${Math.round(m*.9)}kg · 80% → ${Math.round(m*.8)}kg · 70% → ${Math.round(m*.7)}kg</div>`;};
  document.getElementById('plCalc').onclick=()=>{const t=+document.getElementById('plT').value,bar=+document.getElementById('plB').value||20;if(!t){showToast('Enter target weight');return;}const pl=platesFor(t,bar);document.getElementById('plOut').innerHTML=pl.length?`<div class="calc-out" style="text-align:left">Per side (bar ${bar}kg):<div class="plate-list" style="margin-top:8px">${pl.map(p=>`<span class="plate">${p}</span>`).join('')}</div></div>`:`<div class="calc-out">Target ≤ bar weight</div>`;};
}

/* ===== ADD CUSTOM FOOD ===== */
function openAddFood(){
  openModal(`${modalHead('＋ Custom Food')}
    <div class="field"><label>Food name</label><input id="nf-n" type="text" placeholder="e.g. Protein Bar"/></div>
    <div class="field"><label>Serving (e.g. 1 bar)</label><input id="nf-u" type="text" placeholder="1 serving"/></div>
    <div class="grid2"><div class="field"><label>Calories</label><input id="nf-cal" type="number" inputmode="numeric" placeholder="200"/></div><div class="field"><label>Protein (g)</label><input id="nf-p" type="number" inputmode="numeric" placeholder="20"/></div></div>
    <div class="grid2"><div class="field"><label>Carbs (g)</label><input id="nf-c" type="number" inputmode="numeric" placeholder="20"/></div><div class="field"><label>Fat (g)</label><input id="nf-f" type="number" inputmode="numeric" placeholder="8"/></div></div>
    <button class="big-btn" id="nfSave">Save Food</button>`);
  document.getElementById('nfSave').onclick=()=>{const n=(document.getElementById('nf-n').value||'').trim();if(!n){showToast('Enter name');return;}const food={n,u:(document.getElementById('nf-u').value||'1 serving').trim(),cal:+document.getElementById('nf-cal').value||0,p:+document.getElementById('nf-p').value||0,c:+document.getElementById('nf-c').value||0,f:+document.getElementById('nf-f').value||0};const arr=LS.get(uk('foods'),[]);arr.push(food);LS.set(uk('foods'),arr);closeModal();renderDiet();showToast('Food added');};
}

/* ===== ALTERNATIVES PICKER (pick any exercise for a muscle slot) ===== */
function regionOf(cat,name){const p=(EX_POOL[cat]||[]).find(x=>x.name===name);return p?p.r:null;}
function openAltPicker(dayIdx,exIdx){
  const day=getEffectiveDay(dayIdx),ex=day.exercises[exIdx];if(ex.custom)return;
  const cat=ex.cat,pool=EX_POOL[cat],reg=ex.r||regionOf(cat,ex.name);
  const row=(p)=>{const i=pool.indexOf(p),home=p.variants.some(v=>/bodyweight|dumbbell/i.test(v.label)),curr=(p.name===ex.name);return `<div class="alt-row ${curr?'cur':''}"><div class="alt-info"><b>${p.c?'🏋️':'🎯'} ${p.name}${home?' 🏠':''}</b><span>${p.r?p.r+' · ':''}${p.c?'Compound':'Isolation'} · ${p.variants.map(v=>v.label).join(' / ')}</span></div><button class="alt-demo" data-demo="${i}">▶</button><button class="alt-use" data-use="${i}">${curr?'Current':'Use'}</button></div>`;};
  const same=reg?pool.filter(p=>p.r===reg):pool,others=reg?pool.filter(p=>p.r!==reg):[];
  openModal(`${modalHead('Ways to train '+(reg||MUSCLE_LABELS[cat]))}
    <p style="color:var(--muted);font-size:12.5px;margin:-6px 0 14px;line-height:1.5">Ways to hit <b style="color:var(--text)">${reg||MUSCLE_LABELS[cat]}</b> — gym or 🏠 home. Tap <b style="color:#ff6b6b">▶</b> to watch how, then <b style="color:var(--text)">Use</b> to add it.</p>
    ${same.map(row).join('')}
    ${others.length?`<div class="section-title">Other ${MUSCLE_LABELS[cat]} regions</div>${others.map(row).join('')}`:''}`);
  document.querySelectorAll('#modalBox .alt-demo').forEach(b=>b.onclick=()=>{const p=pool[+b.dataset.demo];openVideo(p,p.variants[0]);});
  document.querySelectorAll('#modalBox .alt-use').forEach(b=>b.onclick=()=>{chooseExercise(dayIdx,exIdx,+b.dataset.use);closeModal();});
}

/* ===== ADD EXERCISE (database-driven) ===== */
let addExMuscle='chest';
function openAddExercise(dayIdx){addExMuscle='chest';renderAddEx(dayIdx);}
function renderAddEx(dayIdx){
  const pool=EX_POOL[addExMuscle];
  openModal(`${modalHead('＋ Add Exercise')}
    <div class="field"><label>Muscle group</label><select id="ae-c">${Object.keys(MUSCLE_LABELS).map(k=>`<option value="${k}" ${k===addExMuscle?'selected':''}>${MUSCLE_LABELS[k]}</option>`).join('')}</select></div>
    <div class="section-title" style="margin-top:4px">${MUSCLE_LABELS[addExMuscle]} — tap to add</div>
    ${pool.map((p,i)=>`<div class="goal-card" data-add="${i}"><div class="gc-emoji">${p.c?'🏋️':'🎯'}</div><div class="gc-t"><b>${p.name}</b><span>${p.c?'Compound':'Isolation'} · ${p.variants.map(v=>v.label).join(' / ')}</span></div><div class="pc-badge" style="color:var(--accent-2);background:rgba(255,90,60,.12)">＋ Add</div></div>`).join('')}
    <div class="section-title">Or add your own</div>
    <div class="field"><input id="ae-n" type="text" placeholder="Custom exercise name"/></div>
    <button class="ghost-btn" id="ae-custom" style="margin-top:0">＋ Add Custom</button>`);
  document.getElementById('ae-c').onchange=e=>{addExMuscle=e.target.value;renderAddEx(dayIdx);};
  document.querySelectorAll('#modalBox .goal-card[data-add]').forEach(el=>el.onclick=()=>{const p=pool[+el.dataset.add];addCustomExercise(dayIdx,{name:p.name,cat:addExMuscle,variants:p.variants,c:p.c});closeModal();});
  document.getElementById('ae-custom').onclick=()=>{const n=(document.getElementById('ae-n').value||'').trim();if(!n){showToast('Enter a name');return;}addCustomExercise(dayIdx,{name:n,cat:addExMuscle,c:0});closeModal();};
}

/* ===== EXERCISE PROGRESS CHART ===== */
function openExerciseChart(name){
  const eh=(LS.get(uk('exhist'),{})[name])||[];
  let body;
  if(eh.length<2){body=`<div class="info-banner">Log this exercise's weight on at least 2 different days to see a progress graph.</div>`;}
  else{const ws=eh.map(x=>x.w),min=Math.min(...ws),max=Math.max(...ws),range=(max-min)||1,n=eh.length,W=300,H=130,pad=12;const pts=eh.map((x,i)=>{const px=pad+(i/(n-1))*(W-2*pad),py=pad+(1-(x.w-min)/range)*(H-2*pad);return `${px.toFixed(1)},${py.toFixed(1)}`;}).join(' ');body=`<div class="chart"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="#ffb020" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${eh.map((x,i)=>{const px=pad+(i/(n-1))*(W-2*pad),py=pad+(1-(x.w-min)/range)*(H-2*pad);return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="#ff5a3c"/>`;}).join('')}</svg></div><div style="font-size:12px;color:var(--muted)">From ${eh[0].w}kg → ${eh[eh.length-1].w}kg over ${n} sessions 💪</div>`;}
  openModal(`${modalHead('📈 '+name)}${body}`);
}

/* ===== SHARE ===== */
function shareProgress(){
  const ap=activePlan(),text=`💪 My FitForge progress\nPlan: ${ap.name}\n🔥 Streak: ${streak()} days\n🏋️ Workouts done: ${totalWorkouts()}\n💧 Water today: ${getWater()}/${WATER_GOAL}\n\nTrain with FitForge: https://maksof-rehan.github.io/fitforge/`;
  if(navigator.share){navigator.share({title:'FitForge',text}).catch(()=>{});}
  else if(navigator.clipboard){navigator.clipboard.writeText(text).then(()=>showToast('Copied to clipboard')).catch(()=>showToast('Copy failed'));}
  else showToast('Sharing not supported');
}

/* ===== VIDEO (in-app YouTube player + shared auto-save) ===== */
const vidModal=document.getElementById('vidModal');
let ytPlayer=null,ytReady=false,ytCurrentEx=null,ytCurrentLabel=null;
window.onYouTubeIframeAPIReady=function(){ytReady=true;};
function ensurePlayer(cb){
  if(ytPlayer){cb&&cb();return;}
  if(!ytReady||typeof YT==='undefined'||!YT.Player){setTimeout(()=>ensurePlayer(cb),250);return;}
  ytPlayer=new YT.Player('ytplayer',{width:'100%',height:'100%',playerVars:{playsinline:1,rel:0,modestbranding:1},events:{onReady:()=>cb&&cb(),onStateChange:onYtState}});
}
function onYtState(e){
  if(e.data===1&&ytPlayer){try{const d=ytPlayer.getVideoData(),vid=d&&d.video_id,title=d&&d.title;if(ytCurrentEx&&vid&&videoTitleMatches(ytCurrentEx,title)&&getVideo(ytCurrentEx,ytCurrentLabel)!==vid){saveVideo(ytCurrentEx,ytCurrentLabel,vid);showToast('Demo saved for everyone ✓');}}catch(_){}}
}
function openVideo(ex,variant){
  ytCurrentEx=ex.name;ytCurrentLabel=variant.label;
  document.getElementById('vidTitle').childNodes[0].nodeValue=ex.name+' ';
  document.getElementById('vidSub').textContent=variant.label;
  const saved=getVideo(ex.name,variant.label),searchUrl='https://www.youtube.com/results?search_query='+encodeURIComponent('deltabolic '+variant.q);
  document.getElementById('vidNAyt').href=searchUrl;
  const na=document.getElementById('vidNA'),pl=document.getElementById('ytplayer');
  vidModal.classList.add('open');document.body.style.overflow='hidden';
  document.getElementById('vidHint').textContent=saved?'Demo playing':'Demo not added yet';
  if(saved){na.style.display='none';pl.style.display='block';ensurePlayer(()=>{try{ytPlayer.loadVideoById(saved);}catch(_){}});}
  else{na.style.display='flex';pl.style.display='none';try{if(ytPlayer)ytPlayer.stopVideo();}catch(_){}}
}
function closeVideo(){vidModal.classList.remove('open');document.body.style.overflow='';try{if(ytPlayer)ytPlayer.pauseVideo();}catch(_){}}
document.getElementById('vidClose').onclick=closeVideo;
vidModal.addEventListener('click',e=>{if(e.target===vidModal)closeVideo();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(vidModal.classList.contains('open'))closeVideo();if(modal.classList.contains('open'))closeModal();}});

/* ===== SESSION STOPWATCH ===== */
let sessStart=0,sessInterval=null;
function startSession(){if(!sessStart)sessStart=Date.now();if(sessInterval)clearInterval(sessInterval);sessInterval=setInterval(sessionTick,1000);}
function stopSession(){if(sessInterval){clearInterval(sessInterval);sessInterval=null;}sessStart=0;}
function sessionTick(){const el=document.getElementById('sessTime');if(!el||!sessStart)return;const s=Math.floor((Date.now()-sessStart)/1000);el.textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}

/* ===== REST TIMER ===== */
const timerPanel=document.getElementById('timerPanel'),timerDisplay=document.getElementById('timerDisplay'),fabLabel=document.getElementById('fabLabel');
let timerSec=90,timerRemain=90,timerInterval=null,timerRunning=false;
function fmt(s){const m=Math.floor(s/60),ss=s%60;return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;}
function updateTimerDisplay(){timerDisplay.textContent=fmt(timerRemain);timerDisplay.classList.toggle('warn',timerRemain<=10&&timerRemain>0);timerDisplay.classList.toggle('done',timerRemain===0);fabLabel.textContent=timerRunning?fmt(timerRemain):'Rest Timer';}
function setTimerSeconds(sec){timerSec=sec;timerRemain=sec;document.querySelectorAll('.timer-preset').forEach(x=>x.classList.toggle('active',+x.dataset.sec===sec));updateTimerDisplay();}
function openTimer(a){document.getElementById('timerFab').classList.add('show');timerPanel.classList.add('open');if(a){resetTimer();startTimer();}}
function startTimer(){if(timerRunning)return;timerRunning=true;const b=document.getElementById('tStart');b.textContent='Pause';b.classList.remove('t-start');b.classList.add('t-pause');timerInterval=setInterval(()=>{timerRemain--;if(timerRemain<=0){clearInterval(timerInterval);timerRunning=false;timerRemain=0;updateTimerDisplay();if(navigator.vibrate)navigator.vibrate([200,100,200,100,400]);beep();const bb=document.getElementById('tStart');bb.textContent='Start';bb.classList.add('t-start');bb.classList.remove('t-pause');return;}updateTimerDisplay();},1000);}
function pauseTimer(){clearInterval(timerInterval);timerRunning=false;const b=document.getElementById('tStart');b.textContent='Start';b.classList.add('t-start');b.classList.remove('t-pause');updateTimerDisplay();}
function resetTimer(){clearInterval(timerInterval);timerRunning=false;timerRemain=timerSec;const b=document.getElementById('tStart');b.textContent='Start';b.classList.add('t-start');b.classList.remove('t-pause');updateTimerDisplay();}
function beep(){try{const ctx=new(window.AudioContext||window.webkitAudioContext)(),o=ctx.createOscillator(),gn=ctx.createGain();o.type='sine';o.frequency.value=880;o.connect(gn);gn.connect(ctx.destination);gn.gain.setValueAtTime(0.3,ctx.currentTime);gn.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5);o.start();o.stop(ctx.currentTime+0.5);}catch(e){}}
document.getElementById('timerFab').onclick=()=>timerPanel.classList.toggle('open');
document.getElementById('tStart').onclick=()=>timerRunning?pauseTimer():startTimer();
document.getElementById('tReset').onclick=resetTimer;
document.getElementById('tClose').onclick=()=>timerPanel.classList.remove('open');
document.querySelectorAll('.timer-preset').forEach(b=>b.onclick=()=>setTimerSeconds(+b.dataset.sec));

/* ===== TOAST ===== */
let toastTimer;function showToast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1500);}

/* ===== BOOT ===== */
document.querySelectorAll('.nav-item').forEach(n=>n.onclick=()=>setView(n.dataset.view));
function bootUI(){document.getElementById('bottomNav').style.display='flex';rebuildPLAN();updateTimerDisplay();try{history.replaceState({view:'home'},'');}catch(e){}renderApp();}
/* App-like Back button: close overlays first, else go to previous screen (only exits from Home) */
window.addEventListener('popstate',e=>{
  if(!currentUser)return;
  if(vidModal.classList.contains('open')){closeVideo();try{history.pushState({view:currentView},'');}catch(_){}return;}
  if(modal.classList.contains('open')){closeModal();try{history.pushState({view:currentView},'');}catch(_){}return;}
  if(document.getElementById('wizard').classList.contains('show'))return;
  const v=(e.state&&e.state.view)||'home';currentView=v;if(v!=='workout')currentDay=0;renderApp();window.scrollTo({top:0});
});
function boot(){
  applyTheme();
  if(typeof firebase==='undefined'){showAuth();setTimeout(()=>authError('Internet required — Firebase did not load'),300);return;}
  auth=firebase.auth();db=firebase.firestore();
  try{db.enablePersistence({synchronizeTabs:true}).catch(()=>{});}catch(e){}
  auth.onAuthStateChanged(async user=>{
    if(user){currentUser=user.uid;fbEmail=user.email;await proceedAfterAuth(user);}
    else{currentUser=null;profile=null;plans=[];pendingName='';pendingPhone='';document.getElementById('bottomNav').style.display='none';document.getElementById('wizard').classList.remove('show');document.getElementById('verify').classList.remove('show');showAuth();}
  });
}
async function proceedAfterAuth(user){
  currentView='home';currentDay=0;
  document.getElementById('auth').classList.remove('show');
  document.getElementById('verify').classList.remove('show');
  await pullCloud(user.uid);loadUser();loadVideoMap();touchActivity();
  if(profile&&plans.length){bootUI();}else{startWizard();}
  if(!user.emailVerified)showToast('📧 Please verify your email (optional)');
}
function showVerify(){
  document.getElementById('auth').classList.remove('show');
  const v=document.getElementById('verify');v.classList.add('show');
  document.getElementById('verifyMsg').textContent='We sent a verification link to '+(fbEmail||'your email')+'. Open it, tap the link, then press Continue.';
  document.getElementById('vrfContinue').onclick=()=>{const u=auth.currentUser;if(!u)return;u.reload().then(()=>{if(auth.currentUser.emailVerified){v.classList.remove('show');proceedAfterAuth(auth.currentUser);}else showToast('Not verified yet — check your email');}).catch(()=>showToast('Try again'));};
  document.getElementById('vrfResend').onclick=()=>{const u=auth.currentUser;if(!u)return;u.sendEmailVerification().then(()=>showToast('Verification email sent')).catch(e=>showToast(fbErr(e)));};
  document.getElementById('vrfLogout').onclick=()=>{v.classList.remove('show');logout();};
}
let lastTap=0;document.addEventListener('touchend',e=>{const now=Date.now();if(now-lastTap<300)e.preventDefault();lastTap=now;},{passive:false});
boot();
