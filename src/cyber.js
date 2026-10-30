/* Cyberpunk 2020 · the rest of the cyberware rules (1.1.4): cyberlimbs and cyberoptics with their options and
   structure points, chipware, linear frames, the adrenal booster, implants switched off for therapy, facedowns
   and Reputation, and role income. Book pages: Reputation and facedowns 55, occupations 58, chipware 82–83,
   cyberlimbs 89–90, linear frames 92. Shared by the player and GM apps. */

/* ============================== CYBERLIMBS & CYBEROPTICS ============================== */
const HOST_KINDS={arm:{label:"Cyberarm",slots:4,locs:["rarm","larm"]},leg:{label:"Cyberleg",slots:3,locs:["rleg","lleg"]},eye:{label:"Cyberoptic",slots:4,locs:["reye","leye"]}};
const HOST_LOC_NAMES={rarm:"Right arm",larm:"Left arm",rleg:"Right leg",lleg:"Left leg",reye:"Right eye",leye:"Left eye"};
function hostKind(x){if(!x)return null;if(x.host)return x.host;const n=String(x.name||"");return /^cyberarm\b/i.test(n)?"arm":/^cyberleg\b/i.test(n)?"leg":/^cyberoptic\b/i.test(n)?"eye":null}
// what each option goes on and how many spaces it takes. Coverings (and limb armor) take no space, one per limb.
const OPT_BY_NAME={"Cyberhand":["arm",1],"Hydraulic rams":["limb",1],"Pop-up gun in limb":["arm",1],"Quick change mount":["limb",1],"Thickened myomar":["limb",1],
  "Reinforced joints":["limb",1],"Microwave/EMP shielding":["limb",1],"Plastic covering":["limb",0,1],"RealSkinn":["limb",0,1],"Superchrome":["limb",0,1],
  "Cyberlimb armor (SP 20)":["limb",0,1],"MicroVideo optic":["eye",2],"Digital camera optic":["eye",2],"Dartgun optic":["eye",3]};
function optSpec(x){if(!x||hostKind(x))return null;const n=String(x.name||x[0]||"");const cat=x.cat||x[1]||"";
  if(OPT_BY_NAME[n]){const [on,slots,cover]=OPT_BY_NAME[n];return {on,slots,cover:!!cover}}
  if(cat==="Cyberoptics")return {on:"eye",slots:1};if(cat==="Hands & feet")return {on:/foot/i.test(n)?"leg":"arm",slots:1};
  if(cat==="Limb built-ins"||cat==="Limb weapons")return {on:"limb",slots:1};return null}
const OPT_ON_LABEL={arm:"a cyberarm",leg:"a cyberleg",eye:"a cyberoptic",limb:"a cyberlimb"};
function hostsOf(c){return (c.cyber||[]).filter(x=>hostKind(x))}
function optsOn(c,h){return (c.cyber||[]).filter(x=>h&&x.on===h.id)}
function hostFits(h,spec){const k=hostKind(h);return spec.on==="limb"?(k==="arm"||k==="leg"):k===spec.on}
function hostUsed(c,h){return optsOn(c,h).reduce((a,x)=>a+((optSpec(x)||{}).slots||0),0)}
function hostRoom(c,h,spec,ignore){if(!hostFits(h,spec))return false;const opts=optsOn(c,h).filter(x=>x!==ignore);
  if(spec.cover)return !opts.some(x=>(optSpec(x)||{}).cover);
  return opts.reduce((a,x)=>a+((optSpec(x)||{}).slots||0),0)+spec.slots<=HOST_KINDS[hostKind(h)].slots}
function hostFor(c,spec,prefer){const hs=hostsOf(c).filter(h=>hostRoom(c,h,spec));return hs.find(h=>h.id===prefer)||hs[0]||null}
function hostLabel(h){return HOST_LOC_NAMES[h.loc]||HOST_KINDS[hostKind(h)].label}
function freeLoc(c,kind,self){const used=new Set(hostsOf(c).filter(h=>h!==self&&hostKind(h)===kind).map(h=>h.loc));return HOST_KINDS[kind].locs.find(l=>!used.has(l))||HOST_KINDS[kind].locs[0]}
/* buying cyberware: an option needs somewhere to go; a limb or eye takes the next free side */
function cyBuyProblem(c,row){const spec=optSpec({name:row[0],cat:row[1]});if(!spec)return null;
  if(hostFor(c,spec,ui&&ui.shopHost))return null;
  return hostsOf(c).some(h=>hostFits(h,spec))?`No room: every ${OPT_ON_LABEL[spec.on].slice(2)} you have is full (${spec.cover?"one covering each":"arms take 4 options, legs 3, eyes 4"}).`:`${row[0]} needs ${OPT_ON_LABEL[spec.on]} to go on.`}
function cyPlace(c,item){const k=hostKind(item);if(k){item.loc=freeLoc(c,k,item);return}const spec=optSpec(item);if(!spec)return;const h=hostFor(c,spec,ui&&ui.shopHost);if(h)item.on=h.id}
// structure points (pg. 90): 20 to disable a cyberlimb, 30 to destroy it; hydraulic rams 30/40; myomar and reinforced joints +5 each
function limbSDP(c,h){const o=optsOn(c,h).map(x=>x.name);let dis=20,des=30;if(o.includes("Hydraulic rams")){dis=30;des=40}
  const plus=(o.includes("Thickened myomar")?5:0)+(o.includes("Reinforced joints")?5:0);return {dis:dis+plus,des:des+plus,dmg:Number(h.sdpDmg)||0}}
function limbState(c,h){const s=limbSDP(c,h);return s.dmg>=s.des?"destroyed":s.dmg>=s.dis?"disabled":"working"}
function limbAt(c,loc){return hostsOf(c).find(h=>hostKind(h)!=="eye"&&h.loc===loc&&!h.off)||null}
function limbStrength(c,h){const o=optsOn(c,h).map(x=>x.name);return o.includes("Hydraulic rams")?3:o.includes("Thickened myomar")?2:1}
function limbAttacks(c,h){const m=limbStrength(c,h);const x=m>1?` (×${m})`:"";return hostKind(h)==="arm"?`Punch 1D6${x} · crush 2D6${x}`:`Kick 2D6${x}`}
/* a hit on a cyberlimb is damage to a machine: armor (and limb armor) first, AP halves, no BTM, no stun save,
   and it goes on the limb's structure points instead of your wounds */
function limbHit(c,h,amt,sp,ap){let pen=amt-sp;const name=hostLabel(h);if(pen<=0)return {pen:0,text:`${amt} damage vs SP ${sp} at the ${name.toLowerCase()} (cyberlimb): stopped.`};
  const steps=[`${amt} − SP ${sp} = ${pen}`];if(ap){pen=Math.max(1,Math.floor(pen/2));steps.push(`AP halves → ${pen}`)}
  const s=limbSDP(c,h);const after=s.dmg+pen;const st=after>=s.des?"destroyed":after>=s.dis?"useless until it's repaired":"still working";
  return {pen,text:`${name} (cyberlimb): ${steps.join(" · ")} structural damage, now ${after}/${s.des} and ${st}. No wound and no stun save: cyberlimbs feel no pain.`}}

/* ============================== CHIPWARE ============================== */
// skill, chip type, price per level (pg. 83). MRAM chips work at once; APTR chips need 2 days of practice per level.
const CHIPS=[["Personal Grooming","MRAM",100],["Wardrobe & Style","MRAM",100],["Swimming","APTR",100],
 ["Accounting","MRAM",150],["Anthropology","MRAM",150],["Biology","MRAM",150],["Botany","MRAM",150],["Chemistry","MRAM",150],["Education & Gen. Know","MRAM",200],
 ["Expert","MRAM",200,"subject"],["Geology","MRAM",150],["History","MRAM",150],["Know Language","MRAM",200,"language"],["Mathematics","MRAM",200],["Physics","MRAM",200],
 ["Programming","MRAM",300],["Stock Market","MRAM",300],["Wilderness Survival","MRAM",200],["Zoology","MRAM",150],["Daytimer","MRAM",100],
 ["Archery","APTR",300],["Dance","APTR",150],["Driving","APTR",150],["Fencing","APTR",300],["Handgun","APTR",300],["Heavy Weapons","APTR",400],
 ["Martial Art","APTR",350,"style"],["Melee","APTR",150],["Motorcycle","APTR",150],["Operate Heavy Machinery","APTR",200],["Pilot (Gyro)","APTR",300],
 ["Pilot (Fixed Wing)","APTR",300],["Pilot (Dirigible)","APTR",300],["Pilot (Vect. Thrust)","APTR",350],["Rifle","APTR",300],["Submachinegun","APTR",300],
 ["Aero Tech","APTR",250],["AV Tech","APTR",300],["Basic Tech","APTR",200],["Cryotank Operation","APTR",150],["Cyberdeck Design","APTR",200],["CyberTech","APTR",300],
 ["Demolitions","APTR",300],["Disguise","APTR",150],["Electronics","APTR",150],["Elect. Security","APTR",200],["First Aid","APTR",150],["Forgery","APTR",200],
 ["Gyro Tech","APTR",300],["Pharmaceuticals","APTR",200],["Pick Lock","APTR",150],["Pick Pocket","APTR",150],["Play Instrument","APTR",150],["Weaponsmith","APTR",200]];
function cyOn(c,re){return (c.cyber||[]).some(x=>!x.off&&re.test(x.name||""))}
function chipHW(c){return cyOn(c,/^Neural processor/i)&&(cyOn(c,/^Interface plugs/i)||cyOn(c,/^Chipware socket/i))}
function chipEff(x){return x.kind==="APTR"?Math.min(Number(x.lvl)||0,Math.floor((Number(x.days)||0)/2)):Number(x.lvl)||0}
function chipsIn(c){return (c.chips||[]).filter(x=>x.slot)}
// a working chip sets your level to the chip's, higher or lower (pg. 83)
function chipLevel(c,name){if(!c||!c.chips||!c.chips.length||!chipHW(c))return null;const ch=chipsIn(c).filter(x=>x.skill===name&&chipEff(x)>0);return ch.length?Math.max(...ch.map(chipEff)):null}
function chipCost(row,lvl){return row[2]*clamp(Number(lvl)||1,1,3)}

/* ============================== LINEAR FRAMES, ADRENAL BOOSTER ============================== */
// Strength replaces BODY for lifting and breaking; melee damage bonus; lift 50 × Strength kg (pg. 92)
const FRAMES=[[/Linear frame Ω/,16,8],[/Linear frame β/,14,6],[/Linear frame Σ/,12,4]];
function frameOf(c){for(const [re,str,dmg] of FRAMES)if(cyOn(c,re))return {str,dmg};return null}
const ADRENAL_USES=3;

/* ============================== REPUTATION & FACEDOWNS ============================== */
const REP_LEVELS=["Nobody knows you yet.","Anyone who was there knows.","Stories have reached your immediate friends.","All your co-workers and casual acquaintances know.",
  "Stories are all over the local area.","You're recognized beyond your local area.","You're known on sight beyond your local area.","A news story or two has been written about you.",
  "Your exploits regularly make the headlines and screamsheets.","Your exploits always make the screamsheets and TV.","You're known worldwide."];
function repText(n){return REP_LEVELS[clamp(Number(n)||0,0,10)]}
// both roll COOL + Reputation + 1D10 (a reputation for cowardice counts as negative). The loser backs down, or attacks
// the winner at −3 until beating them once. A tie: no effect.
function facedown(a,b,who){const ra=d10x(),rb=d10x();const sa=ra.reduce((x,y)=>x+y,0),sb=rb.reduce((x,y)=>x+y,0);
  const ta=a.cool+(a.coward?-a.rep:a.rep)+sa,tb=b.cool+(b.coward?-b.rep:b.rep)+sb;
  const win=ta===tb?null:ta>tb?a:b,lose=win===a?b:win===b?a:null;
  const text=`${a.name}: COOL ${a.cool} + Rep ${a.coward?"−":""}${a.rep} + D10 (${ra.join("+")}) = ${ta} · ${b.name}: COOL ${b.cool} + Rep ${b.coward?"−":""}${b.rep} + D10 (${rb.join("+")}) = ${tb}. `+
    (win?`${lose.name} loses: back down, or attack ${win.name} at −3 until beating them once.`:"A tie: both are unsure, and nobody takes a penalty.");
  Dice.raw(`Facedown: ${a.name} vs ${b.name}`,text,Math.max(ta,tb),who||"GM",[win?{t:win.name+" wins",c:"green"}:{t:"Tie",c:"amber"}]);return {ta,tb,win:win&&win.name,text}}

/* ============================== ROLE INCOME (pg. 58) ============================== */
const JOB_TITLES={Rocker:["Desperate for gigs","Regular club jobs","Play the big clubs","You've got a contract","Concert band","Major act"],
  Solo:["Street ronin","Private enforcer","Corporate muscle","Professional operative","Major league hitter","Solo elite"],
  Cop:["Private guard","City cop","Corporate guard or detective","Corp security or Psycho Squad","Enforcement team leader","Security head or police chief"],
  Corporate:["Assistant","Manager","Junior executive","Executive","Department head","Division head"],
  Media:["Stringer reporter","Staff reporter","Section editor","Producer or managing editor","Local media personality","National media personality"],
  Fixer:["Street punk","Gang leader","Enforcer","Sub-lieutenant","Lieutenant","Crime boss"],
  Techie:["Local fixit man","Private operator","Corporate tech","Junior engineer","Engineer","Senior engineer"],
  Netrunner:["Weefle runner","Hacker","Bit jockey","Net cowboy","Deckslinger","Sysop"],
  Medtech:["Patchman","Medical technician","Ripperdoc","Trauma Team medic","General practitioner","Specialist physician"],
  Nomad:["Clanmember","Warrior","Head of household","Scout","Clan senior","Family head"]};
function jobOf(c){const r=roleOf(c);if(!r||!r.income)return null;const ab=skillNatural(c,r.ab);const i=clamp(ab<=5?0:ab-5,0,5);return {title:(JOB_TITLES[c.role]||[])[i]||"",pay:r.income[i]}}

/* ============================== MICROWAVER (pg. 108) ============================== */
const MICROWAVE_FX=["Cyberoptics short out for 1D6 turns.","Neural pulse! With interface plugs, reflex boosts or other hardwiring, REF drops by 1D6/2 until repaired.",
  "Cyberaudio shorts out for 1D6 turns.","Cyberlimb malfunction: no use of a cyberlimb for 1D10 turns (1D6: 1–2 right arm, 3 left leg, 4 right leg, 5–6 left arm).",
  "Total neural breakdown! Reduced to a twitching, epileptic fit for 1D6/3 turns.","No effect."];
function microwaveRoll(who){const r=d(6);let t=MICROWAVE_FX[r-1];
  if(r===1||r===3)t=t.replace("1D6",String(d(6)));if(r===2)t+=` (−${Math.ceil(d(6)/2)} REF)`;
  if(r===4){const l=d(6);t+=` Rolled ${l}: ${l<=2?"right arm":l===3?"left leg":l===4?"right leg":"left arm"}, for ${d(10)} turns.`}if(r===5)t+=` (${Math.ceil(d(6)/3)} turns)`;
  return Dice.raw("Microwaver side effects",`1D6 = ${r}: ${t} Shielded cyberware isn't affected.`,r,who,[{t:r===6?"No effect":"Side effect",c:r===6?"green":"red"}])}
