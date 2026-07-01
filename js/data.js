/* ============================================================
   FitForge · DATA (config, exercises, foods, quotes, achievements)
   Loaded first. Defines globals used by core.js / views.js / app.js
   ============================================================ */
const GOALS={
  fatloss:{label:"Fat Loss",emoji:"🔥",reps:"12-15",restC:60,restI:45,calAdj:-450,prot:2.0,desc:"Lose fat, keep muscle"},
  muscle:{label:"Muscle Gain",emoji:"💪",reps:"8-12",restC:90,restI:60,calAdj:300,prot:1.8,desc:"Build size and muscle"},
  recomp:{label:"Recomp",emoji:"⚖️",reps:"8-12",restC:75,restI:60,calAdj:-200,prot:2.0,desc:"Lose fat + build muscle"},
  strength:{label:"Strength",emoji:"🏋️",reps:"4-6",restC:180,restI:120,calAdj:150,prot:1.8,desc:"Get stronger (heavy lifts)"},
  maintain:{label:"Maintain",emoji:"🎯",reps:"8-12",restC:75,restI:60,calAdj:0,prot:1.6,desc:"Maintain your physique"}
};
const ACTIVITY={sedentary:1.35,light:1.5,active:1.7};
const EXP_LABEL={beginner:"Beginner",intermediate:"Intermediate",advanced:"Advanced"};
function V(){return Array.prototype.slice.call(arguments).map(q=>({label:q[0],q:q[1]}));}
/* Each muscle: best ~5 exercises, RANKED best-first (research/effectiveness).
   c:1 = compound (most bang for buck), c:0 = isolation. variants = equipment options. */
const EX_POOL={
  chest:[
    {name:"Bench Press",c:1,r:"Mid Chest",variants:V(["Barbell","barbell bench press form"],["Dumbbell","dumbbell bench press form"])},
    {name:"Incline Press",c:1,r:"Upper Chest",variants:V(["Dumbbell","incline dumbbell press form"],["Barbell","incline barbell bench press form"])},
    {name:"Chest Dips",c:1,r:"Lower Chest",variants:V(["Bodyweight","chest dips form"],["Weighted","weighted chest dips form"])},
    {name:"Cable Fly",c:0,r:"Mid Chest",variants:V(["High-Low","high to low cable crossover form"],["Mid","cable chest fly form"])},
    {name:"Machine Chest Fly",c:0,r:"Mid Chest",variants:V(["Pec Deck","pec deck fly form"],["Dumbbell","dumbbell chest fly form"])}
  ],
  back:[
    {name:"Pull-ups",c:1,r:"Lats",variants:V(["Bodyweight","pull ups form"],["Assisted","assisted pull up machine form"])},
    {name:"Barbell Row",c:1,r:"Mid Back",variants:V(["Barbell","barbell bent over row form"],["T-Bar","t-bar row form"])},
    {name:"Lat Pulldown",c:1,r:"Lats",variants:V(["Wide","wide grip lat pulldown form"],["Neutral","neutral grip lat pulldown form"])},
    {name:"Seated Cable Row",c:1,r:"Mid Back",variants:V(["Cable","seated cable row form"],["Chest-Supported","chest supported row form"])},
    {name:"Lat Pullover",c:0,r:"Lats",variants:V(["Cable","cable pullover form"],["Dumbbell","dumbbell pullover form"])}
  ],
  shoulders:[
    {name:"Overhead Press",c:1,r:"Front / Overall",variants:V(["Dumbbell","overhead dumbbell press form"],["Barbell","overhead barbell press form"])},
    {name:"Lateral Raise",c:0,r:"Side Delt",variants:V(["Dumbbell","dumbbell lateral raise form"],["Cable","cable lateral raise form"])},
    {name:"Rear Delt Fly",c:0,r:"Rear Delt",variants:V(["Pec Deck","reverse pec deck fly form"],["Face Pull","face pulls form"])},
    {name:"Arnold Press",c:1,r:"Front / Overall",variants:V(["Dumbbell","arnold press form"])},
    {name:"Front Raise",c:0,r:"Front Delt",variants:V(["Dumbbell","front dumbbell raise form"],["Cable","cable front raise form"])}
  ],
  biceps:[
    {name:"Barbell Curl",c:0,r:"Overall",variants:V(["EZ Bar","ez bar curl form"],["Straight","barbell curl form"])},
    {name:"Incline Dumbbell Curl",c:0,r:"Long Head",variants:V(["Dumbbell","incline dumbbell curl form"])},
    {name:"Hammer Curl",c:0,r:"Brachialis",variants:V(["Dumbbell","hammer curl form"],["Rope","rope hammer curl form"])},
    {name:"Preacher Curl",c:0,r:"Short Head",variants:V(["Machine","preacher curl machine form"],["EZ Bar","ez bar preacher curl form"])},
    {name:"Cable Curl",c:0,r:"Long Head",variants:V(["Bayesian","bayesian cable curl form"],["Standing","standing cable curl form"])}
  ],
  triceps:[
    {name:"Close-Grip Bench",c:1,r:"Overall",variants:V(["Barbell","close grip bench press form"])},
    {name:"Tricep Pushdown",c:0,r:"Lateral Head",variants:V(["Rope","rope tricep pushdown form"],["Bar","bar tricep pushdown form"])},
    {name:"Overhead Extension",c:0,r:"Long Head",variants:V(["Cable","overhead cable tricep extension form"],["Dumbbell","overhead dumbbell tricep extension form"])},
    {name:"Skullcrusher",c:0,r:"Long Head",variants:V(["EZ Bar","ez bar skullcrusher form"])},
    {name:"Tricep Dips",c:1,r:"Overall",variants:V(["Bodyweight","tricep dips form"],["Bench","bench dips form"])}
  ],
  quads:[
    {name:"Squat",c:1,r:"Quads",variants:V(["Barbell","barbell squat form"],["Smith","smith machine squat form"])},
    {name:"Leg Press",c:1,r:"Quads",variants:V(["Machine","leg press form"])},
    {name:"Hack Squat",c:1,r:"Quads",variants:V(["Machine","hack squat form"])},
    {name:"Bulgarian Split Squat",c:1,r:"Quads",variants:V(["Dumbbell","bulgarian split squat form"],["Barbell","barbell bulgarian split squat"])},
    {name:"Leg Extension",c:0,r:"Quads",variants:V(["Machine","leg extension form"])}
  ],
  hamstrings:[
    {name:"Romanian Deadlift",c:1,r:"Hamstrings",variants:V(["Barbell","romanian deadlift form"],["Dumbbell","dumbbell rdl form"])},
    {name:"Lying Leg Curl",c:0,r:"Hamstrings",variants:V(["Machine","lying leg curl form"])},
    {name:"Seated Leg Curl",c:0,r:"Hamstrings",variants:V(["Machine","seated leg curl form"])},
    {name:"Hip Thrust",c:1,r:"Glutes",variants:V(["Barbell","barbell hip thrust form"])},
    {name:"Good Morning",c:1,r:"Hamstrings",variants:V(["Barbell","barbell good morning form"])}
  ],
  calves:[
    {name:"Standing Calf Raise",c:0,r:"Gastrocnemius",variants:V(["Machine","standing calf raise form"],["Smith","smith machine calf raise form"])},
    {name:"Seated Calf Raise",c:0,r:"Soleus",variants:V(["Machine","seated calf raise form"])},
    {name:"Leg Press Calf Raise",c:0,r:"Gastrocnemius",variants:V(["Machine","leg press calf raise form"])},
    {name:"Single-Leg Calf Raise",c:0,r:"Gastrocnemius",variants:V(["Dumbbell","single leg calf raise form"])}
  ],
  abs:[
    {name:"Hanging Leg Raise",c:0,r:"Lower Abs",variants:V(["Bodyweight","hanging leg raise form"])},
    {name:"Cable Crunch",c:0,r:"Upper Abs",variants:V(["Cable","cable crunch form"])},
    {name:"Ab Wheel Rollout",c:0,r:"Core",variants:V(["Wheel","ab wheel rollout form"])},
    {name:"Plank",c:0,r:"Core",variants:V(["Hold","plank hold form"])},
    {name:"Russian Twist",c:0,r:"Obliques",variants:V(["Weighted","weighted russian twist form"])}
  ]
};
const MUSCLE_LABELS={chest:"Chest",back:"Back",shoulders:"Shoulders",biceps:"Biceps",triceps:"Triceps",quads:"Quads",hamstrings:"Hamstrings",calves:"Calves",abs:"Abs"};
const SPLITS={
  3:{name:"Full Body (3 Day)",days:[{title:"Full Body A",focus:"Push focus",emoji:"🔥",offset:0,groups:{chest:1,back:1,quads:1,shoulders:1,triceps:1,abs:1}},{title:"Full Body B",focus:"Pull focus",emoji:"💪",offset:1,groups:{back:1,chest:1,hamstrings:1,shoulders:1,biceps:1,abs:1}},{title:"Full Body C",focus:"Legs focus",emoji:"🦵",offset:2,groups:{quads:1,hamstrings:1,chest:1,back:1,calves:1,abs:1}}]},
  4:{name:"Upper / Lower (4 Day)",days:[{title:"Upper A",focus:"Chest & Back",emoji:"💪",offset:0,groups:{chest:2,back:2,shoulders:1,biceps:1,triceps:1}},{title:"Lower A",focus:"Quads focus",emoji:"🦵",offset:0,groups:{quads:2,hamstrings:1,calves:1,abs:1}},{title:"Upper B",focus:"Shoulders & Arms",emoji:"🔥",offset:2,groups:{shoulders:2,back:1,chest:1,biceps:1,triceps:1}},{title:"Lower B",focus:"Hamstrings focus",emoji:"🏃",offset:1,groups:{hamstrings:2,quads:1,calves:1,abs:1}}]},
  5:{name:"Bro Split (5 Day)",days:[{title:"Chest Day",focus:"Chest + Abs",emoji:"💪",offset:0,groups:{chest:4,abs:1}},{title:"Back Day",focus:"Full Back",emoji:"🔥",offset:0,groups:{back:4,abs:1}},{title:"Shoulder Day",focus:"Delts",emoji:"🏋️",offset:0,groups:{shoulders:4,abs:1}},{title:"Leg Day",focus:"Quads + Hams",emoji:"🦵",offset:0,groups:{quads:3,hamstrings:2,calves:1}},{title:"Arms Day",focus:"Biceps + Triceps",emoji:"💪",offset:0,groups:{biceps:3,triceps:3}}]},
  6:{name:"Push Pull Legs (6 Day)",days:[{title:"Push A",focus:"Chest focus",emoji:"💪",offset:0,groups:{chest:3,shoulders:2,triceps:2}},{title:"Pull A",focus:"Back & Biceps",emoji:"🔥",offset:0,groups:{back:3,shoulders:1,biceps:2}},{title:"Legs A",focus:"Quads focus",emoji:"🦵",offset:0,groups:{quads:3,hamstrings:1,calves:1,abs:1}},{title:"Push B",focus:"Shoulder focus",emoji:"🏋️",offset:2,groups:{shoulders:3,chest:2,triceps:2}},{title:"Pull B",focus:"Back & Biceps",emoji:"🎯",offset:2,groups:{back:3,shoulders:1,biceps:2}},{title:"Legs B",focus:"Hamstrings focus",emoji:"🏃",offset:1,groups:{hamstrings:2,quads:2,calves:1,abs:1}}]}
};
const EXP_CAP={beginner:5,intermediate:7,advanced:9};
const LIBRARY=[
  {name:"Beginner Kickstart",goal:"recomp",experience:"beginner",days:3,emoji:"🌱",desc:"For newbies · full body 3 day"},
  {name:"Fat Loss Shred",goal:"fatloss",experience:"intermediate",days:5,emoji:"🔥",desc:"Burn fat · 5 day bro split"},
  {name:"Muscle Builder PPL",goal:"muscle",experience:"intermediate",days:6,emoji:"💪",desc:"Build size · 6 day Push/Pull/Legs"},
  {name:"Strength Power",goal:"strength",experience:"advanced",days:4,emoji:"🏋️",desc:"Get strong · heavy 4 day upper/lower"},
  {name:"Recomp Balanced",goal:"recomp",experience:"intermediate",days:4,emoji:"⚖️",desc:"Fat loss + muscle · 4 day"}
];
const FOODS=[
  {n:"Egg",u:"1 egg",cal:78,p:6,c:1,f:5},{n:"Egg White",u:"1",cal:17,p:4,c:0,f:0},{n:"Roti / Chapati",u:"1 med",cal:120,p:3,c:18,f:3},{n:"Paratha",u:"1",cal:280,p:6,c:36,f:12},{n:"Chicken Breast",u:"100g",cal:165,p:31,c:0,f:4},{n:"Chicken Karahi",u:"1 plate",cal:350,p:35,c:6,f:20},{n:"Beef Mince",u:"100g",cal:250,p:26,c:0,f:16},{n:"Beef/Mutton",u:"100g",cal:240,p:26,c:0,f:15},{n:"Fish",u:"100g",cal:140,p:22,c:0,f:5},{n:"Lentils (Daal)",u:"1 bowl",cal:150,p:9,c:20,f:4},{n:"Chickpeas",u:"1 bowl",cal:180,p:10,c:27,f:3},{n:"Rice",u:"1 cup",cal:200,p:4,c:45,f:1},{n:"Biryani",u:"1 plate",cal:600,p:20,c:80,f:22},{n:"Curry (Salan)",u:"1 bowl",cal:180,p:6,c:8,f:14},{n:"Paneer",u:"100g",cal:265,p:18,c:3,f:21},{n:"Yogurt",u:"1 bowl",cal:100,p:10,c:8,f:4},{n:"Milk",u:"1 glass",cal:150,p:8,c:12,f:8},{n:"Whey Protein",u:"1 scoop",cal:120,p:24,c:3,f:2},{n:"Mango",u:"1 med",cal:150,p:1,c:38,f:1},{n:"Banana",u:"1",cal:105,p:1,c:27,f:0},{n:"Apple",u:"1",cal:95,p:0,c:25,f:0},{n:"Oats",u:"40g",cal:150,p:5,c:27,f:3},{n:"Peanut Butter",u:"1 tbsp",cal:95,p:4,c:3,f:8},{n:"Almonds",u:"10",cal:70,p:3,c:2,f:6},{n:"Salad",u:"1 bowl",cal:35,p:1,c:6,f:0},{n:"Vegetables",u:"1 bowl",cal:90,p:3,c:10,f:5}
];
const QUOTES=[
  "The body achieves what the mind believes.",
  "Don't wish for it — work for it.",
  "Discipline beats motivation. Show up.",
  "Sweat now, shine later.",
  "Small progress is still progress.",
  "You don't have to be extreme, just consistent.",
  "The only bad workout is the one you skipped.",
  "Push yourself — no one else will do it for you.",
  "Your future self is watching you right now.",
  "Strong is the new goal. Earn it."
];
const ACHIEVEMENTS=[
  {id:"first",e:"🎯",t:"First Workout",d:"Complete 1 workout",test:s=>s.workouts>=1},
  {id:"ten",e:"🔟",t:"10 Workouts",d:"Complete 10 workouts",test:s=>s.workouts>=10},
  {id:"fifty",e:"🏅",t:"50 Workouts",d:"Complete 50 workouts",test:s=>s.workouts>=50},
  {id:"streak7",e:"🔥",t:"7-Day Streak",d:"7 days in a row",test:s=>s.streak>=7},
  {id:"streak30",e:"🌟",t:"30-Day Streak",d:"30 days in a row",test:s=>s.streak>=30},
  {id:"hydrate",e:"💧",t:"Hydrated",d:"Hit your water goal",test:s=>s.waterHit},
  {id:"strong",e:"🦍",t:"Strong",d:"Lift 100kg on any move",test:s=>s.maxPR>=100},
  {id:"weekly",e:"📅",t:"Consistent",d:"3 workouts in a week",test:s=>s.weekWorkouts>=3}
];
/* Seed video map (exercise name -> YouTube id) from DeltaBolic. The shared/global
   map in Firestore overrides/extends this; auto-saved when a user plays a match. */
const DEFAULT_VIDEOS={
  /* exercise-name fallbacks */
  "Romanian Deadlift":"QbbURJEUALw","Bulgarian Split Squat":"Cow3ESXmrTU","Hip Thrust":"KBEF9XsiJ-w","Leg Press":"KMUiCMLXOAk",
  /* per-variant (name|VariantLabel) */
  "Bench Press|Barbell":"XjrsqShr-Ic",
  "Bench Press|Dumbbell":"WbCEvFA0NJs",
  "Incline Press|Dumbbell":"8fXfwG4ftaQ",
  "Incline Press|Barbell":"98HWfiRonkE",
  "Chest Dips|Bodyweight":"eicOUO9WaJc",
  "Chest Dips|Weighted":"eicOUO9WaJc",
  "Cable Fly|High-Low":"y4RJDSOBEl8",
  "Cable Fly|Mid":"I-Ue34qLxc4",
  "Machine Chest Fly|Pec Deck":"a9vQ_hwIksU",
  "Machine Chest Fly|Dumbbell":"rk8YayRoTRQ",
  "Pull-ups|Bodyweight":"eDP_OOhMTZ4",
  "Pull-ups|Assisted":"CdO5BvP6Ti8",
  "Barbell Row|Barbell":"phVtqawIgbk",
  "Barbell Row|T-Bar":"phVtqawIgbk",
  "Lat Pulldown|Wide":"7Cjc_aXoQ_I",
  "Lat Pulldown|Neutral":"-NKnCw9LZqA",
  "Seated Cable Row|Cable":"qD1WZ5pSuvk",
  "Seated Cable Row|Chest-Supported":"G35gTqGcXXA",
  "Lat Pullover|Cable":"Datv2L6t3-4",
  "Lat Pullover|Dumbbell":"6yYVcIOAERY",
  "Overhead Press|Dumbbell":"k6tzKisR3NY",
  "Overhead Press|Barbell":"zoN5EH50Dro",
  "Lateral Raise|Dumbbell":"Kl3LEzQ5Zqs",
  "Lateral Raise|Cable":"9ilIKuy6B0g",
  "Rear Delt Fly|Pec Deck":"0LJ-JujImCs",
  "Rear Delt Fly|Face Pull":"lMJUXEvcMkQ",
  "Arnold Press|Dumbbell":"6K_N9AGhItQ",
  "Front Raise|Dumbbell":"9ThlTL25DH8",
  "Barbell Curl|EZ Bar":"54x2WF1_Suc",
  "Barbell Curl|Straight":"54x2WF1_Suc",
  "Incline Dumbbell Curl|Dumbbell":"uCUaRFlA9vE",
  "Hammer Curl|Dumbbell":"lmIo_gVE8T4",
  "Hammer Curl|Rope":"HTtd5uMFVz8",
  "Preacher Curl|Machine":"S4dDLfp3e8w",
  "Preacher Curl|EZ Bar":"dXZl_9Ko6HI",
  "Cable Curl|Bayesian":"_Z8Afknw_Fc",
  "Cable Curl|Standing":"9Ark9S11uXw",
  "Close-Grip Bench|Barbell":"6zWoAllRufg",
  "Tricep Pushdown|Rope":"1FoWlRS2Edc",
  "Tricep Pushdown|Bar":"1FjkhpZsaxc",
  "Overhead Extension|Cable":"9Ark9S11uXw",
  "Overhead Extension|Dumbbell":"b_r_LW4HEcM",
  "Skullcrusher|EZ Bar":"K3mFeNz4e3w",
  "Tricep Dips|Bodyweight":"4ua3MzaU0QU",
  "Tricep Dips|Bench":"4ua3MzaU0QU",
  "Squat|Barbell":"dW3zj79xfrc",
  "Squat|Smith":"iKCJCydYYrE",
  "Leg Press|Machine":"EotSw18oR9w",
  "Hack Squat|Machine":"cFGgMO-ENiQ",
  "Bulgarian Split Squat|Dumbbell":"or1frhkjBDc",
  "Bulgarian Split Squat|Barbell":"bRFohIMjQ7A",
  "Leg Extension|Machine":"uM86QE59Tgc",
  "Romanian Deadlift|Barbell":"Wou9zVQrAfs",
  "Romanian Deadlift|Dumbbell":"hu3jRvTc_po",
  "Lying Leg Curl|Machine":"FRy58-v0YII",
  "Seated Leg Curl|Machine":"_lgE0gPvbik",
  "Hip Thrust|Barbell":"CvuVYMFd11g",
  "Good Morning|Barbell":"7cpldMZjLOs",
  "Standing Calf Raise|Machine":"wdOkFomQNp8",
  "Standing Calf Raise|Smith":"wlqTemUXPXY",
  "Seated Calf Raise|Machine":"ar8nav0jGoE",
  "Leg Press Calf Raise|Machine":"-pktcXXJo7A",
  "Single-Leg Calf Raise|Dumbbell":"E1mG5L9rpFc",
  "Hanging Leg Raise|Bodyweight":"XQc0WHO90Lk",
  "Cable Crunch|Cable":"K2m0jj6RfYg",
  "Ab Wheel Rollout|Wheel":"kISuoI7QCYk",
  "Plank|Hold":"xe2MXatLTUw",
  "Russian Twist|Weighted":"vGwnJSh4Q2Q",
  "Front Raise|Cable":"NdQE5Fhfqn4",
  "Seated Chest Press|Cable":"Qu7-ceCvq7w",
  "Seated Chest Press|Machine":"6v4nrRVySj0",
  "Incline Fly|Cable":"I-Ue34qLxc4",
  "Incline Fly|Dumbbell":"8fXfwG4ftaQ",
  "Walking Lunges|Dumbbell":"mJilHWIBWO8",
  "Walking Lunges|Barbell":"EWBiNhxDnmQ",
  "Glute Adduction|Machine":"tu4o4quPv2k",
  "Glute Kickback|Cable":"UbOcViik3hk",
  "Forearms (Superset)|Wrist Curl":"d5YiFNoiCa0",
  "Forearms (Superset)|Dead Hang":"XPcT3capkyk",
  "Forearms (Superset)|Reverse Wrist Curl":"B699nq91i_w",
  "Forearms (Superset)|Farmer Walk":"5LKllcK6PfQ"
};
const YT_UPLOADS="UUerweoBkwQOb_zwx3NfUD1g"; // DeltaBolic uploads playlist

/* ============================================================
   FIXED PRESET PLAN — Abhinav Mahajan Advanced 6-Day PPL
   Shown to every user by default. reps shown as the working scheme.
   ============================================================ */
const AMP=[
  {title:"Push 1",focus:"Chest focus",emoji:"💪",exercises:[
    {name:"Incline Press",sets:4,reps:"6-12",rest:120,cat:"chest",variants:V(["Dumbbell","incline dumbbell press form"],["Barbell","incline barbell bench press form"])},
    {name:"Bench Press",sets:3,reps:"6",rest:120,cat:"chest",variants:V(["Barbell","barbell bench press form"],["Dumbbell","dumbbell bench press form"])},
    {name:"Overhead Press",sets:3,reps:"8",rest:90,cat:"shoulders",variants:V(["Dumbbell","overhead dumbbell press form"],["Barbell","overhead barbell press form"])},
    {name:"Cable Fly",sets:3,reps:"10",rest:60,cat:"chest",variants:V(["High-Low","high to low cable crossover form"],["Mid","cable chest fly form"])},
    {name:"Lateral Raise",sets:3,reps:"12",rest:90,dropSet:true,cat:"shoulders",variants:V(["Dumbbell","dumbbell lateral raise form"],["Cable","cable lateral raise form"])},
    {name:"Overhead Extension",sets:4,reps:"8-15",rest:90,cat:"triceps",variants:V(["Cable","overhead cable tricep extension form"],["Dumbbell","overhead dumbbell tricep extension form"])},
    {name:"Tricep Pushdown",sets:3,reps:"12",rest:60,dropSet:true,cat:"triceps",variants:V(["Rope","rope tricep pushdown form"],["Bar","bar tricep pushdown form"])},
    {name:"Cable Crunch",sets:4,reps:"12-15",rest:45,cat:"abs",variants:V(["Cable","cable crunch form"])}
  ]},
  {title:"Pull 1",focus:"Back & Biceps",emoji:"🔥",exercises:[
    {name:"Lat Pulldown",sets:4,reps:"8-12",rest:120,cat:"back",variants:V(["Wide","wide grip lat pulldown form"],["Neutral","neutral grip lat pulldown form"])},
    {name:"Seated Cable Row",sets:3,reps:"8",rest:90,cat:"back",variants:V(["Cable","seated cable row form"],["Chest-Supported","chest supported row form"])},
    {name:"Good Morning",sets:3,reps:"15",rest:90,cat:"hamstrings",variants:V(["Barbell","barbell good morning form"])},
    {name:"Incline Dumbbell Curl",sets:4,reps:"8-15",rest:60,cat:"biceps",variants:V(["Dumbbell","incline dumbbell curl form"])},
    {name:"Preacher Curl",sets:2,reps:"12",rest:60,dropSet:true,cat:"biceps",variants:V(["Machine","preacher curl machine form"],["EZ Bar","ez bar preacher curl form"])},
    {name:"Forearms (Superset)",sets:3,reps:"20",rest:60,cat:"biceps",variants:V(["Wrist Curl","barbell wrist curl forearm"],["Dead Hang","dead hang forearm exercise"])}
  ]},
  {title:"Legs 1",focus:"Quads & Glutes",emoji:"🦵",exercises:[
    {name:"Squat",sets:4,reps:"6-12",rest:120,cat:"quads",variants:V(["Barbell","barbell squat form"],["Smith","smith machine squat form"])},
    {name:"Hip Thrust",sets:3,reps:"10",rest:90,cat:"hamstrings",variants:V(["Barbell","barbell hip thrust form"])},
    {name:"Leg Extension",sets:2,reps:"10",rest:60,dropSet:true,cat:"quads",variants:V(["Machine","leg extension form"])},
    {name:"Glute Adduction",sets:2,reps:"15",rest:60,cat:"quads",variants:V(["Machine","hip adduction machine glutes"])},
    {name:"Standing Calf Raise",sets:5,reps:"10-18",rest:45,cat:"calves",variants:V(["Machine","standing calf raise form"],["Smith","smith machine calf raise form"])},
    {name:"Russian Twist",sets:3,reps:"12",rest:30,cat:"abs",variants:V(["Weighted","weighted russian twist form"])}
  ]},
  {title:"Push 2",focus:"Shoulder focus",emoji:"🏋️",exercises:[
    {name:"Overhead Press",sets:4,reps:"6-12",rest:120,cat:"shoulders",variants:V(["Dumbbell","overhead dumbbell press form"],["Barbell","overhead barbell press form"])},
    {name:"Seated Chest Press",sets:3,reps:"8",rest:120,cat:"chest",variants:V(["Cable","seated cable chest press form"],["Machine","seated machine chest press form"])},
    {name:"Lateral Raise",sets:3,reps:"15",rest:90,dropSet:true,cat:"shoulders",variants:V(["Cable","cable lateral raise form"],["Dumbbell","dumbbell lateral raise form"])},
    {name:"Incline Fly",sets:3,reps:"10",rest:60,cat:"chest",variants:V(["Cable","incline cable fly form"],["Dumbbell","incline dumbbell fly form"])},
    {name:"Front Raise",sets:2,reps:"10",rest:60,cat:"shoulders",variants:V(["Dumbbell","front dumbbell raise form"],["Cable","cable front raise form"])},
    {name:"Skullcrusher",sets:4,reps:"8-15",rest:90,cat:"triceps",variants:V(["EZ Bar","ez bar skullcrusher form"])},
    {name:"Tricep Dips",sets:3,reps:"15",rest:60,dropSet:true,cat:"triceps",variants:V(["Bodyweight","tricep dips form"],["Bench","bench dips form"])},
    {name:"Hanging Leg Raise",sets:4,reps:"12-15",rest:45,cat:"abs",variants:V(["Bodyweight","hanging leg raise form"])}
  ]},
  {title:"Pull 2",focus:"Back & Biceps",emoji:"🎯",exercises:[
    {name:"Barbell Row",sets:4,reps:"8-12",rest:120,cat:"back",variants:V(["T-Bar","t-bar row form"],["Barbell","barbell bent over row form"])},
    {name:"Pull-ups",sets:3,reps:"6-8",rest:90,cat:"back",variants:V(["Bodyweight","pull ups form"],["Assisted","assisted pull up machine form"])},
    {name:"Rear Delt Fly",sets:3,reps:"15",rest:60,dropSet:true,cat:"shoulders",variants:V(["Pec Deck","reverse pec deck fly form"],["Face Pull","face pulls form"])},
    {name:"Hammer Curl",sets:4,reps:"8-15",rest:60,cat:"biceps",variants:V(["Dumbbell","hammer curl form"],["Rope","rope hammer curl form"])},
    {name:"Cable Curl",sets:2,reps:"12",rest:60,dropSet:true,cat:"biceps",variants:V(["Bayesian","bayesian cable curl form"],["Standing","standing cable curl form"])},
    {name:"Forearms (Superset)",sets:3,reps:"20",rest:60,cat:"biceps",variants:V(["Reverse Wrist Curl","reverse wrist curl forearm"],["Farmer Walk","dumbbell farmer walk"])}
  ]},
  {title:"Legs 2",focus:"Hamstrings & Glutes",emoji:"🏃",exercises:[
    {name:"Romanian Deadlift",sets:4,reps:"6-12",rest:120,cat:"hamstrings",variants:V(["Barbell","romanian deadlift form"],["Dumbbell","dumbbell rdl form"])},
    {name:"Walking Lunges",sets:3,reps:"10",rest:90,cat:"quads",variants:V(["Dumbbell","walking dumbbell lunges form"],["Barbell","walking barbell lunges form"])},
    {name:"Lying Leg Curl",sets:2,reps:"10",rest:60,dropSet:true,cat:"hamstrings",variants:V(["Machine","lying leg curl form"])},
    {name:"Glute Kickback",sets:2,reps:"15",rest:60,cat:"hamstrings",variants:V(["Cable","cable glute kickback form"])},
    {name:"Seated Calf Raise",sets:5,reps:"12-20",rest:45,cat:"calves",variants:V(["Machine","seated calf raise form"])},
    {name:"Plank",sets:3,reps:"45s",rest:30,cat:"abs",variants:V(["Hold","plank hold form"])}
  ]}
];
const FIXED_PLANS={'am-ppl':AMP};
const AM_META={id:'am-ppl',name:'AM Advanced PPL',emoji:'🔥',fixed:true,goal:'muscle',experience:'advanced',days:6};
