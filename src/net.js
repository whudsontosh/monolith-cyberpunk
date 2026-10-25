/* ============================== CYBERPUNK 2020: THE NET ==============================
   Netrunning rules and data from the Cyberpunk 2020 rulebook (2nd edition, "Netrunner",
   pg. 127–174). Page numbers in the comments are the book's own. Descriptions are short
   summaries in our words; the numbers are the book's.
   Used by both the player and GM screens. */

/* ---------- programs (pg. 137–141) ----------
   [name, class, Strength, MU, cost, effects, summary]
   effects: wall (dice off a data wall), open (turns to open a wall or gate), alert (always, or the
   lowest D10 roll that alerts), gate/lock (decrypts code gates / file locks), vsGate (Strength vs
   gates), detect, trace, cut, see, evade, vsDog, protect, only (attacks it stops), reduce (damage
   cut when it fails), prog (Strength damage dice), kills (de-rezzes this kind instantly), mobile,
   wound (damage dice), int (INT loss dice), status + dur, out (dumped out of the Net),
   crash (turns), sys (system effect), ctrl (remote kinds), carry (Demon subroutines) */
const PROG_CLASSES=["Intrusion","Decryption","Detection/Alarm","Anti-System","Evasion/Stealth","Protection","Anti-IC","Anti-Personnel","Controller","Utility","Demon"];
const PROGRAMS=[
 ["Hammer","Intrusion",4,1,400,{wall:"2D6",alert:"always"},"Pounds a data wall with raw power: every attack also takes 2D6 off the wall's Strength. Very noisy: it alerts every defence within 10 spaces."],
 ["Jackhammer","Intrusion",2,2,360,{wall:"1D6",alert:8},"A quieter Hammer: every attack takes 1D6 off the wall's Strength. Alerts the system on a D10 roll of 8–10."],
 ["Worm","Intrusion",2,5,660,{open:2,alert:9,worm:1},"Mimics the system's own code, slips behind a data wall or code gate and opens it from inside in 2 turns. Alerts only on a D10 roll of 9–10."],
 ["Codecracker","Decryption",3,2,380,{gate:1,lock:1},"Takes a code gate apart at the program level instead of guessing the key."],
 ["Wizard's Book","Decryption",4,2,400,{gate:1,lock:1,vsGate:6},"Tries billions of codes a second. Strength 6 against code gates, 4 against file locks."],
 ["Raffles","Decryption",5,3,560,{gate:1,lock:1},"Asks a code gate or file lock leading questions until it gives up its key word."],
 ["Watchdog","Detection/Alarm",4,5,610,{detect:1,dog:1},"Detects illegal entry and alerts its owner. Can be set to guard part of someone else's system."],
 ["Bloodhound","Detection/Alarm",3,5,700,{detect:1,trace:1,dog:1,follow:1},"Detects entry, traces the intruder to their real location and tells its masters."],
 ["Pit Bull","Detection/Alarm",2,6,780,{detect:1,trace:1,cut:1,dog:1,follow:1},"Detects and traces the intruder, then cuts their line, and keeps cutting it whenever they log on from there."],
 ["SeeYa","Detection/Alarm",3,1,280,{see:1},"Detects invisible ICONs within a subgrid: hidden programs, hidden runners, things hidden in a virtual reality."],
 ["Hidden Virtue","Detection/Alarm",3,1,280,{real:1},"Tells real ICONs from virtual ones, such as which book in a virtual library is really a data file."],
 ["Speedtrap","Detection/Alarm",4,4,600,{speedtrap:1},"Warns of any attack program within 10 spaces, but not where it is."],
 ["Flatline","Anti-System",3,2,570,{deck:"Interface chip burned out: the deck drops out of the Net until the chip is replaced",out:1,sys:"The CPU's interface is killed"},"Kills the interface chip of a deck or system. One hit and the deck needs a new chip."],
 ["Poison Flatline","Anti-System",2,2,540,{deck:"Deck wrecked: interface and memory destroyed",out:1,wreck:1,sys:"Erases one memory each turn until stopped"},"Destroys the interface and the memory. A deck hit by it needs replacing."],
 ["Krash","Anti-System",3,2,570,{crash:"1D6+1",sys:"The nearest CPU goes down"},"The target's CPU (the nearest one in a big system) stops for 1D6+1 turns. A krashed deck drops its runner out of the Net."],
 ["DecKRASH","Anti-System",4,2,600,{crash:"1D6",deckOnly:1},"Works only on cyberdecks: the runner is dropped out of the Net for 1D6 turns."],
 ["Murphy","Anti-System",3,2,600,{sys:"Launches its programs at random, using up its actions",deckFx:"The deck launches its programs at random, using up actions"},"Makes the target launch all its programs at random, using every action it has."],
 ["Virizz","Anti-System",4,2,600,{sys:"Loses one action each turn until shut down",deckFx:"One action a turn is tied up until the deck is turned off"},"Ties up one action of the target every turn until it's turned off."],
 ["Viral 15","Anti-System",4,2,590,{sys:"Erases one random file each turn until shut down",deckFx:"Erases one random program or file each turn until the deck is turned off"},"Erases one random file or program each turn until the target is turned off."],
 ["Invisibility","Evasion/Stealth",3,1,300,{evade:1,invisible:1},"Disguises your signal as harmless static, so you pass through the Net unnoticed."],
 ["Stealth","Evasion/Stealth",4,3,480,{evade:1},"Mutes your signal. Defences don't react to you, though other runners can still see you."],
 ["Replicator","Evasion/Stealth",3,2,320,{evade:1,vsDog:4},"Sends millions of copies of your signal in every direction. Strength 4 against Pit Bulls, Bloodhounds and Hellhounds."],
 ["Shield","Protection",3,1,150,{protect:1},"Stops attacks aimed at you. If it works, you take no damage."],
 ["Force Shield","Protection",4,2,160,{protect:1},"A stronger Shield."],
 ["Reflector","Protection",5,2,160,{protect:1,only:["Stun","Hellbolt","Knockout"]},"Repels Stun, Hellbolt and Knockout. Useless against other attacks."],
 ["Armor","Protection",4,2,170,{protect:1,reduce:3,reduces:["Stun","Hellbolt","Brainwipe","Zombie","Hellhound"]},"Stops anti-personnel attacks when it works. When it fails, it still takes 3 off Stun, Hellbolt, Brainwipe, Zombie and Hellhound damage."],
 ["Flak","Protection",4,2,180,{protect:1,vsDog:2},"A wall of static that blinds attackers. Only Strength 2 against Pit Bulls, Bloodhounds and Hellhounds."],
 ["Killer II","Anti-IC",2,5,1320,{prog:"1D6",mobile:1},"A virus that crashes other programs: each hit does 1D6 to the target's Strength."],
 ["Killer IV","Anti-IC",4,5,1400,{prog:"1D6",mobile:1},"A stronger Killer: 1D6 to the target's Strength per hit."],
 ["Killer VI","Anti-IC",6,5,1480,{prog:"1D6",mobile:1},"The strongest Killer: 1D6 to the target's Strength per hit."],
 ["Manticore","Anti-IC",2,3,880,{kills:"Demon"},"Hunts Demon programs and de-rezzes them instantly. Ignores you if you aren't carrying a Demon."],
 ["Hydra","Anti-IC",3,3,920,{kills:"Demon"},"A stronger Manticore."],
 ["Dragon","Anti-IC",4,3,960,{kills:"Demon"},"The strongest Manticore."],
 ["Aardvark","Anti-IC",4,3,1000,{kills:"Worm"},"Finds and de-rezzes Worm programs, even inside a Demon. No effect on anything else."],
 ["Stun","Anti-Personnel",3,3,6000,{status:"Frozen",dur:"1D6"},"Freezes the runner in place for 1D6 turns. A NetCop favourite."],
 ["Hellbolt","Anti-Personnel",4,4,6750,{wound:"1D10"},"1D10 physical damage to the runner per hit, as a wound. Stun and death saves apply."],
 ["Sword","Anti-Personnel",3,4,6250,{wound:"1D6"},"A Hellbolt variant: 1D6 physical damage per hit."],
 ["Brainwipe","Anti-Personnel",3,4,6500,{int:"1D6",lasting:1},"Fries the forebrain: 1D6 off INT each turn until INT reaches 0 and the runner dies. Lost INT never comes back."],
 ["Zombie","Anti-Personnel",5,4,7500,{int:"1D6",lasting:1},"A stronger Brainwipe: 1D6 off INT each turn, leaving the runner mindless."],
 ["Liche","Anti-Personnel",4,4,7250,{int:"1D6",lasting:1},"Rips away memories (1D6 off INT) and leaves room for a pseudo-personality the Referee controls."],
 ["Firestarter","Anti-Personnel",4,4,6250,{fire:1},"Traces the runner, then surges the power: the deck catches fire and the runner is fried as if in an electric chair. The Referee sets the damage. Keyboards don't protect against it."],
 ["Hellhound","Anti-Personnel",6,6,10000,{wound:"2D10",dog:1,follow:1,mobile:1},"Tracks the runner and causes a heart attack: 2D10 damage per turn. Waits in the Net, for years if it must, for them to come back."],
 ["Spazz","Anti-Personnel",4,3,6250,{status:"REF halved",dur:"1D6"},"Seizures halve the runner's REF for 1D6 turns, wrecking Net initiative."],
 ["Glue","Anti-Personnel",5,4,6500,{status:"Glued",dur:"1D10"},"NetWatch's arrest program: the runner is stuck in place for 1D10 turns. Four turns is enough for a trace."],
 ["Knockout","Anti-Personnel",4,3,6250,{status:"Knocked out",durText:"1D6 hours",out:1},"Knocks the runner out for 1D6 hours. They're dumped out of the Net and lie in a coma."],
 ["Jack Attack","Anti-Personnel",3,3,6000,{status:"Can't jack out",dur:"1D6"},"Stops the runner jacking out for 1D6 turns. Used for arrests."],
 ["Viddy Master","Controller",4,1,140,{ctrl:["Videoboard","Holo display"]},"Controls videoboards."],
 ["Soundmachine","Controller",4,1,140,{ctrl:["Microphone","Vox box"]},"Controls microphones, loudspeakers and voice boxes."],
 ["Open Sesame","Controller",3,1,130,{ctrl:["Door or gate","Elevator"]},"Opens doors, elevators and the like. Low level."],
 ["Genie","Controller",5,1,150,{ctrl:["Door or gate","Elevator"]},"Opens doors, elevators and the like. High level."],
 ["Hotwire","Controller",3,1,130,{ctrl:["Vehicle or robot"]},"Drives remote-controlled cars and vehicles."],
 ["Dee-2","Controller",3,1,130,{ctrl:["Vehicle or robot","Manipulator","Autofactory"]},"Controls robots, cleaning mecha and autofactories."],
 ["Crystal Ball","Controller",4,1,140,{ctrl:["TV camera"]},"Controls video cameras and remote sensors."],
 ["News At 8","Controller",4,1,140,{ctrl:["Terminal"]},"Reads Data Terms and screamsheet boxes through the Net."],
 ["Phone Home","Controller",5,1,150,{ctrl:[]},"Makes and takes calls from inside the Net. Strength 2 to listen in on other calls."],
 ["Databaser","Utility",8,2,180,{},"Creates open files to store information in."],
 ["Alias","Utility",6,2,160,{},"Renames a file to something harmless that hides what it really is."],
 ["Re-Rezz","Utility",3,1,130,{rerezz:1},"Recompiles damaged files and programs. The best way to get back a de-rezzed program without a copy."],
 ["Instant Replay","Utility",8,2,180,{},"Records your trip so you can retrace your steps."],
 ["GateMaster","Utility",5,1,150,{},"Kills Virizz and Viral 15 without shutting the deck or system down."],
 ["Padlock","Utility",4,2,160,{},"Nobody but you can log on to your deck without the code word."],
 ["ElectroLock","Utility",7,2,170,{},"Locks an open file as if behind a Strength 3 code gate."],
 ["Filelocker","Utility",4,1,140,{},"Locks an open file as if behind a Strength 5 code gate."],
 ["NetMap","Utility",4,1,150,{},"A map of the major Net regions: +2 to System Knowledge rolls to find a place in the Net."],
 ["File Packer","Utility",4,1,140,{},"Packs files to half their MU. Unpacking one takes 2 turns."],
 ["Backup","Utility",4,1,140,{},"Copies a program onto data chips (needs a chipreader). Anti-IC and Anti-Personnel programs can't be copied."],
 ["Imp","Demon",3,3,1000,{carry:2,mobile:1},"A Demon carrying 2 programs as subroutines. They fight at the Demon's Strength and die with it."],
 ["Afreet","Demon",3,4,1160,{carry:3,mobile:1},"A Demon carrying 3 programs."],
 ["Succubus","Demon",4,4,1200,{carry:4,mobile:1},"A Demon carrying 4 programs."],
 ["Balron","Demon",5,5,1240,{carry:4,mobile:1},"A Demon carrying 4 programs, and the strongest of the series."],
];
const CLASS_INFO={
 "Intrusion":"Breaks through data walls: program Strength + 1D10 against the wall's Strength + 1D10. Beat it and you're through.",
 "Decryption":"Opens code gates and file locks: program Strength + 1D10 against the gate's Strength + 1D10.",
 "Detection/Alarm":"Finds the hidden: program Strength + 1D10 against the hider's Evasion Strength + 1D10.",
 "Anti-System":"Attacks decks and systems through their data walls: Strength + 1D10 against the data wall's Strength + 1D10. It takes effect the next turn.",
 "Evasion/Stealth":"Keeps you unseen: an enemy must beat your Strength + 1D10 with its own Strength + 1D10 before it can react to you.",
 "Protection":"Defends you against anti-personnel attacks: Strength + INT + Interface + 1D10. If you win, the attack does nothing.",
 "Anti-IC":"Attacks other programs. Each hit takes Strength off the target; at 0 it's de-rezzed.",
 "Anti-Personnel":"Attacks the runner: Strength + INT + Interface + 1D10 against their Protection Strength + INT + Interface + 1D10. Ties go to the attacker.",
 "Controller":"Takes over a remote: roll 1D10 equal to or under the program's Strength.",
 "Utility":"Does its job on a 1D10 roll equal to or under the program's Strength.",
 "Demon":"Carries other programs as subroutines. They use half their memory, fight at the Demon's Strength and are destroyed with it.",
};
const ANTI_IC_NOTE="The rulebook gives no separate formula for Anti-IC. A program's Strength is added to the attack roll like weapon accuracy (pg. 137), so both sides roll Interface + Strength + 1D10; a system's Interface is 10.";

/* ---------- decks (pg. 132–134) ----------
   [name, type, speed, data walls, MU, cost, options, summary] */
const DECK_TYPES={standard:"Table model",portable:"Portable",combat:"Combat assault",cellular:"Cellular",cyberlimb:"Cyberlimb",cellimb:"Cellular cyberlimb"};
const DECKS=[
 ["Standard cyberdeck","standard",0,2,10,1000,[],"The stock deck everyone starts with: paperback-sized, half a kilogram, six option ports and six ports for passengers. 500eb used, 1,000eb new."],
 ["Used cyberdeck","standard",0,2,10,500,[],"A second-hand standard deck. The Referee might find you one cheap. For a price."],
 ["Portable cyberdeck","portable",0,2,10,2000,[],"A standard deck with a rechargeable power pack: 4 hours of running, 1 hour to recharge each hour used."],
 ["Combat assault deck","combat",0,2,10,3000,[],"Ceramic and steel (SP 20), portable, with adapters for any phone line. Finding one is a Difficult task."],
 ["Cellular deck","cellular",0,2,10,4000,[],"A portable deck that runs through the cellular network. Works anywhere in a city, not in the countryside. In a moving vehicle there's a 25% chance each turn of losing the connection and dropping out of the Net."],
 ["Cyberlimb cybermodem","cyberlimb",0,2,10,3000,[],"A deck the size of a cigarette pack built into a cyberarm, wired straight to your nervous system, so it needs no interface plugs. Nobody can pull your cables: if something goes wrong, you just burn. Humanity cost 1."],
 ["Cellular cyberlimb cybermodem","cellimb",0,2,10,5000,[],"A cyberlimb cybermodem that runs through the cellular network (cities over 100,000 people). In a moving vehicle there's a 25% chance each turn of losing the connection. Humanity cost 1."],
 ["Zetatech Parraline 5750","standard",2,4,10,3600,["Keyboard","Videoboard","Chipreader"],"A well-equipped table deck: keyboard, 2×3m videoboard and a chip reader."],
 ["SGI Technologies \"Elysia\"","portable",3,5,20,4260,["Keyboard","Videoboard","Chipreader"],"Fully portable, with a keyboard, a 3×4m videoboard, eight 'trode ports and a chip reader."],
 ["Kirama LPD-12","cellular",3,2,20,8025,[],"A fast cellular deck with doubled memory."],
];
const DECK_UPGRADES={speed:{cost:2000,max:5,label:"+1 Speed"},wall:{cost:1000,max:10,label:"+1 Data walls"},mu:{cost:5000,step:10,max:20,label:"Second memory (+10 MU)"}};
// [name, cost, note] (pg. 134)
const DECK_OPTIONS=[
 ["'Trode set",10,"Self-sticking electrodes, for running without interface plugs. Slower: −2 REF while in the Net. No Humanity cost."],
 ["Keyboard",100,"Controls the deck indirectly. Abysmally slow (−4 REF in the Net), but immune to every anti-personnel attack except Firestarter."],
 ["Videoboard",100,"A flat high-definition screen showing a Net's-eye view to people watching. 100eb per square foot."],
 ["Printer",300,"Hard copies of images and records from your deck."],
 ["Chipreader",100,"Stores programs, images and files on standard data chips (10eb each). Needed for Backup."],
 ["Extra chips (10)",100,"Ten data chips, 1 MU each, 10eb apiece."],
 ["Vox Box",300,"A small speaker so the deck can make sounds, and you can talk to people while you're in the Net."],
 ["Scanner",100,"Reads text and records images, from paper-sized up to a metre square. 100–300eb."],
];
const CONN={plugs:{label:"Interface plugs",ref:0},trodes:{label:"'Trodes",ref:-2},keyboard:{label:"Keyboard",ref:-4}};

/* ---------- data fortresses (pg. 154–165) ---------- */
const FORT_W=20,FORT_H=20,FORT_COLS="ABCDEFGHIJKLMNOPQRST";
const FORT_COST={cpu:10000,wallLevel:1000,extraGate:2000,gateLevel:1000,skillBase:200,skillLevel:100,extraTerminal:5000};
const REMOTE_KINDS=["Terminal","TV camera","Microphone","Vox box","Videoboard","Printer","Holo display","Alarm","Door or gate","Elevator","Vehicle or robot","Manipulator","Autofactory"];
const FILE_TYPES=["Inter-Office","Database","Business Records","Financial Transactions","Grey Ops","Black Ops"];
const FILE_INFO={"Inter-Office":"Memos, letters, gossip and games. Mostly worthless, which is exactly why someone might bury something here.","Database":"Lists: names, numbers, records, clients.","Business Records":"Real business documents: meeting notes, reports, sales figures.","Financial Transactions":"Money: accounts, financial records and orders. Where runners go to steal.","Grey Ops":"Secret records: bribes, slush funds, blackmail, trade secrets. Valuable and well protected.","Black Ops":"Top secret: assassinations, sabotage. Always guarded by lethal defences."};
// [name, MU, cost] and realism multipliers (pg. 158–159)
const VIRTUALS=[["Virtual Conference",1,10000],["Virtual Office",2,50000],["Virtual Rec-Area",4,100000],["Virtual Building",8,500000],["Virtual City",16,1000000],["Virtual World",32,10000000]];
const REALISM=[["Simple",1],["Contextual",2],["Fractal",3],["Photorealistic",4],["Superrealistic",5]];
const COMPUTER_SKILLS=["Accounting","Anthropology","Botany","Chemistry","Composition","Cryotank Operation","Diagnose Illness","Driving","Education & Gen. Know","Gamble","Geology","Heavy Weapons","History","Language","Library Search","Mathematics","Operate Heavy Machinery","Paint or Draw","Pharmaceuticals","Physics","Pilot","Play Instrument","Programming","Rifle","Stock Market","Submachinegun","System Knowledge","Teaching","Zoology"];
const AI_PERSONALITY=["Friendly, curious","Hostile, paranoid","Stable, intelligent, businesslike","Intellectual, detached","Machinelike and inhuman","Remote and godlike"];
const AI_REACTION=["Neutral","Neutral","Kill all intruders","Observe intruders, then act","Report all intruders","Talk to intruders to find out what they want"];
const AI_ICON=["Human","Geometric","Mythological","Voice only","Technic","Humanoid"];
const CELL_TYPES={wall:"Data wall",gate:"Code gate",cpu:"CPU",mem:"Memory",ldl:"LDL",remote:"Remote",entry:"Way in"};

/* ---------- writing programs (pg. 167–169) ---------- */
const DESIGN_FUNCS=[["Evasion",10,"Evasion/Stealth"],["Stealth",15,"Evasion/Stealth"],["Anti-Program",20,"Anti-IC"],["Anti-System",15,"Anti-System"],["Detection",10,"Detection/Alarm"],["Alarm",15,"Detection/Alarm"],["Anti-Personnel",20,"Anti-Personnel"],["Intrusion",15,"Intrusion"],["Protection",10,"Protection"],["Decryption",15,"Decryption"],["Controller",10,"Controller"],["Utility",10,"Utility"],["Interactive",10,"Utility"],["Compiler (Demon)",10,"Demon"]];
const DESIGN_OPTS=[["Movement ability",5],["Trace",2],["Auto Re-Rez",3],["Recognition",2],["Invisibility",3],["Memory",5],["Speed",2],["Endurance",3],["Conversational ability",3],["Pseudo-intellect",6],["ICON (simple)",1],["ICON (contextual)",2],["ICON (fractal)",3],["ICON (photorealistic)",4],["ICON (superrealistic)",5]];
const DESIGN_MU=[[15,1],[20,2],[25,3],[30,4],[35,5],[40,6],[Infinity,7]];
const DESIGN_COSTX={"Intrusion":1,"Decryption":1,"Controller":1,"Utility":1,"Demon":1,"Detection/Alarm":2,"Evasion/Stealth":2,"Protection":2,"Anti-System":3,"Anti-IC":4,"Anti-Personnel":25};

/* ============================== HELPERS ============================== */
const fkey=(x,y)=>x+","+y;
const fxy=k=>k.split(",").map(Number);
const fcoord=(x,y)=>FORT_COLS[x]+(y+1);
function progRow(name){return PROGRAMS.find(r=>r[0]===name)||null}
function progFx(p){if(!p)return {};if(p.fx)return p.fx;const r=progRow(p.name);return r?r[5]:{}}
function mkProgram(r){return {id:uid(),name:r[0],cls:r[1],str:r[2],mu:r[3],cost:r[4],fx:clone(r[5]||{}),desc:r[6]||"",loaded:true}}
function mkDeck(r){return {id:uid(),name:r[0],type:r[1],speed:r[2],wall:r[3],mu:r[4],cost:r[5],opts:(r[6]||[]).slice(),conn:"plugs",chips:0,notes:"",desc:r[7]||""}}
function demonSubs(c,p){return (c.programs||[]).filter(x=>x.in===p.id)}
/* MU a program takes in the deck: Demon subroutines are packed to half size (pg. 169). */
function progMU(c,p){if(p.in){const d0=(c.programs||[]).find(x=>x.id===p.in);if(d0)return Math.ceil((Number(p.mu)||0)/2)}return Number(p.mu)||0}
function muUsed(c){return (c.programs||[]).filter(p=>p.loaded||(p.in&&(c.programs||[]).some(d0=>d0.id===p.in&&d0.loaded))).reduce((a,p)=>a+progMU(c,p),0)}
function deckOf(c){return c&&c.deck||null}
function hasPlugs(c){return (c.cyber||[]).some(x=>/interface plug|cybermodem/i.test(x.name||""))||["cyberlimb","cellimb"].includes((c.deck||{}).type)}
function netConn(c){const d0=deckOf(c);if(!d0)return CONN.plugs;if(["cyberlimb","cellimb"].includes(d0.type))return CONN.plugs;return CONN[d0.conn]||CONN.plugs}
/* Net initiative: REF + deck Speed + 1D10 (pg. 151). 'Trodes −2 REF, keyboards −4 REF in the Net. */
function netInitParts(c,k,status){k=k||calc(c);const d0=deckOf(c);let ref=k.eff.REF;const parts=[["REF",ref]];
  if(status&&status.some(s=>s.t==="REF halved")){const h=Math.floor(ref/2);parts.push(["Spazz: REF halved",h-ref]);ref=h}
  const cm=netConn(c).ref;if(cm)parts.push([netConn(c).label,cm]);
  if(d0&&Number(d0.speed))parts.push(["Deck Speed",Number(d0.speed)]);
  return {base:parts.reduce((a,p)=>a+p[1],0),parts}}
function ifaceOf(c){return skillLevel(c,"Interface")}
function intOf(c){return calc(c).eff.INT}
/* the dice: plain 1D10 in the Net (pg. 151–153) */
function nd10(){return d(10)}
/* An opposed Net roll. a/b: {label,base,parts}; tie: who wins ties ("att" or "def"). Returns {aRoll,bRoll,aTot,bTot,win}. */
function netOpposed(a,b,tie){const ar=nd10(),br=nd10();const at=a.base+ar,bt=b.base+br;const win=at>bt||(at===bt&&tie==="att");return {aRoll:ar,bRoll:br,aTot:at,bTot:bt,win}}
function partsText(parts){return parts.filter(p=>p[1]!==0||p[2]).map((p,i)=>`${i?(p[1]<0?"− ":"+ "):""}${p[0]} ${Math.abs(p[1])}`).join(" ")}
function netCheckUnder(str){const r=nd10();return {roll:r,ok:r<=Number(str)}}

/* ---------- fortress maths ---------- */
function fortCells(f){return f.cells||(f.cells={})}
function fortCount(f,t){return Object.values(fortCells(f)).filter(c=>c.t===t).length}
function fortStats(f){const cells=fortCells(f);const cpus=Math.max(0,fortCount(f,"cpu"));const n=Math.max(1,cpus);
  const INT=3*cpus;const ai=INT>=12;const actions=1+Math.floor(Math.max(0,cpus-1)/2);
  const gates=Object.values(cells).filter(c=>c.t==="gate");const mems=Object.values(cells).filter(c=>c.t==="mem");
  const terms=Object.values(cells).filter(c=>c.t==="remote"&&c.kind==="Terminal").length;
  const wallStr=clamp(Number(f.wallStr)||cpus,0,10);
  const progs=f.progs||[];const fileMU=mems.reduce((a,m)=>a+(m.files||[]).reduce((b,x)=>b+(Number(x.mu)||1),0),0);
  const vMU=mems.reduce((a,m)=>a+(m.virtual?virtualMU(m.virtual):0),0);
  const progMUt=progs.reduce((a,p)=>a+(Number(p.mu)||0),0);
  const cap=mems.length*10;const used=fileMU+vMU+progMUt;
  const cost=[];const add=(l,v)=>{if(v)cost.push([l,v])};
  add(`${cpus} CPU × ${fmtEb(FORT_COST.cpu)}`,cpus*FORT_COST.cpu);
  add(`Data walls raised from ${cpus} to ${wallStr}`,Math.max(0,wallStr-cpus)*FORT_COST.wallLevel);
  add(`${Math.max(0,gates.length-cpus)} extra code gate${gates.length-cpus===1?"":"s"}`,Math.max(0,gates.length-cpus)*FORT_COST.extraGate);
  add("Code gates raised above Strength 2",gates.reduce((a,g)=>a+Math.max(0,(Number(g.str)||2)-2),0)*FORT_COST.gateLevel);
  add(`${(f.skills||[]).length} skills`,(f.skills||[]).reduce((a,s)=>a+FORT_COST.skillBase+Math.max(0,(Number(s.lv)||4)-4)*FORT_COST.skillLevel,0));
  add(`${Math.max(0,terms-cpus)} extra terminal${terms-cpus===1?"":"s"}`,Math.max(0,terms-cpus)*FORT_COST.extraTerminal);
  add(`${progs.length} defence program${progs.length===1?"":"s"}`,progs.reduce((a,p)=>a+(Number(p.cost)||0),0));
  add("Virtual realities",mems.reduce((a,m)=>a+(m.virtual?virtualCost(m.virtual):0),0));
  const warn=[];
  if(!cpus)warn.push("No CPU yet. Every system needs at least one.");
  if(cpus>7)warn.push(`The rulebook allows at most 7 CPUs on one system (this one has ${cpus}).`);
  if(mems.length>cpus*4)warn.push(`Each CPU comes with 4 memories: ${cpus} CPU${cpus===1?"":"s"} allow ${cpus*4}, and ${mems.length} are placed.`);
  if(used>cap)warn.push(`Files, programs and virtuals need ${used} MU, but ${mems.length} memor${mems.length===1?"y holds":"ies hold"} ${cap}.`);
  if(gates.length<1&&cpus)warn.push("No code gate: there's no way in except through a wall.");
  if((f.skills||[]).length>Math.ceil(cpus/2)*5)warn.push(`A system gets 5 skills for every 2 CPUs (${Math.ceil(cpus/2)*5} here).`);
  const loose=mems.filter(m=>!memAdjacentOk(f,m));if(loose.length)warn.push(`${loose.length} memor${loose.length===1?"y isn't":"ies aren't"} next to a CPU or another memory.`);
  return {cpus,INT,ai,actions,wallStr,iface:10,gates:gates.length,mems:mems.length,cap,used,cost,total:cost.reduce((a,x)=>a+x[1],0),warn,terms}}
function memAdjacentOk(f,m){const cells=fortCells(f);const k=Object.keys(cells).find(k=>cells[k]===m);if(!k)return true;const [x,y]=fxy(k);
  const seen=new Set([k]);const q=[k];while(q.length){const [cx,cy]=fxy(q.shift());for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nk=fkey(cx+dx,cy+dy);const c=cells[nk];if(!c||seen.has(nk))continue;if(c.t==="cpu")return true;if(c.t==="mem"){seen.add(nk);q.push(nk)}}}
  return false}
function virtualMU(v){const t=VIRTUALS.find(x=>x[0]===v.type)||VIRTUALS[0];const r=REALISM.find(x=>x[0]===v.realism)||REALISM[0];return t[1]*r[1]}
function virtualCost(v){const t=VIRTUALS.find(x=>x[0]===v.type)||VIRTUALS[0];const r=REALISM.find(x=>x[0]===v.realism)||REALISM[0];return t[2]*r[1]}
function fortProgFrom(r,x,y){return {id:uid(),name:r[0],cls:r[1],str:r[2],mu:r[3],cost:r[4],fx:clone(r[5]||{}),x,y,hidden:false,stealth:0}}
function blankFort(name){return {id:uid(),name:name||"New system",cells:{},progs:[],skills:[],wallStr:0,ai:{pers:"",react:"",icon:""},notes:"",updated:Date.now()}}

/* ---------- movement and sight on the subgrid ---------- */
// Things that stop movement and sight: data walls (until breached) and code gates (until opened).
function cellBlocks(cell,state,k){if(!cell)return false;if(cell.t==="wall")return !(state&&state.breach&&state.breach[k]);if(cell.t==="gate")return !(state&&state.open&&state.open[k]);return false}
/* Spaces reachable in up to n moves, through the sides of squares, never the corners (pg. 144). */
function fortReach(f,state,x,y,n){const out=new Map([[fkey(x,y),0]]);const q=[[x,y]];const cells=fortCells(f);
  while(q.length){const [cx,cy]=q.shift();const dd=out.get(fkey(cx,cy));if(dd>=n)continue;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=FORT_W||ny>=FORT_H)continue;const k=fkey(nx,ny);if(out.has(k))continue;
      if(cellBlocks(cells[k],state,k))continue;out.set(k,dd+1);q.push([nx,ny])}}
  return out}
/* Line of sight: anything within 20 spaces not blocked by a wall or closed gate (pg. 152). */
function fortSees(f,state,x0,y0,x1,y1,range){range=range||20;if(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))>range)return false;const cells=fortCells(f);
  const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));if(!n)return true;
  for(let i=1;i<n;i++){const t=i/n;const xa=x0+(x1-x0)*t,ya=y0+(y1-y0)*t;
    // a ray passing exactly between two squares is blocked only if both are blocked
    const cand=[[Math.round(xa),Math.round(ya)]];if(Math.abs(xa%1)===.5)cand.push([Math.floor(xa),Math.round(ya)],[Math.ceil(xa),Math.round(ya)]);if(Math.abs(ya%1)===.5)cand.push([Math.round(xa),Math.floor(ya)],[Math.round(xa),Math.ceil(ya)]);
    const blocked=cand.every(([cx,cy])=>{const k=fkey(cx,cy);return cellBlocks(cells[k],state,k)});if(blocked)return false}
  return true}
function fortVisible(f,state,x,y,range){const out=new Set();for(let yy=0;yy<FORT_H;yy++)for(let xx=0;xx<FORT_W;xx++)if(fortSees(f,state,x,y,xx,yy,range))out.add(fkey(xx,yy));return out}
function fortDist(x0,y0,x1,y1){return Math.abs(x1-x0)+Math.abs(y1-y0)}

/* ---------- Fast Fortress Construction (pg. 164–165) ---------- */
const FAST_DEFENCES=[[["Watchdog"],["Watchdog"],["Bloodhound"],["Bloodhound"],["Pit Bull"],["Pit Bull"]],
  [["Killer"],["Killer"],["Manticore"],["Manticore"],["Aardvark"],["Aardvark"]],
  [["Flatline"],["Poison Flatline"],["Krash"],["Viral 15"],["DecKRASH"],["Murphy"]],
  [["Stun"],["Hellbolt"],["Brainwipe"],["Knockout"],["Zombie"],["Hellhound"]]];
const FAST_REMOTES=["Microphone","TV camera","Terminal","Videoboard","Printer","Alarm","Vehicle or robot","Door or gate","Elevator","Manipulator"];
function fastFortress(name,rnd){rnd=rnd||d;const f=blankFort(name||"Unknown system");const log=[];
  const cpus=rnd(6);log.push(`${cpus} CPU${cpus>1?"s":""} (1D6): INT ${cpus*3}${cpus*3>=12?", an AI":""}.`);
  f.wallStr=Math.min(10,Math.floor(rnd(6)/2)+cpus);log.push(`Data walls Strength ${f.wallStr} (1D6/2 + CPUs).`);
  if(cpus*3>=12){f.ai={pers:AI_PERSONALITY[rnd(6)-1],react:AI_REACTION[rnd(6)-1],icon:AI_ICON[rnd(6)-1]};log.push(`AI: ${f.ai.pers}; ${f.ai.react.toLowerCase()}; ${f.ai.icon.toLowerCase()} ICON.`)}
  const sk=COMPUTER_SKILLS.slice();for(let i=0;i<5;i++){const j=rnd(sk.length)-1;f.skills.push({name:sk.splice(j,1)[0],lv:rnd(6)+4})}
  // layout: CPUs in a row in the middle, four memories each around them, walls around everything
  const cx=10-Math.floor(cpus/2),cy=9;const cells=f.cells;const inner=[];
  for(let i=0;i<cpus;i++){cells[fkey(cx+i,cy)]={t:"cpu"};inner.push([cx+i,cy])}
  let mi=1;const memSpots=[];for(let i=0;i<cpus;i++)for(const [dx,dy] of [[0,-1],[0,1],[0,-2],[0,2]])memSpots.push([cx+i+dx,cy+dy]);
  for(const [x,y] of memSpots){cells[fkey(x,y)]={t:"mem",n:mi++,files:[]};inner.push([x,y])}
  // files: two rolls per memory
  for(const m of Object.values(cells).filter(c=>c.t==="mem"))for(let r=0;r<2;r++){const t=FILE_TYPES[rnd(6)-1];m.files.push({name:t,type:t,mu:1,lock:0,docs:""})}
  const cap=cpus*40;let used=cpus*4*2;
  if(rnd(6)>=5){const mem=Object.values(cells).find(c=>c.t==="mem");if(mem){let ti=rnd(6)-1,ri=[0,0,1,2,3,4][rnd(6)-1];const rolled=`${VIRTUALS[ti][0]} (${REALISM[ri][0].toLowerCase()})`;
    // common sense (pg. 164): shrink a virtual that can't fit in the system's memory
    while(VIRTUALS[ti][1]*REALISM[ri][1]>cap-used-cpus*4&&(ri>0||ti>0)){if(ri>0)ri--;else ti--}
    mem.virtual={type:VIRTUALS[ti][0],realism:REALISM[ri][0]};used+=virtualMU(mem.virtual);
    const now=`${mem.virtual.type} (${mem.virtual.realism.toLowerCase()})`;log.push(`A virtual reality: ${now}${now!==rolled?`, scaled down from a ${rolled} to fit the memory`:""}.`)}}
  // remotes: one terminal per CPU, then 1D6 more
  const ring=[];for(let x=cx-2;x<=cx+cpus+1;x++)for(const y of [cy-3,cy+3])ring.push([x,y]);for(let y=cy-2;y<=cy+2;y++)for(const x of [cx-2,cx+cpus+1])ring.push([x,y]);
  const free=ring.filter(([x,y])=>!cells[fkey(x,y)]);const takeFree=()=>{const i=rnd(free.length)-1;return free.length?free.splice(i,1)[0]:null};
  for(let i=0;i<cpus;i++){const p=takeFree();if(p)cells[fkey(p[0],p[1])]={t:"remote",kind:"Terminal",label:""}}
  const nr=rnd(6);for(let i=0;i<nr;i++){const p=takeFree();if(p)cells[fkey(p[0],p[1])]={t:"remote",kind:FAST_REMOTES[rnd(10)-1],label:""}}
  log.push(`${cpus} terminal${cpus>1?"s":""}, plus ${nr} remote${nr>1?"s":""} (1D6).`);
  // walls: a rectangle one space outside everything, with one code gate per CPU
  const x0=cx-3,x1=cx+cpus+2,y0=cy-4,y1=cy+4;const wall=[];
  for(let x=x0;x<=x1;x++){wall.push([x,y0]);wall.push([x,y1])}for(let y=y0+1;y<y1;y++){wall.push([x0,y]);wall.push([x1,y])}
  const corners=new Set([fkey(x0,y0),fkey(x1,y0),fkey(x0,y1),fkey(x1,y1)]);
  for(const [x,y] of wall)cells[fkey(x,y)]={t:"wall"};
  const gateSpots=wall.filter(([x,y])=>!corners.has(fkey(x,y)));
  for(let i=0;i<cpus&&gateSpots.length;i++){const j=rnd(gateSpots.length)-1;const [x,y]=gateSpots.splice(j,1)[0];cells[fkey(x,y)]={t:"gate",str:Math.min(10,Math.floor(rnd(6)/2)+cpus)}}
  log.push(`${cpus} code gate${cpus>1?"s":""} (1D6/2 + CPUs each).`);
  // defences: 1D6 + CPUs
  const nd=rnd(6)+cpus;const insideFree=[];for(let y=y0+1;y<y1;y++)for(let x=x0+1;x<x1;x++)insideFree.push([x,y]);
  let full=0;
  for(let i=0;i<nd;i++){let r=null,str=null;
    for(let tries=0;tries<6&&!r;tries++){const t=rnd(10);const g=t<=4?0:t<=6?1:t<=8?2:3;let name=FAST_DEFENCES[g][rnd(6)-1][0];str=null;
      if(name==="Killer"){str=rnd(6);name=str<=2?"Killer II":str<=4?"Killer IV":"Killer VI"}
      const rr=progRow(name);if(used+rr[3]<=cap)r=rr}
    if(!r){full++;continue}used+=r[3];const [x,y]=insideFree[rnd(insideFree.length)-1];const p=fortProgFrom(r,x,y);if(str)p.str=str;f.progs.push(p)}
  log.push(`${nd} defences (1D6 + CPUs): ${f.progs.map(p=>p.name).join(", ")}${full?`. ${full} more didn't fit in the memory`:""}.`);
  // the way in: the space outside the first gate
  const g0=Object.keys(cells).find(k=>cells[k].t==="gate");if(g0){const [gx,gy]=fxy(g0);const out=gx===x0?[gx-1,gy]:gx===x1?[gx+1,gy]:gy===y0?[gx,gy-1]:[gx,gy+1];if(!cells[fkey(out[0],out[1])])cells[fkey(out[0],out[1])]={t:"entry"}}
  f.notes=log.join("\n");return f}

/* A ready-made system to try things on. */
function sampleFortress(){const f=blankFort("Kestrel Biotech (sample)");const C=f.cells;const put=(c,o)=>{const x=FORT_COLS.indexOf(c[0]),y=Number(c.slice(1))-1;C[fkey(x,y)]=o};
  ["H9","I9","J9","K9","L9","M9","N9","O9","H10","H11","H12","H13","H14","H15","H16","O10","O11","O12","O14","O15","O16","I16","J16","K16","L16","M16","N16"].forEach(c=>put(c,{t:"wall"}));
  put("O13",{t:"gate",str:4});put("K16",{t:"gate",str:3});put("P13",{t:"entry"});
  put("K12",{t:"cpu"});put("L12",{t:"cpu"});
  put("J11",{t:"mem",n:1,files:[{name:"Payroll and transfers",type:"Financial Transactions",mu:1,lock:0,docs:"Wire transfers to Night City accounts"},{name:"Lab supply orders",type:"Business Records",mu:1,lock:0,docs:""}]});
  put("K11",{t:"mem",n:2,files:[{name:"Staff directory",type:"Database",mu:1,lock:0,docs:"Every employee, with home address"}]});
  put("L11",{t:"mem",n:3,files:[{name:"Project Lazarus",type:"Black Ops",mu:1,lock:5,docs:"Trial results\nSubjects who didn't survive\nWho signed off"}]});
  put("M11",{t:"mem",n:4,files:[{name:"Gossip and memos",type:"Inter-Office",mu:1,lock:0,docs:""}]});
  put("J13",{t:"mem",n:5,files:[{name:"Payments to the city council",type:"Grey Ops",mu:1,lock:3,docs:""}]});
  put("K13",{t:"mem",n:6,files:[],virtual:{type:"Virtual Conference",realism:"Fractal"}});
  put("L13",{t:"mem",n:7,files:[{name:"Security rota",type:"Business Records",mu:1,lock:0,docs:"Guard shifts and patrol routes for the Kestrel lab"}]});
  put("M13",{t:"mem",n:8,files:[]});
  put("I14",{t:"remote",kind:"Terminal",label:"Lobby desk"});put("N14",{t:"remote",kind:"Terminal",label:"Lab office"});put("J15",{t:"remote",kind:"TV camera",label:"Lab corridor"});put("M15",{t:"remote",kind:"Door or gate",label:"Lab airlock"});put("I10",{t:"ldl",label:"Kestrel Seattle office"});
  f.wallStr=4;
  const P=(n,c,o)=>{const x=FORT_COLS.indexOf(c[0]),y=Number(c.slice(1))-1;f.progs.push({...fortProgFrom(progRow(n),x,y),...(o||{})})};
  P("Watchdog","N13");P("Killer IV","L14");P("Bloodhound","J12");P("Hellbolt","M12");P("Stun","K15",{hidden:true,stealth:3});P("Flatline","N11");
  f.skills=[{name:"Accounting",lv:6},{name:"Chemistry",lv:7},{name:"Biology",lv:5},{name:"Library Search",lv:5},{name:"System Knowledge",lv:6}].map(s=>COMPUTER_SKILLS.includes(s.name)?s:{name:"Zoology",lv:s.lv});
  f.notes="Two CPUs (INT 6), data walls Strength 4. The front gate (O13) faces the Net; the back gate (K16) is the staff entrance. Project Lazarus is behind a Strength 5 file lock.";
  return f}

/* ---------- reading a fortress from a file (campaign packages) ---------- */
function sanFort(raw){if(!raw||typeof raw!=="object")return null;const f=blankFort(pkStr(raw.name)||"System");
  const cells=raw.cells&&typeof raw.cells==="object"?raw.cells:{};let n=0;
  for(const [k,c] of Object.entries(cells)){if(++n>FORT_W*FORT_H)break;const m=/^(\d{1,2}),(\d{1,2})$/.exec(k);if(!m||!c||typeof c!=="object")continue;const x=+m[1],y=+m[2];if(x>=FORT_W||y>=FORT_H)continue;
    const t=CELL_TYPES[c.t]?c.t:null;if(!t)continue;const o={t};
    if(t==="gate")o.str=pkNum(c.str,0,10,2);
    if(t==="mem"){o.n=pkNum(c.n,0,999,0);o.files=(Array.isArray(c.files)?c.files:[]).slice(0,30).filter(fl=>fl&&typeof fl==="object").map(fl=>({name:pkStr(fl.name,80)||"File",type:FILE_TYPES.includes(fl.type)?fl.type:"Inter-Office",mu:pkNum(fl.mu,0,10,1),lock:pkNum(fl.lock,0,10,0),docs:pkText(fl.docs,2000)}));
      if(c.virtual&&typeof c.virtual==="object")o.virtual={type:VIRTUALS.some(v=>v[0]===c.virtual.type)?c.virtual.type:VIRTUALS[0][0],realism:REALISM.some(v=>v[0]===c.virtual.realism)?c.virtual.realism:"Simple"}}
    if(t==="remote"){o.kind=REMOTE_KINDS.includes(c.kind)?c.kind:"Terminal";o.label=pkStr(c.label,60)}
    if(t==="ldl")o.label=pkStr(c.label,60);
    f.cells[fkey(x,y)]=o}
  f.progs=(Array.isArray(raw.progs)?raw.progs:[]).slice(0,80).filter(p=>p&&typeof p==="object").map(p=>({...sanitizeProgram(p,pkStr(p.name)),id:uid(),x:pkNum(p.x,0,FORT_W-1,0),y:pkNum(p.y,0,FORT_H-1,0),hidden:!!p.hidden,stealth:pkNum(p.stealth,0,10,0)}));
  f.skills=(Array.isArray(raw.skills)?raw.skills:[]).slice(0,40).filter(s=>s&&typeof s==="object").map(s=>({name:pkStr(s.name,40)||"Skill",lv:pkNum(s.lv,0,10,4)}));
  f.wallStr=pkNum(raw.wallStr,0,10,0);const ai=raw.ai&&typeof raw.ai==="object"?raw.ai:{};f.ai={pers:pkStr(ai.pers,60),react:pkStr(ai.react,80),icon:pkStr(ai.icon,40)};f.notes=pkText(raw.notes,4000);return f}

/* ============================== DRAWING THE SUBGRID ==============================
   Shared by the GM's fortress editor, the GM's run view and the player's Net window.
   o.cell(k) → cell or null; o.fog(k) → "" (seen) | "dim" (seen before) | "dark" (never seen);
   o.marks: [{x,y,kind:"ice"|"runner",label,color,cls,id,title}]; o.reach: Set of keys; o.sel: key;
   o.act: data-act for clicks; o.state: run state (breaches, open gates); o.gm: show GM-only detail. */
const NET_ICON={
  cpu:'<circle cx="10" cy="10" r="6.5"/><path d="M5.4 5.4l9.2 9.2M14.6 5.4l-9.2 9.2"/>',
  mem:'<rect x="3.5" y="3.5" width="13" height="13"/>',
  gate:'<rect x="3" y="3" width="14" height="14"/><path d="M3 7.5h14M3 10h14M3 12.5h14"/>',
  gateOpen:'<rect x="3" y="3" width="14" height="14" stroke-dasharray="2 2"/>',
  ldl:'<path d="M10 3.5l7 12.5H3z"/>',
  entry:'<path d="M5 10h10M11 6l4 4-4 4"/>',
  ice:'<circle cx="10" cy="8" r="4.6"/><circle cx="8.3" cy="7.6" r="1" class="f"/><circle cx="11.7" cy="7.6" r="1" class="f"/><path d="M4.5 13.5l11 4M15.5 13.5l-11 4"/>',
  term:'<rect x="4" y="3.5" width="12" height="9"/><path d="M6.5 16.5h7M10 12.5v4"/>',
  remote:'<circle cx="10" cy="10" r="6"/>'};
const REMOTE_LETTER={"Terminal":"","TV camera":"C","Microphone":"M","Vox box":"V","Videoboard":"B","Printer":"P","Holo display":"H","Alarm":"A","Door or gate":"D","Elevator":"E","Vehicle or robot":"R","Manipulator":"N","Autofactory":"F"};
function netSvg(path,txt){return `<svg viewBox="0 0 20 20" aria-hidden="true">${path}${txt!=null&&txt!==""?`<text x="10" y="13.6" text-anchor="middle">${esc(txt)}</text>`:""}</svg>`}
function netCellLabel(c,k,o){if(!c)return "Empty space";const st=o.state||{};const n=CELL_TYPES[c.t]||c.t;
  if(c.t==="wall")return st.breach&&st.breach[k]?"Breached data wall":"Data wall"+(o.gm?` (Strength ${Math.max(0,(o.wallStr||0)-((st.wallDmg||{})[k]||0))})`:"");
  if(c.t==="gate")return (st.open&&st.open[k]?"Open code gate":"Code gate")+(o.gm?` (Strength ${c.str})`:"");
  if(c.t==="mem")return `Memory ${c.n||""}`;if(c.t==="remote")return c.kind+(c.label?": "+c.label:"");if(c.t==="ldl")return "LDL"+(c.label?": "+c.label:"");return n}
function netGridHTML(o){const cols=FORT_COLS.split("").slice(0,FORT_W);const st=o.state||{};const marks={};(o.marks||[]).forEach(m=>{(marks[fkey(m.x,m.y)]||(marks[fkey(m.x,m.y)]=[])).push(m)});
  let h=`<div class="ng ${o.cls||""}" role="grid" aria-label="${esc(o.label||"Subgrid")}"><div class="ng-c ng-h"></div>${cols.map(c=>`<div class="ng-c ng-h">${c}</div>`).join("")}`;
  for(let y=0;y<FORT_H;y++){h+=`<div class="ng-c ng-h">${y+1}</div>`;
    for(let x=0;x<FORT_W;x++){const k=fkey(x,y);const fog=o.fog?o.fog(k):"";const c=fog==="dark"?null:o.cell(k);let cls="ng-c ng-s";let ic="";
      if(c){cls+=" t-"+c.t;
        if(c.t==="wall"){if(st.breach&&st.breach[k])cls+=" breached";else if((st.wallDmg||{})[k])cls+=" damaged";if(st.opening&&st.opening[k])cls+=" opening"}
        else if(c.t==="gate"){const open=st.open&&st.open[k];if(open)cls+=" open";ic=netSvg(open?NET_ICON.gateOpen:NET_ICON.gate);if(st.opening&&st.opening[k])cls+=" opening"}
        else if(c.t==="cpu")ic=netSvg(NET_ICON.cpu);else if(c.t==="mem")ic=netSvg(NET_ICON.mem,c.n||"");else if(c.t==="ldl")ic=netSvg(NET_ICON.ldl);else if(c.t==="entry")ic=netSvg(NET_ICON.entry);
        else if(c.t==="remote"){ic=c.kind==="Terminal"?netSvg(NET_ICON.term):netSvg(NET_ICON.remote,REMOTE_LETTER[c.kind]||"?");if(st.ctrl&&st.ctrl[k])cls+=" ctrl"}}
      if(fog)cls+=" fog-"+fog;if(o.reach&&o.reach.has(k))cls+=" reach";if(o.sel===k)cls+=" sel";if(o.vis&&o.vis.has(k))cls+=" vis";
      const ms=(marks[k]||[]).map(m=>m.kind==="runner"?`<span class="ng-r ${m.cls||""}" style="--rc:${esc(m.color||"#3ef2ff")}" title="${esc(m.title||m.label)}">${esc((m.label||"?").charAt(0).toUpperCase())}</span>`
        :`<span class="ng-i ${m.cls||""}" title="${esc(m.title||m.label)}">${netSvg(NET_ICON.ice)}</span>`).join("");
      const lab=[fcoord(x,y),fog==="dark"?"unknown":netCellLabel(c,k,o),...(marks[k]||[]).map(m=>m.title||m.label)].join(", ");
      h+=`<button class="${cls}" data-act="${o.act||"ng-cell"}" data-x="${x}" data-y="${y}" aria-label="${esc(lab)}" title="${esc(lab)}">${ic}${ms}</button>`}}
  return h+"</div>"}
