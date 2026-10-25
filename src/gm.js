
/* ============================== CYBERPUNK 2020: GM SCREENS ==============================
   NPCs, the encounter tracker, the runner view, awards, the rules reference and NPC cards.
   The campaign list, party list, map, hosting and backups are Monolith's. */
/* ============================== NPC TEMPLATES ============================== */
const NPC_TEMPLATES=[
 {id:"t-booster",name:"Boostergang punk",type:"Gang",stats:{INT:4,REF:6,TECH:4,COOL:5,ATTR:4,LUCK:4,MA:6,BODY:6,EMP:3},skills:[["Brawling",4],["Melee",4],["Handgun",3],["Awareness/Notice",3],["Intimidate",4],["Streetwise",3]],weapons:["BudgetArms Auto 3","Knife"],armor:{torso:4,rarm:4,larm:4},init:0,notes:"Cheap chrome, cheaper loyalty. Runs once Seriously wounded."},
 {id:"t-boss",name:"Gang boss",type:"Gang",stats:{INT:6,REF:8,TECH:5,COOL:8,ATTR:5,LUCK:5,MA:7,BODY:8,EMP:4},skills:[["Handgun",6],["Brawling",6],["Melee",5],["Intimidate",6],["Leadership",5],["Awareness/Notice",5]],weapons:["Armalite 44","Knife"],armor:{torso:14,rarm:14,larm:14},init:1,notes:"Kerenzikov +1. Surrounded by 2–6 punks."},
 {id:"t-corpsec",name:"Corporate security",type:"Corporate",stats:{INT:5,REF:7,TECH:5,COOL:6,ATTR:5,LUCK:5,MA:6,BODY:7,EMP:5},skills:[["Handgun",5],["Submachinegun",5],["Awareness/Notice",5],["Brawling",4],["Athletics",4]],weapons:["Arasaka Minami 10","Militech Arms Avenger"],armor:{head:20,torso:14,rarm:14,larm:14},init:0,notes:"Calls backup on the first shot. Response in 1D6+2 turns."},
 {id:"t-cop",name:"Street cop",type:"Law",stats:{INT:5,REF:6,TECH:5,COOL:6,ATTR:5,LUCK:5,MA:6,BODY:6,EMP:5},skills:[["Handgun",5],["Awareness/Notice",5],["Brawling",4],["Melee",4],["Human Perception",4],["Driving",4]],weapons:["Federated Arms X-9mm","Club / bat"],armor:{torso:10},init:0,notes:"Usually in pairs. Radios dispatch before engaging."},
 {id:"t-maxtac",name:"MaxTac officer",type:"Law",stats:{INT:6,REF:9,TECH:6,COOL:9,ATTR:5,LUCK:6,MA:7,BODY:9,EMP:3},skills:[["Rifle",7],["Handgun",7],["Awareness/Notice",7],["Martial Art",5],["Athletics",6]],weapons:["FN-RAL Heavy Assault","Colt AMT Model 2000"],armor:{head:25,torso:25,rarm:25,larm:25,rleg:25,lleg:25},init:2,notes:"Psycho squad. Heavily chromed, AV support nearby."},
 {id:"t-psycho",name:"Cyberpsycho",type:"Threat",stats:{INT:5,REF:10,TECH:4,COOL:10,ATTR:3,LUCK:5,MA:8,BODY:11,EMP:0},skills:[["Melee",7],["Brawling",7],["Rifle",6],["Handgun",6],["Athletics",6]],weapons:[{name:"Wolvers",type:"MEL",wa:0,dmg:"3D6",rof:"1",rel:"VR",range:"1m"},"Arasaka Rapid Assault 12"],armor:{head:12,torso:24,rarm:12,larm:12,rleg:12,lleg:12},init:3,notes:"Skinweave + flak vest. Pain editor: ignores stun saves until Mortal."},
 {id:"t-ninja",name:"Corporate assassin",type:"Corporate",stats:{INT:7,REF:10,TECH:5,COOL:9,ATTR:6,LUCK:6,MA:8,BODY:7,EMP:4},skills:[["Martial Art",7],["Stealth",8],["Melee",7],["Handgun",6],["Awareness/Notice",6]],weapons:["Monokatana","Sternmeyer Type 35"],armor:{torso:10},init:2,notes:"Strikes from ambush. Withdraws if the target is protected."},
 {id:"t-merc",name:"Solo merc",type:"Street",stats:{INT:6,REF:8,TECH:5,COOL:7,ATTR:5,LUCK:5,MA:7,BODY:8,EMP:4},skills:[["Rifle",6],["Handgun",6],["Awareness/Notice",6],["Athletics",5],["Brawling",5],["Combat Sense",4]],weapons:["AKR-20 Medium Assault","Militech Arms Avenger"],armor:{head:14,torso:18,rarm:18,larm:18},init:1,notes:"Professional. Retreats when the job stops paying."},
 {id:"t-runner",name:"Netrunner",type:"Street",stats:{INT:9,REF:6,TECH:7,COOL:6,ATTR:5,LUCK:6,MA:5,BODY:4,EMP:5},skills:[["Interface",6],["Programming",6],["System Knowledge",6],["Awareness/Notice",4],["Handgun",2]],weapons:["Dai Lung Cybermag 15"],armor:{},init:0,notes:"Jacked in from a van or a safe room nearby."},
 {id:"t-fixer",name:"Fixer",type:"Street",stats:{INT:7,REF:6,TECH:5,COOL:8,ATTR:6,LUCK:7,MA:6,BODY:5,EMP:6},skills:[["Streetdeal",6],["Persuasion & Fast Talk",6],["Streetwise",6],["Awareness/Notice",5],["Handgun",4]],weapons:["Federated Arms X-22"],armor:{torso:10},init:0,notes:"Never alone. Knows who's selling what."},
 {id:"t-nomad",name:"Nomad raider",type:"Nomad",stats:{INT:5,REF:7,TECH:6,COOL:6,ATTR:5,LUCK:5,MA:6,BODY:8,EMP:5},skills:[["Rifle",5],["Melee",5],["Driving",6],["Brawling",5],["Awareness/Notice",5]],weapons:["Kalashnikov A-80","Axe"],armor:{torso:4,rarm:4,larm:4},init:0,notes:"Fights from vehicles. Family first."},
 {id:"t-civ",name:"Civilian",type:"Civilian",stats:{INT:5,REF:5,TECH:5,COOL:4,ATTR:5,LUCK:5,MA:5,BODY:5,EMP:6},skills:[["Awareness/Notice",3],["Dodge & Escape",2]],weapons:[],armor:{},init:0,notes:"Panics on gunfire (COOL check)."},
];
const NAMES={first:["Jax","Mira","Dex","Kenji","Rosa","Viktor","Nadia","Tomas","Yuki","Marco","Lena","Ozzy","Priya","Silas","Zhen","Ash","Callie","Rook","Ines","Gage"],handle:["Spike","Ghost","Rattler","Chrome","Neon","Static","Jackal","Wire","Hex","Mamba","Blitz","Cinder","Patch","Razorback","Vapor","Grit","Torque","Sable","Kilo","Fuse"]};
function npcFromTemplate(t){const n=clone(t);n.id=uid();n.custom=true;n.weapons=(t.weapons||[]).map(w=>typeof w==="string"?mkWeaponByName(w):{id:uid(),conc:"",avail:"",shots:"",ammo:0,cost:0,skill:WTYPE_SKILL[w.type]||"Melee",...clone(w)}).filter(Boolean);return n}
function mkWeaponByName(name){const r=WEAPONS.find(w=>w[0]===name);return r?mkWeapon(r):null}
function npcSkill(n,name){const s=(n.skills||[]).find(x=>x[0]===name);return s?Number(s[1])||0:0}
function npcCalc(n){const eff={...n.stats};const w=clamp(Number(n.wounds)||0,0,40);const level=Math.ceil(w/4);woundEffects(eff,level);const body=Number(n.stats.BODY)||0;
  return {eff,level,w,btm:btmFor(body),save:body,stunSave:level?body-(level-1):body,deathSave:level>=4?body-(level-4):null,melee:meleeBonus(body)}}
function npcSP(n,loc){return Math.max(0,(Number(n.armor?.[loc])||0)-(n.armorDmg?.[loc]||0))}

Object.assign(ui,{npcSel:null,npcSearch:"",dmg:{},addCount:1,quick:{name:"",REF:6,BODY:6,sp:0}});
function cpCampaignDefaults(){return {gmNotes:{},npcs:[],encounter:{round:1,turn:0,list:[]},lastAward:null,packs:[],shop:null,net:{forts:[],run:null}}}
function cpCampaignNormalize(out,d0){out.encounter={...d0.encounter,...(out.encounter||{})};if(!Array.isArray(out.encounter.list))out.encounter.list=[];
  if(!Array.isArray(out.npcs))out.npcs=[];if(!out.gmNotes||typeof out.gmNotes!=="object")out.gmNotes={};if(!Array.isArray(out.packs))out.packs=[];
  if(!out.net||typeof out.net!=="object")out.net={forts:[],run:null};if(!Array.isArray(out.net.forts))out.net.forts=[];if(out.net.run&&typeof out.net.run!=="object")out.net.run=null}
function gmSummaryCp(d0){const nf=(d0.net&&d0.net.forts||[]).length;return `${(d0.party||[]).length} runners · ${(d0.npcs||[]).length} custom NPCs · ${(d0.encounter?.list||[]).length} in encounter${nf?` · ${nf} data fortress${nf===1?"":"es"}`:""} · ${(d0.campaign?.sessions||[]).length} sessions`}
function allNpcs(){return [...st.npcs,...NPC_TEMPLATES.map(t=>({...t,template:true}))]}
function findNpc(id){return st.npcs.find(n=>n.id===id)||NPC_TEMPLATES.find(t=>t.id===id)||null}

/* ============================== ENCOUNTER HELPERS ============================== */
function cbInfo(cb){
  if(cb.kind==="pc"){const ch=pc(cb.ref);if(!ch)return null;const k=calc(ch);
    return {name:ch.handle||ch.name||"Unnamed",sub:`${ch.role}${st.players[ch.id]?" · "+st.players[ch.id]:""}`,color:ch.color,eff:k.eff,level:k.level,w:k.w,btm:k.btm,save:k.save,stunSave:k.stunSave,deathSave:k.deathSave,
      sp:l=>spAt(ch,l),weapons:ch.weapons||[],skill:n=>skillLevel(ch,n),initBase:k.eff.REF+(ch.role==="Solo"?skillLevel(ch,"Combat Sense"):0)+k.init,melee:k.melee,smart:k.smart,obj:ch}}
  const n=cb.npc;const k=npcCalc(n);
  return {name:n.name,sub:n.type||"NPC",color:"#3d4352",eff:k.eff,level:k.level,w:k.w,btm:k.btm,save:k.save,stunSave:k.stunSave,deathSave:k.deathSave,sp:l=>npcSP(n,l),weapons:n.weapons||[],
    skill:s=>npcSkill(n,s),initBase:k.eff.REF+(Number(n.init)||0)+npcSkill(n,"Combat Sense"),melee:k.melee,smart:false,obj:n}}
function setWounds(cb,v){v=clamp(v,0,40);if(cb.kind==="pc"){const ch=pc(cb.ref);if(ch){ch.wounds=v;ch.updatedAt=Date.now()}}else cb.npc.wounds=v}
function ablate(cb,loc){if(cb.kind==="pc"){const ch=pc(cb.ref);if(!ch)return;const a=(ch.armor||[]).filter(x=>x.worn&&x.locs?.includes(loc)).slice(-1)[0];if(a){a.dmg=a.dmg||{};a.dmg[loc]=(a.dmg[loc]||0)+1}}else{const n=cb.npc;n.armorDmg=n.armorDmg||{};if(npcSP(n,loc)>0)n.armorDmg[loc]=(n.armorDmg[loc]||0)+1}}
function npcSP0(n,loc){return n.armorDmg?.[loc]||0}
function weaponHit(info,w){const skillName=w.skill||WTYPE_SKILL[w.type]||"Melee";let lvl=info.skill(skillName);if(w.type==="MEL")lvl=Math.max(lvl,info.skill("Martial Art"),info.skill("Melee"));return info.eff.REF+lvl+(Number(w.wa)||0)+(info.smart&&w.type!=="MEL"?2:0)}
function sortEncounter(){const e=st.encounter;const curId=e.list[e.turn]?.cid;e.list.sort((a,b)=>(Number(b.init)||0)-(Number(a.init)||0));const i=e.list.findIndex(x=>x.cid===curId);e.turn=i>=0?i:0}
function addPcToEnc(id){if(st.encounter.list.some(x=>x.kind==="pc"&&x.ref===id))return false;st.encounter.list.push({cid:uid(),kind:"pc",ref:id,init:0,out:false,note:"",last:""});return true}
function addNpcToEnc(n,count){const same=st.encounter.list.filter(x=>x.kind==="npc"&&x.npc.base===n.id).length;
  for(let i=0;i<count;i++){const copy=npcFromTemplate(n);copy.base=n.id;copy.id=uid();copy.wounds=0;copy.armorDmg={};(copy.weapons||[]).forEach(w=>{w.ammo=Number(w.shots)||0});
    if(count>1||same>0)copy.name=`${n.name} ${same+i+1}`;st.encounter.list.push({cid:uid(),kind:"npc",npc:copy,init:0,out:false,note:"",last:""})}}

/* ============================== PARTY ============================== */
function cpPartyActions(){return `<button class="btn" data-act="open-modal" data-m="award">Award IP & eurobucks</button><button class="btn" data-act="print-party">Print all sheets</button>`}
function cpPartyTable(list){return `<div class="tbl-wrap panel"><table class="party-tbl"><thead><tr><th>Runner</th><th>Role</th><th>REF</th><th>BODY</th><th>EMP</th><th>Wounds</th><th>SP H/T</th><th>BTM</th><th>Hum.</th><th>IP free</th><th>Cash</th><th></th></tr></thead><tbody>
    ${list.map(c=>{const k=calc(c);return `<tr><td><button class="linkish" data-act="open-pc" data-id="${esc(c.id)}"><span class="portrait sm" style="background:${esc(c.color||"#3d4352")}">${esc((c.handle||"?").charAt(0).toUpperCase())}</span><span><b>${esc(c.handle||"Unnamed")}</b>${isOnline(c.id)?`<span class="chip green" style="margin-left:6px">Online</span>`:""}${st.players[c.id]?`<small class="faint"> · ${esc(st.players[c.id])}</small>`:""}</span></button></td>
      <td>${esc(c.role)}</td><td class="num">${k.eff.REF}</td><td class="num">${k.eff.BODY}</td><td class="num">${k.eff.EMP}</td><td><span class="chip ${woundChipClass(k.level)}">${woundLabel(k.level)} ${k.w}</span></td><td class="num mono">${spAt(c,"head")}/${spAt(c,"torso")}</td><td class="num">${k.btm}</td><td class="num">${k.humanity}</td><td class="num">${(c.ip?.total||0)-(c.ip?.spent||0)}</td><td class="num mono">${fmtEb(c.eb)}</td>
      <td><div class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn sm" data-act="open-pc" data-id="${esc(c.id)}">Open</button><button class="btn sm ghost" data-act="download-pc" data-id="${esc(c.id)}" title="Download this character's file to give back to the player">File</button><button class="btn sm ghost" data-act="ask-remove-pc" data-id="${esc(c.id)}" title="Remove this runner from the party">Remove</button></div></td></tr>`}).join("")}
  </tbody></table></div>`}
function viewPc(c){
  const k=calc(c);const ipFree=(c.ip?.total||0)-(c.ip?.spent||0);
  const trained=Object.keys(c.skills||{}).concat(roleOf(c)?[roleOf(c).ab]:[]).filter((n,i,a)=>a.indexOf(n)===i&&skillLevel(c,n)>0).sort((a,b)=>skillLevel(c,b)-skillLevel(c,a));
  const lp=c.lifepath||{};
  return `<div class="row" style="margin-bottom:14px"><button class="btn sm ghost" data-act="close-pc">← Party</button></div>
  <header class="sheet-head">
    <div class="portrait lg" style="background:${esc(c.color||"#3d4352")}">${esc((c.handle||"?").charAt(0).toUpperCase())}</div>
    <div style="min-width:0"><span class="label">${esc(c.role)} · ${esc(abilityOf(c))} ${skillLevel(c,abilityOf(c))}</span><h1>${esc(c.handle||"Unnamed")}</h1>
      <div class="sub">${c.name?esc(c.name):""}${c.age?` · age ${esc(c.age)}`:""}</div>
      <div class="row" style="gap:6px;margin-top:8px"><button class="btn sm" data-act="print-pc" data-id="${esc(c.id)}">Paper sheet / PDF</button><button class="btn sm" data-act="download-pc" data-id="${esc(c.id)}">Download file for player</button><button class="btn sm" data-act="enc-add-pc" data-id="${esc(c.id)}">Add to encounter</button><button class="btn sm danger" data-act="ask-remove-pc" data-id="${esc(c.id)}">Remove from party…</button></div></div>
    <div class="hstats">
      <div><span class="label">Rep</span><div class="row" style="gap:4px;flex-wrap:nowrap"><b class="num">${c.rep||0}</b><button class="icon-btn" style="width:22px;height:22px" data-act="pc-num" data-id="${esc(c.id)}" data-f="rep" data-d="-1">−</button><button class="icon-btn" style="width:22px;height:22px" data-act="pc-num" data-id="${esc(c.id)}" data-f="rep" data-d="1">+</button></div></div>
      <div><span class="label">IP free</span><b class="num">${ipFree}</b></div><div><span class="label">Cash</span><b class="num">${(c.eb||0).toLocaleString("en-US")}<small style="font-size:14px">eb</small></b></div><div><span class="label">Humanity</span><b class="num" style="color:${k.eff.EMP<=2?"var(--red)":"inherit"}">${k.humanity}</b></div>
    </div>
  </header>
  <div class="sheet">
    <div class="side">
      <section class="panel"><div class="panel-h"><h3>Stats</h3><span class="faint" style="font-size:12.5px">Tap to roll</span></div><div class="panel-b">
        <div class="stat-grid">${STAT_KEYS.map(key=>{const b=k.base[key],e=k.eff[key];return `<div class="stat rollable"><div class="k"><span>${key}</span></div><div class="v num">${e}${e!==b?`<small class="${e<b?"down":""}">/${b}</small>`:""}</div><button class="roll" data-act="roll" data-who="${esc(c.handle)}" data-l="${key} check" data-b="${e}" aria-label="Roll ${key}"></button></div>`}).join("")}</div>
        ${derivedHTML(k)}</div></section>
      <section class="panel"><div class="panel-h"><h3>Wounds</h3><span class="chip ${woundChipClass(k.level)}">${woundLabel(k.level)} · ${k.w}/40</span></div><div class="panel-b">
        ${woundTrackHTML(k.w,k.save,{act:"pc-wound",extra:`data-id="${esc(c.id)}"`})}
        <div class="wstate"><button class="btn sm" data-act="save-roll" data-who="${esc(c.handle)}" data-t="stun" data-v="${k.stunSave}">Stun save ≤ ${k.stunSave}</button>${k.deathSave!=null?`<button class="btn sm danger" data-act="save-roll" data-who="${esc(c.handle)}" data-t="death" data-v="${k.deathSave}">Death save ≤ ${k.deathSave}</button>`:""}<span class="row" style="gap:4px;margin-left:auto"><button class="icon-btn" data-act="pc-num" data-id="${esc(c.id)}" data-f="wounds" data-d="-1">−</button><button class="icon-btn" data-act="pc-num" data-id="${esc(c.id)}" data-f="wounds" data-d="1">+</button></span></div></div></section>
      <section class="panel"><div class="panel-h"><h3>Armor SP</h3><span class="faint mono" style="font-size:12px">EV ${k.ev||0}</span></div><div class="panel-b"><div class="locs">${LOCS.map(([key,lab,rng])=>`<div class="loc"><div class="lk"><span>${lab}</span><span>${rng}</span></div><b class="num">${spAt(c,key)}</b></div>`).join("")}</div>
        ${(c.armor||[]).some(a=>Object.values(a.dmg||{}).some(v=>v>0))?`<button class="btn sm ghost" style="margin-top:8px" data-act="pc-repair" data-id="${esc(c.id)}">Repair all armor</button>`:""}</div></section>
      <section class="panel"><div class="panel-h"><h3>GM only</h3></div><div class="panel-b" style="display:grid;gap:10px">
        <div class="field"><label class="label" for="pl-${esc(c.id)}">Player name</label><input id="pl-${esc(c.id)}" data-s="players.${esc(c.id)}" value="${esc(st.players[c.id]||"")}"></div>
        <div class="field"><label class="label" for="gn-${esc(c.id)}">Private notes (not in the player's file)</label><textarea id="gn-${esc(c.id)}" data-s="gmNotes.${esc(c.id)}" placeholder="Secrets, hooks, what their enemies are planning">${esc(st.gmNotes[c.id]||"")}</textarea></div>
        <div class="grid2"><div class="field"><label class="label" for="ipt-${esc(c.id)}">IP earned (total)</label><input id="ipt-${esc(c.id)}" type="number" data-p="${esc(c.id)}|ip.total" value="${esc(c.ip?.total||0)}"></div><div class="field"><label class="label" for="eb-${esc(c.id)}">Cash (eb)</label><input id="eb-${esc(c.id)}" type="number" data-p="${esc(c.id)}|eb" value="${esc(c.eb||0)}"></div></div>
      </div></section>
    </div>
    <div style="min-width:0;display:grid;gap:14px;align-content:start">
      <section class="panel"><div class="panel-h"><h3>Skills</h3><span class="faint" style="font-size:12.5px">Stat + skill + D10</span></div><div class="panel-b">
        ${trained.length?(rows=>cols2(rows,rows.map(()=>1)))(trained.map(n=>{const def=skillDef(c,n);const lv=skillLevel(c,n);let base=(k.eff[def.s]||0)+lv;if(n==="Awareness/Notice"&&c.role==="Solo")base+=skillLevel(c,"Combat Sense");return `<div class="sk" style="break-inside:avoid"><div class="nm">${esc(n)}<em>${def.s}</em></div><span class="lv num">${lv}</span><button class="rollbtn" data-act="roll" data-who="${esc(c.handle)}" data-l="${esc(n)}" data-b="${base}"><b>${base}</b>+D10</button></div>`})):`<p class="faint">No trained skills.</p>`}
      </div></section>
      <section class="panel"><div class="panel-h"><h3>Weapons</h3></div><div class="panel-b items" style="padding-block:0">${(c.weapons||[]).length?c.weapons.map(w=>{const info=cbInfo({kind:"pc",ref:c.id});const hit=weaponHit(info,w);return `<div class="it"><div style="min-width:0"><div class="t">${esc(w.name)}</div><div class="m">${esc(w.type)} · WA ${sgn(Number(w.wa)||0)} · ${esc(w.dmg)} · ROF ${esc(w.rof)} · ${esc(w.range)}${w.shots?` · ${w.ammo}/${w.shots} rounds`:""}</div></div>
        <div class="a"><button class="rollbtn" data-act="roll" data-who="${esc(c.handle)}" data-l="Attack · ${esc(w.name)}" data-b="${hit}">Hit <b>${hit}</b>+D10</button><button class="rollbtn" data-act="roll-expr" data-who="${esc(c.handle)}" data-l="Damage · ${esc(w.name)}" data-e="${esc(w.dmg)}" data-bonus="${w.type==="MEL"?k.melee:0}">Dmg <b>${esc(w.dmg)}</b></button></div></div>`}).join(""):`<p class="faint" style="padding:12px 0;margin:0">No weapons.</p>`}</div></section>
      <div class="grid2">
        <section class="panel"><div class="panel-h"><h3>Cyberware</h3><span class="chip blue">Hum ${k.humanity}/${k.humMax}</span></div><div class="panel-b" style="font-size:14px;display:grid;gap:3px">${(c.cyber||[]).map(x=>`<div>${esc(x.name)} <span class="faint mono">−${esc(x.hcLoss)}</span></div>`).join("")||`<span class="faint">None.</span>`}</div></section>
        <section class="panel"><div class="panel-h"><h3>Gear</h3></div><div class="panel-b" style="font-size:14px;display:grid;gap:3px">${[...(c.armor||[]).map(a=>`${esc(a.name)} <span class="faint mono">SP ${esc(a.sp)}${a.worn?"":" stowed"}</span>`),...(c.gear||[]).map(g=>`${esc(g.name)}${Number(g.qty)>1?" ×"+esc(g.qty):""}`)].map(x=>`<div>${x}</div>`).join("")||`<span class="faint">Nothing.</span>`}</div></section>
      </div>
      <section class="panel"><div class="panel-h"><h3>Background</h3></div><div class="panel-b" style="font-size:14px;display:grid;gap:6px">
        ${c.concept?`<div><b>Concept:</b> ${esc(c.concept)}</div>`:""}
        <div><b>Family:</b> ${esc(lp.family?.ranking||"—")}. ${esc(lp.family?.status||"")}</div>
        <div><b>Motivation:</b> ${esc(lp.motive?.trait||"—")}; values ${esc((lp.motive?.value||"—").toLowerCase())}.</div>
        ${(lp.events||[]).filter(e=>e.kind==="Enemy"||e.kind==="Big problem"||e.kind==="Friend").map(e=>`<div><span class="chip ${EV_CHIP[e.kind]||"ink"}">${esc(e.kind)} · ${esc(e.age)}</span> ${esc(e.text)}</div>`).join("")}
        ${(c.contacts||[]).length?`<div><b>Contacts:</b> ${c.contacts.map(x=>esc(x.name)+(x.role?" ("+esc(x.role)+")":"")).join(", ")}</div>`:""}
        ${c.notes?`<div class="faint" style="white-space:pre-wrap">${esc(c.notes)}</div>`:""}
      </div></section>
    </div>
  </div>`;
}
function derivedHTML(k){return `<div class="derived" style="margin-top:10px"><div><span class="label">Run</span><b class="num">${k.run}m</b></div><div><span class="label">Save</span><b class="num">${k.save}</b></div><div><span class="label">BTM</span><b class="num">${k.btm}</b></div></div>`}

/* ---------- ENCOUNTER ---------- */
function viewEncounter(){
  const e=st.encounter;const list=e.list;
  const npcOpts=allNpcs().map(n=>`<option value="${esc(n.id)}">${esc(n.name)}${n.template?"":" (yours)"}</option>`).join("");
  return `<div class="roster-head"><h1><small>Combat tracker</small>Round ${e.round}</h1>
    <div class="row"><button class="btn primary" data-act="enc-init" ${list.length?"":"disabled"}>Roll initiative</button><button class="btn" data-act="enc-prev" ${list.length?"":"disabled"}>← Prev</button><button class="btn primary" data-act="enc-next" ${list.length?"":"disabled"}>Next turn →</button><button class="btn danger" data-act="enc-clear" ${list.length?"":"disabled"}>${ui.confirm==="enc-clear"?"Confirm: end combat":"End combat"}</button></div></div>
  <div class="panel" style="margin-bottom:14px"><div class="panel-b enc-add">
    <div class="row"><span class="label">Add</span><button class="btn sm" data-act="enc-add-party" ${st.party.length?"":"disabled"}>Whole party</button></div>
    <div class="row"><select id="enc-npc" aria-label="NPC to add">${npcOpts}</select><input id="enc-count" type="number" min="1" max="20" value="${ui.addCount}" style="width:64px" aria-label="How many"><button class="btn sm" data-act="enc-add-npc">Add NPCs</button></div>
    <div class="row enc-tools"><span class="label">Tools</span><button class="btn sm" data-act="enc-scatter" title="Where a missed grenade or rocket lands">Grenade scatter</button>
      <label class="row" style="gap:4px" title="Suppressive fire: rounds fired ÷ zone width in meters"><span class="label">Fire zone save</span><input id="enc-zone" type="number" min="0" max="200" value="${esc(ui.zone||"")}" style="width:64px" placeholder="—"></label></div>
    <div class="row"><input id="q-name" placeholder="Quick NPC name" style="width:150px" aria-label="Quick NPC name"><label class="row" style="gap:4px"><span class="label">REF</span><input id="q-ref" type="number" value="6" style="width:56px"></label><label class="row" style="gap:4px"><span class="label">BODY</span><input id="q-body" type="number" value="6" style="width:56px"></label><label class="row" style="gap:4px"><span class="label">SP</span><input id="q-sp" type="number" value="0" style="width:56px"></label><button class="btn sm" data-act="enc-quick">Add</button></div>
  </div></div>
  ${list.length?`<div class="enc">${list.map((cb,i)=>rg("row-"+cb.cid,encRow(cb,i))).join("")}</div>`:`<div class="empty"><h3>No one in the fight yet</h3><p class="muted" style="margin:0">Add the party and some NPCs above, then roll initiative. Initiative is REF + D10, plus Combat Sense for Solos and any speedware.</p></div>`}`;
}
function encRow(cb,i){
  const info=cbInfo(cb);if(!info)return `<div class="cb"><div class="cb-main"><span class="faint">A party member who was removed.</span><button class="btn sm ghost" data-act="enc-remove" data-cid="${cb.cid}">Remove</button></div></div>`;
  const e=st.encounter;const turn=i===e.turn;const dmg=ui.dmg[cb.cid]||{loc:"torso",ap:false};
  const dead=info.w>=40;const state=dead?["red","Dead"]:cb.out?["ink","Out of the fight"]:[woundChipClass(info.level),woundLabel(info.level)];
  return `<div class="cb ${turn?"turn":""} ${cb.out||dead?"out":""}" id="cb-${cb.cid}">
    <div class="cb-main">
      <input class="cb-init num" type="number" value="${esc(cb.init)}" data-cb="${cb.cid}|init" aria-label="Initiative for ${esc(info.name)}">
      <div style="min-width:0;flex:1"><div class="row" style="gap:6px"><b class="cb-name">${esc(info.name)}</b><span class="chip ${cb.kind==="pc"?"blue":"ink"}">${cb.kind==="pc"?"PC":"NPC"}</span><span class="chip ${state[0]}">${state[1]} · ${info.w}</span>${turn?`<span class="chip red">Acting</span>`:""}</div>
        <div class="m mono">${esc(info.sub)} · REF ${info.eff.REF} · BTM ${info.btm} · SP ${LOCS.map(l=>info.sp(l[0])).join("/")} <span class="faint">(H/T/RA/LA/RL/LL)</span></div></div>
      <div class="row cb-opts" style="gap:6px"><label class="row" style="gap:3px;font-size:13px" title="Fast draw: +3 initiative, −3 to hit this round"><input type="checkbox" data-act-change="cb-fd" data-cid="${cb.cid}" ${cb.fd?"checked":""}>Fast draw</label>
        <select data-act-change="cb-def" data-cid="${cb.cid}" aria-label="Defending" class="sm"><option value="">Not defending</option><option value="dodge" ${cb.def==="dodge"?"selected":""}>Dodging</option><option value="parry" ${cb.def==="parry"?"selected":""}>Parrying</option></select>
        <select data-act-change="cb-cover" data-cid="${cb.cid}" aria-label="Cover" class="sm"><option value="">No cover</option>${COVER.map(([n,v])=>`<option value="${v}" ${Number(cb.cover)===v&&cb.coverName===n?"selected":""} data-n="${esc(n)}">${esc(n)} · SP ${v}</option>`).join("")}</select></div>
      <div class="row" style="gap:4px"><button class="btn sm ghost" data-act="enc-out" data-cid="${cb.cid}">${cb.out?"Back in":"Out"}</button>${cb.kind==="npc"?`<button class="btn sm ghost" data-act="enc-dup" data-cid="${cb.cid}">Duplicate</button>`:""}<button class="btn sm ghost" data-act="enc-remove" data-cid="${cb.cid}" aria-label="Remove">×</button></div>
    </div>
    <div class="cb-body">
      <div style="min-width:0">${woundTrackHTML(info.w,info.save,{act:"cb-wound",extra:`data-cid="${cb.cid}"`})}
        <div class="row" style="margin-top:8px;gap:6px"><button class="btn sm" data-act="save-roll" data-who="${esc(info.name)}" data-t="stun" data-v="${info.stunSave}">Stun ≤ ${info.stunSave}</button>${info.deathSave!=null?`<button class="btn sm danger" data-act="save-roll" data-who="${esc(info.name)}" data-t="death" data-v="${info.deathSave}">Death ≤ ${info.deathSave}</button>`:""}<button class="icon-btn" data-act="cb-w" data-cid="${cb.cid}" data-d="-1" aria-label="Heal 1">−</button><button class="icon-btn" data-act="cb-w" data-cid="${cb.cid}" data-d="1" aria-label="Damage 1">+</button></div></div>
      <div style="display:grid;gap:8px;min-width:0">
        <div class="row" style="gap:6px"><input type="number" id="dmg-${cb.cid}" placeholder="Damage" style="width:104px" aria-label="Damage rolled"><select data-act-change="cb-loc" data-cid="${cb.cid}" aria-label="Location">${LOCS.map(l=>`<option value="${l[0]}" ${dmg.loc===l[0]?"selected":""}>${l[1]} · SP ${info.sp(l[0])}</option>`).join("")}</select><button class="btn sm ghost" data-act="cb-rollloc" data-cid="${cb.cid}">Roll loc</button><label class="row" style="gap:3px;font-size:13px"><input type="checkbox" data-act-change="cb-ap" data-cid="${cb.cid}" ${dmg.ap?"checked":""}>AP</label><label class="row" style="gap:3px;font-size:13px" title="Mono-edge: soft armor at 1/3 SP, hard armor at 2/3"><input type="checkbox" data-act-change="cb-mono" data-cid="${cb.cid}" ${dmg.mono?"checked":""}>Mono</label><button class="btn sm primary" data-act="cb-hit" data-cid="${cb.cid}">Apply hit</button></div>
        ${cb.def==="dodge"?`<div class="faint" style="font-size:12.5px">Dodging: −2 to melee attacks against them this turn; −3 to each of their other actions.</div>`:cb.def==="parry"?`<div class="row" style="gap:6px"><span class="faint" style="font-size:12.5px">Parrying: a melee hit goes into what they parry with first. A blade must save or break.</span><button class="btn sm ghost" data-act="cb-parry" data-cid="${cb.cid}" data-n="9">Blade save (≤ 9)</button><button class="btn sm ghost" data-act="cb-parry" data-cid="${cb.cid}" data-n="4">Mono-edge save (≤ 4)</button></div>`:""}
        ${ui.zone?`<div class="row" style="gap:6px"><button class="btn sm ghost" data-act="cb-zone" data-cid="${cb.cid}">Fire zone save: Athletics + REF + 1D10 vs ${ui.zone}</button></div>`:""}
        ${cb.last?`<div class="calc-out" style="font-size:13px">${esc(cb.last)}</div>`:""}
        <div class="row" style="gap:6px">${info.weapons.map((w,wi)=>{const hit=weaponHit(info,w);return `<span class="wchip"><span>${esc(w.name)}${w.shots?` <small class="faint">${w.ammo}/${w.shots}</small>`:""}</span><button class="rollbtn" data-act="roll" data-who="${esc(info.name)}" data-l="Attack · ${esc(w.name)}" data-b="${hit}">${hit}+D10</button><button class="rollbtn" data-act="roll-expr" data-who="${esc(info.name)}" data-l="Damage · ${esc(w.name)}" data-e="${esc(w.dmg)}" data-bonus="${w.type==="MEL"?info.melee:0}">${esc(w.dmg)}</button>${w.shots?`<button class="rollbtn" data-act="cb-ammo" data-cid="${cb.cid}" data-w="${wi}" title="Fire one">−1</button><button class="rollbtn" data-act="cb-reload" data-cid="${cb.cid}" data-w="${wi}">⟲</button>`:""}</span>`}).join("")||`<span class="faint" style="font-size:13px">Unarmed.</span>`}</div>
        <input data-cb="${cb.cid}|note" value="${esc(cb.note||"")}" placeholder="Notes: cover, status, who they're targeting" aria-label="Notes">
      </div>
    </div>
  </div>`;
}

/* ---------- NPCS ---------- */
function viewNpcs(){
  const q=ui.npcSearch.toLowerCase();const list=allNpcs().filter(n=>!q||n.name.toLowerCase().includes(q)||(n.type||"").toLowerCase().includes(q));
  const sel=ui.npcSel?findNpc(ui.npcSel):null;
  return `<div class="roster-head"><h1><small>NPC library</small>Faces in the crowd</h1>
    <div class="row"><button class="btn" data-act="npc-new">+ New NPC</button><button class="btn" data-act="npc-random">Random NPC</button>${st.npcs.length?`<button class="btn" data-act="print-npcs">Print NPC cards</button>`:""}</div></div>
  <div class="npc-layout">
    <div class="panel"><div class="panel-b" style="display:grid;gap:8px"><input id="npc-q" data-ui="npcSearch" data-rerender value="${esc(ui.npcSearch)}" placeholder="Search NPCs" aria-label="Search NPCs">
      <div class="npc-list">${list.map(n=>`<button class="npc-item ${sel&&sel.id===n.id?"on":""}" data-act="npc-sel" data-id="${esc(n.id)}"><b>${esc(n.name)}</b><span class="faint">${esc(n.type||"")}${n.template?" · template":" · yours"}</span></button>`).join("")}</div></div></div>
    <div style="min-width:0">${sel?npcDetail(sel):`<div class="empty"><h3>Pick an NPC</h3><p class="muted" style="margin:0">Templates cover common opposition. Make an editable copy to tweak stats, or build your own from scratch. Add any NPC to the encounter as many times as you need.</p></div>`}</div>
  </div>`;
}
function npcDetail(n){
  const ed=!n.template;const k=npcCalc({...n,wounds:0});
  const statCells=STAT_KEYS.map(s=>ed?`<div class="stat"><div class="k"><span>${s}</span></div><input type="number" class="stat-in num" data-n="${esc(n.id)}|stats.${s}" value="${esc(n.stats[s])}" aria-label="${s}"></div>`:`<div class="stat"><div class="k"><span>${s}</span></div><div class="v num">${n.stats[s]}</div></div>`).join("");
  return `<section class="panel"><div class="panel-h"><div style="min-width:0;flex:1">${ed?`<input class="npc-name" data-n="${esc(n.id)}|name" value="${esc(n.name)}" aria-label="NPC name">`:`<h3 style="font-size:26px">${esc(n.name)}</h3>`}</div>
    <div class="row">${ed?"":`<span class="chip amber">Template</span>`}<input id="npc-count" type="number" min="1" max="20" value="${ui.addCount}" style="width:60px" aria-label="How many"><button class="btn sm primary" data-act="npc-to-enc" data-id="${esc(n.id)}">Add to encounter</button></div></div>
    <div class="panel-b" style="display:grid;gap:14px">
      <div class="row">${ed?`<label class="row" style="gap:6px"><span class="label">Type</span><input data-n="${esc(n.id)}|type" value="${esc(n.type||"")}" style="width:150px"></label><label class="row" style="gap:6px"><span class="label">Init bonus</span><input type="number" data-n="${esc(n.id)}|init" value="${esc(n.init||0)}" style="width:64px"></label>`:`<span class="chip ink">${esc(n.type)}</span>${n.init?`<span class="chip ink">Init +${n.init}</span>`:""}`}
        <span class="faint mono" style="font-size:12.5px">BTM ${k.btm} · Save ${k.save} · melee ${sgn(k.melee)}</span></div>
      <div class="stat-grid npc-stats">${statCells}</div>
      <div class="grid2">
        <div><span class="label">Skills</span><div class="items">${(n.skills||[]).map((s,i)=>ed?`<div class="row" style="gap:6px;padding:3px 0;flex-wrap:nowrap"><input list="skill-names" data-n="${esc(n.id)}|skills.${i}.0" value="${esc(s[0])}" aria-label="Skill"><input type="number" data-n="${esc(n.id)}|skills.${i}.1" value="${esc(s[1])}" style="width:60px" aria-label="Level"><button class="icon-btn" data-act="npc-del-skill" data-id="${esc(n.id)}" data-i="${i}" aria-label="Remove skill">×</button></div>`
          :`<div class="sk" style="grid-template-columns:minmax(0,1fr) auto auto"><span class="nm">${esc(s[0])}</span><span class="lv num">${s[1]}</span><span class="faint mono" style="font-size:11px">${(n.stats[skillDef({customSkills:[]},s[0]).s]||0)+Number(s[1])}+D10</span></div>`).join("")||`<p class="faint" style="margin:0">None.</p>`}</div>
          ${ed?`<button class="btn sm ghost" style="margin-top:6px" data-act="npc-add-skill" data-id="${esc(n.id)}">+ Skill</button>`:""}</div>
        <div><span class="label">Armor SP by location</span><div class="locs" style="margin-top:4px">${LOCS.map(([key,lab])=>`<div class="loc"><div class="lk"><span>${lab}</span></div>${ed?`<input type="number" class="num" data-n="${esc(n.id)}|armor.${key}" value="${esc(n.armor?.[key]||0)}" aria-label="${lab} SP" style="padding:2px 4px;font-size:16px;font-weight:700">`:`<b class="num">${n.armor?.[key]||0}</b>`}</div>`).join("")}</div></div>
      </div>
      <div><span class="label">Weapons</span><div class="items">${(n.weapons||[]).map((w,i)=>{const r=typeof w==="string"?WEAPONS.find(x=>x[0]===w):null;const W=r?{name:r[0],type:r[1],wa:r[2],dmg:r[5],rof:r[7],range:r[9]}:w;return `<div class="it"><div style="min-width:0"><div class="t">${esc(W.name)}</div><div class="m">${esc(W.type)} · WA ${sgn(Number(W.wa)||0)} · ${esc(W.dmg)} · ROF ${esc(W.rof)} · ${esc(W.range)}</div></div><div class="a">${ed?`<button class="btn sm ghost" data-act="npc-del-weapon" data-id="${esc(n.id)}" data-i="${i}">Remove</button>`:""}</div></div>`}).join("")||`<p class="faint" style="margin:0">Unarmed.</p>`}</div>
        ${ed?`<div class="row" style="margin-top:6px"><select id="npc-wpn" aria-label="Weapon">${WEAPONS.map((w,i)=>`<option value="${i}">${esc(w[0])} (${w[5]})</option>`).join("")}</select><button class="btn sm" data-act="npc-add-weapon" data-id="${esc(n.id)}">+ Weapon</button></div>`:""}</div>
      <div class="field"><span class="label">Notes</span>${ed?`<textarea data-n="${esc(n.id)}|notes" style="min-height:70px">${esc(n.notes||"")}</textarea>`:`<p style="margin:0">${esc(n.notes||"")}</p>`}</div>
      <div class="row">${n.template?`<button class="btn" data-act="npc-copy" data-id="${esc(n.id)}">Make an editable copy</button>`:`<button class="btn" data-act="npc-copy" data-id="${esc(n.id)}">Duplicate</button><button class="btn" data-act="print-npc" data-id="${esc(n.id)}">Print card</button><button class="btn danger" data-act="npc-delete" data-id="${esc(n.id)}">${ui.confirm==="npc-"+n.id?"Confirm delete":"Delete"}</button>`}</div>
    </div></section>`;
}

/* ---------- REFERENCE ---------- */
function viewReference(){
  const t=(title,head,rows)=>`<section class="panel"><div class="panel-h"><h3>${title}</h3></div><div class="panel-b tbl-wrap"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
  return `<div class="roster-head"><h1><small>Quick reference</small>Table rules</h1></div>
  <div class="ref-grid">
    ${t("Difficulty values",["Task","DV"],[["Easy","10"],["Average","15"],["Difficult","20"],["Very difficult","25"],["Nearly impossible","30"]])}
    ${t("Ranged attacks",["Range","DV","Distance"],[["Point blank","10","Touching to 1m"],["Close","15","¼ weapon range"],["Medium","20","½ weapon range"],["Long","25","Full weapon range"],["Extreme","30","Up to 2× range"]])}
    ${t("Checks",["Roll","How"],[["Skill check","Stat + skill + D10 vs DV"],["Natural 10","Roll again and add (keeps going on 10s)"],["Natural 1","Fumble: roll on your fumble table"],["Opposed","Both roll; higher total wins"],["Initiative","REF + D10 (+ Combat Sense, boosters)"]])}
    ${t("Hit location (D10)",["Roll","Location","Note"],[["1","Head","Damage ×2 after armor"],["2–4","Torso",""],["5","Right arm","Over 8 in one hit: limb lost"],["6","Left arm","Over 8 in one hit: limb lost"],["7–8","Right leg","Over 8 in one hit: limb lost"],["9–0","Left leg","Over 8 in one hit: limb lost"]])}
    ${t("Wound levels",["Damage","Level","Effect"],[["1–4","Light","None"],["5–8","Serious","−2 REF"],["9–12","Critical","REF, INT, COOL halved"],["13–40","Mortal 0–6","REF, INT, COOL at ⅓; death save each turn"]])}
    ${t("Saves",["Save","Succeed on D10 ≤"],[["Stun","BODY − (wound level − 1)"],["Death","BODY − mortal level"],["Stunned","Recover with a successful stun save on your turn"]])}
    ${t("Body type modifiers",["BODY","BTM","Melee dmg"],[["2 or less","0","−2"],["3–4","−1","−1"],["5–7","−2","+0"],["8–9","−3","+1"],["10","−4","+2"],["11–12","−5","+4"],["13–14","−5","+6"]])}
    ${t("Layered armor",["SP difference","Add to the larger"],[["0–4","+5"],["5–8","+4"],["9–14","+3"],["15–20","+2"],["21–26","+1"],["27+","+0"]])}
    ${t("Damage sequence",["Step",""],[["1","Roll damage"],["2","Subtract SP at the location (AP: SP halved)"],["3","Head hits ×2"],["4","Subtract BTM (minimum 1)"],["5","Armor that was penetrated loses 1 SP"]])}
    ${t("Improvement points",["Raise","Cost"],[["Skill to next level","Current level × 10 IP"],["Difficult skills","× their multiplier (2 or 3)"],["Typical award","1–5 IP per skill used well per session"]])}
    ${t("Attack modifiers",["Situation","To hit"],ATK_SITUATIONS.filter(x=>x[0]!=="telescopic").map(x=>[esc(x[1])+(x[4]?` <span class="faint">(${esc(x[4])})</span>`:""),sgn(x[2])]).concat([["Telescopic sight","+2 long/extreme, +1 medium"],["Aimed shot at a location","−4"],["Aiming","+1 a turn, up to 3"],["More than one action","−3 for each after the first"],["3-round burst (close, medium)","+3"],["Full auto","±1 per 10 rounds (+ close, − farther)"]]))}
    ${t("Common cover",["Cover","SP"],COVER.map(([n,v])=>[esc(n),v]))}
    ${t("Area effects",["Weapon","Area","Damage"],[["Grenade","5m","Frag 7D6 · incendiary 4D6 ×3 turns"],["Gas grenade","3m, drifts","See gas types"],["Molotov","2m per liter","2D10, whole body"],["Flamethrower","2m","2D10, then 1D10, 1D6"],["Mine","2m","4D10"],["Claymore","6m × 75m front, 6m back","4D10"],["C-6","5m per kg","8D10, whole body"],["RPG","4m","6D10"],["Missile","6m","7D10"],["Shotgun","1 / 2 / 3m","4D6 / 3D6 / 2D6 (close / medium / long)"]])}
    ${t("Grenade scatter",["1D10","Lands"],Object.entries(SCATTER_DIR).map(([k,v])=>[k,esc(v)]).concat([["Then","1D10 meters from the target"]]))}
    ${t("Fumbles (combat)",["1D10","Result"],FUMBLES.combat.rows.map((r,i,a)=>[i?`${a[i-1][0]+1}${r[0]>a[i-1][0]+1?"–"+r[0]:""}`:`1–${r[0]}`,esc(r[1])]).concat([["Automatic weapons","Roll 1D10 instead: VR jams on 3 or less, ST on 5, UR on 8. Unjamming takes 1D6 turns"]]))}
    ${t("Martial arts key attacks",["Style (IP ×)",...MA_MOVES],Object.entries(MA_STYLES).map(([n,[x,b]])=>[`${esc(n)} (${x})`,...MA_MOVES.map(m=>b[m]?"+"+b[m]:"—")]))}
    ${t("Melee",["Move","Effect"],[["Attack","REF + skill + 1D10 vs the defender's REF + skill + 1D10"],["Strike / Kick","1D6/2 / 1D6 + melee bonus; martial arts add their level"],["Throw","After a grapple: 1D6 + bonus, Stun save at −2"],["Choke","After a hold or grapple: 1D6 a turn"],["Sweep","Down: they're −2 next attack, you're +2"],["Dodge","−2 to attacks on you, −3 to your other actions"],["Parry","Damage goes into what you parry with; blades save on 9 or less"],["Mono-edges","Double damage on a natural 10, break on a 1; soft armor 1/3 SP, hard 2/3"]])}
    ${t("Suppressive fire",["Step","Rule"],[["Save number","Rounds fired ÷ zone width in meters (at least 2m)"],["Crossing the zone","Athletics + REF + 1D10 vs the save number"],["Failing","1D6 rounds hit, each in a random location"]])}
  </div>`;
}

/* ============================== WINDOWS ============================== */
MODALS.award=()=>({title:"Award IP & eurobucks",body:`<div style="display:grid;gap:12px"><p class="muted" style="margin:0">Rewards apply to the party's copies here, and sync to players who are at the table.</p>
    <div class="grid2"><div class="field"><label class="label" for="aw-ip">IP each</label><input id="aw-ip" type="number" placeholder="e.g. 8"></div><div class="field"><label class="label" for="aw-eb">Eurobucks each</label><input id="aw-eb" type="number" placeholder="e.g. 500"></div></div>
    <div class="field"><span class="label">Who gets it</span>${st.party.map(x=>`<label class="row" style="gap:8px;padding:4px 0"><input type="checkbox" class="aw-who" value="${esc(x.id)}" checked> <b>${esc(x.handle||"Unnamed")}</b> <span class="faint">${esc(x.role)}</span></label>`).join("")}</div>
    <div><button class="btn primary" data-act="do-award">Award to selected</button></div></div>`});

/* ============================== PRINT (GM) ============================== */
function npcCardsHTML(list){
  const cards=list.map(n=>{const k=npcCalc({...n,wounds:0});const ws=(n.weapons||[]).map(w=>typeof w==="string"?mkWeaponByName(w):w).filter(Boolean);
    return `<div class="npc"><h3>${esc(n.name)}<small>${esc(n.type||"")}${n.init?" · init +"+n.init:""}</small></h3><div class="b">
      <div class="st">${STAT_KEYS.map(s=>`<div>${s}<b>${n.stats[s]}</b></div>`).join("")}</div>
      <div><b>Skills:</b> ${(n.skills||[]).map(s=>`${esc(s[0])} ${s[1]}`).join(", ")||"—"}</div>
      <div><b>Weapons:</b> ${ws.map(w=>`${esc(w.name)} (${esc(w.dmg)}, WA ${sgn(Number(w.wa)||0)}${w.shots?", "+esc(w.shots)+" shots":""})`).join("; ")||"Unarmed"}</div>
      <div><b>SP</b> H ${n.armor?.head||0} · T ${n.armor?.torso||0} · RA ${n.armor?.rarm||0} · LA ${n.armor?.larm||0} · RL ${n.armor?.rleg||0} · LL ${n.armor?.lleg||0} &nbsp; <b>BTM</b> ${k.btm} &nbsp; <b>Save</b> ${k.save}</div>
      ${n.notes?`<div style="font-style:italic">${esc(n.notes)}</div>`:""}
      <div class="wt">${WOUND_LEVELS.map(()=>`<div>${"<span></span>".repeat(4)}</div>`).join("")}</div></div></div>`}).join("");
  const pages=[];const per=8;const arr=cards.split('<div class="npc">').filter(Boolean).map(x=>'<div class="npc">'+x);
  for(let i=0;i<arr.length;i+=per)pages.push(`<div class="page"><div class="npc-grid">${arr.slice(i,i+per).join("")}</div><div class="pp-foot" style="margin-top:auto"><span>Night City Dossier · NPC cards</span><span>${esc(st.campaign.name)}</span></div></div>`);
  return pages.join("")||`<div class="page"><p>No NPCs.</p></div>`;
}

/* ============================== ACTIONS ============================== */
// Only the changed combatant's row is redrawn, so big fights stay quick.
function renderRow(cid){const i=st.encounter.list.findIndex(x=>x.cid===cid);const el=document.getElementById("cb-"+cid);
  if(ui.tab!=="encounter"||i<0||!el||typeof morphdom!=="function"){render();return}
  morphdom(el,encRow(st.encounter.list[i],i),{onBeforeElUpdated(f,t){if(f.isEqualNode(t))return false;if(f===document.activeElement&&(f.tagName==="TEXTAREA"||f.tagName==="SELECT"||(f.tagName==="INPUT"&&f.type!=="checkbox")))return false;return true}})}
function withCb(cid,fn){const cb=st.encounter.list.find(x=>x.cid===cid);if(!cb)return;fn(cb);save();renderRow(cid)}
function withNpc(id,fn){const n=st.npcs.find(x=>x.id===id);if(!n)return;fn(n);save();render()}
Object.assign(A,{
  "print-pc":el=>{const c=pc(el.dataset.id);if(c)printCharacter(c)},
  "print-party":()=>Print.open({css:PAPER_CSS,title:`Party sheets · ${st.party.length}`,options:[{key:"allSkills",label:"All skills",def:true},{key:"state",label:"Current wounds, cash & ammo",def:true},{key:"lifepath",label:"Lifepath page",def:false}],render:o=>st.party.map(c=>sheetPages(c,o)).join("")}),
  "print-blank":()=>printBlank(),
  "print-npcs":()=>Print.open({css:PAPER_CSS,title:"NPC cards",options:[],render:()=>npcCardsHTML(st.npcs)}),
  "print-npc":el=>{const n=findNpc(el.dataset.id);if(n)Print.open({css:PAPER_CSS,title:`NPC card · ${n.name}`,options:[],render:()=>npcCardsHTML([n])})},
  "pc-num":el=>withPc(el.dataset.id,c=>{const f=el.dataset.f;let v=(Number(getPath(c,f))||0)+Number(el.dataset.d);if(f==="wounds")v=clamp(v,0,40);if(f==="rep")v=clamp(v,0,10);setPath(c,f,v)}),
  "pc-wound":el=>withPc(el.dataset.id,c=>{const n=Number(el.dataset.n);c.wounds=c.wounds===n?n-1:n}),
  "pc-repair":el=>withPc(el.dataset.id,c=>(c.armor||[]).forEach(a=>a.dmg={})),
  "enc-add-pc":el=>{if(addPcToEnc(el.dataset.id)){save();showNotice("Added to the encounter.")}else showNotice("Already in the encounter.")},
  "roll":el=>Dice.check(el.dataset.l,Number(el.dataset.b),{who:el.dataset.who}),
  "roll-expr":el=>Dice.expr(el.dataset.l,el.dataset.e,Number(el.dataset.bonus)||0,el.dataset.who),
  "save-roll":el=>{const t=el.dataset.t,v=Number(el.dataset.v);const r=d(10);Dice.raw(t==="stun"?`Stun save (need ≤ ${v})`:`Death save (need ≤ ${v})`,`D10 = ${r} → ${r<=v?(t==="stun"?"stays conscious":"survives this turn"):(t==="stun"?"knocked out":"dies")}`,r,el.dataset.who)},
  "do-award":()=>{const ip=Number(document.getElementById("aw-ip").value)||0;const eb=Number(document.getElementById("aw-eb").value)||0;const ids=[...document.querySelectorAll(".aw-who:checked")].map(x=>x.value);
    ids.forEach(id=>{const c=pc(id);if(!c)return;c.ip=c.ip||{total:0,spent:0};c.ip.total=(c.ip.total||0)+ip;c.eb=(Number(c.eb)||0)+eb;c.updatedAt=Date.now()});
    snapshot("After awarding IP/eb",true);ui.modal=null;save(true);render();showNotice(`Awarded ${ip?ip+" IP":""}${ip&&eb?" and ":""}${eb?fmtEb(eb):""} to ${ids.length}. Download their files to hand back.`)},
  // encounter
  "enc-add-party":()=>{let n=0;st.party.forEach(c=>{if(addPcToEnc(c.id))n++});save();render();showNotice(n?`Added ${n} runner${n>1?"s":""}.`:"The whole party is already in.")},
  "enc-add-npc":()=>{const id=document.getElementById("enc-npc").value;const cnt=clamp(Number(document.getElementById("enc-count").value)||1,1,20);ui.addCount=cnt;const n=findNpc(id);if(!n)return;addNpcToEnc(n.template?{...n,template:true}:n,cnt);save();render()},
  "enc-quick":()=>{const name=document.getElementById("q-name").value.trim()||"Mook";const R=Number(document.getElementById("q-ref").value)||5,Bd=Number(document.getElementById("q-body").value)||5,sp=Number(document.getElementById("q-sp").value)||0;
    const n={id:uid(),name,type:"Quick NPC",stats:{INT:5,REF:R,TECH:5,COOL:5,ATTR:5,LUCK:5,MA:5,BODY:Bd,EMP:5},skills:[],weapons:[],armor:sp?{head:0,torso:sp,rarm:sp,larm:sp,rleg:0,lleg:0}:{},init:0,notes:""};addNpcToEnc(n,1);save();render()},
  "enc-init":()=>{st.encounter.list.forEach(cb=>{const info=cbInfo(cb);if(!info)return;const r=d10x();const s=r.reduce((a,b)=>a+b,0);cb.init=info.initBase+s+(cb.fd?3:0)});
    st.encounter.turn=0;st.encounter.list.sort((a,b)=>(Number(b.init)||0)-(Number(a.init)||0));st.encounter.turn=0;save();render();
    Dice.raw("Initiative",st.encounter.list.map(cb=>{const i=cbInfo(cb);return i?`${i.name} ${cb.init}`:""}).filter(Boolean).join(" · ").slice(0,200),st.encounter.list[0]?.init||0,"GM")},
  "enc-next":()=>{const e=st.encounter;const n=e.list.length;if(!n)return;let t=e.turn;for(let k=0;k<n;k++){t++;if(t>=n){t=0;e.round++}const cb=e.list[t];const i=cbInfo(cb);if(!cb.out&&i&&i.w<40)break}e.turn=t;save();render()},
  "enc-prev":()=>{const e=st.encounter;if(!e.list.length)return;e.turn--;if(e.turn<0){e.turn=e.list.length-1;e.round=Math.max(1,e.round-1)}save();render()},
  "enc-clear":()=>{if(ui.confirm!=="enc-clear"){ui.confirm="enc-clear";render();return}snapshot("Before ending combat",true);st.encounter={round:1,turn:0,list:[]};ui.confirm=null;save(true);render()},
  "enc-remove":el=>{const e=st.encounter;const i=e.list.findIndex(x=>x.cid===el.dataset.cid);if(i<0)return;e.list.splice(i,1);if(e.turn>=e.list.length)e.turn=0;save();render()},
  "enc-out":el=>withCb(el.dataset.cid,cb=>cb.out=!cb.out),
  "enc-dup":el=>{const cb=st.encounter.list.find(x=>x.cid===el.dataset.cid);if(!cb||cb.kind!=="npc")return;const copy=clone(cb);copy.cid=uid();copy.npc.id=uid();copy.npc.wounds=0;copy.npc.armorDmg={};copy.last="";copy.npc.name=cb.npc.name.replace(/\s\d+$/,"")+" "+(st.encounter.list.filter(x=>x.kind==="npc"&&x.npc.base===cb.npc.base).length+1);st.encounter.list.push(copy);save();render()},
  "cb-wound":el=>withCb(el.dataset.cid,cb=>{const i=cbInfo(cb);const n=Number(el.dataset.n);setWounds(cb,i.w===n?n-1:n)}),
  "cb-w":el=>withCb(el.dataset.cid,cb=>{const i=cbInfo(cb);setWounds(cb,i.w+Number(el.dataset.d))}),
  "cb-rollloc":el=>{const r=rollLocation();ui.dmg[el.dataset.cid]={...(ui.dmg[el.dataset.cid]||{ap:false}),loc:r.loc};showNotice(`Location roll ${r.r}: ${locName(r.loc)}`);renderRow(el.dataset.cid)},
  "cb-hit":el=>{const cid=el.dataset.cid;const amt=Number(document.getElementById("dmg-"+cid).value)||0;if(!amt){showNotice("Enter the damage rolled first.");return}
    withCb(cid,cb=>{const i=cbInfo(cb);const dm=ui.dmg[cid]||{loc:"torso",ap:false};const hard=cb.kind==="pc"?(()=>{const ch=pc(cb.ref);const a=ch&&(ch.armor||[]).filter(x=>x.worn&&(x.locs||[]).includes(dm.loc)).sort((x,y)=>y.sp-x.sp)[0];return !!(a&&HARD_ARMOR.test(a.name))})():false;
      const res=computeHit({amount:amt,loc:dm.loc,sp:i.sp(dm.loc),ap:dm.ap,mono:dm.mono,hard,cover:Number(cb.cover)||0,btm:i.btm});
      if(res.final>0){setWounds(cb,i.w+res.final);ablate(cb,dm.loc)}const after=cbInfo(cb);cb.last=res.text+(res.final>0?` Now ${woundLabel(after.level)} (${after.w}).`:"")})},
  "cb-parry":el=>{const cb=st.encounter.list.find(x=>x.cid===el.dataset.cid);const i=cb&&cbInfo(cb);if(!i)return;const n=Number(el.dataset.n);const r=d(10);Dice.raw(`${i.name}'s parry: does the blade hold? (≤ ${n})`,`D10 = ${r}`,r,"GM",[r<=n?{t:"Holds",c:"green"}:{t:"Breaks",c:"red"}])},
  "cb-zone":el=>{const cb=st.encounter.list.find(x=>x.cid===el.dataset.cid);const i=cb&&cbInfo(cb);if(!i||!ui.zone)return;const r=d10x();const sum=r.reduce((a,b)=>a+b,0);const base=i.eff.REF+i.skill("Athletics");const tot=base+sum;const ok=tot>=Number(ui.zone);const n=ok?0:d(6);
    Dice.raw(`${i.name} crosses the fire zone`,`REF ${i.eff.REF} + Athletics ${i.skill("Athletics")} + D10 (${r.join("+")}) = ${tot} vs ${ui.zone}${ok?"":` · hit by 1D6 = ${n} round${n===1?"":"s"}, each in a random location`}`,tot,"GM",[ok?{t:"Makes it",c:"green"}:{t:`${n} round${n===1?"":"s"} hit`,c:"red"}]);
    withCb(cb.cid,x=>{x.last=ok?`Crossed the fire zone (${tot} vs ${ui.zone}).`:`Caught in the fire zone: ${n} round${n===1?"":"s"} hit${n===1?"s":""}. Roll each one's damage and location, then Apply hit.`})},
  "enc-scatter":()=>{const r=scatterRoll();Dice.raw("Grenade scatter",r.text,r.m,"GM")},
  "cb-ammo":el=>withCb(el.dataset.cid,cb=>{const w=cbInfo(cb).weapons[Number(el.dataset.w)];if(w)w.ammo=Math.max(0,(Number(w.ammo)||0)-1)}),
  "cb-reload":el=>withCb(el.dataset.cid,cb=>{const w=cbInfo(cb).weapons[Number(el.dataset.w)];if(w)w.ammo=Number(w.shots)||0}),
  // npcs
  "npc-sel":el=>{ui.npcSel=el.dataset.id;ui.confirm=null;render()},
  "npc-new":()=>{const n={id:uid(),name:"New NPC",type:"Street",stats:{INT:5,REF:6,TECH:5,COOL:5,ATTR:5,LUCK:5,MA:6,BODY:6,EMP:5},skills:[["Awareness/Notice",4],["Handgun",4]],weapons:[],armor:{},init:0,notes:"",custom:true};st.npcs.unshift(n);ui.npcSel=n.id;save();render()},
  "npc-random":()=>{const t=pick(NPC_TEMPLATES.filter(x=>x.id!=="t-civ"));const n=npcFromTemplate(t);n.name=`${pick(NAMES.handle)} (${pick(NAMES.first)})`;STAT_KEYS.forEach(k=>n.stats[k]=clamp(n.stats[k]+d(3)-2,1,12));n.skills=n.skills.map(s=>[s[0],clamp(s[1]+d(3)-2,1,10)]);n.notes=(n.notes||"")+` Built from ${t.name}.`;st.npcs.unshift(n);ui.npcSel=n.id;save();render()},
  "npc-copy":el=>{const src=findNpc(el.dataset.id);if(!src)return;const n=NPC_TEMPLATES.includes(src)?npcFromTemplate(src):clone(src);n.id=uid();n.custom=true;n.name=src.name+(NPC_TEMPLATES.includes(src)?"":" (copy)");delete n.template;st.npcs.unshift(n);ui.npcSel=n.id;save();render()},
  "npc-delete":el=>{const id=el.dataset.id;if(ui.confirm!=="npc-"+id){ui.confirm="npc-"+id;render();return}st.npcs=st.npcs.filter(n=>n.id!==id);ui.npcSel=null;ui.confirm=null;save();render()},
  "npc-to-enc":el=>{const n=findNpc(el.dataset.id);const cnt=clamp(Number(document.getElementById("npc-count").value)||1,1,20);ui.addCount=cnt;if(!n)return;addNpcToEnc(NPC_TEMPLATES.includes(n)?{...n,template:true}:n,cnt);save();render();showNotice(`Added ${cnt} × ${n.name} to the encounter.`)},
  "npc-add-skill":el=>withNpc(el.dataset.id,n=>n.skills.push(["Awareness/Notice",3])),
  "npc-del-skill":el=>withNpc(el.dataset.id,n=>n.skills.splice(Number(el.dataset.i),1)),
  "npc-add-weapon":el=>{const i=Number(document.getElementById("npc-wpn").value);withNpc(el.dataset.id,n=>n.weapons.push(mkWeapon(WEAPONS[i])))},
  "npc-del-weapon":el=>withNpc(el.dataset.id,n=>n.weapons.splice(Number(el.dataset.i),1)),
});
Object.assign(CHANGE,{
  "cb-fd":el=>withCb(el.dataset.cid,cb=>{cb.fd=el.checked}),
  "cb-def":el=>withCb(el.dataset.cid,cb=>{cb.def=el.value}),
  "cb-cover":el=>withCb(el.dataset.cid,cb=>{cb.cover=Number(el.value)||0;const o=el.selectedOptions[0];cb.coverName=o&&o.dataset.n||""}),
  "cb-mono":el=>{ui.dmg[el.dataset.cid]={...(ui.dmg[el.dataset.cid]||{loc:"torso",ap:false}),mono:el.checked}},
  "cb-loc":el=>{ui.dmg[el.dataset.cid]={...(ui.dmg[el.dataset.cid]||{ap:false}),loc:el.value}},
  "cb-ap":el=>{ui.dmg[el.dataset.cid]={...(ui.dmg[el.dataset.cid]||{loc:"torso"}),ap:el.checked}},
});
document.addEventListener("change",ev=>{const t=ev.target;if(t.dataset.cb&&t.dataset.cb.endsWith("|init")){sortEncounter();save();render()}});
document.addEventListener("input",ev=>{const t=ev.target;if(t.id==="enc-zone"){ui.zone=t.value===""?"":Math.max(0,Number(t.value)||0);clearTimeout(ui.zoneT);ui.zoneT=setTimeout(()=>render(),400)}});
document.addEventListener("input",ev=>{const el=ev.target;if(!st)return;const num=el.type==="number";const val=num?(el.value===""?0:Number(el.value)):el.value;
  if(el.dataset.n){const [id,path]=el.dataset.n.split("|");const n=st.npcs.find(x=>x.id===id);if(n){setPath(n,path,val);save()}}
  else if(el.dataset.cb){const [cid,path]=el.dataset.cb.split("|");const cb=st.encounter.list.find(x=>x.cid===cid);if(cb){setPath(cb,path,val);save()}}
});
function cpSkillNames(){let dl=document.getElementById("skill-names");if(!dl){dl=document.createElement("datalist");dl.id="skill-names";document.body.appendChild(dl)}
  dl.innerHTML=[...SKILL_DEFS.map(x=>x[0]),...Object.keys(ABILITIES)].map(n=>`<option value="${esc(n)}">`).join("")}
