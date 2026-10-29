/* Cyberpunk 2020 · Trauma Team (1.1.2), from the rulebook's medical chapter: stabilization, death and Death
   State, healing with First Aid and Medical Tech, speedheal and nanotech, surgery codes, body banks,
   bodysculpting, Trauma Team™ and drugs, with the drug designer. Shared by the player and GM apps; each app
   supplies medEdit(id,fn) (change a character and save) and medUI(id) (that character's panel state). */

/* ============================== TABLES ============================== */
const STAB_MODS=[["hospital","Full hospital & surgery",5],["tt","Trauma Team ambulance",3],["cryo","Cryotank / life suspension",3]];
const SURGERY={
  N:{name:"Negligible",where:"Mall clinic or other drop-in bodyshop",hrs:1,dmg:"1",cost:0,dv:10},
  M:{name:"Minor",where:"Medical center or ripperdoc clinic",hrs:2,dmg:"1D6+1",cost:500,dv:15},
  MA:{name:"Major",where:"Full hospital with surgery center",hrs:4,dmg:"2D6+1",cost:1500,dv:20},
  CR:{name:"Critical",where:"Full hospital with surgery center",hrs:6,dmg:"3D6+1",cost:2500,dv:25}};
function surgOf(x){const s=x&&(x.surg||(Array.isArray(x)&&x[4]&&x[4].surg));if(SURGERY[s])return s;const cat=x&&(x.cat||(Array.isArray(x)?x[1]:""));return cat==="Cyberlimbs"?"CR":cat==="Bodysculpt"?"M":"M"}
const RECOVERY=["Light: up and about, with a little pain.",
  "Serious: up and about, but needs dressings changed once a day, and −2 REF to all actions while healing.",
  "Critical: at least half the day in bed to heal at all. Simple tasks only, at −4 REF. Dressings twice a day, and someone to nurse them.",
  "Mortal: bedridden, with constant care. At Mortal 3 and worse, probably comatose half the time and on life support."];
function recoveryText(level){return level?RECOVERY[Math.min(level,4)-1]:"Uninjured."}
const MED_COST={speedheal:1650,nano:1500,ttMonth:500,ttMinute:100};
const BODYBANK=[["Arm",500,1000],["Leg",600,1200],["Heart or lung",700,1400],["Liver or kidney",200,400],["Eye or ear",800,1000],["Other organ",250,500]];

/* ============================== CONDITION ============================== */
function medOf(c){return (c&&c.med)||{}}
function medEnsure(c){if(!c.med||typeof c.med!=="object")c.med={};return c.med}
function medDmg(c){return clamp(Number(c&&c.wounds)||0,0,40)}
// a stabilized patient stays stable until they take another wound
function medStable(c){const m=medOf(c);return !!(m.stab&&medDmg(c)<=(Number(m.stabW)||0))}
function medState(c){const m=medOf(c);const k=calc(c);
  if(m.gone)return {id:"gone",label:"Dead for good",chip:"red"};
  if(m.dead)return {id:"dead",label:`Dead · Death State ${Number(m.ds)||0}`,chip:"red"};
  if(m.dying&&k.level>=4)return {id:"dying",label:"Dying this turn",chip:"red"};
  if(k.level>=4)return medStable(c)?{id:"stable",label:"Stabilized",chip:"amber"}:{id:"mortal",label:"Not stabilized",chip:"red"};
  if(k.level)return m.treat?{id:"healing",label:"Healing",chip:"ink"}:{id:"hurt",label:"Untreated",chip:"amber"};
  return {id:"ok",label:"Uninjured",chip:"green"}}
function medHealedUp(m){m.treat="";m.speedheal=false;m.nano=false;m.carry=0;m.stab=false;m.dying=false}

/* ============================== HEALING ============================== */
function healParts(c){const m=medOf(c);const out=[];if(!m.treat)return {rate:0,parts:out};
  let r=m.treat==="medtech"?1:0.5;out.push([m.treat==="medtech"?"Medical Tech":"First Aid",r]);
  if(m.speedheal){r+=1;out.push(["Speedheal",1])}
  if(m.nano){r+=1;out.push(["Nanotech & tailored antibodies",1])}
  (c.cyber||[]).forEach(x=>{if(Number(x.heal)){r+=Number(x.heal);out.push([x.name,Number(x.heal)])}});
  (c.fx||[]).forEach(f=>{if(Number(f.heal)){r+=Number(f.heal);out.push([f.name,Number(f.heal)])}});
  const x2=(c.cyber||[]).reduce((a,x)=>a*(Number(x.healx)||1),1);if(x2>1){out.push([`Nanosurgeons ×${x2}`,r*(x2-1)]);r*=x2}
  return {rate:Math.round(r*100)/100,parts:out}}
function healRate(c){return healParts(c).rate}
function daysToHeal(c){const r=healRate(c);const w=medDmg(c);if(!w)return 0;if(r<=0)return null;return Math.ceil(Math.max(0,w-(Number(medOf(c).carry)||0))/r-1e-9)}
/* n days pass. Treated patients heal at their rate; untreated ones take 2 points a day from infection and
   shock, and make a daily death save while mortal. Effects that last days count down; shorter ones end. */
function medDays(c,n){const m=medEnsure(c);n=clamp(Math.round(Number(n)||1),1,365);const lines=[];let healed=0,days=0;if(c.adrenalUsed)c.adrenalUsed=0;
  c.fx=(c.fx||[]).filter(f=>f.perm||Number(f.days)>0);
  for(let i=1;i<=n;i++){if(m.dead||m.gone)break;const w=medDmg(c);if(!w){if(m.treat)medHealedUp(m);break}days=i;
    if(!m.treat){const st=medStable(c);c.wounds=clamp(w+2,0,40);if(st)m.stabW=c.wounds;const k=calc(c);let t=`Day ${i}: untreated, so infection and shock do 2 damage (${woundLabel(k.level)}, ${k.w}).`;
      if(k.deathSave!=null){const r=d(10);if(r>k.deathSave){m.dead=true;m.ds=0;m.stab=false;m.dying=false;lines.push(t+` Death save ${r} vs ≤ ${k.deathSave}: dies.`);break}t+=` Death save ${r} vs ≤ ${k.deathSave}: hangs on.`}
      lines.push(t);continue}
    m.carry=(Number(m.carry)||0)+healRate(c);const pts=Math.min(w,Math.floor(m.carry+1e-9));m.carry-=pts;c.wounds=w-pts;healed+=pts;
    if(!c.wounds){lines.push(`Day ${i}: fully healed.`);medHealedUp(m);break}}
  if(healed)lines.unshift(`Healed ${healed} point${healed===1?"":"s"} in ${days} day${days===1?"":"s"} of treatment.`);
  (c.fx||[]).forEach(f=>{if(Number(f.days))f.days=Math.max(0,f.days-n)});
  const gone=(c.fx||[]).filter(f=>!f.perm&&!(Number(f.days)>0)).map(f=>f.name);c.fx=(c.fx||[]).filter(f=>f.perm||Number(f.days)>0);
  if(gone.length)lines.push(`Worn off: ${gone.join(", ")}.`);
  const k=calc(c);lines.push(`Now ${woundLabel(k.level)}${k.w?` (${k.w})`:""}.${m.treat&&k.w?` ${daysToHeal(c)} more day${daysToHeal(c)===1?"":"s"} at ${healRate(c)} a day.`:""}`);
  m.log=[...lines,...(m.log||[])].slice(0,12);return lines}

/* ============================== DRUGS ============================== */
// id, name, Difficulty, what it does (book pg. 110)
const DRUG_EFFECTS=[["ref","Increase REF",15,"+Strength to REF"],["int","Increase INT",15,"+Strength to INT"],["cool","Increase COOL",15,"+Strength to COOL"],
  ["aware","Enhanced perception",15,"+Strength to Awareness checks"],["heal","Increase healing rate",15,"+1 point a day per point of Strength"],["antidote","Antidote",15,"+1 to saves per point of Strength"],
  ["endur","Increased endurance",10,"+Strength to Endurance checks"],["pain","Negate pain",10,"+Strength to Stun saves"],["depress","Depressant",5,"−Strength to Awareness"],
  ["euph","Euphoric",5,"Makes you feel good"],["hallu","Hallucinogenic",10,"Makes you see things"],["stun","Reduce stun",10,"+Strength to Stun saves"],
  ["sopor","Soporific",5,"−Strength to saves against sleep"],["aphro","Aphrodisiac",10,"−Strength to resist Seduction"],["contra","Contraceptive",10,"Male or female"],["antibio","Antibiotic",10,"+Strength to saves against disease"]];
// id, name, points it takes off, what happens
const DRUG_SIDES=[["psych","Psychological addiction",8,"Each hour after the last dose, roll under COOL or be driven to find more. Kicking it is a Very Difficult Endurance check."],
  ["phys","Physiological addiction",10,"Each hour after the last dose, roll under BODY or suffer intense pain and 2D6 damage. Kicking it is a Very Difficult Endurance check."],
  ["death","Death",15,"Every dose needs a death save at −(Strength − 1)."],["lref","Reduced REF",5,"−1 REF per dose while it lasts. Doses stack."],["lint","Reduced INT",5,"−1 INT per dose while it lasts. Doses stack."],
  ["tremor","Tremors",2,"Painful tremors: −2 REF."],["hallu","Hallucinations",5,"Colors, voices, strange shapes: barely able to function."],["para","Paranoia",3,"Drops everything to defend against \"them\"."],
  ["delu","Delusions",5,"Believes untrue things and acts on them."],["steril","Sterility",8,"3 in 10: permanently sterile."],["cancer","Carcinogenic",10,"3 in 10: cancer. 1 point of permanent damage unless cured (Very Difficult Medical Tech)."],
  ["rage","Psychotic rage",10,"Attacks anyone in range."],["aggro","Aggressive behavior",12,"5 in 10: picks a fight with the nearest person."],["fear","Irrational fear",12,"Cowers in near catatonia until it wears off."],
  ["nerve","Nerve degeneration",15,"Severe nerve damage: −2 REF, permanently."]];
const DRUG_DUR=[["turns","1D6+1 turns",1],["minutes","1D6+1 minutes",2],["hours","1D6+1 hours",3]];
// the book's street drugs (pg. 108–109). Their numbers are the book's, not the designer's formula.
const DRUGS=[
  {name:"SynthCoke",type:"Stimulant",str:1,diff:20,cost:1000,dur:"minutes",fx:["endur"],sides:["para","psych"],text:"Synthetic cocaine. Nasty side effects: paranoia and psychological addiction."},
  {name:"Stim",type:"Stimulant",str:3,diff:10,cost:500,dur:"minutes",fx:["endur"],sides:["delu"],text:"Keeps you alert for longer. Side effects include mental delusions."},
  {name:"Syncomp 15",type:"Antidote",str:3,diff:13,cost:650,dur:"turns",fx:["antidote"],sides:["lref"],text:"A broad-spectrum antidote for nerve agents and biotoxins. −1 REF per dose."},
  {name:"Speedheal",type:"Healing drug",str:2,diff:33,cost:1650,dur:"hours",fx:[],sides:[],special:"speedheal",text:"Speeds natural healing by 1 point a day while you're being treated. −1D6/3 REF for a week afterwards."},
  {name:"Boost",type:"INT booster",str:4,diff:12,cost:600,dur:"hours",fx:[],mods:{INT:1},sides:["psych"],text:"+1 INT. An addict gets no boost, and without more within twelve hours: screaming fits and hallucinations."},
  {name:"Blue Glass",type:"Hallucinogenic",str:1,diff:18,cost:900,dur:"minutes",fx:["hallu"],sides:["lint"],special:"glass",text:"A failed bioweapon. Under stress, 3 in 10 that you flash out and stare at the pretty colors. −1 INT per dose."},
  {name:"Smash",type:"Euphoric",str:1,diff:2,cost:17,dur:"minutes",fx:["euph"],sides:["psych"],pack:6,packCost:100,text:"2020's beer: yellow, foamy, in cans (100eb a 6-pack). Fail the addiction save when it wears off and you sink into catatonia."},
  {name:"'Dorph",type:"Pain negation",str:2,diff:5,cost:250,dur:"turns",fx:["pain"],sides:[],special:"dorph",text:"Combat painkiller: +2 to Stun saves. Every dose, a 1 on 1D10 costs you a point of REF for good."},
  {name:"Black Lace",type:"Pain negation",str:3,diff:13,cost:650,dur:"hours",fx:["pain"],mods:{COOL:2},sides:[],special:"lace",text:"Euphoria, adrenal rush and no pain: +2 COOL and resistant to stun. Fail the addiction save (1D10 over BODY) and lose 1D6 EMP. Cyberpsychosis waits."}];
const DRUG_BY_NAME=Object.fromEntries(DRUGS.map(x=>[x.name,x]));
function drugDiff(dr){if(dr.book)return Number(dr.diff)||2;const base=(dr.fx||[]).reduce((a,id)=>a+((DRUG_EFFECTS.find(e=>e[0]===id)||[])[2]||0),0);
  const side=(dr.sides||[]).reduce((a,id)=>a+((DRUG_SIDES.find(e=>e[0]===id)||[])[2]||0),0);
  return Math.max(2,base+clamp(Number(dr.str)||1,1,3)-side)*((DRUG_DUR.find(x=>x[0]===dr.dur)||DRUG_DUR[0])[2])}
function drugCost(dr){return dr.book?Number(dr.cost)||0:drugDiff(dr)*25}
function drugBook(name){const b=DRUG_BY_NAME[name];return b?{...clone(b),book:true}:null}
// skill and save bonuses a drug gives while it runs (the skill check adds them)
const DRUG_SKILL_FX={aware:["Awareness/Notice",1],depress:["Awareness/Notice",-1],endur:["Endurance",1]};
const DRUG_SAVE_FX={antidote:["poison",1],antibio:["disease",1],sopor:["sleep",-1]};
function drugEffects(dr){const s=Number(dr.str)||1;const mods={};let stun=0,heal=0;const notes=[];const skills={},saves={};
  const add=(k,v)=>mods[k]=(mods[k]||0)+v;
  if(dr.mods)for(const [k,v] of Object.entries(dr.mods))add(k,Number(v)||0);
  (dr.fx||[]).forEach(id=>{const e=DRUG_EFFECTS.find(x=>x[0]===id);if(!e)return;
    if(id==="ref"&&!dr.book)add("REF",s);else if(id==="int"&&!dr.book)add("INT",s);else if(id==="cool"&&!dr.book)add("COOL",s);
    else if(id==="pain"||id==="stun")stun+=s;else if(id==="heal")heal+=s;
    else if(DRUG_SKILL_FX[id]){const [sk,m]=DRUG_SKILL_FX[id];skills[sk]=(skills[sk]||0)+m*s}
    else if(DRUG_SAVE_FX[id]){const [sv,m]=DRUG_SAVE_FX[id];saves[sv]=(saves[sv]||0)+m*s}
    else notes.push(e[1]+(e[3]?` (${e[3].replace(/Strength/g,String(s))})`:""))});
  (dr.sides||[]).forEach(id=>{if(id==="lref")add("REF",-1);else if(id==="lint")add("INT",-1);else if(id==="tremor")add("REF",-2);
    else if(!["death","nerve","steril","cancer","aggro"].includes(id)){const e=DRUG_SIDES.find(x=>x[0]===id);if(e)notes.push(e[1])}});
  return {mods,stun,heal,notes,skills,saves}}
function drugSummary(dr){const e=drugEffects(dr);const bits=[...Object.entries(e.mods).map(([k,v])=>`${sgn(v)} ${k}`),e.stun?`${sgn(e.stun)} Stun saves`:"",e.heal?`+${e.heal} healing a day`:"",...fxBonusBits(e),...e.notes].filter(Boolean);
  return bits.join(", ")||"No game effect"}
/* take one dose: rolls the duration and every side effect the book calls for, and starts the effect */
function drugTake(c,dr){const m=medEnsure(c);const k=calc(c);const lines=[];const s=Number(dr.str)||1;
  const unit=(DRUG_DUR.find(x=>x[0]===dr.dur)||DRUG_DUR[0]);const n=d(6)+1;const e=drugEffects(dr);
  const fx={id:uid(),name:dr.name,mods:e.mods,stun:e.stun,heal:e.heal,skills:e.skills,saves:e.saves,until:`${n} ${unit[0]==="turns"?"turns":unit[0]}`,notes:e.notes.join(", "),addict:(dr.sides||[]).filter(x=>x==="psych"||x==="phys")};
  lines.push(`Lasts ${n} ${unit[0]} (1D6+1).`);
  if(dr.special==="speedheal"){m.speedheal=true;const r=Math.ceil(d(6)/3);fx.mods={};fx.until="while healing";
    c.fx=(c.fx||[]).filter(f=>f.name!=="Speedheal: −REF");c.fx.push({id:uid(),name:"Speedheal: −REF",mods:{REF:-r},days:7,until:"1 week",notes:"Side effect of speedheal"});
    lines.push(`Healing +1 a day while you're treated. Side effect: −${r} REF for a week (1D6/3).`)}
  if(dr.special==="dorph"){const r=d(10);if(r===1){c.statLoss=c.statLoss||{};c.statLoss.REF=(Number(c.statLoss.REF)||0)+1;lines.push(`Nerve damage roll 1D10 = 1: lose 1 REF permanently.`)}else lines.push(`Nerve damage roll 1D10 = ${r}: no harm done.`)}
  if(dr.special==="lace"){const r=d(10);if(r>k.eff.BODY){const loss=d(6);c.humanityAdj=(Number(c.humanityAdj)||0)-loss*10;lines.push(`Addiction save 1D10 = ${r} vs BODY ${k.eff.BODY}: failed. Lose ${loss} EMP (1D6). Treat it like cyberpsychosis.`)}else lines.push(`Addiction save 1D10 = ${r} vs BODY ${k.eff.BODY}: resisted.`)}
  if(dr.special==="glass")lines.push("Under stress, roll 1D10: 1–3 and you flash out.");
  (dr.sides||[]).forEach(id=>{const r=d(10);
    if(id==="death"){const need=(k.deathSave!=null?k.deathSave:k.eff.BODY)-(s-1);if(r>need){m.dying=true;lines.push(`Death save ${r} vs ≤ ${need}: fails. Dies at the end of the turn unless stabilized.`)}else lines.push(`Death save ${r} vs ≤ ${need}: survives.`)}
    if(id==="nerve"){c.statLoss=c.statLoss||{};c.statLoss.REF=(Number(c.statLoss.REF)||0)+2;lines.push("Nerve degeneration: −2 REF, permanently.")}
    if(id==="steril")lines.push(r<=3?`Sterility (1D10 = ${r}): permanently sterile.`:`Sterility (1D10 = ${r}): no effect.`);
    if(id==="cancer")lines.push(r<=3?`Carcinogenic (1D10 = ${r}): develops cancer. 1 point of permanent damage unless cured.`:`Carcinogenic (1D10 = ${r}): no cancer.`);
    if(id==="aggro")lines.push(r<=5?`Aggression (1D10 = ${r}): picks a fight with the nearest person.`:`Aggression (1D10 = ${r}): keeps it together.`)});
  if(fx.addict.length)lines.push(`Addictive: an hourly ${fx.addict.map(x=>x==="psych"?"COOL":"BODY").join(" and ")} check after the last dose.`);
  if(Object.keys(fx.mods).length||fx.stun||fx.heal||fx.notes||Object.keys(fx.skills).length||Object.keys(fx.saves).length||dr.special!=="speedheal")c.fx=[...(c.fx||[]),fx];
  return lines}
function drugCarried(c){return (c.gear||[]).filter(g=>g.drug&&(Number(g.qty)||0)>0)}

/* ============================== BODYSHOP ============================== */
// name, cost, kind, extra
const BODYSHOP=[
  ["Appearance change: passable",1200,"look",{dv:15,note:"An Average (15) Notice check spots the sculpt."}],
  ["Appearance change: convincing",2400,"look",{dv:20,note:"A Difficult (20) Notice check spots the sculpt."}],
  ["Appearance change: exact",3600,"look",{dv:25,note:"A Very Difficult (25) Notice check spots the sculpt."}],
  ["Appearance change: perfect",5000,"look",{dv:30,note:"A Nearly Impossible (30) Notice check spots the sculpt."}],
  ["Bodysculpt: +1 ATTR",600,"attr",{note:"600eb for every point of Attractiveness."}],
  ["Exotic: facial sculpt",5000,"exotic",{note:"Vat-grown muzzle, whiskers, animal ears, mane or cat eyes."}],
  ["Exotic: tail",3000,"exotic",{note:"Vat-grown and nerve-linked. Furred, scaled or bare. Lifts about half a pound."}],
  ["Exotic: hooves, claws or paws",8000,"exotic",{mods:{REF:-2},note:"Not as dexterous as fingers: −2 REF."}],
  ["Exotic: skin alteration",10000,"exotic",{cancer:true,note:"Patterned fur, light scales or exotic colors. 1 in 10 that it turns into skin cancer."}],
  ...BODYBANK.map(([n,,sale])=>[`Body bank: ${n.toLowerCase()}`,sale,"part",{note:"Roll 1D10: 1–3 not in today; 4–5 in, but a different color or another small mismatch."}]),
  ...BODYBANK.map(([n,,sale])=>[`Vat-grown: ${n.toLowerCase()}`,sale*2,"vat",{note:"Grown to match your genes. Twice the body bank price."}]),
  ["Body bank storage for a limb (a month)",100,"store",{note:"Keeps your meat limb on ice. 20% chance it's sold for parts anyway."}],
  ["Secure body bank storage (a month)",200,"store",{note:"5% chance it's sold for parts."}],
  ["Trauma Team account (a month)",500,"tt",{note:"Paid in advance each month: Trauma Team comes for you and the bill is covered."}],
  ["Nanotech treatment",1500,"nano",{note:"Nanotech and tailored antibodies: +1 healing a day while you're treated. Only 1 hospital in 10 has it."}]];
function bodyshopNote(i){const r=BODYSHOP[i];return r?r[3].note||"":""}

/* ============================== SHARED PANELS ============================== */
function medBtn(c,act,label,extra="",cls="btn sm"){return `<button class="${cls}" data-act="${act}" data-id="${esc(c.id)}" ${extra}>${label}</button>`}
function medCondHTML(c,k,ctx){const m=medOf(c);const s=medState(c);const ed=ctx.ed;
  let body=`<div class="med-state"><span class="chip ${s.chip}">${esc(s.label)}</span><span class="mono">${woundLabel(k.level)} · ${k.w} damage</span></div>`;
  if(s.id==="mortal")body+=`<p class="med-p">Mortal: a death save every turn (≤ ${k.deathSave}) until someone stabilizes ${ctx.gm?"them":"you"}. That takes TECH + First Aid or Medical Tech + 1D10 of at least ${k.w}.</p>${ctx.gm&&ed?medBtn(c,"med-dying","Failed a death save","","btn sm ghost"):""}`;
  if(s.id==="dying")body+=`<p class="med-p">Failed a death save: dies at the end of this turn unless someone stabilizes them now.</p>${ed?medBtn(c,"med-die","End of turn: dead","","btn sm danger"):""}`;
  if(s.id==="stable")body+=`<p class="med-p">Stabilized at ${k.w} damage: no more death saves unless they take another wound. Now they need treatment to heal.</p>`;
  if(s.id==="dead"){const ds=Number(m.ds)||0;body+=`<p class="med-p">Clinically dead. Death State rises by 2 for every minute (six turns). To revive, roll 1D10 over the Death State (${ds}) when the Trauma Team or a medtech gets to them. At Death State 10 they're gone for good.</p>
    ${ed?`<div class="row" style="gap:6px">${medBtn(c,"med-min","+1 minute (+2)")}${medBtn(c,"med-revive",`Revive: 1D10 over ${ds}`,"","btn sm primary")}</div>`:""}`}
  if(s.id==="gone")body+=`<p class="med-p">Past saving. A candidate for the Body Bank.</p>${ctx.gm?medBtn(c,"med-undead","Undo (GM)","","btn sm ghost"):""}`;
  if(k.level&&!["dead","gone"].includes(s.id))body+=`<p class="faint med-p">While healing · ${esc(recoveryText(k.level))}</p>`;
  if(m.dead&&ctx.gm)body+=`<div class="row" style="gap:6px">${medBtn(c,"med-undead","Undo death (GM)","","btn sm ghost")}</div>`;
  return `<section class="panel"><div class="panel-h"><h3>Condition</h3></div><div class="panel-b">${body}</div></section>`}
function medMedicParts(c,k,u){const t=k.eff.TECH;const fa=skillLevel(c,"First Aid"),mt=skillLevel(c,"Medical Tech");return {t,fa,mt}}
function medTreatHTML(c,k,ctx){const m=medOf(c);const u=ctx.u;const ed=ctx.ed;const self=!ctx.gm&&u.who==="self";const p=medMedicParts(c,k);
  const advs=new Set(u.adv||[]);const advB=STAB_MODS.reduce((a,x)=>a+(advs.has(x[0])?x[2]:0),0);const mortal=k.level>=4&&!medStable(c)&&!m.dead&&!m.gone;
  const who=ctx.gm?"":`<div class="row" style="gap:8px"><span class="label">Who's treating</span><span class="seg">${[["other","Someone else"],["self","Me"]].map(([v,l])=>`<button class="${(u.who||"other")===v?"on":""}" data-act="med-who" data-id="${esc(c.id)}" data-v="${v}">${l}</button>`).join("")}</span></div>`;
  const tot=self?`<p class="faint med-p">TECH ${p.t} + First Aid ${p.fa} = ${p.t+p.fa}. You can give yourself first aid, but you can't stabilize yourself or use Medical Tech on yourself.</p>`
    :`<label class="row" style="gap:6px"><span class="label">Medic's TECH + skill</span><input type="number" min="0" max="40" data-medui="tot" data-id="${esc(c.id)}" value="${esc(u.tot??"")}" style="width:72px" placeholder="—" aria-label="Medic's TECH plus First Aid or Medical Tech"></label>`;
  const advH=`<div class="row" style="gap:6px;flex-wrap:wrap"><span class="label">Advantages</span>${STAB_MODS.map(([id,l,v])=>`<button class="chipbtn ${advs.has(id)?"on":""}" data-act="med-adv" data-id="${esc(c.id)}" data-v="${id}" aria-pressed="${advs.has(id)}">${l} +${v}</button>`).join("")}</div>`;
  const cur=m.treat?`<p class="med-p">Treated with <b>${m.treat==="medtech"?"Medical Tech":"First Aid"}</b>.${ed?` <button class="linkish" data-act="med-untreat" data-id="${esc(c.id)}">Clear</button>`:""}</p>`:k.w?`<p class="med-p faint">No successful treatment yet: they get 2 points worse every day. One roll a day until it works.</p>`:"";
  const btns=ed&&k.w&&!m.dead&&!m.gone?`<div class="row" style="gap:6px;flex-wrap:wrap">
    ${mortal?medBtn(c,"med-stab",`Stabilize: need ${k.w}+`,self?'disabled title="You can&#39;t stabilize yourself"':"","btn sm primary"):""}
    ${m.treat!=="medtech"&&m.treat!=="first"?medBtn(c,"med-treat",`First Aid: beat ${k.w}`,`data-s="first"`):""}
    ${m.treat!=="medtech"?medBtn(c,"med-treat",`Medical Tech: beat ${k.w}`,`data-s="medtech" ${self?'disabled title="Not on yourself"':""}`):""}</div>`:"";
  return `<section class="panel"><div class="panel-h"><h3>Treatment</h3>${advB?`<span class="faint mono" style="font-size:12px">+${advB} to stabilize</span>`:""}</div><div class="panel-b med-grid">
    ${k.w||m.dead?`${who}${tot}${mortal?advH:""}${btns}${cur}`:`<p class="faint med-p">Not hurt. Nothing to treat.</p>`}</div></section>`}
function medHealHTML(c,k,ctx){const m=medOf(c);const u=ctx.u;const ed=ctx.ed;const hp=healParts(c);const dt=daysToHeal(c);
  const parts=hp.parts.length?`<div class="med-rate">${hp.parts.map(([n,v])=>`<span>${esc(n)} <b>+${Math.round(v*100)/100}</b></span>`).join("")}</div>`:"";
  const rate=m.treat?`<p class="med-p"><b class="num">${hp.rate}</b> point${hp.rate===1?"":"s"} a day${dt?` · fully healed in <b>${dt}</b> day${dt===1?"":"s"}`:""}.</p>`:k.w?`<p class="med-p">Untreated: <b>2 points worse a day</b>${k.level>=4?", and a death save each day":""}.</p>`:"";
  const extra=ed&&m.treat&&k.w?`<div class="row" style="gap:6px;flex-wrap:wrap">${m.speedheal?`<span class="chip ink">Speedheal</span>`:medBtn(c,"med-speed",`Speedheal (${fmtEb(MED_COST.speedheal)})`)}${m.nano?`<span class="chip ink">Nanotech</span>`:medBtn(c,"med-nano",`Nanotech (${fmtEb(MED_COST.nano)})`,`title="Only 1 hospital in 10 has it"`)}</div>`:"";
  const days=ed&&(k.w||(c.fx||[]).some(f=>Number(f.days)))&&!m.dead&&!m.gone?`<div class="row" style="gap:6px;flex-wrap:wrap"><span class="label">Time passes</span>${medBtn(c,"med-days","1 day",`data-n="1"`)}${medBtn(c,"med-days","1 week",`data-n="7"`)}<input type="number" min="1" max="365" data-medui="days" data-id="${esc(c.id)}" value="${esc(u.days||"")}" style="width:64px" placeholder="days" aria-label="Days">${medBtn(c,"med-days","Go")}</div>`:"";
  const log=(m.log||[]).length?`<ul class="med-log">${m.log.slice(0,6).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:"";
  return `<section class="panel"><div class="panel-h"><h3>Healing</h3></div><div class="panel-b med-grid">${rate||`<p class="faint med-p">Nothing to heal.</p>`}${parts}${extra}${days}${log}</div></section>`}
function medTTHTML(c,k,ctx){const m=medOf(c);const ed=ctx.ed;const cov=m.tt||"";
  const sel=`<label class="row" style="gap:6px"><span class="label">Coverage</span><select data-act-change="med-ttcov" data-id="${esc(c.id)}" ${ed?"":"disabled"}><option value="" ${!cov?"selected":""}>None: 100eb a minute</option><option value="account" ${cov==="account"?"selected":""}>TT account (500eb a month)</option><option value="corp" ${cov==="corp"?"selected":""}>Corporate group policy</option></select></label>`;
  const call=m.ttEta?`<p class="med-p">Called: the AV-4 arrives in <b>${m.ttEta}</b> minute${m.ttEta===1?"":"s"} (1D6+1).${cov?" Covered.":` Billed 100eb a minute from the call until they hand you to a hospital.`}${m.dead?` Death State then: about ${Math.min(10,(Number(m.ds)||0)+2*m.ttEta)}.`:""}</p>`:"";
  const btns=ed?`<div class="row" style="gap:6px;flex-wrap:wrap">${m.ttEta?medBtn(c,"med-ttarrive","They're here"):medBtn(c,"med-ttcall","Call Trauma Team","","btn sm danger")}${m.ttBill?medBtn(c,"med-ttbill",`Pay the bill (${m.ttBill} min · ${fmtEb(m.ttBill*MED_COST.ttMinute)})`):""}${cov==="account"?medBtn(c,"med-ttpay",`Pay this month (${fmtEb(MED_COST.ttMonth)})`,"","btn sm ghost"):""}</div>`:"";
  return `<section class="panel"><div class="panel-h"><h3>Trauma Team™</h3></div><div class="panel-b med-grid">${sel}${call}${btns}<p class="faint med-p">Dial 911 or bend a Trauma card. They arrive within 1D6+1 minutes, secure the area, and stabilize with +3. Not obliged to take you to a hospital.</p></div></section>`}
function medFxHTML(c,ctx){const fx=c.fx||[];if(!fx.length)return "";
  return `<div class="med-fx">${fx.map(f=>{const bits=[...Object.entries(f.mods||{}).map(([k,v])=>`${sgn(v)} ${k}`),f.stun?`${sgn(f.stun)} Stun saves`:"",f.heal?`+${f.heal} healing a day`:"",...fxBonusBits(f),f.notes||""].filter(Boolean).join(", ");
    return `<div class="it"><div style="min-width:0"><div class="t">${esc(f.name)}</div><div class="m">${esc(bits||"No game effect")}${f.until?` · ${esc(f.until)}${Number(f.days)?` (${f.days} day${f.days===1?"":"s"} left)`:""}`:""}</div></div>
      ${ctx.ed?`<div class="row" style="gap:4px">${(f.addict||[]).map(a=>medBtn(c,"med-crave",a==="psych"?"COOL check":"BODY check",`data-fid="${esc(f.id)}" data-v="${a}"`,"btn sm ghost")).join("")}${medBtn(c,"med-fxoff","Wore off",`data-fid="${esc(f.id)}"`,"btn sm ghost")}</div>`:""}</div>`}).join("")}</div>`}

/* ============================== SHARED ACTIONS ============================== */
function medTot(c,u,kind){if(u.who==="self"){const k=calc(c);const p=medMedicParts(c,k);return {base:p.t+p.fa,who:whoOf(c)}}
  const v=u.tot;if(v===""||v==null||isNaN(Number(v)))return null;return {base:clamp(Number(v),0,40),who:"Medic"}}
function whoOf(c){return c.handle||c.name||"Runner"}
function medRoll(label,base,need,mode,who,extra=""){const r=d10x();const sum=r.reduce((a,b)=>a+b,0);const tot=base+sum;const ok=mode==="ge"?tot>=need:tot>need;
  const e=Dice.raw(label,`${base} + D10 (${r.join("+")}) = ${tot} vs ${mode==="ge"?"":"over "}${need}${extra}`,tot,who,[{t:ok?"Success":"Failed",c:ok?"green":"red"}]);return {ok,tot,e}}
Object.assign(A,{
  "med-who":el=>{const u=medUI(el.dataset.id);u.who=el.dataset.v;render()},
  "med-adv":el=>{const u=medUI(el.dataset.id);const s=new Set(u.adv||[]);s.has(el.dataset.v)?s.delete(el.dataset.v):s.add(el.dataset.v);u.adv=[...s];render()},
  "med-stab":el=>medEdit(el.dataset.id,c=>{const u=medUI(c.id);if(u.who==="self"){showNotice("You can't stabilize yourself.");return}const t=medTot(c,u);if(!t){showNotice("Fill in the medic's TECH + First Aid or Medical Tech.");return}
    const adv=STAB_MODS.filter(x=>(u.adv||[]).includes(x[0]));const b=adv.reduce((a,x)=>a+x[2],0);const w=medDmg(c);
    const r=medRoll(`Stabilize ${whoOf(c)}`,t.base+b,w,"ge",t.who,adv.length?` (${adv.map(x=>x[1]+" +"+x[2]).join(", ")})`:"");const m=medEnsure(c);
    if(r.ok){m.stab=true;m.stabW=w;m.dying=false;m.log=[`Stabilized at ${w} damage (${r.tot} vs ${w}).`,...(m.log||[])].slice(0,12)}else m.log=[`Stabilization failed (${r.tot} vs ${w}).`,...(m.log||[])].slice(0,12)}),
  "med-treat":el=>medEdit(el.dataset.id,c=>{const u=medUI(c.id);const s=el.dataset.s;if(s==="medtech"&&u.who==="self"){showNotice("You can't use Medical Tech on yourself.");return}
    const t=medTot(c,u);if(!t){showNotice("Fill in the medic's TECH + skill.");return}const w=medDmg(c);
    const r=medRoll(`${s==="medtech"?"Medical Tech":"First Aid"} on ${whoOf(c)}`,t.base,w,"gt",t.who);const m=medEnsure(c);
    if(r.ok){m.treat=m.treat==="medtech"?"medtech":s;m.log=[`${s==="medtech"?"Medical Tech":"First Aid"} worked (${r.tot} vs ${w}): healing ${healRate(c)} a day.`,...(m.log||[])].slice(0,12)}
    else m.log=[`${s==="medtech"?"Medical Tech":"First Aid"} failed (${r.tot} vs ${w}). Try again tomorrow.`,...(m.log||[])].slice(0,12)}),
  "med-untreat":el=>medEdit(el.dataset.id,c=>{const m=medEnsure(c);m.treat="";m.carry=0}),
  "med-speed":el=>medEdit(el.dataset.id,c=>{if(!medPay(c,MED_COST.speedheal,"speedheal"))return;const lines=drugTake(c,drugBook("Speedheal"));Dice.raw(`${whoOf(c)} takes speedheal`,lines.join(" "),"",whoOf(c));const m=medEnsure(c);m.log=[...lines,...(m.log||[])].slice(0,12)}),
  "med-nano":el=>medEdit(el.dataset.id,c=>{const r=d(10);if(r!==1){Dice.raw("Nanotech: does this hospital have it?",`1D10 = ${r}: no (only 1 in 10 do). Try another hospital.`,r,whoOf(c),[{t:"Not here",c:"amber"}]);return}
    if(!medPay(c,MED_COST.nano,"nanotech"))return;medEnsure(c).nano=true;Dice.raw("Nanotech: does this hospital have it?",`1D10 = 1: yes. +1 healing a day.`,r,whoOf(c),[{t:"Available",c:"green"}])}),
  "med-days":el=>medEdit(el.dataset.id,c=>{const u=medUI(c.id);const n=Number(el.dataset.n||u.days)||1;const lines=medDays(c,n);Dice.raw(`${whoOf(c)}: ${n} day${n===1?"":"s"} pass`,lines.join(" "),"",whoOf(c))}),
  "med-dying":el=>medEdit(el.dataset.id,c=>{medEnsure(c).dying=true}),
  "med-die":el=>medEdit(el.dataset.id,c=>{const m=medEnsure(c);m.dead=true;m.ds=0;m.dying=false;m.stab=false;Dice.raw(`${whoOf(c)} dies`,"Death State 0. It rises by 2 a minute.","",whoOf(c),[{t:"Dead",c:"red"}])}),
  "med-min":el=>medEdit(el.dataset.id,c=>{const m=medEnsure(c);m.ds=Math.min(10,(Number(m.ds)||0)+2);if(m.ds>=10){m.gone=true;m.dead=false}}),
  "med-revive":el=>medEdit(el.dataset.id,c=>{const m=medEnsure(c);const ds=Number(m.ds)||0;const r=d(10);const ok=r>ds;
    Dice.raw(`Revive ${whoOf(c)}`,`1D10 = ${r} vs over Death State ${ds}: ${ok?`revived, and stabilized at ${medDmg(c)} damage`:"can't be brought back. A candidate for the Body Bank"}`,r,whoOf(c),[{t:ok?"Revived":"Gone",c:ok?"green":"red"}]);
    if(ok){m.dead=false;m.ds=0;m.stab=true;m.stabW=medDmg(c)}else{m.dead=false;m.gone=true}}),
  "med-undead":el=>medEdit(el.dataset.id,c=>{const m=medEnsure(c);m.dead=false;m.gone=false;m.ds=0;m.dying=false}),
  "med-ttcall":el=>medEdit(el.dataset.id,c=>{const m=medEnsure(c);m.ttEta=d(6)+1;Dice.raw(`${whoOf(c)} calls Trauma Team`,`The AV-4 arrives in 1D6+1 = ${m.ttEta} minutes.`,m.ttEta,whoOf(c))}),
  "med-ttarrive":el=>medEdit(el.dataset.id,c=>{const m=medEnsure(c);const u=medUI(c.id);const s=new Set(u.adv||[]);s.add("tt");u.adv=[...s];
    m.ttBill=m.tt?0:(Number(m.ttEta)||0)+4;m.ttEta=0;showNotice(m.dead?"Trauma Team is here. Roll to revive.":"Trauma Team is here: +3 to stabilize.")}),
  "med-ttbill":el=>medEdit(el.dataset.id,c=>{const m=medEnsure(c);const mins=Number(m.ttBill)||0;medPay(c,mins*MED_COST.ttMinute,"the Trauma Team bill",true);Dice.raw(`${whoOf(c)} pays Trauma Team`,`${mins} minutes × 100eb = ${fmtEb(mins*MED_COST.ttMinute)}`,"",whoOf(c));m.ttBill=0}),
  "med-ttpay":el=>medEdit(el.dataset.id,c=>{medPay(c,MED_COST.ttMonth,"this month's Trauma Team premium",true)}),
  "med-fxoff":el=>medEdit(el.dataset.id,c=>{c.fx=(c.fx||[]).filter(f=>f.id!==el.dataset.fid)}),
  "med-crave":el=>medEdit(el.dataset.id,c=>{const f=(c.fx||[]).find(x=>x.id===el.dataset.fid);const k=calc(c);const psych=el.dataset.v==="psych";const need=psych?k.eff.COOL:k.eff.BODY;const r=d(10);const ok=r<need;
    let t=`1D10 = ${r} vs under ${psych?"COOL":"BODY"} ${need}: ${ok?"holds out for another hour":psych?"anxiety, fear and depression: has to find more":"withdrawal"}`;
    if(!ok&&!psych){const dm=d(6)+d(6);c.wounds=clamp(medDmg(c)+dm,0,40);t+=`, takes ${dm} damage (2D6)`}
    Dice.raw(`${whoOf(c)}: ${f?f.name:"drug"} craving`,t+".",r,whoOf(c),[{t:ok?"Holds out":"Craving",c:ok?"green":"red"}])}),
});
Object.assign(CHANGE,{"med-ttcov":el=>medEdit(el.dataset.id,c=>{medEnsure(c).tt=el.value})});
document.addEventListener("input",ev=>{const el=ev.target;if(el.dataset&&el.dataset.medui&&typeof medUI==="function"){medUI(el.dataset.id)[el.dataset.medui]=el.value}});
// pays from the character's cash unless the app is adding things for free; false if they can't afford it
function medPay(c,cost,what,always){if(!always&&typeof ui!=="undefined"&&ui.shopFree)return true;if((Number(c.eb)||0)<cost&&!always){showNotice(`Not enough cash for ${what} (${fmtEb(cost)}).`);return false}c.eb=(Number(c.eb)||0)-cost;return true}

/* ============================== REFERENCE ============================== */
function medRefTables(t){return `
  ${t("Stabilization",["Roll","Rule"],[["Who","Anyone but the patient"],["Roll","TECH + First Aid or Medical Tech + 1D10 ≥ total damage"],...STAB_MODS.map(x=>[x[1],"+"+x[2]]),["After","No more death saves until another wound"]])}
  ${t("Death State",["Step","Rule"],[["Death save","1D10 ≤ BODY − Mortal level, every turn until stabilized"],["Fail","Dies at the end of that turn"],["Death State","+2 for every minute dead"],["Revive","1D10 over the Death State: stabilized at their last wound state"],["Death State 10","Gone for good"]])}
  ${t("Healing rates",["Treatment","Points a day"],[["None","−2 a day (and a daily death save while mortal)"],["First Aid","0.5"],["Medical Tech","1"],["Medical Tech + speedheal","2"],["Medical Tech + nanotech","2"],["Medical Tech + both","3"],["Enhanced antibodies","+1"],["Nanosurgeons","×2"]])}
  ${t("Treatment checks",["Check","Rule"],[["First Aid","TECH + First Aid + 1D10 over the damage. Can be done on yourself"],["Medical Tech","TECH + Medical Tech + 1D10 over the damage. Not on yourself"],["Failed","No healing. One new try a day"],["Speedheal","1,650eb · −1D6/3 REF for a week"],["Nanotech","1,500eb · 1 hospital in 10"]])}
  ${t("Surgery codes",["Code","Where","Time","Damage","Cost","Diff"],Object.entries(SURGERY).map(([k,s])=>[`${k} · ${s.name}`,s.where,s.hrs+" hr",s.dmg,s.cost?fmtEb(s.cost):"With installation",s.dv]))}
  ${t("Body bank",["Part","Bounty","Sale price"],[...BODYBANK.map(([n,b,s])=>[n,fmtEb(b),fmtEb(s)]),["Poor / excellent condition","½ / ×2 bounty",""],["Vat-grown","","×2"],["Finding a part","1D10: 1–3 not in today · 4–5 small mismatch",""]])}
  ${t("Bodysculpting",["Job","Cost"],BODYSHOP.filter(x=>x[2]==="look"||x[2]==="attr"||x[2]==="exotic").map(x=>[esc(x[0].replace(/^(Exotic|Bodysculpt|Appearance change): /,"")),fmtEb(x[1])]))}
  ${t("Trauma Team",["","Rule"],[["Arrives","Within 1D6+1 minutes"],["Fees","100eb a minute, or a 500eb monthly account"],["Ambulance","+3 to stabilize, with a cryotank"]])}
  ${t("Street drugs",["Drug","Str","Diff","Cost","Lasts"],DRUGS.map(x=>[`${esc(x.name)} (${esc(x.type)})`,"+"+x.str,x.diff,x.pack?`${fmtEb(x.packCost)} / ${x.pack}`:fmtEb(x.cost),(DRUG_DUR.find(y=>y[0]===x.dur)||[])[1]]))}
  ${t("Drug designer: effects",["Effect","Diff"],DRUG_EFFECTS.map(x=>[`${x[1]}${x[3]?` (${x[3]})`:""}`,x[2]]))}
  ${t("Drug designer: side effects",["Side effect","Takes off"],DRUG_SIDES.map(x=>[x[1],"−"+x[2]]))}
  ${t("Drug designer: totals",["Step","Rule"],[["Difficulty","(effects + Strength 1–3 − side effects, at least 2) × duration"],["Duration","1D6+1 turns ×1 · minutes ×2 · hours ×3"],["Cost","Difficulty × 25eb a dose"],["Making it","TECH + Pharmaceuticals + 1D10 vs the Difficulty"]])}`}

/* ============================== BONUSES TO ONE SKILL OR SAVE (1.1.4) ==============================
   Running effects can add to a single skill (Stim's Endurance, enhanced perception's Awareness) or to saves
   against poison, disease or sleep. Toxin binders give +4 against poison and drugs, nasal filters +4 against gas. */
const SAVE_NAMES={poison:"poison and drugs",disease:"disease",sleep:"sleep drugs",gas:"gas"};
function fxBonusBits(f){return [...Object.entries(f.skills||{}).map(([k,v])=>`${sgn(v)} ${k}`),...Object.entries(f.saves||{}).map(([k,v])=>`${sgn(v)} saves vs ${SAVE_NAMES[k]||k}`)]}
function fxSkillBonus(c,name){const parts=[];(c&&c.fx||[]).forEach(f=>{const v=Number((f.skills||{})[name]);if(v)parts.push([f.name,v])});return {total:parts.reduce((a,p)=>a+p[1],0),parts}}
function saveBonus(c,kind){const parts=[];(c.fx||[]).forEach(f=>{const v=Number((f.saves||{})[kind]);if(v)parts.push([f.name,v])});
  (c.cyber||[]).filter(x=>!x.off).forEach(x=>{const n=x.name||"";if(/^Toxin binders/i.test(n)&&(kind==="poison"||kind==="gas"))parts.push(["Toxin binders",4]);if(/^Nasal filters/i.test(n)&&kind==="gas")parts.push(["Nasal filters",4])});
  return {total:parts.reduce((a,p)=>a+p[1],0),parts}}
/* a save against poison, drugs, gas, disease or sleep: 1D10 at or under BODY plus bonuses; a success halves a poison's damage */
function medSaveRoll(c,kind){const k=calc(c);const b=saveBonus(c,kind);const need=k.eff.BODY+b.total;const r=d(10);const ok=r<=need;
  return Dice.raw(`${whoOf(c)}: save vs ${SAVE_NAMES[kind]||kind}`,`1D10 = ${r} vs ≤ BODY ${k.eff.BODY}${b.parts.map(p=>` ${sgn(p[1])} ${p[0]}`).join("")} = ${need}: ${ok?"resists (poison damage halved)":"fails"}.`,r,whoOf(c),[{t:ok?"Resists":"Fails",c:ok?"green":"red"}])}
function medSavesHTML(c,ctx){if(!ctx.ed)return "";const kinds=["poison","gas","disease","sleep"];
  return `<div class="row" style="gap:6px;flex-wrap:wrap"><span class="label">Saves</span>${kinds.map(k=>{const b=saveBonus(c,k).total;return medBtn(c,"med-save",`vs ${SAVE_NAMES[k]}${b?` (${sgn(b)})`:""}`,`data-v="${k}"`,"btn sm ghost")}).join("")}</div>`}
Object.assign(A,{"med-save":el=>medEdit(el.dataset.id,c=>{medSaveRoll(c,el.dataset.v)})});
