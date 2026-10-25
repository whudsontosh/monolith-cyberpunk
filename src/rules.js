/* ============================== CYBERPUNK 2020: RULES ==============================
   Game data, character maths, combat maths and the CP2020 dice check. */
const STATS=[["INT","Intelligence"],["REF","Reflexes"],["TECH","Technical Ability"],["COOL","Cool"],["ATTR","Attractiveness"],["LUCK","Luck"],["MA","Movement Allowance"],["BODY","Body Type"],["EMP","Empathy"]];
const STAT_KEYS=STATS.map(s=>s[0]);

// [name, stat, IP multiplier]
const SKILL_DEFS=[
 ["Personal Grooming","ATTR",1],["Wardrobe & Style","ATTR",1],
 ["Endurance","BODY",1],["Strength Feat","BODY",1],["Swimming","BODY",1],
 ["Interrogation","COOL",1],["Intimidate","COOL",1],["Oratory","COOL",1],["Resist Torture/Drugs","COOL",1],["Streetwise","COOL",1],
 ["Human Perception","EMP",1],["Interview","EMP",1],["Leadership","EMP",1],["Seduction","EMP",1],["Social","EMP",1],["Persuasion & Fast Talk","EMP",1],["Perform","EMP",1],
 ["Accounting","INT",1],["Anthropology","INT",1],["Awareness/Notice","INT",1],["Biology","INT",1],["Botany","INT",1],["Chemistry","INT",1],["Composition","INT",1],["Diagnose Illness","INT",2],["Education & Gen. Know","INT",1],["Gamble","INT",1],["Geology","INT",1],["Hide/Evade","INT",1],["History","INT",1],["Library Search","INT",1],["Mathematics","INT",1],["Physics","INT",1],["Programming","INT",1],["Shadow/Track","INT",1],["Stock Market","INT",1],["System Knowledge","INT",1],["Teaching","INT",1],["Wilderness Survival","INT",1],["Zoology","INT",1],
 ["Archery","REF",1],["Athletics","REF",1],["Brawling","REF",1],["Dance","REF",1],["Dodge & Escape","REF",1],["Driving","REF",1],["Fencing","REF",2],["Handgun","REF",1],["Heavy Weapons","REF",2],["Martial Art","REF",3],["Melee","REF",1],["Motorcycle","REF",1],["Operate Heavy Machinery","REF",1],["Pilot (Gyro)","REF",3],["Pilot (Fixed Wing)","REF",2],["Pilot (Dirigible)","REF",2],["Pilot (Vect. Thrust)","REF",3],["Rifle","REF",1],["Stealth","REF",1],["Submachinegun","REF",1],
 ["Aero Tech","TECH",2],["AV Tech","TECH",3],["Basic Tech","TECH",1],["Cryotank Operation","TECH",1],["Cyberdeck Design","TECH",2],["CyberTech","TECH",2],["Demolitions","TECH",2],["Disguise","TECH",1],["Electronics","TECH",1],["Elect. Security","TECH",2],["First Aid","TECH",1],["Forgery","TECH",1],["Gyro Tech","TECH",3],["Paint or Draw","TECH",1],["Photo & Film","TECH",1],["Pharmaceuticals","TECH",2],["Pick Lock","TECH",1],["Pick Pocket","TECH",1],["Play Instrument","TECH",1],["Weaponsmith","TECH",2],
];
const SKILL_BY_NAME=Object.fromEntries(SKILL_DEFS.map(d=>[d[0],{n:d[0],s:d[1],m:d[2]}]));
const TECH_PICKS=SKILL_DEFS.filter(d=>d[1]==="TECH").map(d=>d[0]);

const ROLES={
 Solo:{ab:"Combat Sense",abStat:"INT",blurb:"Hired muscle and cybered killers. Combat Sense adds to Awareness and initiative.",
  skills:["Awareness/Notice","Handgun",{pick:["Brawling","Martial Art"]},"Melee","Weaponsmith","Rifle","Athletics","Submachinegun","Stealth"],income:[2000,3000,4500,7000,9000,12000]},
 Rocker:{ab:"Charismatic Leadership",abStat:"COOL",blurb:"Musicians and rebels who move crowds. Leadership sways audiences.",
  skills:["Awareness/Notice","Perform","Wardrobe & Style","Composition","Brawling","Play Instrument","Streetwise","Persuasion & Fast Talk","Seduction"],income:[1000,1500,2000,5000,8000,12000]},
 Netrunner:{ab:"Interface",abStat:"INT",blurb:"Cyberspace hackers who jack into the Net through interface plugs.",
  skills:["Awareness/Notice","Basic Tech","Education & Gen. Know","System Knowledge","CyberTech","Cyberdeck Design","Composition","Electronics","Programming"],income:[1000,2000,3000,5000,7000,10000]},
 Techie:{ab:"Jury Rig",abStat:"TECH",blurb:"Renegade mechanics who fix, build and improvise anything.",
  skills:["Awareness/Notice","Basic Tech","CyberTech","Teaching","Education & Gen. Know","Electronics",{pick:TECH_PICKS},{pick:TECH_PICKS},{pick:TECH_PICKS}],income:[1000,2000,3000,4000,5000,8000]},
 Media:{ab:"Credibility",abStat:"INT",blurb:"Reporters and screamsheet writers who expose the truth.",
  skills:["Awareness/Notice","Composition","Education & Gen. Know","Persuasion & Fast Talk","Human Perception","Social","Streetwise","Photo & Film","Interview"],income:[1000,1200,3000,4500,7000,10000]},
 Cop:{ab:"Authority",abStat:"COOL",blurb:"Badges on the edge, from beat cops to corporate security.",
  skills:["Awareness/Notice","Handgun","Human Perception","Athletics","Education & Gen. Know","Brawling","Melee","Interrogation","Streetwise"],income:[1000,1200,3000,4500,7000,9000]},
 Corporate:{ab:"Resources",abStat:"INT",blurb:"Slick suits with company money and company enemies.",
  skills:["Awareness/Notice","Human Perception","Education & Gen. Know","Library Search","Social","Persuasion & Fast Talk","Stock Market","Wardrobe & Style","Personal Grooming"],income:[1500,3000,5000,7000,9000,12000]},
 Fixer:{ab:"Streetdeal",abStat:"COOL",blurb:"Deal-makers and smugglers who know where everything is.",
  skills:["Awareness/Notice","Forgery","Handgun","Brawling","Melee","Pick Lock","Pick Pocket","Intimidate","Persuasion & Fast Talk"],income:[1500,3000,5000,7000,8000,10000]},
 Nomad:{ab:"Family",abStat:"INT",blurb:"Road warriors with a whole clan at their back.",
  skills:["Awareness/Notice","Endurance","Melee","Rifle","Driving","Basic Tech","Wilderness Survival","Brawling","Athletics"],income:[1000,1500,2000,3000,4000,5000]},
 Medtech:{ab:"Medical Tech",abStat:"TECH",blurb:"Street doctors and trauma techs who patch up the chromed.",
  skills:["Awareness/Notice","Basic Tech","Diagnose Illness","Education & Gen. Know","Cryotank Operation","Library Search","Pharmaceuticals","Zoology","Human Perception"],income:[1600,3000,5000,7000,10000,15000]},
};
const ROLE_NAMES=Object.keys(ROLES);
const ABILITIES=Object.fromEntries(ROLE_NAMES.map(r=>[ROLES[r].ab,{n:ROLES[r].ab,s:ROLES[r].abStat,m:1,special:true}]));

const LOCS=[["head","Head","1"],["torso","Torso","2–4"],["rarm","R. Arm","5"],["larm","L. Arm","6"],["rleg","R. Leg","7–8"],["lleg","L. Leg","9–0"]];
const LOC_KEYS=LOCS.map(l=>l[0]);
const WOUND_LEVELS=["Light","Serious","Critical","Mortal 0","Mortal 1","Mortal 2","Mortal 3","Mortal 4","Mortal 5","Mortal 6"];
const DVS=[["",""],[10,"Easy 10"],[15,"Average 15"],[20,"Difficult 20"],[25,"Very Difficult 25"],[30,"Nearly Impossible 30"]];
const RANGE_DVS=[[10,"Point blank"],[15,"Close"],[20,"Medium"],[25,"Long"],[30,"Extreme"]];
const COLORS=["#c8102e","#2346d1","#18744a","#a76200","#6c2bd9","#0e7c86","#b3127a","#3d4352"];
const POOLS=[[50,"Average"],[60,"Minor supporting"],[70,"Major supporting"],[75,"Minor hero"],[80,"Major hero"]];

const WTYPE_SKILL={P:"Handgun",SMG:"Submachinegun",RIF:"Rifle",SHT:"Rifle",HVY:"Heavy Weapons",MEL:"Melee"};
// name,type,WA,conceal,avail,damage,shots,ROF,rel,range,cost
const WEAPONS=[
 ["BudgetArms C-13","P",-1,"P","E","1D6","8","2","ST","50m",75],
 ["Dai Lung Cybermag 15","P",-1,"P","C","1D6+1","10","2","UR","50m",50],
 ["Federated Arms X-22","P",0,"P","E","1D6+1","10","2","ST","50m",150],
 ["Militech Arms Avenger","P",0,"J","E","2D6+1","10","2","VR","50m",250],
 ["Dai Lung Streetmaster","P",0,"J","E","2D6+3","12","2","UR","50m",250],
 ["Federated Arms X-9mm","P",0,"J","E","2D6+1","12","2","ST","50m",300],
 ["BudgetArms Auto 3","P",-1,"J","E","3D6","8","2","UR","50m",350],
 ["Sternmeyer Type 35","P",0,"J","C","3D6","8","2","VR","50m",400],
 ["Armalite 44","P",0,"J","E","4D6+1","8","2","ST","50m",450],
 ["Colt AMT Model 2000","P",1,"J","C","4D6+1","8","2","VR","50m",500],
 ["Uzi Miniauto 9","SMG",1,"J","E","2D6+1","30","35","VR","150m",475],
 ["H&K MP-2013","SMG",1,"J","C","2D6+3","35","32","ST","150m",450],
 ["Fed. Arms Tech Assault II","SMG",1,"L","C","1D6+1","50","25","ST","150m",400],
 ["Arasaka Minami 10","SMG",0,"J","E","2D6+3","40","20","VR","200m",500],
 ["H&K MPK-9","SMG",1,"J","C","2D6+1","35","25","ST","200m",520],
 ["Sternmeyer SMG 21","SMG",-1,"L","E","3D6","30","15","VR","200m",500],
 ["H&K MPK-11","SMG",0,"J","C","4D6+1","30","20","ST","200m",700],
 ["Ingram MAC 14","SMG",-2,"L","E","4D6+1","20","10","ST","200m",650],
 ["Militech Ronin Light Assault","RIF",1,"N","C","5D6","35","30","VR","400m",450],
 ["AKR-20 Medium Assault","RIF",0,"N","C","5D6","30","30","ST","400m",500],
 ["FN-RAL Heavy Assault","RIF",-1,"N","C","6D6+2","30","30","VR","400m",600],
 ["Kalashnikov A-80","RIF",-1,"N","E","6D6+2","35","25","ST","400m",550],
 ["Arasaka Rapid Assault 12","SHT",-1,"N","C","4D6","20","10","ST","50m",900],
 ["Sternmeyer Stakeout 10","SHT",-2,"N","R","4D6","10","2","ST","50m",450],
 ["Barrett-Arasaka Light 20mm","HVY",0,"N","R","4D10","10","1","VR","450m",2000],
 ["Militech Arms RPG-A","HVY",-2,"N","R","6D10","1","1","VR","750m",7500],
 ["Scorpion 16 Missile Launcher","HVY",-1,"N","R","7D10","1","1","VR","1000m",3000],
 ["Kenshiri Adachi F-253 Flamethrower","HVY",-2,"N","R","2D10","10","1","ST","50m",7500],
 ["Grenade launcher","HVY",0,"L","R","Grenade","","1","ST","225m",150],
 ["Grenade (fragmentation)","HVY",0,"P","P","7D6","1","1","VR","Thrown",30],
 ["Grenade (incendiary)","HVY",0,"P","P","4D6","1","1","VR","Thrown",30],
 ["Grenade (stun)","HVY",0,"P","P","—","1","1","VR","Thrown",30],
 ["Grenade (dazzle)","HVY",0,"P","P","—","1","1","VR","Thrown",30],
 ["Grenade (sonic)","HVY",0,"P","P","—","1","1","VR","Thrown",30],
 ["Grenade (gas)","HVY",0,"P","P","Gas","1","1","VR","Thrown",30],
 ["C-6 plastic explosive (1kg)","HVY",0,"P","P","8D10","1","1","VR","Placed",100],
 ["Mine","HVY",0,"J","P","4D10","1","1","VR","Placed",350],
 ["Molotov cocktail","HVY",0,"J","E","2D10","1","1","VR","Thrown",0],
 ["Knife","MEL",0,"P","C","1D6","","1","VR","1m",30],
 ["Club / bat","MEL",0,"L","C","1D6","","1","VR","1m",10],
 ["Nunchaku","MEL",0,"L","C","3D6","","1","VR","1m",15],
 ["Axe","MEL",-1,"N","C","2D6+3","","1","VR","1m",20],
 ["Sword","MEL",0,"N","C","2D6+2","","1","VR","1m",200],
 ["Monoknife","MEL",1,"P","P","2D6","","1","VR","1m",200],
 ["Monokatana","MEL",1,"N","R","4D6","","1","VR","1m",600],
 ["Chainsaw","MEL",-3,"N","C","4D6","","1","ST","1m",80],
];
// name, SP, locs, EV, cost
const ARMOR=[
 ["Heavy leather jacket",4,["torso","rarm","larm"],0,50],
 ["Kevlar T-shirt / vest",10,["torso"],0,90],
 ["Steel helmet",14,["head"],0,20],
 ["Nylon helmet",20,["head"],0,100],
 ["Light armor jacket",14,["torso","rarm","larm"],0,150],
 ["Medium armor jacket",18,["torso","rarm","larm"],1,200],
 ["Flak vest",20,["torso"],1,200],
 ["Flak pants",20,["rleg","lleg"],1,200],
 ["Heavy armor jacket",20,["torso","rarm","larm"],2,250],
 ["Door gunner's vest",25,["torso"],3,250],
 ["MetalGear suit",25,LOC_KEYS,2,600],
];
// name, category, cost, HC dice, extra
const CYBER=[
 ["Light tattoo","Fashionware",40,"1",{}],["Shift-tacts","Fashionware",400,"1",{}],["Skinwatch","Fashionware",100,"1",{}],["Techhair","Fashionware",200,"1",{}],["Biomonitor","Fashionware",700,"2",{}],
 ["Neural processor","Neuralware",1000,"1D6",{}],["Interface plugs","Neuralware",200,"1D6",{}],["Kerenzikov boost +1","Neuralware",500,"1D6",{init:1}],["Kerenzikov boost +2","Neuralware",1000,"1D6",{init:2}],["Sandevistan speedware +3","Neuralware",1600,"1D6",{init:3}],["Pain editor","Neuralware",200,"2D6",{}],["Tactile boost","Neuralware",100,"1D6/2",{}],["Olfactory boost","Neuralware",200,"1D6/2",{}],["Chipware socket","Neuralware",200,"1D6/2",{}],["Cybermodem link","Neuralware",100,"1",{}],["Vehicle link","Neuralware",100,"1D6/2",{}],["Smartgun link","Neuralware",100,"1D6/2",{smart:1}],
 ["Cyberoptic (one eye)","Cyberoptics",500,"1D6",{}],["Low-lite","Cyberoptics",200,"1",{}],["Infrared","Cyberoptics",500,"1D6/2",{}],["Targeting scope","Cyberoptics",300,"1D6/2",{}],["Times Square marquee","Cyberoptics",300,"1",{}],["Anti-dazzle","Cyberoptics",200,"1",{}],["Teleoptics","Cyberoptics",150,"1",{}],["Image enhancement","Cyberoptics",300,"1D6/2",{}],
 ["Cyberaudio suite","Cyberaudio",500,"1D6",{}],["Radio link","Cyberaudio",100,"1",{}],["Phone splice","Cyberaudio",300,"1",{}],["Amplified hearing","Cyberaudio",200,"1",{}],["Level damper","Cyberaudio",200,"1",{}],["Voice stress analyzer","Cyberaudio",200,"1D6/2",{}],
 ["Nasal filters","Implants",200,"1",{}],["Toxin binders","Implants",200,"1",{}],["Enhanced antibodies","Implants",300,"1",{}],["Contraceptive implant","Implants",100,"0",{}],["Grafted muscle (+1 BODY)","Implants",1000,"2D6",{mods:{BODY:1}}],["Muscle & bone lace (+2 BODY)","Implants",1500,"2D6",{mods:{BODY:2}}],["Skinweave (SP 12)","Implants",2000,"2D6",{armor:{sp:12,locs:LOC_KEYS}}],["Subdermal armor (SP 18 torso)","Implants",1200,"2D6",{armor:{sp:18,locs:["torso"]}}],
 ["Big knucks (1D6+2)","Cyberweapons",100,"1D6/2",{}],["Scratchers (1D6/2)","Cyberweapons",100,"1",{}],["Rippers (1D6+3)","Cyberweapons",400,"1D6",{}],["Wolvers (3D6)","Cyberweapons",600,"2D6",{}],["Slice-n-dice (2D6)","Cyberweapons",700,"2D6",{}],["Fangs (1D6/2)","Cyberweapons",200,"1D6/2",{}],
 ["Cyberhand","Cyberlimbs",1500,"1D6",{}],["Cyberleg","Cyberlimbs",2000,"2D6",{}],["Cyberarm","Cyberlimbs",3000,"2D6",{}],["Hydraulic rams","Cyberlimbs",500,"1D6/2",{}],["Pop-up gun in limb","Cyberlimbs",400,"1D6/2",{}],
];
const GEAR=[
 ["Pocket computer",100],["Cellular phone",400],["Pocket TV",200],["Flashlight",2],["Binoglasses",200],["Techtool kit",100],["Electronics tool kit",100],["Medkit",50],["Trauma kit",100],
 ["Cyberdeck (Zetatech Paraline)",1000],["Interface cables (pair)",20],["Lockpick set",20],["Gas mask",20],["Handcuffs",20],["Rope, 50m",20],["Handgun ammo, box of 50",15],["Rifle ammo, box of 50",40],["Shotgun shells, box of 12",15],["Smartgoggles",200],["Jumpsuit",50],["Leathers",100],
];

/* lifepath tables (paraphrased) */
const LP={
 clothes:["Biker leathers","Blue jeans","Corporate suits","Jumpsuits","Miniskirts","High fashion","Cammos","Normal clothes","Nude","Bag-lady chic"],
 hair:["Mohawk","Long and ratty","Short and spiked","Wild, all over the place","Bald","Striped","Tinted","Neat and short","Short and curly","Long and straight"],
 affect:["Tattoos","Mirrorshades","Ritual scars","Spiked gloves","Nose rings","Earrings","Long fingernails","Spike-heeled boots","Weird contact lenses","Fingerless gloves"],
 ethnic:[["Anglo-American",["English"]],["African",["Bantu","Fante","Kongo","Ashanti","Zulu","Swahili"]],["Japanese / Korean",["Japanese","Korean"]],["Central European / Soviet",["Bulgarian","Russian","Czech","Polish","Ukrainian","Slovak"]],["Pacific Islander",["Micronesian","Tagalog","Polynesian","Malay","Indonesian","Hawaiian"]],["Chinese / Southeast Asian",["Burmese","Cantonese","Mandarin","Thai","Tibetan","Vietnamese"]],["Black American",["English","Blackspeak"]],["Hispanic American",["Spanish","English"]],["Central / South American",["Spanish","Portuguese"]],["European",["English","French","German","Italian","Spanish"]]],
 ranking:["Corporate executive","Corporate manager","Corporate technician","Nomad pack","Ocean pirate fleet","Gang family","Crime lord","Combat zone poor","Urban homeless","Arcology family"],
 parentFate:["Died in warfare","Died in an accident","Were murdered","Have amnesia and don't remember you","You never knew them","Are in hiding to protect you","Left you with relatives for safekeeping","You grew up on the street and never had any","Gave you up for adoption","Sold you for money"],
 tragedy:["Lost everything through betrayal","Lost everything through bad management","Exiled or driven out of their home","Imprisoned; you alone escaped","Vanished; you're the only one left","Murdered or killed; you were the only survivor","Caught up in a long-term conspiracy or organization","Scattered to the winds by misfortune","Locked in a hereditary feud lasting generations","You inherited a family debt that must be paid"],
 childhood:["On the street, with no adult supervision","In safe corporate suburbia","In a nomad pack, moving town to town","In a decaying, once-upscale neighborhood","In a defended corporate zone downtown","In the heart of the Combat Zone","In a small village or town far from the city","In a large arcology city","In an aquatic pirate pack","On a corporate-controlled farm or research facility"],
 sibFeel:["Dislikes you","Dislikes you","Likes you","Likes you","Neutral","Neutral","Hero-worships you","Hero-worships you","Hates you","Hates you"],
 trait:["Shy and secretive","Rebellious, antisocial, violent","Arrogant, proud and aloof","Moody, rash and headstrong","Picky, fussy and nervous","Stable and serious","Silly and fluff-headed","Sneaky and deceptive","Intellectual and detached","Friendly and outgoing"],
 person:["A parent","A brother or sister","A lover","A friend","Yourself","A pet","A teacher or mentor","A public figure","A personal hero","No one"],
 value:["Money","Honor","Your word","Honesty","Knowledge","Vengeance","Love","Power","Having a good time","Friendship"],
 people:["Neutral about them","You like almost everyone","You hate almost everyone","People are tools to use","Every person is a valuable individual","People are obstacles in your way","People can't be trusted","Wipe them all out","People are wonderful","Each one has to earn it"],
 possession:["A weapon","A tool","A piece of clothing","A photograph","A book or diary","A recording","A musical instrument","A piece of jewelry","A toy","A letter"],
 problems:[()=>`Financial loss or debt: lost ${d(10)*100}eb. Can't pay? Debt collectors are coming.`,()=>`Imprisonment: jailed or held hostage for ${d(10)} months.`,()=>"Illness or addiction: picked up a disease or drug habit (GM may reduce REF by 1).",()=>"Betrayal: blackmailed, a secret exposed, or sold out by someone close.",()=>`Accident: badly hurt and hospitalized for ${d(10)} months.`,()=>pick(["A lover, friend or relative died in an accident","A lover, friend or relative was murdered by unknown parties","A lover, friend or relative was murdered, and you know who did it"])+".",()=>"False accusation: framed for "+pick(["theft","cowardice","murder","treason","fraud"])+".",()=>"Hunted by the law for a crime you may not have committed.",()=>"A corporation is after you for something you did or saw.",()=>"Mental or physical breakdown: months lost to stress, trauma or injury."],
 wins:[()=>"Made a connection in local city government.",()=>`Financial windfall: gained ${d(10)*100}eb.`,()=>`Big score on a job or deal: gained ${d(10)*100}eb.`,()=>"Found a sensei: +2 to a Martial Art or Brawling.",()=>"Found a teacher: +2 to one INT-based skill.",()=>"A powerful corporate exec owes you a favor.",()=>"A local nomad pack befriended you.",()=>"Made a friend on the police force.",()=>"A local boostergang likes you.",()=>"Found a combat teacher: +1 to a weapon skill."],
 friend:["Like a big brother or sister to you","Like a kid sister or brother to you","A teacher or mentor","A partner or coworker","A former lover","A former enemy","Like a foster parent","A relative","Someone from your childhood you reconnected with","Met through a shared interest"],
 enemyWho:["An ex-friend","An ex-lover","A relative","A childhood enemy","Someone working for you","Someone you work for","A partner or coworker","A boostergang member","A corporate executive","A government official"],
 enemyWhy:["one caused the other to lose face or status","one caused the loss of a lover, friend or relative","one publicly humiliated the other","one accused the other of cowardice or a flaw","one caused the other a physical injury","one deserted or betrayed the other","one turned down the other's job or romance","you just didn't like each other","you were romantic rivals","one foiled the other's plans"],
 enemyAct:["goes into a murderous rage on sight","avoids you","works against you from the shadows"],
 enemyRes:["just themselves","themselves and a few friends","an entire gang","a small corporation","a large corporation","a city agency"],
 tragic:["your lover died in an accident","your lover vanished without a trace","it just didn't work out","a personal goal or vendetta came between you","your lover was kidnapped","your lover lost their mind","your lover took their own life","your lover was killed in a fight","a rival cut you out","your lover was imprisoned or exiled"],
 trouble:["their friends or family hate you","their family will do anything to break you up","your friends or family hate them","one of you has a romantic rival","you're separated by circumstance","you fight constantly","you're professional rivals","one of you is insanely jealous","one of you is cheating","your backgrounds clash badly"],
 feelings:["they still love you","you still love them","you still love each other","you hate them","they hate you","you hate each other","you're friends now","no feelings either way","you like them, they hate you","they like you, you hate them"],
};

const fmtEb=n=>(Number(n)||0).toLocaleString("en-US")+"eb";

/* ============================== RULES ============================== */
function blankChar(){
  return {id:uid(),owner:null,created:false,wizStep:0,createdAt:Date.now(),updatedAt:Date.now(),
    name:"",handle:"",role:"Solo",age:18,gender:"",color:COLORS[d(COLORS.length)-1],concept:"",
    statMethod:"cinematic",statPool:60,stats:{INT:2,REF:2,TECH:2,COOL:2,ATTR:2,LUCK:2,MA:2,BODY:2,EMP:2},
    skills:{},roleChoices:{},customSkills:[],
    ip:{total:0,spent:0},ipLog:[],rep:0,eb:0,luckSpent:0,wounds:0,
    armor:[],weapons:[],cyber:[],gear:[],contacts:[],notes:"",humanityAdj:0,deck:null,programs:[],
    lifepath:{style:{},family:{siblings:[]},motive:{},events:[]},
    lifestyle:{housing:"",rent:0,food:0,other:0}};
}
function careerList(c){
  const r=roleOf(c); if(!r) return [];
  const out=[r.ab];
  r.skills.forEach((s,i)=>{ if(typeof s==="string") out.push(s); else out.push(c.roleChoices?.[i]||null); });
  return out;
}
function skillDef(c,name){
  if(SKILL_BY_NAME[name]) return SKILL_BY_NAME[name];
  if(ABILITIES[name]) return ABILITIES[name];
  const hb=c&&c.homebrew;
  if(hb){if(hb.skills&&hb.skills[name]){const s=hb.skills[name];return {n:name,s:s.stat,m:s.mult||1,homebrew:true}}
    for(const r of Object.values(hb.roles||{}))if(r.ability&&r.ability.name===name)return {n:name,s:r.ability.stat,m:1,special:true}}
  const cs=(c.customSkills||[]).find(s=>s.n===name); if(cs) return {n:cs.n,s:cs.s,m:cs.m||1,custom:true};
  return {n:name,s:"INT",m:1};
}
function sk(c,name){return c.skills?.[name]||{c:0,p:0,b:0}}
function skillLevel(c,name){const s=sk(c,name);return (s.c||0)+(s.p||0)+(s.b||0)}
function careerUsed(c){return careerList(c).filter(Boolean).reduce((a,n)=>a+(sk(c,n).c||0),0)}
function pickupPool(c){return (c.stats.REF||0)+(c.stats.INT||0)}
function pickupUsed(c){return Object.values(c.skills||{}).reduce((a,s)=>a+(s.p||0),0)}
function statSum(c){return STAT_KEYS.reduce((a,k)=>a+(c.stats[k]||0),0)}
function ipCost(c,name){const lv=skillLevel(c,name);return Math.max(1,lv)*10*(skillDef(c,name).m||1)}
function btmFor(body){return body<=2?0:body<=4?-1:body<=7?-2:body<=9?-3:body===10?-4:-5}
function meleeBonus(body){return body<=2?-2:body<=4?-1:body<=7?0:body<=9?1:body===10?2:body<=12?4:6}
function propBonus(diff){return diff<=4?5:diff<=8?4:diff<=14?3:diff<=20?2:diff<=26?1:0}
function layersAt(c,loc){
  const out=[];
  (c.armor||[]).forEach(a=>{ if(a.worn&&a.locs?.includes(loc)) out.push({name:a.name,sp:Math.max(0,(Number(a.sp)||0)-(a.dmg?.[loc]||0)),id:a.id}); });
  (c.cyber||[]).forEach(cy=>{ if(cy.armor?.locs?.includes(loc)) out.push({name:cy.name,sp:Number(cy.armor.sp)||0,cyber:true}); });
  return out;
}
function spAt(c,loc){
  const ls=layersAt(c,loc).map(l=>l.sp).filter(x=>x>0).sort((a,b)=>b-a);
  if(!ls.length) return 0;
  let sp=ls[0]; for(let i=1;i<ls.length;i++) sp+=propBonus(sp-ls[i]);
  return sp;
}
function calc(c){
  const base={...c.stats};
  const mods={};(c.cyber||[]).forEach(cy=>{for(const [k,v] of Object.entries(cy.mods||{}))mods[k]=(mods[k]||0)+Number(v||0)});
  const ev=(c.armor||[]).filter(a=>a.worn).reduce((a,x)=>a+(Number(x.ev)||0),0);
  const hcLoss=(c.cyber||[]).reduce((a,x)=>a+(Number(x.hcLoss)||0),0);
  const humMax=(base.EMP||0)*10;
  const humanity=humMax-hcLoss+(Number(c.humanityAdj)||0);
  const w=clamp(Number(c.wounds)||0,0,40);
  const level=Math.ceil(w/4); // 0 none, 1 light ... 10 mortal6
  const eff={};
  STAT_KEYS.forEach(k=>eff[k]=(base[k]||0)+(mods[k]||0));
  eff.EMP=Math.max(0,Math.min(eff.EMP,Math.ceil(humanity/10)));
  eff.REF=Math.max(0,eff.REF-ev);
  eff.LUCK=Math.max(0,eff.LUCK-(Number(c.luckSpent)||0));
  if(level===2) eff.REF=Math.max(0,eff.REF-2);
  if(level===3){["REF","INT","COOL"].forEach(k=>eff[k]=Math.ceil(eff[k]/2))}
  if(level>=4){["REF","INT","COOL"].forEach(k=>eff[k]=Math.ceil(eff[k]/3))}
  const body=eff.BODY;
  const init=(c.cyber||[]).reduce((a,x)=>a+(Number(x.init)||0),0);
  return {base,eff,mods,ev,hcLoss,humMax,humanity,level,w,
    btm:btmFor(body),save:body,run:eff.MA*3,leap:Math.floor(eff.MA*3/4),lift:body*40,carry:body*10,
    stunSave:level?body-(level-1):body,deathSave:level>=4?body-(level-4):null,
    init,smart:(c.cyber||[]).some(x=>x.smart),melee:meleeBonus(body)};
}
function woundLabel(level){return level?WOUND_LEVELS[level-1]:"Uninjured"}
function woundChipClass(level){return level===0?"green":level<=1?"ink":level<=2?"amber":"red"}

/* ============================== SAMPLE ============================== */
const SAMPLE=(()=>{const c=blankChar();Object.assign(c,{id:"sample",owner:"sample",created:true,name:"Teresa Vance",handle:"Razor",role:"Solo",age:24,gender:"Female",color:"#c8102e",concept:"Ex-Arasaka bodyguard working the Combat Zone for cash and payback.",
 stats:{INT:6,REF:9,TECH:5,COOL:8,ATTR:5,LUCK:6,MA:7,BODY:8,EMP:6},statPool:60,
 skills:{"Combat Sense":{c:6,p:0,b:0},"Awareness/Notice":{c:5,p:0,b:0},"Handgun":{c:6,p:0,b:0},"Brawling":{c:3,p:0,b:0},"Melee":{c:3,p:0,b:0},"Weaponsmith":{c:2,p:0,b:0},"Rifle":{c:5,p:0,b:0},"Athletics":{c:4,p:0,b:0},"Submachinegun":{c:3,p:0,b:0},"Stealth":{c:3,p:0,b:0},"Driving":{c:0,p:3,b:0},"Streetwise":{c:0,p:4,b:0},"Intimidate":{c:0,p:3,b:0},"Dodge & Escape":{c:0,p:3,b:0},"First Aid":{c:0,p:2,b:0}},
 roleChoices:{2:"Brawling"},ip:{total:24,spent:0},rep:3,eb:1450,wounds:3,
 weapons:[mkWeapon(WEAPONS[3]),mkWeapon(WEAPONS[16]),mkWeapon(WEAPONS[26])],
 armor:[mkArmor(ARMOR[4]),mkArmor(ARMOR[3])],
 cyber:[cy("Neural processor",4),cy("Kerenzikov boost +2",3),cy("Smartgun link",2),cy("Cyberoptic (one eye)",4),cy("Targeting scope",2),cy("Low-lite",1),cy("Subdermal armor (SP 18 torso)",7)],
 gear:[{id:uid(),name:"Handgun ammo, box of 50",qty:2,cost:15,notes:""},{id:uid(),name:"Cellular phone",qty:1,cost:400,notes:""},{id:uid(),name:"Medkit",qty:1,cost:50,notes:""}],
 contacts:[{id:uid(),name:"Doc Ruiz",role:"Ripperdoc, Little China",notes:"Owes her for a clean extraction."},{id:uid(),name:"Kaito Mori",role:"Arasaka security chief",notes:"Ex-boss. Wants her dead."}],
 notes:"Keeps the Avenger cleaned and loaded at all times. Doesn't talk about Tokyo.",
 lifepath:{style:{clothes:"Corporate suits",hair:"Short and spiked",affect:"Mirrorshades"},ethnic:"Japanese / Korean",language:"Japanese",
  family:{ranking:"Corporate technician",parents:"Both parents are living",status:"Family status is OK",childhood:"In a defended corporate zone downtown",siblings:[{gender:"Brother",age:"Younger",feel:"Hero-worships you"}]},
  motive:{trait:"Stable and serious",person:"A brother or sister",value:"Your word",people:"People can't be trusted",possession:"A weapon"},
  events:[{age:17,kind:"Nothing",text:"Nothing happened that year."},{age:18,kind:"Big win",text:"Found a combat teacher: +1 to a weapon skill."},{age:19,kind:"Friend",text:"A teacher or mentor (Doc Ruiz)."},{age:20,kind:"Romance",text:"Fast affairs and hot dates."},{age:21,kind:"Enemy",text:"Someone you work for. One deserted or betrayed the other. They work against you from the shadows, backed by a large corporation."},{age:22,kind:"Big problem",text:"A corporation is after you for something you did or saw."},{age:23,kind:"Nothing",text:"Nothing happened that year."},{age:24,kind:"Big win",text:"Financial windfall: gained 600eb."}]},
 lifestyle:{housing:"Cube hotel, Combat Zone edge",rent:300,food:300,other:100}});
 function cy(n,loss){const r=CYBER.find(x=>x[0]===n);return mkCyber(r,loss)}
 return c;})();
function mkWeapon(r){return {id:uid(),name:r[0],type:r[1],wa:r[2],conc:r[3],avail:r[4],dmg:r[5],shots:r[6],ammo:Number(r[6])||0,rof:r[7],rel:r[8],range:r[9],cost:r[10],skill:r[11]||WTYPE_SKILL[r[1]]}}
function mkArmor(r){return {id:uid(),name:r[0],sp:r[1],locs:[...r[2]],ev:r[3],cost:r[4],worn:true,dmg:{}}}
function mkCyber(r,loss){const x=r[4]||{};return {id:uid(),name:r[0],cat:r[1],cost:r[2],hc:r[3],hcLoss:loss,notes:"",...clone(x)}}

/* ============================== LIFEPATH ============================== */
function rollStyle(lp){lp.style={clothes:pick(LP.clothes),hair:pick(LP.hair),affect:pick(LP.affect)};const e=pick(LP.ethnic);lp.ethnic=e[0];lp.language=pick(e[1])}
function rollFamily(lp){
  const f={};f.ranking=pick(LP.ranking);
  f.parents=d(10)<=6?"Both parents are living":"Something happened to them: "+pick(LP.parentFate).toLowerCase()+".";
  f.status=d(10)<=6?"Family in danger: "+pick(LP.tragedy).toLowerCase()+".":"Family status is OK";
  f.childhood=pick(LP.childhood);
  const n=d(10);f.siblings=[];if(n<=7)for(let i=0;i<n;i++){const a=d(10);f.siblings.push({gender:d(2)===1?"Brother":"Sister",age:a<=5?"Older":a<=9?"Younger":"Twin",feel:pick(LP.sibFeel)})}
  lp.family=f;
}
function rollMotive(lp){lp.motive={trait:pick(LP.trait),person:pick(LP.person),value:pick(LP.value),people:pick(LP.people),possession:pick(LP.possession)}}
function lifeEvent(age){
  const r=d(10);
  if(r<=3){ if(d(2)===1) return {age,kind:"Big problem",text:pick(LP.problems)()}; return {age,kind:"Big win",text:pick(LP.wins)()}; }
  if(r<=6){ if(d(2)===1) return {age,kind:"Friend",text:pick(LP.friend)+"."};
    const who=pick(LP.enemyWho),why=pick(LP.enemyWhy),act=pick(LP.enemyAct),res=pick(LP.enemyRes);
    return {age,kind:"Enemy",text:`${who}: ${why}. They ${act}, backed by ${res}.`}; }
  if(r<=8){ const t=d(10);
    if(t<=4) return {age,kind:"Romance",text:"A happy love affair."};
    if(t===5) return {age,kind:"Romance",text:`A tragic love affair: ${pick(LP.tragic)}. Now ${pick(LP.feelings)}.`};
    if(t<=7) return {age,kind:"Romance",text:`A love affair with problems: ${pick(LP.trouble)}. Now ${pick(LP.feelings)}.`};
    return {age,kind:"Romance",text:"Fast affairs and hot dates."}; }
  return {age,kind:"Nothing",text:"Nothing happened that year."};
}
function rollEvents(lp,age){lp.events=[];for(let a=17;a<=Math.max(17,age);a++)lp.events.push(lifeEvent(a))}
function rollLifepath(c){const lp=c.lifepath||(c.lifepath={});rollStyle(lp);rollFamily(lp);rollMotive(lp);rollEvents(lp,c.age||18)}
const EV_CHIP={"Big problem":"red","Big win":"green","Friend":"blue","Enemy":"red","Romance":"amber","Nothing":"ink"};

/* ============================== COMBAT MATH ============================== */
function rollLocation(){const r=d(10);return {r,loc:r===1?"head":r<=4?"torso":r===5?"rarm":r===6?"larm":r<=8?"rleg":"lleg"}}
function locName(l){return (LOCS.find(x=>x[0]===l)||[,l])[1]}
function computeHit({amount,loc,sp,ap,btm,mono,hard,cover}){
  const name=locName(loc);let s=hitSP(sp,{ap,mono,hard,cover});let pen=amount-s;const what=[cover?`cover SP ${cover}`:"",mono?"mono-edge":"",ap&&!mono?"AP":""].filter(Boolean).join(", ");
  if(pen<=0) return {final:0,text:`${amount} damage vs SP ${s}${what?` (${what})`:""} at the ${name}: stopped. No wounds.`};
  const steps=[`${amount} − SP ${s}${what?` (${what})`:""} = ${pen}`];
  if(ap&&!mono){pen=Math.max(1,Math.floor(pen/2));steps.push(`AP halves → ${pen}`)}
  if(loc==="head"){pen*=2;steps.push(`head ×2 → ${pen}`)}
  const fin=Math.max(1,pen+btm);steps.push(`BTM ${btm} → ${fin}`);
  let note="";if(fin>8&&loc!=="torso")note=loc==="head"?" Over 8 to the head: instant death unless the GM rules otherwise.":" Over 8 to a limb: severed or crushed. Death save at Mortal 0.";
  return {final:fin,text:`${name}: ${steps.join(" · ")}. Takes ${fin} damage.${note}`};
}
function woundEffects(eff,level){
  if(level===2) eff.REF=Math.max(0,eff.REF-2);
  if(level===3) ["REF","INT","COOL"].forEach(k=>eff[k]=Math.ceil(eff[k]/2));
  if(level>=4) ["REF","INT","COOL"].forEach(k=>eff[k]=Math.ceil(eff[k]/3));
  return eff;
}
function woundTrackHTML(w,save,opts={}){
  return `<div class="wounds">${WOUND_LEVELS.map((lab,g)=>`<div class="wg ${g>=3?"mortal":""}"><span class="wl">${lab}</span><div class="bx">${[1,2,3,4].map(j=>{const n=g*4+j;return `<button class="${n<=w?"f":""}" ${opts.act?`data-act="${opts.act}" data-n="${n}" ${opts.extra||""}`:""} ${opts.disabled?"disabled":""} aria-label="${n} damage"></button>`}).join("")}</div><span class="ss num">Stun ${save-g}</span></div>`).join("")}</div>`;
}


/* ============================== FRIDAY NIGHT FIREFIGHT (1.1.1) ==============================
   From the rulebook's combat chapter (pg. 96–114) and the fumble table (pg. 42). */
// Attack modifiers (pg. 99): [id, label, value, group, note]
const ATK_SITUATIONS=[
 ["immobile","Target immobile",4,"Target"],["moving10","Target moving, REF over 10",-3,"Target","Only one moving penalty counts"],["moving12","Target moving, REF over 12",-4,"Target"],["moving14","Target moving, REF over 14",-5,"Target"],
 ["dodging","Target dodging",-2,"Target","Melee only"],["silhouette","Target silhouetted",2,"Target"],["large","Large target",4,"Target"],["small","Small target",-4,"Target"],["tiny","Tiny target",-6,"Target"],
 ["fastdraw","Fast draw / snapshot",-3,"You","+3 to your initiative; no scopes, sights or aiming"],["ambush","Ambush",5,"You","One attack, on a target who doesn't know you're there"],["twoweapons","Using two weapons",-3,"You","On both weapons"],
 ["running","Firing while running",-3,"You"],["hip","Firing a shoulder arm from the hip",-2,"You"],["turning","Turning to face the target",-2,"You"],["blinded","Blinded by light or dust",-3,"You"],["ricochet","Ricochet or indirect fire",-5,"You"],
 ["turret","Turret-mounted weapon",2,"Weapon"],["vehicle","Vehicle-mounted, no turret",-4,"Weapon"],["laser","Laser sight",1,"Weapon"],["telescopic","Telescopic sight",0,"Weapon","+2 at long or extreme range, +1 at medium"],["scope","Targeting scope",1,"Weapon"],["goggles","Smartgoggles",2,"Weapon","With a smartgun"]];
const MOVING_SITS=["moving10","moving12","moving14"];
// Common cover SPs (pg. 103)
const COVER=[["Sheetrock wall",5],["Wood door",5],["Concrete block wall",10],["Car body, door",10],["Heavy wood door",15],["Steel door",20],["Brick wall",25],["Data Term",25],["Mailbox",25],["Curb",25],["Stone wall",30],["Tree, phone pole",30],["Concrete utility pole",35],["Engine block",35],["Hydrant",35],["Armored car body",40],["AV-4 body",40]];
// Armor in the book's hard armor list (pg. 101); everything else is soft
const HARD_ARMOR=/metalgear|door gunner|steel helmet|flak|nylon helmet|riot|rpa heavy/i;
// The fumble table (pg. 42)
const FUMBLES={
 combat:{label:"Reflex (combat)",rows:[[4,"No fumble. You just screw up."],[5,"You drop your weapon."],[6,"The weapon discharges (non-automatic weapons: make a reliability roll) or strikes something harmless."],[7,"The weapon jams (non-automatic weapons: make a reliability roll) or imbeds itself in the ground for a turn."],[8,"You manage to wound yourself. Roll for location."],[10,"You manage to wound a member of your own party."]]},
 athletics:{label:"Reflex (athletics)",rows:[[4,"No fumble. You just mess up and make an idiot of yourself."],[7,"You fail miserably: take 1 point of damage (sprain, fall, stumble) and make a Stun save."],[10,"You fail abysmally: if it was a physical action, take 1D6 damage from a fall or strained muscles, and make a Stun save at −1."]]},
 tech:{label:"Tech (repair or create)",rows:[[4,"No fumble. You just can't get it together."],[7,"You make it worse: you drop your tools or damage the thing even more. Raise the Difficulty by 5 and try again."],[10,"You blew it: the device or creation is damaged beyond repair. Buy a new one."]]},
 emp:{label:"EMP (convince, fast talk, seduce)",rows:[[4,"No fumble. They just won't buy it."],[6,"They're left totally cold: −4 to your next EMP roll with them."],[10,"You blew it royally: now they're violently opposed to anything you want. Roll 1D10; on 1–4 they try to do you physical harm."]]},
 int:{label:"INT (figure out, notice, catch a clue)",rows:[[4,"No fumble. You just don't know how to do it, and carry on oblivious."],[7,"You don't know anything about what's going on or how to handle it. Make a Convince check at −2 to see if anyone notices how dumb you are."],[10,"You're completely oblivious, and everyone knows how ignorant you are."]]}};
const COMBAT_SKILLS=/^(handgun|submachinegun|rifle|heavy weapons|melee|brawling|fencing|archery|martial art|combat sense)/i;
function fumbleArea(label){const l=String(label||"");if(/^attack/i.test(l))return "combat";
  const m=/\((INT|REF|TECH|COOL|ATTR|LUCK|MA|BODY|EMP)\)/.exec(l);const name=l.replace(/\s*\(.*$/,"").replace(/ check$/,"").trim();
  let stat=m?m[1]:STAT_KEYS.includes(name)?name:(SKILL_BY_NAME[name]||ABILITIES[name]||{}).s;
  if(!stat&&/^martial art/i.test(name))stat="REF";
  if(stat==="REF")return COMBAT_SKILLS.test(name)?"combat":"athletics";
  return {TECH:"tech",EMP:"emp",INT:"int"}[stat]||null}
function fumbleRoll(area){const t=FUMBLES[area];if(!t)return null;const r=d(10);const row=t.rows.find(x=>r<=x[0]);return {r,area,label:t.label,text:row[1],bad:r>t.rows[0][0]}}
// Martial arts key attacks (pg. 100): style → [IP difficulty, {move: bonus}]
const MA_MOVES=["Strike","Kick","Block","Dodge","Throw","Hold","Escape","Choke","Sweep","Grapple"];
const MA_STYLES={"Karate":[2,{Strike:2,Kick:2,Block:2}],"Judo":[1,{Dodge:1,Throw:3,Hold:2,Escape:2,Sweep:2,Grapple:2}],"Boxing":[1,{Strike:3,Block:3,Dodge:1}],"Thai Boxing":[4,{Strike:3,Kick:3,Block:2,Grapple:1}],
 "Choi Li Fut":[3,{Strike:2,Kick:2,Block:2,Dodge:1,Throw:1,Sweep:2}],"Aikido":[3,{Block:4,Dodge:3,Throw:3,Hold:3,Escape:3,Choke:1,Sweep:3,Grapple:2}],"Animal Kung Fu":[3,{Strike:2,Kick:2,Block:2,Sweep:1}],
 "Tae Kwon Do":[4,{Strike:3,Kick:3,Block:2,Dodge:1,Sweep:2}],"Savate":[2,{Kick:4,Block:1,Dodge:1}],"Wrestling":[1,{Throw:3,Hold:4,Escape:4,Choke:2,Sweep:2,Grapple:4}],"Capoeira":[3,{Strike:1,Kick:2,Block:2,Dodge:2,Sweep:3}]};
function maStyleOf(name){const m=/^Martial Art:\s*(.+)$/i.exec(String(name||""));if(!m)return null;const k=Object.keys(MA_STYLES).find(s=>s.toLowerCase()===m[1].trim().toLowerCase()||(s==="Capoeira"&&/capeoira/i.test(m[1])));return k||null}
// Unarmed moves (pg. 112): damage, what it needs, what it does
const UNARMED_MOVES={
 Strike:{dmg:"1D6/2",dmgMod:true,text:"A punch or hand strike."},Kick:{dmg:"1D6",dmgMod:true,text:"A kick."},
 Throw:{dmg:"1D6",dmgMod:true,needs:"a Grapple first",text:"They're thrown to the ground and make a Stun save at −2."},
 Choke:{dmg:"1D6",needs:"a Hold or Grapple first",text:"1D6 damage every turn you keep it on."},
 Sweep:{text:"They're knocked down: −2 to their next attack, +2 to yours."},Grapple:{text:"You grab them. Next action you can Throw, Choke or Hold."},
 Hold:{needs:"a Grapple first",text:"A painful joint or body hold: they can't move until they Escape."},Escape:{text:"On a success you're free of a hold and can move."},
 Disarm:{text:"On a success you knock the weapon out of their hand."},Block:{text:"Block or parry: stop or absorb the damage."},Dodge:{text:"−2 to the attacker's roll this turn; −3 to your other actions."}};
// Area effects (pg. 99, 107–112)
const AREA_FX={
 "Grenade (fragmentation)":{kind:"grenade",area:5,text:"Fragmentation: 7D6 to everything in the blast."},
 "Grenade (incendiary)":{kind:"grenade",area:5,burn:3,text:"Incendiary: 4D6 to everything in the area, for 3 turns."},
 "Grenade (stun)":{kind:"grenade",area:5,nodmg:true,text:"Stun: everyone in the area makes a Stun save at −5."},
 "Grenade (dazzle)":{kind:"grenade",area:5,nodmg:true,text:"Dazzle: everyone in the area is blinded for 4 turns."},
 "Grenade (sonic)":{kind:"grenade",area:5,nodmg:true,text:"Sonic: everyone in the area is deafened for 4 turns."},
 "Grenade (gas)":{kind:"gas",area:3,nodmg:true,text:"Gas: everyone within 3m is affected now. Next turn the cloud drifts (roll scatter for the wind) and catches anyone in its path; on the third turn it's gone. Armor doesn't help; filters and gas masks do."},
 "Grenade launcher":{kind:"launcher",text:"Fires one of your grenades up to 225m."},
 "C-6 plastic explosive (1kg)":{kind:"explosive",area:5,perUnit:"kg",text:"C-6: 8D10, 5m of blast for every kg. Explosives hit the whole body, not a location."},
 "Mine":{kind:"mine",area:2,text:"Land mine: 4D10 to whatever sets it off. A claymore throws its blast in an hourglass: 6m wide and 75m long in front, 6m long behind, with a 6m circle at the middle."},
 "Militech Arms RPG-A":{kind:"rpg",area:4,text:"Rocket-propelled grenade: 6D10 in a 4m radius. The backblast means it can't be fired in a confined space."},
 "Scorpion 16 Missile Launcher":{kind:"missile",area:6,text:"Missile: 7D10 in a 6m radius. Against an armor-piercing warhead, armor counts at half SP but the damage isn't halved."},
 "Kenshiri Adachi F-253 Flamethrower":{kind:"flame",area:2,text:"Flame: 2D10 this turn, then 1D10 and 1D6 the next two turns. Hard armor protects normally; soft armor needs more than SP 15 to protect, and loses 2 SP per hit. You can sweep the flame between two points."},
 "Molotov cocktail":{kind:"molotov",area:2,perUnit:"liter",text:"Molotov: 2D10 to the whole body, 2m for every liter of fuel."}};
const GAS_TYPES=[["Teargas","Tearing: −2 REF"],["Nausea","Illness: −4 REF"],["Sleep","Sleep (half effect: drowsy, −2 to all stats)"],["Biotoxin I","Death: 4D6"],["Biotoxin II","Death: 8D6"],["Nerve gas","Death: 8D10"]];
// Grenade scatter (pg. 99): 1D10 for the direction from the target, 1D10 for meters
const SCATTER_DIR={1:"short (toward you), 2 squares",2:"short and left",3:"short",4:"short and right",5:"left",6:"right",7:"long and left",8:"long (past the target)",9:"long and right",10:"long (past the target), 2 squares"};
function scatterRoll(){const a=d(10),b=d(10);return {dir:a,m:b,text:`1D10 ${a}: lands ${SCATTER_DIR[a]}, 1D10 ${b}: ${b}m from the target`}}
// Shotgun patterns (pg. 109)
function shotgunAt(dv){return dv<=15?{w:1,dmg:"4D6",label:"Close or point blank"}:dv<=20?{w:2,dmg:"3D6",label:"Medium"}:{w:3,dmg:"2D6",label:"Long or extreme"}}
const isMono=w=>/mono|slice/i.test(String(w&&w.name||""));
/* SP against a hit: cover combines with armor by the proportional rule (pg. 102); AP halves it;
   mono-edges count soft armor at 1/3 and hard armor at 2/3 (pg. 113). */
function hitSP(sp,{ap,mono,hard,cover}={}){let s=Number(sp)||0;if(mono)s=Math.floor(s*(hard?2:1)/3);else if(ap)s=Math.floor(s/2);
  const cv=Number(cover)||0;if(cv){const hi=Math.max(s,cv),lo=Math.min(s,cv);s=lo?hi+propBonus(hi-lo):hi}return s}

/* ============================== CHARACTER FILES ============================== */
function normalizeChar(x){const b=blankChar();const c={...b,...clone(x)};
  ["skills","roleChoices","stats","lifestyle","lifepath","ip"].forEach(k=>{if(!c[k]||typeof c[k]!=="object")c[k]=b[k]});
  ["customSkills","ipLog","armor","weapons","cyber","gear","contacts","programs"].forEach(k=>{if(!Array.isArray(c[k]))c[k]=[]});
  if(!c.deck||typeof c.deck!=="object"||Array.isArray(c.deck))c.deck=null;
  STAT_KEYS.forEach(k=>{if(typeof c.stats[k]!=="number")c.stats[k]=Number(c.stats[k])||2});
  if(!c.id)c.id=uid();return c}


/* ============================== CP2020 DICE ==============================
   STAT + skill + 1D10. A 10 is rolled again and added; a 1 is a fumble (automatic failure).
   Verdicts travel with the roll as tags, so the table log shows them the same everywhere. */
function d10x(){const rolls=[d(10)];if(rolls[0]===10){let x;do{x=d(10);rolls.push(x)}while(x===10&&rolls.length<8)}return rolls}
function cpTags(e){const dv=Number(e&&e.dv)||0;const t=[];
  if(e&&e.fumble)t.push({t:"Fumble"+(dv?" · fails DV "+dv:""),c:"red"});
  else if(dv)t.push(e.total>=dv?{t:`Beats DV ${dv}`,c:"green"}:{t:`Misses DV ${dv}`,c:"red"});
  if(e&&e.crit)t.push({t:"Critical",c:"amber"});return t}
function rollVerdict(e){return rollTags({tags:e&&e.tags?e.tags:cpTags(e)})}
Dice.check=function(label,base,opts={}){const rolls=d10x();const sum=rolls.reduce((a,b)=>a+b,0);const fumble=rolls[0]===1;const crit=rolls[0]===10;
  base=Number(base)||0;const mod=Number(opts.mod)||0,luck=Math.max(0,Number(opts.luck)||0);
  const parts=[String(base)];if(mod)parts.push((mod>0?"+ ":"− ")+Math.abs(mod)+" mod");if(luck)parts.push("+ "+luck+" Luck");
  const e={who:opts.who||this.who(),label,detail:`${parts.join(" ")} + D10 (${rolls.join("+")})${fumble?" · FUMBLE":""}${crit?" · CRITICAL":""}`,total:base+mod+luck+sum,dv:opts.dv?Number(opts.dv):null,crit,fumble,t:Date.now()};
  if(fumble&&opts.area!=="none"){const fr=fumbleRoll(opts.area||fumbleArea(label));if(fr){e.fumbleRoll=fr;e.detail+=` · fumble table 1D10 ${fr.r}: ${fr.text}`}}
  e.tags=cpTags(e);if(e.fumbleRoll&&e.fumbleRoll.bad)e.tags.push({t:"Fumble table "+e.fumbleRoll.r,c:"red"});this.push(e);return e};
// the dice tray: CP2020 dice, and "d10x" / "d10!" for an exploding D10
Monolith.hooks.trayQuick=()=>[["1D10","1D10"],["1D6","1D6"],["2D6","2D6"],["3D6","3D6"],["4D6","4D6"],["D10 (exploding)","1D10x"]];
Monolith.hooks.trayRoll=v=>{if(/^1?d10\s*(x|!|e)$/i.test(String(v).trim())){Dice.check("D10",0);return true}return false};

