/* ============================================================
   FitForge · VIEWS (all screen renderers)
   ============================================================ */
function setHeader(t,s){document.getElementById('hTitle').textContent=t;document.getElementById('hSub').textContent=s;}
function setView(v){currentView=v;if(v!=='workout')currentDay=0;try{history.pushState({view:v},'');}catch(e){}renderApp();window.scrollTo({top:0});}
function renderApp(){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===currentView));
  document.getElementById('tabs').style.display='none';document.getElementById('progressWrap').style.display='none';
  document.getElementById('timerFab').classList.remove('show');document.getElementById('timerPanel').classList.remove('open');
  document.getElementById('hChip').style.display='none';
  if(currentView!=='workout')stopSession();
  if(currentView==='home')renderHome();else if(currentView==='workout')renderWorkout();else if(currentView==='diet')renderDiet();else if(currentView==='progress')renderProgress();else if(currentView==='profile')renderProfile();else if(currentView==='plans')renderPlans();else if(currentView==='calendar')renderCalendar();else if(currentView==='admin')renderAdmin();
  const _a=document.getElementById('app');if(_a){_a.classList.remove('view-in');void _a.offsetWidth;_a.classList.add('view-in');}
}
let calRef=null;

/* ---------- HOME ---------- */
function renderHome(){
  const ap=activePlan(),c=calc(profile,ap.goal),g=GOALS[ap.goal];
  setHeader(profile.name?`Hi, ${profile.name} 👋`:'FitForge',`${g.label} · ${EXP_LABEL[ap.experience]} · ${ap.days} day`);
  const chip=document.getElementById('hChip');chip.style.display='inline-flex';chip.innerHTML=`<span>${ap.emoji||g.emoji} ${ap.name}</span>`;chip.onclick=()=>setView('plans');
  const sched=LS.get(uk('schedule'),{}),schedIdx=sched[new Date().getDay()],hd=(schedIdx!=null?schedIdx:currentDay)%PLAN.length;
  const td=PLAN[hd],water=getWater(),wpct=Math.min(100,Math.round(water/WATER_GOAL*100));
  const q=QUOTES[(new Date().getDate()+new Date().getMonth())%QUOTES.length];
  const unverified=auth&&auth.currentUser&&!auth.currentUser.emailVerified;
  document.getElementById('app').innerHTML=`
    ${unverified?`<div class="info-banner" id="verifyBanner" style="border-color:rgba(255,176,32,.45);background:linear-gradient(135deg,rgba(255,176,32,.13),transparent);cursor:pointer">📧 <b>Email not verified.</b> Tap to send the verification link — or ignore, app works fine.</div>`:''}
    <div class="hero"><h2>${g.emoji} ${g.label}</h2><div class="focus">Today's targets — let's get to work</div>
      <div class="stats"><div class="stat"><b>${c.bmi}</b><span>BMI · ${c.bmiCat}</span></div><div class="stat"><b>${c.cals}</b><span>Calories</span></div><div class="stat"><b>${c.protein}g</b><span>Protein</span></div></div></div>
    <div class="quote">“${q}”</div>
    <div class="grid2"><div class="stat-card accent"><div class="lbl">🔥 Streak</div><div class="val">${streak()}<small> days</small></div></div><div class="stat-card"><div class="lbl">Workouts Done</div><div class="val">${totalWorkouts()}</div></div></div>
    <div class="grid2" style="margin-top:10px"><div class="stat-card"><div class="lbl">Daily Calories</div><div class="val">${c.cals}<small> kcal</small></div></div><div class="stat-card"><div class="lbl">Maintenance</div><div class="val">${c.tdee}<small> kcal</small></div></div></div>
    <div class="macro-row"><div class="macro p"><b>${c.protein}g</b><span>Protein</span></div><div class="macro c"><b>${c.carbs}g</b><span>Carbs</span></div><div class="macro f"><b>${c.fat}g</b><span>Fat</span></div></div>
    <div class="water-card"><div class="water-top"><div class="wt-l">💧 <b>${water}</b><span>/ ${WATER_GOAL} glasses (~3L)</span></div><div class="water-btns"><button id="wMinus">−</button><button class="add" id="wPlus">+</button></div></div><div class="water-bar"><i style="width:${wpct}%"></i></div></div>
    <div class="section-title">Today's Workout<button id="seeAll">All days →</button></div>
    <div class="exercise" id="todayWk" style="cursor:pointer"><div class="ex-head"><div class="ex-num" style="font-size:16px">${td.emoji}</div><div class="ex-name"><h3>${td.title}</h3><div class="sub">${schedIdx!=null?'📅 Scheduled today · ':''}${td.focus} · ${td.exercises.length} exercises</div></div></div></div>
    <button class="big-btn" id="goWk">🏋️ Start Workout</button>
    <button class="ghost-btn" id="goDiet">🍽️ View Today's Diet</button>
    <button class="ghost-btn" id="goCal">📅 Open Calendar</button>
    <div class="section-title">My Plans<button id="mgPlans">Manage →</button></div>
    ${plans.map(p=>{const pg=GOALS[p.goal];return `<div class="plan-card ${p.id===activePlanId?'active':''}" data-pid="${p.id}"><div class="pc-e">${p.emoji||pg.emoji}</div><div class="pc-t"><b>${p.name}</b><span>${pg.label} · ${EXP_LABEL[p.experience]} · ${p.days} day</span></div>${p.id===activePlanId?'<div class="pc-badge">Active</div>':''}</div>`;}).join('')}
    <button class="ghost-btn" id="addPlan">＋ Add a New Plan</button><div style="height:8px"></div>`;
  document.getElementById('goWk').onclick=()=>{currentDay=hd;setView('workout');};
  document.getElementById('todayWk').onclick=()=>{currentDay=hd;setView('workout');};
  document.getElementById('seeAll').onclick=()=>setView('workout');
  document.getElementById('goDiet').onclick=()=>setView('diet');
  document.getElementById('goCal').onclick=()=>{calRef=new Date();setView('calendar');};
  document.getElementById('mgPlans').onclick=()=>setView('plans');
  document.getElementById('addPlan').onclick=()=>setView('plans');
  document.getElementById('wPlus').onclick=()=>changeWater(1);
  document.getElementById('wMinus').onclick=()=>changeWater(-1);
  document.querySelectorAll('#app .plan-card').forEach(el=>el.onclick=()=>switchPlan(el.dataset.pid));
  const vb=document.getElementById('verifyBanner');if(vb)vb.onclick=()=>{const u=auth&&auth.currentUser;if(u)u.sendEmailVerification().then(()=>showToast('Verification email sent ✓')).catch(e=>showToast(fbErr(e)));};
}

/* ---------- PLANS ---------- */
function switchPlan(id){activePlanId=id;LS.set(uk('active'),id);rebuildPLAN();currentDay=0;showToast('Plan switched');setView('home');}
function renderPlans(){
  setHeader('My Plans','Switch · add · customize');
  document.getElementById('app').innerHTML=`
    <div class="section-title">My Plans</div>
    ${plans.map(p=>{const g=GOALS[p.goal];return `<div class="plan-card ${p.id===activePlanId?'active':''}" data-pid="${p.id}"><div class="pc-e">${p.emoji||g.emoji}</div><div class="pc-t"><b>${p.name}</b><span>${g.label} · ${EXP_LABEL[p.experience]} · ${p.days} day</span></div>${p.id===activePlanId?'<div class="pc-badge">Active</div>':`<button class="pc-del" data-del="${p.id}">×</button>`}</div>`;}).join('')||'<div class="info-banner">No plans yet — create one below.</div>'}
    <div class="section-title">Ready-made Library</div>
    ${LIBRARY.map((l,i)=>`<div class="plan-card" data-lib="${i}"><div class="pc-e">${l.emoji}</div><div class="pc-t"><b>${l.name}</b><span>${l.desc}</span></div><div class="pc-badge" style="color:var(--accent-2);background:rgba(255,90,60,.12)">＋ Add</div></div>`).join('')}
    <div class="section-title">Build a Custom Plan</div>
    <div class="form-card" id="customForm"></div><div style="height:8px"></div>`;
  document.querySelectorAll('#app .plan-card[data-pid]').forEach(el=>el.onclick=e=>{if(e.target.dataset.del)return;switchPlan(el.dataset.pid);});
  document.querySelectorAll('#app .pc-del').forEach(b=>b.onclick=e=>{e.stopPropagation();delPlan(b.dataset.del);});
  document.querySelectorAll('#app .plan-card[data-lib]').forEach(el=>el.onclick=()=>addFromLibrary(+el.dataset.lib));
  renderCustomForm();
}
let cf={name:'',goal:'recomp',experience:'intermediate',days:5};
function renderCustomForm(){
  const opt=(key,arr)=>arr.map(o=>`<button class="opt ${cf[key]==o.v?'sel':''}" data-ck="${key}" data-v="${o.v}">${o.t}</button>`).join('');
  document.getElementById('customForm').innerHTML=`
    <div class="field"><label>Plan name</label><input id="cf-name" type="text" value="${cf.name}" placeholder="e.g. Summer Cut" /></div>
    <div class="field"><label>Goal</label><div class="opt-row">${opt('goal',Object.keys(GOALS).map(k=>({v:k,t:GOALS[k].label})))}</div></div>
    <div class="field"><label>Experience</label><div class="opt-row">${opt('experience',[{v:'beginner',t:'Beginner'},{v:'intermediate',t:'Inter'},{v:'advanced',t:'Advanced'}])}</div></div>
    <div class="field"><label>Days/week</label><div class="opt-row">${opt('days',[{v:3,t:'3'},{v:4,t:'4'},{v:5,t:'5'},{v:6,t:'6'}])}</div></div>
    <button class="big-btn" id="cfCreate">✓ Create Plan</button>`;
  document.querySelectorAll('#customForm .opt').forEach(x=>x.onclick=()=>{let v=x.dataset.v;if(x.dataset.ck==='days')v=+v;cf[x.dataset.ck]=v;cf.name=document.getElementById('cf-name').value;renderCustomForm();});
  document.getElementById('cfCreate').onclick=()=>{const name=(document.getElementById('cf-name').value||'').trim()||GOALS[cf.goal].label+' Plan';const plan={id:newId(),name,goal:cf.goal,experience:cf.experience,days:cf.days};plans.push(plan);LS.set(uk('plans'),plans);switchPlan(plan.id);};
}
function addFromLibrary(i){const l=LIBRARY[i],plan={id:newId(),name:l.name,goal:l.goal,experience:l.experience,days:l.days,emoji:l.emoji};plans.push(plan);LS.set(uk('plans'),plans);switchPlan(plan.id);}
function delPlan(id){if(plans.length<=1){showToast('Keep at least 1 plan');return;}if(!confirm('Delete this plan?'))return;plans=plans.filter(p=>p.id!==id);LS.set(uk('plans'),plans);Object.keys(localStorage).filter(k=>k.indexOf(uk(`prog-${id}-`))===0).forEach(k=>localStorage.removeItem(k));if(activePlanId===id){activePlanId=plans[0].id;LS.set(uk('active'),activePlanId);rebuildPLAN();}renderPlans();showToast('Deleted');}

/* ---------- WORKOUT ---------- */
function renderWorkout(){const ap=activePlan();setHeader(ap.name,SPLITS[ap.days].name);document.getElementById('tabs').style.display='flex';document.getElementById('progressWrap').style.display='block';document.getElementById('timerFab').classList.add('show');startSession();renderTabs();renderDay();}
function renderTabs(){const wrap=document.getElementById('tabs');wrap.innerHTML='';PLAN.forEach((d,idx)=>{const btn=document.createElement('button');btn.className='tab'+(idx===currentDay?' active':'');const prog=loadProgress(idx),total=d.exercises.reduce((a,e)=>a+e.sets,0),done=d.exercises.reduce((a,e,i)=>a+getEx(prog,i).done,0);if(total>0&&done===total)btn.classList.add('done');btn.innerHTML=`<span class="dot"></span>${d.title}`;btn.onclick=()=>{currentDay=idx;renderTabs();renderDay();window.scrollTo({top:0,behavior:'smooth'});};wrap.appendChild(btn);});}
function renderDay(){
  const day=getEffectiveDay(currentDay),app=document.getElementById('app'),prog=loadProgress(currentDay),prs=LS.get(uk('prs'),{}),eh=LS.get(uk('exhist'),{});
  const total=day.exercises.reduce((a,e)=>a+e.sets,0),done=day.exercises.reduce((a,e,i)=>a+getEx(prog,i).done,0);
  app.innerHTML=`<div class="hero"><h2>${day.emoji} ${day.title}</h2><div class="focus">${day.focus}</div><div class="stats"><div class="stat"><b>${day.exercises.length}</b><span>Exercises</span></div><div class="stat"><b>${total}</b><span>Sets</span></div><div class="stat"><b>${done}</b><span>Done</span></div><div class="stat"><b id="sessTime">00:00</b><span>Session</span></div></div></div>
    <button class="ghost-btn" id="toolsBtn" style="margin-top:0">🧮 Tools (1RM & Plate Calculator)</button>`;
  day.exercises.forEach((ex,idx)=>{
    const exData=getEx(prog,idx),card=document.createElement('div');card.className='exercise';
    const badges=[`<span class="badge sets">${ex.sets} × ${ex.reps}</span>`];if(ex.dropSet)badges.push(`<span class="badge drop">Drop Set</span>`);
    if(prs[ex.name])badges.push(`<span class="badge pr">PR ${prs[ex.name]}kg</span>`);
    const lastArr=eh[ex.name];if(lastArr&&lastArr.length)badges.push(`<span class="badge last">Last ${lastArr[lastArr.length-1].w}kg</span>`);
    const note=ex.variants.length>1?`<div class="sub">Pick one · ${ex.rest}s rest · beat your last set ↑</div>`:`<div class="sub">${ex.rest}s rest · beat your last set ↑</div>`;
    let vids=ex.variants.map((v,vi)=>`<button class="vid-btn" data-ex="${idx}" data-v="${vi}"><svg viewBox="0 0 24 24"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3L10 15z"/></svg>${v.label}</button>`).join('');
    if(ex.custom)vids+=`<button class="vid-btn rm" data-rm="${idx}">🗑 Remove</button>`;else vids+=`<button class="vid-btn swap" data-alt="${idx}">🔀 Alternatives (${EX_POOL[ex.cat].length})</button>`;
    const setHtml=Array.from({length:ex.sets}).map((_,s)=>{const isDone=s<exData.done,isDrop=ex.dropSet&&s===ex.sets-1,lg=exData.log[s]||{};return `<div class="set ${isDone?'done':''} ${isDrop?'drop-set':''}" data-ex="${idx}" data-set="${s}" data-rest="${ex.rest}"><div class="set-num">${isDrop?'Drop':'Set '+(s+1)}</div><div class="set-inputs"><input class="s-w" type="number" inputmode="decimal" data-ex="${idx}" data-set="${s}" value="${lg.w??''}" placeholder="kg" /><span class="x">×</span><input class="s-r" type="number" inputmode="numeric" data-ex="${idx}" data-set="${s}" value="${lg.r??''}" placeholder="reps" /></div><div class="set-check"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div></div>`;}).join('');
    card.innerHTML=`<div class="ex-head"><div class="ex-num">${idx+1}</div><div class="ex-name"><h3>${ex.name}</h3>${note}<div class="badges">${badges.join('')}</div></div></div><div class="videos">${vids}</div><div class="sets">${setHtml}</div>`;
    app.appendChild(card);
  });
  const addBtn=document.createElement('button');addBtn.className='ghost-btn';addBtn.id='addExBtn';addBtn.textContent='＋ Add Exercise';app.appendChild(addBtn);
  app.querySelectorAll('.vid-btn[data-v]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();const ex=day.exercises[+btn.dataset.ex];openVideo(ex,ex.variants[+btn.dataset.v]);}));
  app.querySelectorAll('.vid-btn[data-alt]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();openAltPicker(currentDay,+btn.dataset.alt);}));
  app.querySelectorAll('.vid-btn[data-rm]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();removeCustomExercise(currentDay,day.baseLen,+btn.dataset.rm);}));
  document.getElementById('toolsBtn').onclick=openTools;
  document.getElementById('addExBtn').onclick=()=>openAddExercise(currentDay);
  app.querySelectorAll('.set').forEach(el=>el.addEventListener('click',e=>{if(e.target.tagName==='INPUT')return;const exIdx=+el.dataset.ex,s=+el.dataset.set,rest=+el.dataset.rest;const prog=loadProgress(currentDay),exData=getEx(prog,exIdx),curr=exData.done;if(s+1===curr)exData.done=curr-1;else exData.done=s+1;prog[exIdx]=exData;saveProgress(currentDay,prog);if(navigator.vibrate)navigator.vibrate(15);if(exData.done===s+1){const tr=LS.get(uk('trained'),{});tr[dateKey()]=(tr[dateKey()]||0)+1;LS.set(uk('trained'),tr);setTimerSeconds(rest);openTimer(true);}const nt=day.exercises.reduce((a,e)=>a+e.sets,0),nd=day.exercises.reduce((a,e,i)=>a+getEx(prog,i).done,0);if(nt>0&&nd===nt)markComplete(currentDay);renderTabs();renderDay();}));
  app.querySelectorAll('.s-w, .s-r').forEach(inp=>{inp.addEventListener('click',e=>e.stopPropagation());inp.addEventListener('change',()=>{const exIdx=+inp.dataset.ex,s=+inp.dataset.set,prog=loadProgress(currentDay),exData=getEx(prog,exIdx);exData.log[s]=exData.log[s]||{};if(inp.classList.contains('s-w')){exData.log[s].w=inp.value;updatePR(day.exercises[exIdx].name,+inp.value);}else exData.log[s].r=inp.value;prog[exIdx]=exData;saveProgress(currentDay,prog);});});
  const pct=total>0?Math.round(done/total*100):0;document.getElementById('progressFill').style.width=pct+'%';document.getElementById('progressText').textContent=`${done} / ${total} sets`;document.getElementById('progressPct').textContent=pct+'%';
  sessionTick();
}

/* ---------- DIET ---------- */
function sumMacros(items){const F=allFoods();return items.reduce((a,it)=>{const f=F[it.f];if(!f)return a;const q=it.q||1;a.cal+=f.cal*q;a.p+=f.p*q;a.c+=f.c*q;a.f+=f.f*q;return a;},{cal:0,p:0,c:0,f:0});}
function suggestedMeals(){return [
  {t:"Breakfast",e:"🍳",items:[{f:0,q:3},{f:2,q:2}],extra:"+ tea (low sugar)"},
  {t:"Pre-Workout",e:"🥭",items:[{f:18,q:1}],extra:"+ coffee · creatine 5g"},
  {t:"Post-Workout",e:"🥤",items:[{f:17,q:1},{f:19,q:1}],extra:"right after training"},
  {t:"Main Meal",e:"🍗",items:[{f:4,q:2},{f:11,q:1},{f:25,q:1}],extra:""},
  {t:"Dinner",e:"🌙",items:[{f:6,q:1.5},{f:2,q:2},{f:24,q:1}],extra:"low oil"},
  {t:"Before Bed",e:"🥛",items:[{f:15,q:1}],extra:""}
];}
function renderDiet(){
  const ap=activePlan(),c=calc(profile,ap.goal);
  setHeader('Diet Plan',`${c.cals} kcal · ${c.protein}g protein`);
  document.getElementById('app').innerHTML=`<div class="seg" style="margin-bottom:14px"><button id="segSug" class="${dietTab==='suggested'?'active':''}">⭐ Suggested</button><button id="segMy" class="${dietTab==='builder'?'active':''}">🛠️ My Plan</button></div><div id="dietBody"></div>`;
  document.getElementById('segSug').onclick=()=>{dietTab='suggested';renderDiet();};
  document.getElementById('segMy').onclick=()=>{dietTab='builder';renderDiet();};
  dietTab==='suggested'?renderSuggested(c):renderBuilder(c);
}
function renderSuggested(c){
  const P=c.protein,C=c.cals,Carb=c.carbs,Fat=c.fat,goal=GOALS[activePlan().goal].label;
  const meals=[
    {t:"Breakfast",e:"🍳",cf:.25,pf:.25,ex:"Whole eggs / egg whites or Greek yogurt + oats + a fruit"},
    {t:"Pre-Workout · 60–90 min before",e:"⚡",cf:.12,pf:.10,ex:"Banana or oats + black coffee — carbs to fuel the session"},
    {t:"Post-Workout",e:"🥤",cf:.18,pf:.22,ex:"Whey protein + fast carbs (banana / white rice)"},
    {t:"Lunch",e:"🍗",cf:.25,pf:.25,ex:"Lean protein (chicken / fish / lean meat) + rice or potato + vegetables"},
    {t:"Dinner",e:"🌙",cf:.20,pf:.18,ex:"Protein (chicken / paneer / fish / lentils) + big salad + a healthy fat (olive oil / nuts)"}
  ];
  document.getElementById('dietBody').innerHTML=`
    <div class="info-banner">📚 <b>Research-based plan · ${goal}</b><br>Daily target: <b>${C} kcal</b> · <b>${P}g protein</b> · ${Carb}g carbs · ${Fat}g fat. Spread protein across meals (~${Math.round(P/5)}g each), keep most carbs around training, and eat vegetables/fiber at every meal.</div>
    ${meals.map(m=>`<div class="exercise"><div class="ex-head"><div class="ex-num" style="font-size:15px">${m.e}</div><div class="ex-name"><h3>${m.t}</h3><div class="sub">Aim ~${Math.round(C*m.cf)} kcal · ~${Math.round(P*m.pf)}g protein</div></div></div><div class="diet-items"><div class="diet-item">• ${m.ex}</div></div></div>`).join('')}
    <div class="info-banner">🔬 <b>Why this works:</b> protein every 3–4h maximises muscle protein synthesis · carbs around training fuel performance & recovery · fibre + 3–4L water improve fullness and digestion · keep dietary fat ~0.8g/kg · ${goal==='Fat Loss'||goal==='Recomp'?'stay in a small calorie deficit and protein high to preserve muscle.':goal==='Muscle Gain'?'eat a slight surplus with high protein to build muscle.':'match calories to maintenance.'}</div>
    <button class="ghost-btn" id="toMy">🛠️ Build my own & track exact macros</button>`;
  document.getElementById('toMy').onclick=()=>{dietTab='builder';renderDiet();};
}
function renderBuilder(c){
  const F=allFoods(),diet=loadDiet(),all=dietItems(diet),tot=sumMacros(all);
  logCalorieDay(tot.cal,tot.p);
  const sc=dietScore(tot,c),circ=2*Math.PI*42,off=circ*(1-sc.score/100);
  const bar=(val,target,cls)=>{const pct=target>0?Math.min(100,Math.round(val/target*100)):0,over=val>target*1.05;return `<div class="tline"><span>${cls.toUpperCase()}</span><span>${Math.round(val)} / ${target}${cls==='cal'?' kcal':'g'}</span></div><div class="tbar ${cls} ${over?'over':''}"><i style="width:${pct}%"></i></div>`;};
  let html=`
    <div class="score-card">
      <svg viewBox="0 0 100 100" class="ring"><circle cx="50" cy="50" r="42" class="ring-bg"/><circle cx="50" cy="50" r="42" class="ring-fg" style="stroke:${sc.color};stroke-dasharray:${circ.toFixed(1)};stroke-dashoffset:${off.toFixed(1)}"/><text x="50" y="48" class="ring-num">${sc.score}</text><text x="50" y="64" class="ring-sub">/ 100</text></svg>
      <div class="score-side"><div class="score-grade" style="color:${sc.color}">${sc.grade} · ${sc.label}</div><div class="score-tip">${sc.tips[0]||''}</div></div>
    </div>
    <div class="target-card">${bar(tot.cal,c.cals,'cal')}${bar(tot.p,c.protein,'p')}${bar(tot.c,c.carbs,'c')}${bar(tot.f,c.fat,'f')}</div>`;
  MEALS.forEach(m=>{
    const items=diet[m.k]||[],mt=sumMacros(items);
    html+=`<div class="exercise"><div class="ex-head"><div class="ex-num" style="font-size:15px">${m.e}</div><div class="ex-name"><h3>${m.t}</h3><div class="sub">${Math.round(mt.cal)} kcal · ${Math.round(mt.p)}P / ${Math.round(mt.c)}C / ${Math.round(mt.f)}F</div></div></div>
      <div class="diet-items">
        ${items.map((it,i)=>{const f=F[it.f];if(!f)return '';return `<div class="food-row" style="margin:0 0 8px"><div class="fr-name">${f.n}<span>${it.q} × ${f.u} · ${Math.round(f.cal*it.q)} kcal · ${Math.round(f.p*it.q)}P</span></div><div class="fr-p">${Math.round(f.p*it.q)}g</div><button class="fr-del" data-meal="${m.k}" data-i="${i}">×</button></div>`;}).join('')||'<div style="color:var(--muted);font-size:12px;padding:0 0 8px">No items yet — add your '+m.t.toLowerCase()+' below</div>'}
        <div class="food-add" style="margin:0"><select class="mf-sel" data-meal="${m.k}">${F.map((f,i)=>`<option value="${i}">${f.n} (${f.u}) · ${f.p}g P</option>`).join('')}</select><input class="mf-qty" data-meal="${m.k}" type="number" inputmode="decimal" value="1" min="0.5" step="0.5"/><button class="mf-add" data-meal="${m.k}">+</button></div>
      </div></div>`;
  });
  html+=`<div class="info-banner">💡 ${sc.tips.slice(0,3).map(t=>'• '+t).join('<br>')}</div>
    <div class="grid2" style="margin-top:4px"><button class="ghost-btn" id="addFood" style="margin-top:0">＋ Custom Food</button><button class="ghost-btn danger-btn" id="clearDiet" style="margin-top:0">🗑️ Clear Day</button></div>
    ${calorieHistoryChart()}`;
  document.getElementById('dietBody').innerHTML=html;
  document.querySelectorAll('.mf-add').forEach(b=>b.onclick=()=>{const mk=b.dataset.meal,sel=document.querySelector('.mf-sel[data-meal="'+mk+'"]'),qt=document.querySelector('.mf-qty[data-meal="'+mk+'"]'),f=+sel.value,q=+qt.value||1,d=loadDiet();d[mk]=d[mk]||[];d[mk].push({f,q});saveDiet(d);renderBuilder(c);});
  document.querySelectorAll('.fr-del').forEach(b=>b.onclick=()=>{const d=loadDiet();(d[b.dataset.meal]||[]).splice(+b.dataset.i,1);saveDiet(d);renderBuilder(c);});
  document.getElementById('addFood').onclick=openAddFood;
  document.getElementById('clearDiet').onclick=()=>{if(confirm('Clear all meals for the day?')){saveDiet({});renderBuilder(c);}};
}
function calorieHistoryChart(){
  const all=LS.get(uk('calhist'),{}),keys=Object.keys(all).sort().slice(-7);
  if(keys.length<2)return '';
  const vals=keys.map(k=>all[k].cal),max=Math.max(...vals)||1,W=300,H=110,pad=10,n=keys.length;
  const bars=keys.map((k,i)=>{const bw=(W-2*pad)/n-6,x=pad+i*((W-2*pad)/n)+3,h=(all[k].cal/max)*(H-2*pad),y=H-pad-h;return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="#ff5a3c"/>`;}).join('');
  return `<div class="chart"><div class="ct">📊 Calorie intake (last ${n} days)</div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${bars}</svg></div>`;
}

/* ---------- PROGRESS ---------- */
function renderProgress(){
  setHeader('Progress','Weight · records · body');
  const log=LS.get(uk('weights'),[]),app=document.getElementById('app'),prs=LS.get(uk('prs'),{});
  let chart='';
  if(log.length>=2){const ws=log.map(x=>x.w),min=Math.min(...ws),max=Math.max(...ws),range=(max-min)||1,n=log.length,W=300,H=120,pad=12;const pts=log.map((x,i)=>{const px=pad+(i/(n-1))*(W-2*pad),py=pad+(1-(x.w-min)/range)*(H-2*pad);return `${px.toFixed(1)},${py.toFixed(1)}`;}).join(' ');chart=`<div class="chart"><div class="ct">⚖️ Body weight</div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="#ff5a3c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${log.map((x,i)=>{const px=pad+(i/(n-1))*(W-2*pad),py=pad+(1-(x.w-min)/range)*(H-2*pad);return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="#ff9556"/>`;}).join('')}</svg></div>`;}
  const first=log[0],last=log[log.length-1],change=(first&&last)?(last.w-first.w).toFixed(1):null,ap=activePlan();
  const prEntries=Object.keys(prs).map(k=>({n:k,w:prs[k]})).sort((a,b)=>b.w-a.w).slice(0,10);
  const meas=LS.get(uk('measure'),[]),lastM=meas[meas.length-1];
  const wkW=workoutsInLastDays(7);
  app.innerHTML=`
    <div class="section-title" style="margin-top:0">This Week</div>
    <div class="grid3"><div class="stat-card"><div class="lbl">Workouts</div><div class="val">${wkW}</div></div><div class="stat-card"><div class="lbl">Streak</div><div class="val">${streak()}</div></div><div class="stat-card"><div class="lbl">Best PR</div><div class="val">${prEntries[0]?prEntries[0].w:'—'}<small>kg</small></div></div></div>
    <div class="grid2" style="margin-top:10px"><div class="stat-card accent"><div class="lbl">Current Weight</div><div class="val">${last?last.w:profile.weight}<small> kg</small></div></div><div class="stat-card"><div class="lbl">Total Change</div><div class="val" style="${change>0?'color:var(--warn)':change<0?'color:var(--ok)':''}">${change!==null?(change>0?'+':'')+change:'—'}<small> kg</small></div></div></div>
    ${chart}
    <div class="food-add" style="margin-top:14px"><input id="wInput" type="number" inputmode="decimal" placeholder="Today's weight (kg)" style="flex:1;text-align:left" /><button id="wAdd">+</button></div>
    <div class="section-title">🏆 Personal Records<span style="color:var(--muted);font-weight:600;text-transform:none">tap for graph</span></div>
    ${prEntries.length?prEntries.map(p=>`<div class="pr-row" data-pr="${encodeURIComponent(p.n)}"><span>${p.n}</span><b>${p.w} kg</b></div>`).join(''):'<div class="info-banner">Log set weights during workouts — your best lift per exercise appears here automatically. 💪</div>'}
    <div class="section-title">📏 Body Measurements (cm)</div>
    <div class="grid3"><input class="ms-i" id="ms-waist" type="number" inputmode="decimal" placeholder="Waist" /><input class="ms-i" id="ms-chest" type="number" inputmode="decimal" placeholder="Chest" /><input class="ms-i" id="ms-arms" type="number" inputmode="decimal" placeholder="Arms" /></div>
    <button class="ghost-btn" id="msAdd">＋ Save Measurements</button>
    ${lastM?`<div class="info-banner" style="margin-top:10px">Last (${lastM.d}): Waist <b>${lastM.waist||'—'}</b> · Chest <b>${lastM.chest||'—'}</b> · Arms <b>${lastM.arms||'—'}</b> cm</div>`:''}
    <div class="section-title">🏅 Achievements</div>
    <div class="ach-grid" id="achGrid"></div>`;
  document.querySelectorAll('.ms-i').forEach(i=>{i.style.cssText='background:var(--bg-2);border:1px solid var(--border);color:var(--text);border-radius:11px;padding:12px;font-size:14px;font-weight:700;text-align:center;width:100%';});
  document.getElementById('wAdd').onclick=()=>{const v=+document.getElementById('wInput').value;if(!v){showToast('Enter weight');return;}const d=new Date(),ds=`${d.getDate()}/${d.getMonth()+1}/${String(d.getFullYear()).slice(2)}`,arr=LS.get(uk('weights'),[]);arr.push({w:v,d:ds,iso:dateKey()});LS.set(uk('weights'),arr);renderProgress();showToast('Logged');};
  document.getElementById('msAdd').onclick=()=>{const waist=+document.getElementById('ms-waist').value||null,chest=+document.getElementById('ms-chest').value||null,arms=+document.getElementById('ms-arms').value||null;if(!waist&&!chest&&!arms){showToast('Enter at least one');return;}const d=new Date(),ds=`${d.getDate()}/${d.getMonth()+1}/${String(d.getFullYear()).slice(2)}`,arr=LS.get(uk('measure'),[]);arr.push({d:ds,waist,chest,arms});LS.set(uk('measure'),arr);renderProgress();showToast('Saved');};
  document.querySelectorAll('.pr-row[data-pr]').forEach(r=>r.onclick=()=>openExerciseChart(decodeURIComponent(r.dataset.pr)));
  // achievements
  const st=achievementState();document.getElementById('achGrid').innerHTML=ACHIEVEMENTS.map(a=>`<div class="ach ${a.test(st)?'on':''}"><div class="ae">${a.e}</div><div class="at"><b>${a.t}</b><span>${a.d}</span></div></div>`).join('');
}

/* ---------- PROFILE ---------- */
function renderProfile(){
  setHeader('Profile','Account & settings');
  const ap=activePlan(),c=calc(profile,ap.goal),th=LS.get('ff-theme','dark');
  document.getElementById('app').innerHTML=`
    <div class="form-card">
      <div class="pf-row"><span>Account</span><b>${profile.name||'—'}</b></div>
      <div class="pf-row"><span>Email</span><b style="font-size:12px">${fbEmail||'—'}</b></div>
      <div class="pf-row"><span>Phone</span><b>${profile.phone||'—'}</b></div>
      <div class="pf-row"><span>Gender / Age</span><b>${profile.gender==='female'?'Female':'Male'} · ${profile.age} yrs</b></div>
      <div class="pf-row"><span>Height / Weight</span><b>${profile.height} cm · ${profile.weight} kg</b></div>
      <div class="pf-row"><span>BMI</span><b>${c.bmi} (${c.bmiCat})</b></div>
      <div class="pf-row"><span>Active Plan</span><b>${ap.name}</b></div>
      <div class="pf-row"><span>Target</span><b>${c.cals} kcal · ${c.protein}g P</b></div>
    </div>
    <button class="big-btn" id="editStats">✏️ Edit Body Stats</button>
    ${isAdmin()?'<button class="ghost-btn" id="adminBtn" style="border-color:rgba(168,85,247,.45);color:#c79bff">🛡️ Admin Panel</button>':''}
    <button class="ghost-btn" id="shareBtn">📤 Share My Progress</button>
    <div class="form-card" style="margin-top:10px"><div class="field" style="margin:0"><label>Theme</label><div class="opt-row">
      <button class="opt ${th==='dark'?'sel':''}" data-th="dark">🌙 Dark</button>
      <button class="opt ${th==='light'?'sel':''}" data-th="light">☀️ Light</button>
      <button class="opt ${th==='minimal'?'sel':''}" data-th="minimal">⚪ Minimal</button>
    </div></div></div>
    <button class="ghost-btn" id="goPlans">📋 Manage My Plans</button>
    <button class="ghost-btn" id="resetDay">🔄 Reset Today's Workout</button>
    <button class="ghost-btn danger-btn" id="logoutBtn">🚪 Logout</button>
    <div class="info-banner" style="margin-top:14px">📱 <b>Install:</b> browser menu → "Add to Home Screen". Your data syncs to the cloud across devices.</div>
    <div style="text-align:center;color:var(--muted);font-size:11px;padding:10px">FitForge · v5.0 💪</div>`;
  document.getElementById('editStats').onclick=editStats;
  const ab=document.getElementById('adminBtn');if(ab)ab.onclick=()=>setView('admin');
  document.getElementById('shareBtn').onclick=shareProgress;
  document.querySelectorAll('#app .opt[data-th]').forEach(b=>b.onclick=()=>{setTheme(b.dataset.th);renderProfile();});
  document.getElementById('goPlans').onclick=()=>setView('plans');
  document.getElementById('resetDay').onclick=()=>{if(confirm("Reset today's workout?")){LS.del(progressKey(currentDay));showToast('Reset');}};
  document.getElementById('logoutBtn').onclick=()=>{if(confirm('Logout?'))logout();};
}
function editStats(){const apx=activePlan();wz={name:profile.name,phone:profile.phone,gender:profile.gender,age:profile.age,height:profile.height,weight:profile.weight,goal:apx.goal,experience:apx.experience,days:apx.days,activity:profile.activity};wzStep=1;finishWizardOverride=true;document.getElementById('wizard').classList.add('show');renderWizard();}

/* ---------- CALENDAR ---------- */
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
function renderCalendar(){
  setHeader('Calendar','Your training history');
  if(!calRef)calRef=new Date();
  const app=document.getElementById('app'),year=calRef.getFullYear(),month=calRef.getMonth();
  const startDow=new Date(year,month,1).getDay(),daysInMonth=new Date(year,month+1,0).getDate();
  const trained=LS.get(uk('trained'),{}),sched=LS.get(uk('schedule'),{});
  let cells='',trainedCount=0;
  for(let i=0;i<startDow;i++)cells+=`<div class="cal-cell empty"></div>`;
  for(let d=1;d<=daysInMonth;d++){const dk=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,cnt=trained[dk]||0;if(cnt)trainedCount++;const lvl=cnt>=12?3:cnt>=6?2:cnt>=1?1:0,isToday=dk===dateKey();cells+=`<div class="cal-cell lvl${lvl} ${isToday?'today':''}" data-dk="${dk}">${d}</div>`;}
  const consistency=Math.round(trainedCount/daysInMonth*100);
  const dows=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  app.innerHTML=`
    <div class="cal-head"><button id="calPrev">◀</button><b>${MONTHS[month]} ${year}</b><button id="calNext">▶</button></div>
    <div class="cal-dow"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>
    <div class="cal-grid">${cells}</div>
    <div id="calDay"></div>
    <div class="grid3" style="margin-top:14px"><div class="stat-card"><div class="lbl">Trained</div><div class="val">${trainedCount}<small> d</small></div></div><div class="stat-card"><div class="lbl">Consistency</div><div class="val">${consistency}<small>%</small></div></div><div class="stat-card"><div class="lbl">Streak</div><div class="val">${streak()}</div></div></div>
    <div class="section-title">🗓️ Weekly Schedule</div>
    <div class="info-banner">Assign a workout to each weekday — Home will show what's planned for today.</div>
    ${dows.map((dw,i)=>`<div class="sched-row"><span>${dw}</span><select class="sched-sel" data-dow="${i}"><option value="">Rest</option>${PLAN.map((p,j)=>`<option value="${j}" ${sched[i]==j?'selected':''}>${p.title}</option>`).join('')}</select></div>`).join('')}
    <div style="height:8px"></div>`;
  document.getElementById('calPrev').onclick=()=>{calRef=new Date(year,month-1,1);renderCalendar();};
  document.getElementById('calNext').onclick=()=>{calRef=new Date(year,month+1,1);renderCalendar();};
  document.querySelectorAll('.cal-cell[data-dk]').forEach(c=>c.onclick=()=>showCalDay(c.dataset.dk));
  document.querySelectorAll('.sched-sel').forEach(s=>s.onchange=()=>{const sc=LS.get(uk('schedule'),{});if(s.value==='')delete sc[s.dataset.dow];else sc[s.dataset.dow]=+s.value;LS.set(uk('schedule'),sc);showToast('Schedule saved');});
}
function showCalDay(dk){
  const trained=LS.get(uk('trained'),{}),hist=LS.get(uk('history'),[]),cnt=trained[dk]||0,h=hist.filter(x=>x.d===dk),el=document.getElementById('calDay');
  if(!cnt){el.innerHTML=`<div class="info-banner" style="margin-top:14px"><b>${dk}</b> — Rest day 😴</div>`;return;}
  let txt=`${cnt} set${cnt>1?'s':''} completed`;
  if(h.length){const names=[...new Set(h.map(x=>(PLAN[x.day]&&PLAN[x.day].title)||'Workout'))];txt+=` · ${names.join(', ')} ✅`;}
  el.innerHTML=`<div class="info-banner" style="margin-top:14px"><b>${dk}</b><br>💪 ${txt}</div>`;
}

/* ---------- ADMIN (only admin email) ---------- */
function renderAdmin(){
  setHeader('Admin Panel','All registered users');
  const app=document.getElementById('app');
  if(!isAdmin()){app.innerHTML='<div class="info-banner">⛔ Access denied.</div>';return;}
  app.innerHTML='<div class="section-title">All Users</div><div id="adminList"><div class="info-banner">Loading users…</div></div>';
  if(!db){document.getElementById('adminList').innerHTML='<div class="info-banner">Offline.</div>';return;}
  db.collection('users').get().then(snap=>{
    const users=[];
    snap.forEach(doc=>{
      const d=doc.data()||{},blob=d.blob||{};
      let prof={},hist=[];
      try{prof=JSON.parse(blob.profile||'{}')||{};}catch(e){}
      try{hist=JSON.parse(blob.history||'[]')||[];}catch(e){}
      users.push({name:prof.name||'(no name)',email:d.email||'(no email)',phone:prof.phone||'—',workouts:hist.length,lastActive:d.lastActive||0});
    });
    users.sort((a,b)=>b.lastActive-a.lastActive);
    const active7=users.filter(u=>u.lastActive&&(Date.now()-u.lastActive)<7*864e5).length;
    const rows=users.map(u=>`<div class="food-row" style="align-items:flex-start"><div class="fr-name">${u.name}<span>📧 ${u.email}</span><span>📱 ${u.phone}</span><span>🕒 Last active: ${timeAgo(u.lastActive)}</span></div><div class="fr-p">${u.workouts} 🏋️</div></div>`).join('');
    app.innerHTML=`<div class="grid2"><div class="stat-card accent"><div class="lbl">Total Users</div><div class="val">${users.length}</div></div><div class="stat-card"><div class="lbl">Active (7d)</div><div class="val">${active7}</div></div></div><div class="section-title">All Users · recent first</div>${rows||'<div class="info-banner">No users yet.</div>'}<button class="ghost-btn" id="adminRefresh">🔄 Refresh</button>`;
    const r=document.getElementById('adminRefresh');if(r)r.onclick=renderAdmin;
  }).catch(e=>{
    app.innerHTML=`<div class="info-banner">Could not load users (<b>${(e&&e.code)||'error'}</b>). Publish the admin read rule in Firestore (see below).</div>`;
  });
}
