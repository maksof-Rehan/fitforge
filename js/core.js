/* ============================================================
   FitForge · CORE (storage, cloud sync, state, calculations, feature logic)
   ============================================================ */
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}},set(k,v){localStorage.setItem(k,JSON.stringify(v));},del(k){localStorage.removeItem(k);}};

/* ----- STATE ----- */
let currentUser=null,fbEmail=null,pendingName='',db=null,auth=null;
let profile=null,plans=[],activePlanId=null,PLAN=[];
let currentView='home',currentDay=0,dietTab='suggested',authMode='login';
const uk=k=>`ff:${currentUser}:${k}`;
const WATER_GOAL=12;
function dateKey(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}

/* ----- THEME (global, not per-user) ----- */
function applyTheme(){document.body.classList.toggle('light',LS.get('ff-theme','dark')==='light');}
function toggleTheme(){LS.set('ff-theme',LS.get('ff-theme','dark')==='light'?'dark':'light');applyTheme();}

/* ----- CLOUD SYNC: mirror this user's localStorage keys to one Firestore doc ----- */
const _lsset=LS.set;
LS.set=function(k,v){_lsset.call(LS,k,v);if(currentUser&&k.indexOf('ff:'+currentUser+':')===0)scheduleSync();};
let syncT=null;
function scheduleSync(){if(!db||!currentUser)return;clearTimeout(syncT);syncT=setTimeout(pushCloud,1500);}
function pushCloud(){if(!db||!currentUser)return;const pre='ff:'+currentUser+':',blob={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf(pre)===0)blob[k.slice(pre.length)]=localStorage.getItem(k);}db.collection('users').doc(currentUser).set({blob,email:fbEmail||''}).catch(e=>console.warn('sync up',e&&e.code));}
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

/* ----- GENERATORS ----- */
function pickEx(cat,n,offset){const pool=EX_POOL[cat],r=[];for(let i=0;i<n;i++)r.push(pool[(offset+i)%pool.length]);return r;}
function buildPlan(plan){
  const spec=SPLITS[plan.days],g=GOALS[plan.goal],cap=EXP_CAP[plan.experience];
  return spec.days.map(d=>{
    let list=[];
    Object.keys(d.groups).forEach(cat=>{let cnt=d.groups[cat];if(plan.experience==='beginner'&&cnt>1&&EX_POOL[cat][0].c===0)cnt=1;pickEx(cat,cnt,d.offset||0).forEach(ex=>list.push({ex,cat}));});
    list=list.slice(0,cap);
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
  const custom=(LS.get(uk('customEx-'+activePlanId),{})[dayIdx])||[];
  custom.forEach(c=>exercises.push({name:c.name,sets:c.sets||3,reps:c.reps||GOALS[activePlan().goal].reps,rest:c.rest||75,dropSet:false,variants:[{label:"Tutorial",q:c.name+" exercise form"}],cat:c.cat||'chest',srcIdx:-1,custom:true}));
  return{title:day.title,focus:day.focus,emoji:day.emoji,exercises,baseLen:day.exercises.length};
}
function swapExercise(dayIdx,exIdx){const day=getEffectiveDay(dayIdx),ex=day.exercises[exIdx];if(ex.custom)return;const pool=EX_POOL[ex.cat],used=day.exercises.filter(e=>!e.custom).map(e=>e.srcIdx);let idx=ex.srcIdx;for(let k=1;k<=pool.length;k++){const cand=(ex.srcIdx+k)%pool.length;if(used.indexOf(cand)===-1){idx=cand;break;}}const all=LS.get(uk('swap-'+activePlanId),{});all[dayIdx]=all[dayIdx]||{};all[dayIdx][exIdx]=idx;LS.set(uk('swap-'+activePlanId),all);renderDay();showToast('Exercise swapped');}
function addCustomExercise(dayIdx,name,cat){const all=LS.get(uk('customEx-'+activePlanId),{});all[dayIdx]=all[dayIdx]||[];all[dayIdx].push({name,cat});LS.set(uk('customEx-'+activePlanId),all);renderDay();showToast('Exercise added');}
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

/* ----- TOOLS: 1RM + plate calc ----- */
function oneRM(w,reps){return Math.round(w*(1+reps/30));}
function platesFor(target,bar){let perSide=(target-bar)/2;if(perSide<=0)return [];const plates=[25,20,15,10,5,2.5,1.25],out=[];plates.forEach(p=>{while(perSide>=p-0.001){out.push(p);perSide=+(perSide-p).toFixed(3);}});return out;}
