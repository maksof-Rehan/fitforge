/* ============================================================
   FitForge · CORE (storage, cloud sync, state, calculations, feature logic)
   ============================================================ */
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}},set(k,v){localStorage.setItem(k,JSON.stringify(v));},del(k){localStorage.removeItem(k);}};

/* ----- STATE ----- */
let currentUser=null,fbEmail=null,pendingName='',pendingPhone='',db=null,auth=null;
let profile=null,plans=[],activePlanId=null,PLAN=[];
let currentView='home',currentDay=0,dietTab='suggested',authMode='login';
const uk=k=>`ff:${currentUser}:${k}`;
const WATER_GOAL=12;
const ADMIN_EMAIL='rehanbhatti.in@gmail.com';
function isAdmin(){return (fbEmail||'').toLowerCase()===ADMIN_EMAIL;}
function dateKey(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}

/* ----- THEME (global, not per-user) ----- */
function applyTheme(){const t=LS.get('ff-theme','dark');document.body.classList.toggle('light',t==='light');document.body.classList.toggle('minimal',t==='minimal');}
function setTheme(t){LS.set('ff-theme',t);applyTheme();}

/* ----- CLOUD SYNC: mirror this user's localStorage keys to one Firestore doc ----- */
const _lsset=LS.set;
LS.set=function(k,v){_lsset.call(LS,k,v);if(currentUser&&k.indexOf('ff:'+currentUser+':')===0)scheduleSync();};
let syncT=null;
function scheduleSync(){if(!db||!currentUser)return;clearTimeout(syncT);syncT=setTimeout(pushCloud,1500);}
function pushCloud(){if(!db||!currentUser)return;const pre='ff:'+currentUser+':',blob={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf(pre)===0)blob[k.slice(pre.length)]=localStorage.getItem(k);}db.collection('users').doc(currentUser).set({blob,email:fbEmail||'',lastActive:Date.now()},{merge:true}).catch(e=>console.warn('sync up',e&&e.code));}
function touchActivity(){if(!db||!currentUser)return;try{db.collection('users').doc(currentUser).set({lastActive:Date.now(),email:fbEmail||''},{merge:true}).catch(()=>{});}catch(e){}}
function timeAgo(ts){if(!ts)return 'never';const s=Math.floor((Date.now()-ts)/1000);if(s<60)return 'just now';const m=Math.floor(s/60);if(m<60)return m+'m ago';const h=Math.floor(m/60);if(h<24)return h+'h ago';const d=Math.floor(h/24);if(d<30)return d+'d ago';return Math.floor(d/30)+'mo ago';}
async function pullCloud(uid){try{const snap=await db.collection('users').doc(uid).get();if(snap.exists){const blob=(snap.data()||{}).blob||{};Object.keys(blob).forEach(sub=>{try{localStorage.setItem('ff:'+uid+':'+sub,blob[sub]);}catch(e){}});}}catch(e){console.warn('sync down',e&&e.code);}}

/* ----- USER / PLANS ----- */
function loadUser(){profile=LS.get(uk('profile'),null);plans=LS.get(uk('plans'),[]);activePlanId=LS.get(uk('active'),plans[0]?plans[0].id:null);}
function activePlan(){return plans.find(p=>p.id===activePlanId)||plans[0];}
function rebuildPLAN(){const ap=activePlan();PLAN=ap?buildPlan(ap):[];}
const progressKey=d=>uk(`prog-${activePlanId}-${d}`);
function loadProgress(d){return LS.get(progressKey(d),{});}
function saveProgress(d,data){LS.set(progressKey(d),data);}
function getEx(prog,idx){const v=prog[idx];if(typeof v==='number')return{done:v,log:{}};return v?{done:v.done||0,log:v.log||{}}:{done:0,log:{}};}
function newId(){return 'p'+Date.now()+Math.floor(Math.random()*1000);}

/* ----- FOODS (base + custom) ----- */
function allFoods(){return FOODS.concat(LS.get(uk('foods'),[]));}

/* ----- MEAL-WISE DIET + SCORING ----- */
const MEALS=[{k:'breakfast',t:'Breakfast',e:'🍳'},{k:'pre',t:'Pre-Workout',e:'⚡'},{k:'post',t:'Post-Workout',e:'🥤'},{k:'lunch',t:'Lunch',e:'🍗'},{k:'dinner',t:'Dinner',e:'🌙'},{k:'snack',t:'Snacks',e:'🥜'}];
function loadDiet(){let d=LS.get(uk('diet'),null);if(Array.isArray(d)){d={breakfast:d};LS.set(uk('diet'),d);}if(!d||typeof d!=='object')d={};return d;}
function saveDiet(d){LS.set(uk('diet'),d);}
function dietItems(d){return MEALS.reduce((a,m)=>a.concat(d[m.k]||[]),[]);}
function dietScore(t,c){
  const pr=c.protein>0?t.p/c.protein:0;
  let pScore=pr>=0.9&&pr<=1.2?40:pr>=0.75?30:pr>=0.5?18:pr>0?8:0;
  const dev=c.cals>0?Math.abs(t.cal/c.cals-1):1;
  let cScore=t.cal===0?0:dev<=0.1?35:dev<=0.2?25:dev<=0.35?15:6;
  let bScore=0;if(t.c>=c.carbs*0.5)bScore+=9;if(t.f>=c.fat*0.45)bScore+=9;if(t.cal>0)bScore+=7;bScore=Math.min(25,bScore);
  let score=t.cal===0?0:Math.round(pScore+cScore+bScore);
  let grade,label,color;
  if(score>=85){grade='A';label='Excellent';color='var(--ok)';}
  else if(score>=70){grade='B';label='Good';color='#7ed957';}
  else if(score>=55){grade='C';label='Average';color='var(--warn)';}
  else if(score>0){grade='D';label='Needs Work';color='var(--drop)';}
  else{grade='–';label='No food logged';color='var(--muted)';}
  const tips=[];
  if(t.cal===0)tips.push('Add your meals below to get a diet score.');
  else{
    if(pr<0.9)tips.push(`Add ~${Math.max(5,Math.round(c.protein-t.p))}g more protein.`);
    else if(pr>1.25)tips.push('Protein is very high — you can ease off slightly.');
    if(t.cal>c.cals*1.15)tips.push(`You're ~${Math.round(t.cal-c.cals)} kcal over target.`);
    else if(t.cal<c.cals*0.8)tips.push(`You're ~${Math.round(c.cals-t.cal)} kcal under target.`);
    if(t.c<c.carbs*0.5)tips.push('Carbs are low — add some around your workout.');
    if(t.f<c.fat*0.45)tips.push('Add a healthy fat (nuts / olive oil).');
    if(!tips.length)tips.push('Great balance — keep it up! 💪');
  }
  return{score,grade,label,color,tips};
}

/* ----- GENERATORS ----- */
function pickEx(cat,n,offset){const pool=EX_POOL[cat],r=[];for(let i=0;i<n;i++)r.push(pool[(offset+i)%pool.length]);return r;}
function buildPlan(plan){
  const spec=SPLITS[plan.days],g=GOALS[plan.goal],cap=EXP_CAP[plan.experience];
  return spec.days.map(d=>{
    let list=[];
    Object.keys(d.groups).forEach(cat=>{let cnt=d.groups[cat];if(plan.experience==='beginner'&&cnt>1&&EX_POOL[cat][0].c===0)cnt=1;pickEx(cat,cnt,d.offset||0).forEach(ex=>list.push({ex,cat}));});
    list=list.slice(0,cap);
    list.sort((a,b)=>(b.ex.c||0)-(a.ex.c||0)); // research: compounds first, isolation after
    const exercises=list.map((it,i)=>{const ex=it.ex,cat=it.cat,comp=ex.c===1;let sets=comp?4:3;if(plan.experience==='beginner')sets=3;const dropSet=(plan.experience==='advanced'&&!comp&&i>=list.length-2);return{name:ex.name,sets,reps:g.reps,rest:comp?g.restC:g.restI,dropSet,variants:ex.variants,cat,srcIdx:EX_POOL[cat].indexOf(ex)};});
    return{title:d.title,focus:d.focus,emoji:d.emoji,exercises};
  });
}
function calc(profile,goalKey){
  const w=+profile.weight,h=+profile.height,a=+profile.age;
  let bmr=10*w+6.25*h-5*a+(profile.gender==='female'?-161:5);
  const tdee=bmr*(ACTIVITY[profile.activity]||1.5),g=GOALS[goalKey];
  const cals=Math.round((tdee+g.calAdj)/10)*10,protein=Math.round(w*g.prot),fat=Math.round(w*0.8);
  const carbs=Math.max(0,Math.round((cals-(protein*4+fat*9))/4)),bmi=+(w/Math.pow(h/100,2)).toFixed(1);
  let bmiCat="Normal";if(bmi<18.5)bmiCat="Underweight";else if(bmi<25)bmiCat="Normal";else if(bmi<30)bmiCat="Overweight";else bmiCat="Obese";
  return{bmr:Math.round(bmr),tdee:Math.round(tdee),cals,protein,fat,carbs,bmi,bmiCat};
}

/* ----- EFFECTIVE DAY (swaps + custom exercises) ----- */
function getEffectiveDay(dayIdx){
  const day=PLAN[dayIdx],sw=(LS.get(uk('swap-'+activePlanId),{})[dayIdx])||{};
  let exercises=day.exercises.map((ex,i)=>{if(sw[i]!=null){const alt=EX_POOL[ex.cat][sw[i]];return Object.assign({},ex,{name:alt.name,variants:alt.variants,srcIdx:sw[i]});}return ex;});
  const custom=(LS.get(uk('customEx-'+activePlanId),{})[dayIdx])||[],g=GOALS[activePlan().goal];
  custom.forEach(c=>exercises.push({name:c.name,sets:c.sets||3,reps:g.reps,rest:c.c?g.restC:g.restI,dropSet:false,variants:c.variants||[{label:"Tutorial",q:c.name+" exercise form"}],cat:c.cat||'chest',srcIdx:-1,custom:true}));
  return{title:day.title,focus:day.focus,emoji:day.emoji,exercises,baseLen:day.exercises.length};
}
/* Pick a specific alternative exercise for a slot (from the muscle's best-5 list) */
function chooseExercise(dayIdx,exIdx,poolIdx){const all=LS.get(uk('swap-'+activePlanId),{});all[dayIdx]=all[dayIdx]||{};all[dayIdx][exIdx]=poolIdx;LS.set(uk('swap-'+activePlanId),all);renderDay();showToast('Exercise updated');}
function addCustomExercise(dayIdx,exObj){const all=LS.get(uk('customEx-'+activePlanId),{});all[dayIdx]=all[dayIdx]||[];all[dayIdx].push(exObj);LS.set(uk('customEx-'+activePlanId),all);renderDay();showToast('Added to plan');}
function removeCustomExercise(dayIdx,baseLen,exIdx){const all=LS.get(uk('customEx-'+activePlanId),{}),arr=all[dayIdx]||[];arr.splice(exIdx-baseLen,1);all[dayIdx]=arr;LS.set(uk('customEx-'+activePlanId),all);renderDay();showToast('Removed');}

/* ----- HISTORY / STREAK / PRs / EXERCISE HISTORY ----- */
function markComplete(dayIdx){const h=LS.get(uk('history'),[]),d=dateKey();if(!h.some(x=>x.d===d&&x.plan===activePlanId&&x.day===dayIdx)){h.push({d,plan:activePlanId,day:dayIdx});LS.set(uk('history'),h);}}
function uniqueDays(){return [...new Set(LS.get(uk('history'),[]).map(x=>x.d))];}
function streak(){const days=new Set(uniqueDays());if(!days.size)return 0;let d=new Date();if(!days.has(dateKey(d)))d.setDate(d.getDate()-1);let s=0;for(;;){if(days.has(dateKey(d))){s++;d.setDate(d.getDate()-1);}else break;}return s;}
function totalWorkouts(){return LS.get(uk('history'),[]).length;}
function workoutsInLastDays(n){const cut=new Date();cut.setDate(cut.getDate()-n);return LS.get(uk('history'),[]).filter(x=>new Date(x.d)>=cut).length;}
function updatePR(name,w){if(!(w>0))return;const prs=LS.get(uk('prs'),{});if(!prs[name]||w>prs[name]){prs[name]=w;LS.set(uk('prs'),prs);}
  const eh=LS.get(uk('exhist'),{});eh[name]=eh[name]||[];const d=dateKey(),last=eh[name][eh[name].length-1];if(last&&last.d===d){if(w>last.w)last.w=w;}else eh[name].push({d,w});LS.set(uk('exhist'),eh);}

/* ----- WATER ----- */
function getWater(){return (LS.get(uk('water'),{})[dateKey()])||0;}
function changeWater(delta){const all=LS.get(uk('water'),{}),k=dateKey();all[k]=Math.max(0,(all[k]||0)+delta);LS.set(uk('water'),all);if(delta>0&&navigator.vibrate)navigator.vibrate(10);renderHome();}

/* ----- CALORIE HISTORY (auto from diet builder) ----- */
function logCalorieDay(cal,p){const all=LS.get(uk('calhist'),{});all[dateKey()]={cal:Math.round(cal),p:Math.round(p)};LS.set(uk('calhist'),all);}

/* ----- ACHIEVEMENTS ----- */
function achievementState(){const prs=LS.get(uk('prs'),{});const maxPR=Object.keys(prs).reduce((m,k)=>Math.max(m,prs[k]),0);return{workouts:totalWorkouts(),streak:streak(),waterHit:getWater()>=WATER_GOAL,maxPR,weekWorkouts:workoutsInLastDays(7)};}

/* ----- SHARED VIDEO MAP (global, all users) -----
   Stored in Firestore app/videos {map:{exerciseName:videoId}}; cached locally. */
let VIDEOMAP=Object.assign({}, (typeof DEFAULT_VIDEOS!=='undefined'?DEFAULT_VIDEOS:{}), LS.get('ff-videos',{}));
function vidKey(name,label){return label?name+'|'+label:name;}
/* per-variant key first, then exercise-name fallback */
function getVideo(name,label){return VIDEOMAP[vidKey(name,label)]||VIDEOMAP[name]||null;}
async function loadVideoMap(){
  if(!db)return;
  try{const snap=await db.collection('app').doc('videos').get();if(snap.exists){const m=(snap.data()||{}).map||{};VIDEOMAP=Object.assign({},DEFAULT_VIDEOS,m);LS.set('ff-videos',m);}}catch(e){console.warn('vid map load',e&&e.code);}
}
function saveVideo(name,label,vid){
  if(!name||!vid)return;
  const key=vidKey(name,label);
  VIDEOMAP[key]=vid;
  const c=LS.get('ff-videos',{});c[key]=vid;LS.set('ff-videos',c);
  if(db){try{db.collection('app').doc('videos').set({map:{[key]:vid}},{merge:true}).catch(e=>console.warn('vid save',e&&e.code));}catch(e){}}
}
function videoTitleMatches(name,title){if(!title)return false;title=title.toLowerCase();return name.toLowerCase().split(/[^a-z]+/).filter(t=>t.length>3).some(t=>title.indexOf(t)!==-1);}

/* ----- TOOLS: 1RM + plate calc ----- */
function oneRM(w,reps){return Math.round(w*(1+reps/30));}
function platesFor(target,bar){let perSide=(target-bar)/2;if(perSide<=0)return [];const plates=[25,20,15,10,5,2.5,1.25],out=[];plates.forEach(p=>{while(perSide>=p-0.001){out.push(p);perSide=+(perSide-p).toFixed(3);}});return out;}
