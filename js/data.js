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
const EX_POOL={
  chest:[{name:"Bench Press",c:1,variants:V(["Barbell","barbell bench press form"],["Dumbbell","dumbbell bench press form"])},{name:"Incline Press",c:1,variants:V(["Dumbbell","incline dumbbell press form"],["Barbell","incline barbell bench press form"])},{name:"Chest Fly",c:0,variants:V(["Dumbbell","dumbbell chest fly form"],["Pec Deck","pec deck fly form"])},{name:"Cable Crossover",c:0,variants:V(["High-Low","high to low cable crossover form"])},{name:"Chest Dips",c:1,variants:V(["Bodyweight","chest dips form"])}],
  back:[{name:"Lat Pulldown",c:1,variants:V(["Wide","wide grip lat pulldown form"],["Neutral","neutral grip lat pulldown form"])},{name:"Seated Cable Row",c:1,variants:V(["Cable","seated cable row form"])},{name:"Barbell Row",c:1,variants:V(["Barbell","barbell bent over row form"],["T-Bar","t-bar row form"])},{name:"Pull-ups",c:1,variants:V(["Bodyweight","pull ups form"])},{name:"Lat Pullover",c:0,variants:V(["Cable","cable pullover form"])}],
  shoulders:[{name:"Overhead Press",c:1,variants:V(["Dumbbell","overhead dumbbell press form"],["Barbell","overhead barbell press form"])},{name:"Lateral Raise",c:0,variants:V(["Dumbbell","dumbbell lateral raise form"],["Cable","cable lateral raise form"])},{name:"Rear Delt Fly",c:0,variants:V(["Pec Deck","reverse pec deck fly form"],["Face Pull","face pulls form"])},{name:"Front Raise",c:0,variants:V(["Dumbbell","front dumbbell raise form"])},{name:"Arnold Press",c:1,variants:V(["Dumbbell","arnold press form"])}],
  biceps:[{name:"Barbell Curl",c:0,variants:V(["EZ Bar","ez bar curl form"])},{name:"Dumbbell Curl",c:0,variants:V(["Incline","incline dumbbell curl form"])},{name:"Hammer Curl",c:0,variants:V(["Dumbbell","hammer curl form"])},{name:"Preacher Curl",c:0,variants:V(["Machine","preacher curl form"])}],
  triceps:[{name:"Tricep Pushdown",c:0,variants:V(["Rope","rope tricep pushdown form"])},{name:"Skullcrusher",c:0,variants:V(["EZ Bar","ez bar skullcrusher form"])},{name:"Overhead Extension",c:0,variants:V(["Cable","overhead cable tricep extension form"])},{name:"Close-Grip Bench",c:1,variants:V(["Barbell","close grip bench press form"])}],
  quads:[{name:"Squat",c:1,variants:V(["Barbell","barbell squat form"],["Smith","smith machine squat form"])},{name:"Leg Press",c:1,variants:V(["Machine","leg press form"])},{name:"Hack Squat",c:1,variants:V(["Machine","hack squat form"])},{name:"Lunges",c:1,variants:V(["Walking","walking lunges form"],["Bulgarian","bulgarian split squat form"])},{name:"Leg Extension",c:0,variants:V(["Machine","leg extension form"])}],
  hamstrings:[{name:"Romanian Deadlift",c:1,variants:V(["Barbell","romanian deadlift form"],["Dumbbell","dumbbell rdl form"])},{name:"Leg Curl",c:0,variants:V(["Lying","lying leg curl form"],["Seated","seated leg curl form"])},{name:"Hip Thrust",c:1,variants:V(["Barbell","barbell hip thrust form"])}],
  calves:[{name:"Standing Calf Raise",c:0,variants:V(["Machine","standing calf raise form"])},{name:"Seated Calf Raise",c:0,variants:V(["Machine","seated calf raise form"])}],
  abs:[{name:"Hanging Leg Raise",c:0,variants:V(["Bodyweight","hanging leg raise form"])},{name:"Cable Crunch",c:0,variants:V(["Cable","cable crunch form"])},{name:"Plank",c:0,variants:V(["Hold","plank hold form"])},{name:"Russian Twist",c:0,variants:V(["Weighted","weighted russian twist form"])}]
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
