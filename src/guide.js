
/* ============================== GUIDED BUILD: RULES IN PLAIN WORDS ============================== */
const STAT_INFO={
  INT:"Smarts, memory and noticing things. Drives Awareness/Notice, knowledge skills and most Netrunning.",
  REF:"Speed and coordination. The fighting stat: attacks are REF + weapon skill + 1D10, and initiative is REF + 1D10.",
  TECH:"Working with your hands and machines: repairs, building, first aid, picking locks.",
  COOL:"Nerve and willpower. Staying calm under fire, intimidating people, resisting torture and drugs.",
  ATTR:"Looks and presence. Helps grooming, style and first impressions.",
  LUCK:"Points you can spend to add to any roll. They refill at the start of each session.",
  MA:"Movement. You run MA × 3 metres in a combat turn and can leap a quarter of that.",
  BODY:"Strength and toughness. Sets your Save number, your Body Type Modifier (damage you shrug off), lifting and melee damage.",
  EMP:"Connection to other people. Humanity starts at EMP × 10; cyberware eats it, and every 10 points lost costs 1 EMP.",
};
const ROLE_GUIDE={
  Solo:{does:"Professional fighters: bodyguards, mercenaries, assassins.",stats:["REF","BODY","COOL"],ability:"Combat Sense adds to your Awareness/Notice and initiative rolls, so you spot trouble first and act first."},
  Rocker:{does:"Musicians and performers who move crowds and start movements.",stats:["COOL","EMP","ATTR"],ability:"Charismatic Leadership lets you sway and lead a crowd. The higher it is, the bigger the crowd."},
  Netrunner:{does:"Hackers who jack their minds into the Net to break into systems.",stats:["INT","TECH","REF"],ability:"Interface is how well you run programs and your cyberdeck inside the Net."},
  Techie:{does:"Mechanics and inventors who can fix or modify almost anything.",stats:["TECH","INT","REF"],ability:"Jury Rig lets you patch together a quick repair on nearly anything so it works for a while."},
  Media:{does:"Journalists who dig up stories and get them broadcast.",stats:["INT","EMP","COOL"],ability:"Credibility is how much the public believes you, and how far your stories reach."},
  Cop:{does:"Law enforcement, from street patrol to corporate security.",stats:["REF","COOL","INT"],ability:"Authority is the weight of your badge: getting cooperation, or backing people down."},
  Corporate:{does:"Executives who play with company money and company power.",stats:["INT","COOL","ATTR"],ability:"Resources is how much of the corporation's money, gear and people you can call on."},
  Fixer:{does:"Dealers and smugglers who know where to get anything.",stats:["COOL","INT","EMP"],ability:"Streetdeal finds contacts, black-market goods and rumours on the street."},
  Nomad:{does:"Road warriors who travel with a whole extended family.",stats:["REF","BODY","TECH"],ability:"Family lets you call on your nomad pack for help, vehicles and gear."},
  Medtech:{does:"Doctors and trauma techs who keep people alive.",stats:["TECH","INT","COOL"],ability:"Medical Tech covers surgery, treating critical wounds and installing cyberware."},
};
const SKILL_INFO={
  "Personal Grooming":"Looking good: hair, makeup, presentation.","Wardrobe & Style":"Knowing what to wear and how to wear it.",
  "Endurance":"Keeping going through pain, hunger and long effort.","Strength Feat":"Lifting, breaking and bending things.","Swimming":"Staying afloat and moving through water.",
  "Interrogation":"Getting information out of someone who doesn't want to give it.","Intimidate":"Scaring people into doing what you want.","Oratory":"Public speaking and moving an audience.",
  "Resist Torture/Drugs":"Holding out against pain, questioning and chemicals.","Streetwise":"Knowing the Street: who's who, where to buy, how to stay out of trouble.",
  "Human Perception":"Reading people: lies, moods and hidden motives.","Interview":"Drawing information out of people in conversation.","Leadership":"Commanding and inspiring a group.",
  "Seduction":"Romance and attraction.","Social":"Fitting in at parties, dinners and formal events.","Persuasion & Fast Talk":"Talking people into things, or bluffing past them.","Perform":"Acting, singing and stage presence.",
  "Accounting":"Money, books and spotting financial fraud.","Anthropology":"Cultures, customs and how groups behave.",
  "Awareness/Notice":"Spotting danger, clues and ambushes. The most-rolled skill in the game; almost everyone wants some.",
  "Biology":"Living things and how they work.","Botany":"Plants: identifying, growing and using them.","Chemistry":"Chemicals and making them.","Composition":"Writing songs, articles and scripts.",
  "Diagnose Illness":"Working out what's wrong with a patient.","Education & Gen. Know":"General knowledge and schooling.","Gamble":"Games of chance and knowing the odds.","Geology":"Rocks, minerals and the ground.",
  "Hide/Evade":"Losing someone who's following you.","History":"Past events and how they shaped the present.","Library Search":"Finding information in databases and archives.",
  "Mathematics":"Calculation and statistics.","Physics":"How the physical world works: forces, energy, ballistics.","Programming":"Writing and changing software, including Netrunner programs.",
  "Shadow/Track":"Following someone without being noticed.","Stock Market":"Trading shares and reading the corporate economy.","System Knowledge":"The layout of the Net and its major systems.",
  "Teaching":"Passing your skills on to someone else.","Wilderness Survival":"Finding food, water and shelter outside the city.","Zoology":"Animals and how they behave.",
  "Archery":"Bows and crossbows.","Athletics":"Running, climbing, jumping and throwing.","Brawling":"Unarmed fighting: punches, kicks and grapples.","Dance":"Dancing well.",
  "Dodge & Escape":"Getting out of the way of melee attacks and wriggling free of holds.","Driving":"Cars and trucks, especially at speed or under fire.","Fencing":"Sword fighting with real technique.",
  "Handgun":"Pistols. Attack = REF + Handgun + the gun's WA + 1D10.","Heavy Weapons":"Rocket and grenade launchers, mounted guns.","Martial Art":"A trained fighting style; hits harder than Brawling.",
  "Melee":"Knives, clubs, swords and other hand weapons.","Motorcycle":"Riding bikes.","Operate Heavy Machinery":"Cranes, loaders, bulldozers.",
  "Pilot (Gyro)":"Flying gyrocopters.","Pilot (Fixed Wing)":"Flying planes.","Pilot (Dirigible)":"Flying airships.","Pilot (Vect. Thrust)":"Flying AVs and other vectored-thrust craft.",
  "Rifle":"Rifles and shotguns.","Stealth":"Moving quietly and staying out of sight.","Submachinegun":"SMGs, including full-auto bursts.",
  "Aero Tech":"Repairing aircraft.","AV Tech":"Repairing AVs.","Basic Tech":"Fixing everyday machines and electrics.","Cryotank Operation":"Running the cryo tanks that keep the badly wounded alive.",
  "Cyberdeck Design":"Building and upgrading cyberdecks.","CyberTech":"Repairing and maintaining cyberware.","Demolitions":"Explosives: setting, defusing, estimating the blast.","Disguise":"Changing how you look.",
  "Electronics":"Building and repairing electronic devices.","Elect. Security":"Alarms, cameras and electronic locks.","First Aid":"Stopping bleeding and stabilising the wounded.","Forgery":"Faking documents and IDs.",
  "Gyro Tech":"Repairing gyrocopters.","Paint or Draw":"Visual art.","Photo & Film":"Taking pictures and shooting video.","Pharmaceuticals":"Drugs and medicines: knowing them and making them.",
  "Pick Lock":"Opening mechanical locks.","Pick Pocket":"Lifting things off people unnoticed.","Play Instrument":"Making music.","Weaponsmith":"Repairing and modifying weapons.",
};
function skillHint(c,name){
  if(ABILITIES[name]||(roleOf(c)&&roleOf(c).ab===name)){const r=ROLE_NAMES.find(x=>ROLES[x].ab===name);const role=r?ROLES[r]:roleOf(c);return r&&ROLE_GUIDE[r]?ROLE_GUIDE[r].ability:(role&&role.guide&&role.guide.ability)||""}
  const t=SKILL_INFO[name]||ITEM_DESC.skill[name]||((c&&c.homebrew&&c.homebrew.skills&&c.homebrew.skills[name]||{}).desc)||"";const m=skillDef(c,name).m||1;
  return t+(m>1?` Costs ${m===2?"double":"triple"} IP to improve.`:"");
}
function guideOn(c){return !!c&&(c.id==="sample"?!!ui.sampleGuide:!!c.guide)}
function tip(html,cls=""){return `<div class="tip ${cls}"><span class="tip-k">How it works</span><div class="tip-b">${html}</div></div>`}
function guideStep(step,c){
  const hr=roleOf(c);const r=ROLE_GUIDE[c.role]||(hr&&hr.guide&&{does:hr.guide.does,stats:hr.guide.stats.length?hr.guide.stats:[hr.abStat],ability:hr.guide.ability||"Your role's special ability."})||ROLE_GUIDE.Solo;
  const S=[
    `<p>Your <b>handle</b> is your street name. It's what the other players and the GM call you.</p>
     <p>Your <b>role</b> is your profession. It sets your ten career skills and gives you a <b>special ability</b> no other role has. Pick the one that sounds most fun to play; there are no wrong choices.</p>
     <p><b>Concept</b> is one line about who you are. It helps the GM build stories around you. Age doesn't change your stats, but every year past 16 gives you a life event in the Lifepath step.</p>`,
    `<p>Stats run from <b>2</b> (awful) to <b>10</b> (the best a normal human gets); 5–6 is average. You spread a pool of points across all nine. Cinematic pools go from 50 (an average person) to 80 (a major hero); most groups use 60–70, so ask your GM.</p>
     <p>As a <b>${esc(c.role)}</b>, put your best numbers in <b>${r.stats.join(", ")}</b>.</p>
     <p>Almost every roll in the game is <b>stat + skill + 1D10</b>, trying to reach a target number the GM sets. The numbers under the stats update as you go.</p>`,
    `<p>You get <b>40 points</b> for your role's ten career skills, including your special ability. No skill can go above 10.</p>
     <p>What a level means: <b>1–2</b> beginner · <b>3–4</b> competent · <b>5–6</b> professional · <b>7–8</b> expert · <b>9–10</b> one of the best.</p>
     <p>Targets the GM sets: Easy <b>10</b> · Average <b>15</b> · Difficult <b>20</b> · Very difficult <b>25</b> · Nearly impossible <b>30</b>. With a stat of 6 and a skill of 4 you roll 1D10 + 10, so an Average task works 6 times in 10. A natural 10 rolls again and adds; a natural 1 is a fumble.</p>
     <p><b>${esc(abilityOf(c))}:</b> ${esc(r.ability)} A 4–6 is a good start.</p>`,
    `<p>Pickup skills are everything else you learned on the street. You get <b>REF + INT</b> points to spend on any skill, including more points in your career skills.</p>
     <p>Good picks for almost anyone: <b>Awareness/Notice</b> (spotting danger), <b>Dodge & Escape</b>, <b>Athletics</b>, a weapon skill, and <b>Streetwise</b>.</p>
     <p>Skills marked <b>×2</b> or <b>×3</b> don't cost more points now; they just cost more Improvement Points to raise later.</p>`,
    `<p>The lifepath is your backstory, built from random tables: your style, your family, what drives you, and one event for each year since you were 16.</p>
     <p>Enemies, friends and lovers you roll here are <b>story hooks</b>. Tell your GM about them, because they may turn up in play.</p>
     <p>Roll everything with one button, reroll any line you don't like, or type over it with your own idea.</p>`,
    `<p>Your role pays a <b>monthly income</b> based on your special ability level. Starting cash is a few months of it.</p>
     <p><b>Weapons:</b> WA is a bonus or penalty to hit. Damage is the dice you roll when you hit. ROF is shots per turn. Rel is reliability (VR very reliable, ST standard, UR unreliable). Conc is how easy it is to hide (P pocket, J jacket, L long coat, N can't hide).</p>
     <p><b>Armor:</b> SP is stopping power, taken off every hit to that body part. EV is how much heavy armor slows you; it lowers your REF.</p>
     <p><b>Cyberware:</b> every implant costs Humanity, rolled when you buy it. Each 10 Humanity lost drops your EMP by 1, and at EMP 0 you're a cyberpsycho and the GM takes over. Chrome is powerful; spend Humanity carefully.</p>`,
    `<p>Anything flagged here is a reminder, not a rule; your GM can approve anything.</p>
     <p>When you finish, your character sheet opens with tips on rolling, wounds, armor and improving. Turn them off any time with <b>Hide tips</b>.</p>`,
  ];
  return `<div class="guide-step">${tip(S[step])}</div>`;
}
const SHEET_TIPS={
  skills:`Tap a stat or a skill's roll button to roll it: <b>stat + skill + 1D10</b>. Pick a <b>Target</b> first and the result tells you whether you beat it. The GM awards <b>Improvement Points</b> (IP) for good play; raising a skill costs its current level × 10 IP, more for ×2 and ×3 skills.`,
  combat:`<b>Initiative</b> is REF + 1D10 (Solos add Combat Sense); highest acts first. <b>Attack</b> is REF + weapon skill + WA + 1D10 against the range number. <b>Damage:</b> roll the weapon's dice, subtract the armor SP where you were hit, double it for head hits, then subtract your BTM. The calculator below does it for you.`,
  cyber:`<b>Humanity</b> is your grip on being human. Every implant costs some; each 10 points lost lowers EMP by 1, and at EMP 0 you go cyberpsycho. Therapy, arranged with the GM, can win some back.`,
  gear:`Track your cash here. Rent, food and other lifestyle costs come due every month; <b>Pay this month</b> takes them off in one go.`,
  lifepath:`Your backstory. Enemies and friends make good story hooks, so tell your GM about them.`,
  net:`Your <b>cyberdeck</b> holds your programs: its <b>Speed</b> adds to Net initiative (REF + Speed + 1D10), its <b>data walls</b> are its armour, and its <b>memory</b> limits how many programs you can load. Programs on chips stay home. Most program rolls are the program's <b>Strength + 1D10</b> against the target's Strength + 1D10; anti-personnel attacks add <b>INT + Interface</b> on both sides. In a run, your GM jacks you in and you play it from the <b>Net</b> window at the table.`,
  notes:`<b>Contacts</b> are people you can call on for help, gear or information. Keep notes on jobs, debts and secrets.`,
};
const SIDE_TIPS={
  stats:`Tap a stat to roll it. <b>Luck</b> is a pool you spend to add to rolls; it refills each session.`,
  wounds:`Each box is 1 point of damage. <b>Light:</b> no effect · <b>Serious:</b> −2 REF · <b>Critical:</b> REF, INT and COOL halved · <b>Mortal:</b> cut to a third, and you make a death save every turn. After a hit, make a <b>stun save</b>: roll 1D10 at or under the number shown or be knocked out.`,
  armor:`<b>SP</b> at each body part is taken off every hit there. Each time a hit gets through, that armor loses 1 SP until repaired.`,
};
