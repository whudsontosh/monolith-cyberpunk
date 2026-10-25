/* ============================== CYBERPUNK 2020: PLAYER SCREENS ==============================
   The character builder (wizard), the sheet and its tabs, the shop and the player's windows.
   The roster, saving, backups, the table and the dice tray are Monolith's. */
Object.assign(ui,{tab:"skills",skFilter:"trained",skSearch:"",dv:"",rangeDv:15,editItem:null,adjust:false,dmg:{amount:"",loc:"torso",ap:false,result:null},
  shopTab:"Weapons",shopFree:false,hcMode:"roll",pendingRender:false});
const SAMPLE_ID="sample";
const checkRoll=(l,b,o)=>Dice.check(l,b,o||{});
const exprRoll=(l,e,b)=>Dice.expr(l,e,b||0);
const pushRoll=e=>Dice.push(e);

/* ============================== WIZARD ============================== */
const WIZ_STEPS=[["Identity","Who are you on the street?"],["Stats","Nine stats from 2 to 10."],["Career skills","40 points across your role's ten skills."],["Pickup skills","REF + INT points for anything else."],["Lifepath","Where you came from and who wants you dead."],["Funds & gear","Starting cash, weapons, armor and chrome."],["Review","Check everything, then hit the street."]];
function viewWizard(c){
  const step=c.wizStep||0;const ro=!canEditChar(c);
  const steps=WIZ_STEPS.map((s,i)=>`<button class="step ${i===step?"on":""} ${i<step?"done":""}" data-act="wiz-go" data-step="${i}"><span class="k">${i+1}</span>${s[0]}</button>`).join("");
  const bodies=[wizIdentity,wizStats,wizCareer,wizPickup,wizLifepath,wizFunds,wizReview];
  return `<div class="wiz">
    <nav class="steps" aria-label="Build steps">${steps}</nav>
    <section style="min-width:0">
      <div class="wiz-h"><div><span class="label">Step ${step+1} of 7 · ${esc(c.handle||"New runner")}</span><h2>${WIZ_STEPS[step][0]}</h2><p>${WIZ_STEPS[step][1]}</p></div>
        <div class="row">${canEditChar(c)?`<button class="btn ghost sm" data-act="toggle-guide">${c.guide?"Hide explanations":"Explain the rules"}</button><button class="btn ghost sm" data-act="ask-delete" data-id="${esc(c.id)}">Discard draft</button>`:""}<button class="btn ghost sm" data-act="go-roster">Save & exit</button></div></div>
      ${ro?`<div class="banner" style="margin-bottom:12px"><b>Read-only.</b> This draft belongs to another player.</div>`:""}
      ${guideOn(c)?rg("guide-"+step+"-"+c.role,guideStep(step,c)):""}
      <fieldset style="border:0;padding:0;margin:0;min-width:0" ${ro?"disabled":""}>${bodies[step](c)}</fieldset>
      <div class="wiz-foot">
        <button class="btn" data-act="wiz-go" data-step="${step-1}" ${step===0?"disabled":""}>← Back</button>
        ${step<6?`<button class="btn primary" data-act="wiz-go" data-step="${step+1}">Next: ${WIZ_STEPS[step+1][0]} →</button>`:`<button class="btn primary" data-act="wiz-finish" ${ro?"disabled":""}>Finish character</button>`}
      </div>
    </section>
  </div>`;
}
function wizIdentity(c){
  return `<div style="display:grid;gap:18px">
    <div class="grid3">
      <div class="field"><label class="label" for="w-handle">Handle</label><input id="w-handle" data-f="handle" value="${esc(c.handle)}" placeholder="Razor"></div>
      <div class="field"><label class="label" for="w-name">Real name</label><input id="w-name" data-f="name" value="${esc(c.name)}" placeholder="Teresa Vance"></div>
      <div class="field"><label class="label" for="w-gender">Gender</label><input id="w-gender" data-f="gender" value="${esc(c.gender)}"></div>
    </div>
    <div class="grid3">
      <div class="field"><label class="label" for="w-age">Age</label><div class="row" style="flex-wrap:nowrap"><input id="w-age" type="number" min="16" max="80" data-f="age" value="${esc(c.age)}"><button class="btn sm" data-act="roll-age" title="16 + 2D6">Roll</button></div></div>
      <div class="field" style="grid-column:span 2"><label class="label" for="w-concept">Concept</label><input id="w-concept" data-f="concept" value="${esc(c.concept)}" placeholder="Burned-out corporate bodyguard looking for one last score"></div>
    </div>
    <div class="field"><span class="label">Portrait color</span><div class="swatches">${COLORS.map(col=>`<button class="swatch ${c.color===col?"on":""}" style="background:${col}" data-act="set-color" data-color="${col}" aria-label="Color ${col}"></button>`).join("")}</div></div>
    <div class="field"><span class="label">Role</span><div class="roles">${ROLE_NAMES.map(r=>`<button class="role ${c.role===r?"on":""}" data-act="set-role" data-role="${esc(r)}"><b>${esc(r)}</b>${ROLES[r].homebrew?`<span class="chip amber hbchip" title="From ${esc(ROLES[r].pack)}">Homebrew</span>`:""}<span class="ab">${esc(ROLES[r].ab)}</span><p>${esc(ROLES[r].blurb)}</p>${guideOn(c)?`<p class="hint">Best stats: <b>${((ROLE_GUIDE[r]||ROLES[r].guide||{}).stats||[]).join(" · ")}</b></p>`:""}</button>`).join("")}</div></div>
  </div>`;
}
function wizStats(c){
  const sum=statSum(c);const pool=Number(c.statPool)||0;const left=pool-sum;const k=calc(c);
  const isPool=c.statMethod!=="fast";
  return `<div style="display:grid;gap:18px">
    <div class="row" style="justify-content:space-between">
      <div class="seg" role="group" aria-label="Stat method">
        <button class="${c.statMethod==="cinematic"?"on":""}" data-act="stat-method" data-m="cinematic">Cinematic pool</button>
        <button class="${c.statMethod==="random"?"on":""}" data-act="stat-method" data-m="random">Random 9D10</button>
        <button class="${c.statMethod==="fast"?"on":""}" data-act="stat-method" data-m="fast">Fast (roll each)</button>
      </div>
      ${c.statMethod==="random"?`<button class="btn sm" data-act="roll-pool">Roll 9D10 for the pool</button>`:""}
      ${c.statMethod==="fast"?`<button class="btn sm" data-act="roll-fast">Roll every stat (D10, reroll 1–2)</button>`:""}
    </div>
    ${c.statMethod==="cinematic"?`<div class="seg" role="group" aria-label="Pool size">${POOLS.map(p=>`<button class="${pool===p[0]?"on":""}" data-act="set-pool" data-pool="${p[0]}">${p[1]} · ${p[0]}</button>`).join("")}</div>`:""}
    ${isPool?`<div class="pool"><b class="num ${left<0?"over":""}">${left}</b><span class="muted">of ${pool} points left to place${left<0?" — you're over the pool":""}</span></div>`:`<div class="pool"><b class="num">${sum}</b><span class="muted">total from your rolls. Adjust with your GM's blessing.</span></div>`}
    <div class="stat-grid">${STATS.map(([key,name])=>`<div class="stat"><div class="k"><span>${key}</span><span class="faint">${esc(name)}</span></div><div class="v num">${c.stats[key]}</div>${guideOn(c)?`<p class="hint">${esc(STAT_INFO[key])}</p>`:""}
      <div class="ctl"><button class="icon-btn" data-act="stat-step" data-k="${key}" data-d="-1" ${c.stats[key]<=2?"disabled":""} aria-label="Lower ${key}">−</button><button class="icon-btn" data-act="stat-step" data-k="${key}" data-d="1" ${c.stats[key]>=10||(isPool&&left<=0)?"disabled":""} aria-label="Raise ${key}">+</button></div></div>`).join("")}</div>
    <div><span class="label">Derived</span>${derivedHTML(c,k)}</div>
  </div>`;
}
function derivedHTML(c,k){
  return `<div class="derived" style="margin-top:6px">
    <div><span class="label">Run</span><b class="num">${k.run}m</b></div><div><span class="label">Leap</span><b class="num">${k.leap}m</b></div><div><span class="label">Lift</span><b class="num">${k.lift}kg</b></div>
    <div><span class="label">Save</span><b class="num">${k.save}</b></div><div><span class="label">BTM</span><b class="num">${k.btm}</b></div><div><span class="label">Humanity</span><b class="num">${k.humanity}</b></div>
  </div>`;
}
function wizCareer(c){
  const r=roleOf(c)||ROLES.Solo;const used=careerUsed(c);const left=40-used;const list=careerList(c);
  return `<div style="display:grid;gap:14px">
    <div class="pool"><b class="num ${left<0?"over":""}">${left}</b><span class="muted">of 40 career points left. Max 10 in any skill. ${esc(r.ab)} is the ${esc(c.role)} special ability.</span></div>
    <div class="panel"><div class="panel-b" style="padding-block:4px">
    ${list.map((name,i)=>{
      const slot=i===0?null:r.skills[i-1];const isPick=slot&&typeof slot!=="string";
      const lv=name?(sk(c,name).c||0):0;
      return `<div class="sk" style="grid-template-columns:minmax(0,1fr) auto">
        <div class="nm">${isPick?`<select data-act-change="role-choice" data-i="${i-1}" aria-label="Choose skill" style="max-width:260px"><option value="">Choose a skill…</option>${slot.pick.filter(p=>p===name||!list.includes(p)).map(p=>`<option ${p===name?"selected":""}>${esc(p)}</option>`).join("")}</select>`:`${esc(name)}${i===0?` <span class="chip red" style="margin-left:6px">Special</span>`:""}`}
          ${name?`<em>${skillDef(c,name).s}</em>`:""}${name&&guideOn(c)?`<p class="hint">${esc(skillHint(c,name))}</p>`:""}</div>
        <div class="stepper"><button class="icon-btn" data-act="career-step" data-n="${esc(name||"")}" data-d="-1" ${!name||lv<=0?"disabled":""} aria-label="Lower">−</button><b class="num">${lv}</b><button class="icon-btn" data-act="career-step" data-n="${esc(name||"")}" data-d="1" ${!name||lv>=10||left<=0?"disabled":""} aria-label="Raise">+</button></div>
      </div>`}).join("")}
    </div></div>
  </div>`;
}
function wizPickup(c){
  const pool=pickupPool(c);const used=pickupUsed(c);const left=pool-used;const q=(ui.skSearch||"").toLowerCase();
  const names=[...SKILL_DEFS.map(d0=>d0[0]),...(c.customSkills||[]).map(s=>s.n)].filter(n=>!q||n.toLowerCase().includes(q));
  return `<div style="display:grid;gap:14px">
    <div class="pool"><b class="num ${left<0?"over":""}">${left}</b><span class="muted">of ${pool} pickup points left (REF ${c.stats.REF} + INT ${c.stats.INT}). Totals cap at 10.</span></div>
    <div class="row"><input id="pk-search" data-ui="skSearch" data-rerender value="${esc(ui.skSearch)}" placeholder="Filter skills" style="max-width:260px" aria-label="Filter skills"><button class="btn sm" data-act="open-modal" data-m="addskill">+ Custom skill (Expert, Language…)</button></div>
    <div class="panel"><div class="panel-b" style="padding-block:6px">
      ${(rows=>cols2(rows,rows.map(()=>1)))(names.map(n=>{const s=sk(c,n);const tot=skillLevel(c,n);return rg("pk-"+n,`<div class="sk" style="break-inside:avoid;grid-template-columns:minmax(0,1fr) auto"><div class="nm">${esc(n)}<em>${skillDef(c,n).s}</em>${s.c?` <span class="chip ink">career ${s.c}</span>`:""}${guideOn(c)?`<p class="hint">${esc(skillHint(c,n))}</p>`:""}</div>
      <div class="stepper"><button class="icon-btn" data-act="pickup-step" data-n="${esc(n)}" data-d="-1" ${(s.p||0)<=0?"disabled":""} aria-label="Lower">−</button><b class="num">${tot}</b><button class="icon-btn" data-act="pickup-step" data-n="${esc(n)}" data-d="1" ${tot>=10||left<=0?"disabled":""} aria-label="Raise">+</button></div></div>`)}))}
    </div></div>
  </div>`;
}
function lpBody(c,editable){
  const lp=c.lifepath||{};const st=lp.style||{},f=lp.family||{},m=lp.motive||{};
  const inp=(path,val,ph="")=>editable?`<input data-f="lifepath.${path}" value="${esc(val||"")}" placeholder="${esc(ph)}" aria-label="${esc(path)}">`:`<span>${esc(val||"—")}</span>`;
  const rr=(act)=>editable?`<button class="btn sm" data-act="${act}">Reroll</button>`:"";
  return `<div class="lp">
    <section><h4>Style & origins ${rr("lp-style")}</h4><dl>
      <dt>Clothes</dt><dd>${inp("style.clothes",st.clothes)}</dd><dt>Hairstyle</dt><dd>${inp("style.hair",st.hair)}</dd><dt>Affectation</dt><dd>${inp("style.affect",st.affect)}</dd>
      <dt>Ethnic origin</dt><dd>${inp("ethnic",lp.ethnic)}</dd><dt>Native language</dt><dd>${inp("language",lp.language)}</dd></dl></section>
    <section><h4>Family ${rr("lp-family")}</h4><dl>
      <dt>Family ranking</dt><dd>${inp("family.ranking",f.ranking)}</dd><dt>Parents</dt><dd>${inp("family.parents",f.parents)}</dd><dt>Family status</dt><dd>${inp("family.status",f.status)}</dd><dt>Childhood</dt><dd>${inp("family.childhood",f.childhood)}</dd>
      <dt>Siblings</dt><dd>${(f.siblings||[]).length?(f.siblings).map(s=>`${esc(s.gender)} (${esc(s.age)}) · ${esc(s.feel)}`).join("<br>"):"Only child"}</dd></dl></section>
    <section><h4>Motivations ${rr("lp-motive")}</h4><dl>
      <dt>Personality</dt><dd>${inp("motive.trait",m.trait)}</dd><dt>Person valued most</dt><dd>${inp("motive.person",m.person)}</dd><dt>Values most</dt><dd>${inp("motive.value",m.value)}</dd><dt>Feels about people</dt><dd>${inp("motive.people",m.people)}</dd><dt>Valued possession</dt><dd>${inp("motive.possession",m.possession)}</dd></dl></section>
    <section><h4>Life events <span class="row">${editable?`<button class="btn sm" data-act="lp-events">Reroll all years</button>`:""}</span></h4>
      ${(lp.events||[]).length?(lp.events).map((e,i)=>`<div class="ev"><div class="age num">${e.age}</div><div style="min-width:0"><span class="kind chip ${EV_CHIP[e.kind]||"ink"}">${esc(e.kind)}</span>
        <div style="margin-top:4px">${editable?`<input data-f="lifepath.events.${i}.text" value="${esc(e.text)}" aria-label="Event at age ${e.age}">`:esc(e.text)}</div></div>
        ${editable?`<button class="btn sm ghost" data-act="lp-event" data-i="${i}">Reroll</button>`:"<span></span>"}</div>`).join(""):`<p class="faint" style="margin:0">One event per year from age 17 to your current age.</p>`}
    </section></div>`;
}
function wizLifepath(c){
  return `<div style="display:grid;gap:12px">
    <div class="row"><button class="btn primary" data-act="lp-all">Roll entire lifepath</button><span class="muted" style="font-size:13.5px">Rolls every table, plus ${Math.max(1,(c.age||18)-16)} years of life events for age ${c.age||18}. Edit any line afterwards.</span></div>
    <div class="panel"><div class="panel-b" style="padding-block:0">${lpBody(c,true)}</div></div>
  </div>`;
}
function wizFunds(c){
  const r=roleOf(c)||ROLES.Solo;const ab=skillLevel(c,r.ab);const idx=ab<=5?0:ab-5;const inc=r.income[clamp(idx,0,5)];
  const k=calc(c);
  return `<div style="display:grid;gap:16px">
    <div class="panel"><div class="panel-b" style="display:grid;gap:12px">
      <div class="row" style="justify-content:space-between"><div><span class="label">Monthly income · ${esc(c.role)}, ${esc(r.ab)} ${ab}</span><div class="big-n num">${fmtEb(inc)}</div></div>
      <div style="display:grid;gap:6px;justify-items:end"><button class="btn primary" data-act="roll-funds" data-inc="${inc}">Roll starting funds</button><span class="faint" style="font-size:12.5px">Income × (1D6 ÷ 3, rounded up) months</span></div></div>
      <div class="grid2"><div class="field"><label class="label" for="w-eb">Cash on hand (eb)</label><input id="w-eb" type="number" data-f="eb" value="${esc(c.eb)}"></div>
      <div class="field"><span class="label">Spend it</span><button class="btn" data-act="open-modal" data-m="shop">Open the shop: weapons, armor, cyberware, gear</button></div></div>
    </div></div>
    <div class="grid2">
      <div class="panel"><div class="panel-h"><h3>Loadout</h3></div><div class="panel-b" style="font-size:14px;display:grid;gap:4px">
        ${[...c.weapons.map(w=>`⟶ ${esc(w.name)} <span class="faint mono">${esc(w.dmg)}</span>`),...c.armor.map(a=>`⟶ ${esc(a.name)} <span class="faint mono">SP ${a.sp}</span>`),...c.gear.map(g=>`⟶ ${esc(g.name)}${g.qty>1?" ×"+g.qty:""}`)].join("<br>")||`<span class="faint">Nothing yet.</span>`}</div></div>
      <div class="panel"><div class="panel-h"><h3>Chrome</h3><span class="chip blue">Humanity ${k.humanity}/${k.humMax}</span></div><div class="panel-b" style="font-size:14px">
        ${c.cyber.map(x=>`⟶ ${esc(x.name)} <span class="faint mono">−${x.hcLoss} HL</span>`).join("<br>")||`<span class="faint">No cyberware installed.</span>`}</div></div>
    </div>
  </div>`;
}
function wizReview(c){
  const k=calc(c);const checks=[];
  const sum=statSum(c);
  if(!c.handle) checks.push(["amber","No handle yet. Go back to Identity."]);
  if(c.statMethod!=="fast"&&sum!==Number(c.statPool)) checks.push([sum>c.statPool?"red":"amber",`Stats total ${sum} against a pool of ${c.statPool}.`]);
  const cu=careerUsed(c);if(cu!==40) checks.push([cu>40?"red":"amber",`Career points: ${cu} of 40 placed.`]);
  if(careerList(c).some(x=>!x)) checks.push(["amber","A career skill slot hasn't been chosen."]);
  const pu=pickupUsed(c),pp=pickupPool(c);if(pu!==pp) checks.push([pu>pp?"red":"amber",`Pickup points: ${pu} of ${pp} placed.`]);
  if(!(c.lifepath?.events||[]).length) checks.push(["amber","Lifepath not rolled."]);
  if(c.eb<0) checks.push(["red","Cash is negative."]);
  const top=Object.keys(c.skills).filter(n=>skillLevel(c,n)>0).sort((a,b)=>skillLevel(c,b)-skillLevel(c,a)).slice(0,8);
  return `<div style="display:grid;gap:16px">
    <div class="panel"><div class="panel-b" style="display:grid;gap:8px">${checks.length?checks.map(x=>`<div class="row"><span class="chip ${x[0]}">${x[0]==="red"?"Fix":"Check"}</span><span>${esc(x[1])}</span></div>`).join(""):`<div class="row"><span class="chip green">Ready</span><span>Everything checks out. Finish to open the full character sheet.</span></div>`}
    ${checks.length?`<p class="faint" style="margin:4px 0 0;font-size:13px">You can finish anyway; the GM gets the final word.</p>`:""}</div></div>
    <div class="grid2">
      <div class="panel"><div class="panel-h"><h3>${esc(c.handle||"Unnamed")}</h3><span class="chip red">${esc(c.role)}</span></div><div class="panel-b">
        <div class="stat-grid">${STAT_KEYS.map(s=>`<div class="stat"><div class="k"><span>${s}</span></div><div class="v num">${c.stats[s]}</div></div>`).join("")}</div></div></div>
      <div class="panel"><div class="panel-h"><h3>Top skills</h3></div><div class="panel-b">${top.map(n=>`<div class="sk" style="grid-template-columns:minmax(0,1fr) auto"><span class="nm">${esc(n)}</span><span class="lv num">${skillLevel(c,n)}</span></div>`).join("")||`<span class="faint">No skills yet.</span>`}
        <hr class="sep"><div class="row" style="justify-content:space-between"><span class="label">Cash</span><b class="mono">${fmtEb(c.eb)}</b></div><div class="row" style="justify-content:space-between"><span class="label">Humanity</span><b class="mono">${k.humanity} / ${k.humMax}</b></div></div></div>
    </div>
  </div>`;
}

function newCharBody(){
  const first=!allChars().some(c=>c.created);
  return `<div style="display:grid;gap:14px">
    <p class="muted" style="margin:0">Both build the same character in the same 7 steps. Pick how much explaining you want along the way.</p>
    <div class="buildopts">
      <button class="buildopt ${first?"rec":""}" data-act="new-char" data-guide="1"><span class="label">${first?"Recommended for your first runner":"Explains as you go"}</span><b>Guided build</b>
        <span>Every step explains the rules in plain words: what each stat and skill does, which ones matter for your role, how rolls, wounds, armor and cyberware work. Tips stay on your sheet until you hide them.</span></button>
      <button class="buildopt" data-act="new-char" data-guide="0"><span class="label">You know the rules</span><b>Quick build</b>
        <span>Just the steps and the numbers. You can switch explanations on at any point with <b>Explain the rules</b>.</span></button>
    </div></div>`}
/* ============================== SHEET ============================== */
function viewSheet(c){
  const k=calc(c);const ed=canEditChar(c);const ipAvail=(c.ip?.total||0)-(c.ip?.spent||0);
  const tabs=[["skills","Skills"],["combat","Combat"],["med","Medical"],["cyber","Cyberware"],["gear","Gear & cash"],...(netTabShown(c)?[["net","Netrunning"]]:[]),["lifepath","Lifepath"],["notes","Notes"]];
  const body={skills:tabSkills,combat:tabCombat,med:tabMed,cyber:tabCyber,gear:tabGear,net:tabNet,lifepath:tabLifepath,notes:tabNotes}[ui.tab]||tabSkills;
  return `
  ${c.id==="sample"?`<div class="banner" style="margin-bottom:14px"><span class="chip amber">Example</span> This is a sample character so you can see how the sheet works. Rolls work; edits don't save. <button class="btn sm" data-act="copy-sample">Copy to my roster</button></div>`:""}
  ${rg("hdr",`<header class="sheet-head">
    <div class="portrait lg" style="background:${esc(c.color||"#3d4352")}">${esc((c.handle||c.name||"?").charAt(0).toUpperCase())}</div>
    <div style="min-width:0"><span class="label">${esc(c.role)} · ${esc(abilityOf(c))} ${skillLevel(c,abilityOf(c))}</span><h1>${esc(c.handle||"Unnamed")}</h1>
      <div class="sub">${c.name?`<span>${esc(c.name)}</span>`:""}${c.age?`<span>· age ${esc(c.age)}</span>`:""}${c.id!=="sample"?`<span class="faint">· saved ${ago(c.updatedAt)}</span>`:""}</div>
      <div class="row" style="gap:6px;margin-top:8px"><button class="btn sm" data-act="print-char">Paper sheet / PDF</button><button class="btn sm" data-act="download-char">Download file</button><button class="btn sm ghost ${guideOn(c)?"blue":""}" data-act="toggle-guide">${guideOn(c)?"Hide tips":"Show tips"}</button>${ed?`<button class="btn sm ghost" data-act="open-modal" data-m="backups">History</button><button class="btn sm ghost" data-act="reopen-wiz">Edit build</button><button class="btn sm ghost ${ui.adjust?"blue":""}" data-act="toggle-adjust">${ui.adjust?"Done adjusting":"Adjust stats"}</button>`:""}</div></div>
    <div class="hstats">
      <div><span class="label">Rep</span><div class="row" style="gap:6px;flex-wrap:nowrap"><b class="num">${c.rep||0}</b>${ed?`<span class="row" style="gap:2px;flex-wrap:nowrap"><button class="icon-btn" style="width:22px;height:22px" data-act="num" data-f="rep" data-d="-1" aria-label="Lower rep">−</button><button class="icon-btn" style="width:22px;height:22px" data-act="num" data-f="rep" data-d="1" aria-label="Raise rep">+</button></span>`:""}</div></div>
      <div><span class="label">IP free</span><b class="num">${ipAvail}</b></div>
      <div><span class="label">Cash</span><b class="num">${(c.eb||0).toLocaleString("en-US")}<small style="font-size:14px">eb</small></b></div>
      <div><span class="label">Humanity</span><b class="num" style="color:${k.eff.EMP<=2?"var(--red)":"inherit"}">${k.humanity}</b></div>
    </div>
  </header>`)}
  <div class="sheet">
    <div class="side">
      ${rg("stats",`<section class="panel cut"><div class="panel-h"><h3>Stats</h3><span class="faint" style="font-size:12.5px">Tap a stat to roll it</span></div><div class="panel-b">${guideOn(c)?tip(SIDE_TIPS.stats,"sm"):""}
        <div class="stat-grid">${STAT_KEYS.map(key=>{const b=k.base[key],e=k.eff[key];return `<div class="stat ${ui.adjust?"":"rollable"}" ${guideOn(c)?`title="${esc(STAT_INFO[key])}"`:""}><div class="k"><span>${key}</span>${key==="LUCK"?`<span class="faint">pool</span>`:""}</div>
          <div class="v num">${e}${e!==b?`<small class="${e<b?"down":""}">/${b}</small>`:""}</div>
          ${ui.adjust&&ed?`<div class="ctl"><button class="icon-btn" data-act="adj-stat" data-k="${key}" data-d="-1" aria-label="Lower ${key}">−</button><button class="icon-btn" data-act="adj-stat" data-k="${key}" data-d="1" aria-label="Raise ${key}">+</button></div>`:`<button class="roll" data-act="roll-stat" data-k="${key}" aria-label="Roll ${key} + D10"></button>`}</div>`}).join("")}</div>
        <div class="row" style="justify-content:space-between;margin-top:10px"><span class="faint" style="font-size:12.5px">Luck spent this session: ${c.luckSpent||0}</span>${ed?`<span class="row" style="gap:4px"><button class="btn sm" data-act="num" data-f="luckSpent" data-d="1">Spend 1 Luck</button><button class="btn sm ghost" data-act="set" data-f="luckSpent" data-v="0">Reset</button></span>`:""}</div>
        ${derivedHTML(c,k)}
      </div></section>`)}
      ${rg("wounds",`<section class="panel"><div class="panel-h"><h3>Wounds</h3><span class="row" style="gap:6px">${(s=>["ok","healing","hurt"].includes(s.id)?"":`<button class="chip ${s.chip} chiplink" data-act="tab" data-t="med">${esc(s.label)}</button>`)(medState(c))}<span class="chip ${woundChipClass(k.level)}">${woundLabel(k.level)} · ${k.w}/40</span></span></div><div class="panel-b">${guideOn(c)?tip(SIDE_TIPS.wounds,"sm"):""}
        <div class="wounds">${WOUND_LEVELS.map((lab,g)=>`<div class="wg ${g>=3?"mortal":""}"><span class="wl">${lab}</span><div class="bx">${[1,2,3,4].map(j=>{const n=g*4+j;return `<button class="${n<=k.w?"f":""}" data-act="wound" data-n="${n}" ${ed?"":"disabled"} aria-label="${n} damage"></button>`}).join("")}</div><span class="ss num">Stun ${k.save-g}</span></div>`).join("")}</div>
        <div class="wstate"><button class="btn sm" data-act="roll-save" data-t="stun">Stun save ≤ ${k.stunSave}</button>${k.deathSave!=null&&!medStable(c)&&!medOf(c).dead&&!medOf(c).gone?`<button class="btn sm danger" data-act="roll-save" data-t="death">Death save ≤ ${k.deathSave}</button>`:""}
        ${ed?`<span class="row" style="gap:4px;margin-left:auto"><button class="icon-btn" data-act="num" data-f="wounds" data-d="-1" aria-label="Heal 1">−</button><button class="icon-btn" data-act="num" data-f="wounds" data-d="1" aria-label="Take 1">+</button></span>`:""}</div>
        <p class="faint" style="margin:8px 0 0;font-size:12.5px">${k.level===2?"Serious: −2 REF.":k.level===3?"Critical: REF, INT and COOL halved.":k.level>=4?(medStable(c)?"Mortal, but stabilized: REF, INT and COOL at one third.":"Mortal: REF, INT and COOL at one third. Make a death save every turn until someone stabilizes you (Medical tab)."):"Each box is one point of damage."}</p>
      </div></section>`)}
      ${rg("armor",`<section class="panel"><div class="panel-h"><h3>Armor</h3><span class="faint mono" style="font-size:12px">EV ${k.ev?"−"+k.ev+" REF":"0"}</span></div><div class="panel-b">${guideOn(c)?tip(SIDE_TIPS.armor,"sm"):""}
        <div class="locs">${LOCS.map(([key,lab,rng])=>`<div class="loc"><div class="lk"><span>${lab}</span><span>${rng}</span></div><b class="num">${spAt(c,key)}</b></div>`).join("")}</div>
        <p class="faint" style="margin:8px 0 0;font-size:12.5px">Layered SP uses the proportional armor rule. Damage calculator is on the Combat tab.</p>
      </div></section>`)}
    </div>
    <div style="min-width:0">
      ${rg("tabs",`<nav class="tabs" role="tablist">${tabs.map(t=>`<button role="tab" class="${ui.tab===t[0]?"on":""}" data-act="tab" data-t="${t[0]}">${t[1]}</button>`).join("")}</nav>`)}
      ${guideOn(c)&&SHEET_TIPS[ui.tab]?rg("tabtip-"+ui.tab,`<div style="margin-bottom:12px">${tip(SHEET_TIPS[ui.tab])}</div>`):""}
      ${body(c,k,ed)}
    </div>
  </div>`;
}
function tabSkills(c,k,ed){
  const ipAvail=(c.ip?.total||0)-(c.ip?.spent||0);const q=ui.skSearch.toLowerCase();
  const ab=abilityOf(c);
  const names=new Set([ab,...SKILL_DEFS.map(x=>x[0]),...(c.customSkills||[]).map(x=>x.n),...Object.keys(c.skills||{})]);
  const groups={};
  [...names].forEach(n=>{if(!n)return;const def=skillDef(c,n);const lv=skillLevel(c,n);
    if(ui.skFilter==="trained"&&lv===0&&n!==ab)return;if(q&&!n.toLowerCase().includes(q))return;
    const g=def.special||n===ab?"Special ability":def.s;(groups[g]||(groups[g]=[])).push(n)});
  const order=["Special ability","REF","INT","TECH","COOL","EMP","ATTR","BODY","LUCK","MA"];
  const last=(c.ipLog||[]).slice(-1)[0];
  return `<div class="sk-tools">
    <div class="seg" role="group" aria-label="Show"><button class="${ui.skFilter==="trained"?"on":""}" data-act="sk-filter" data-v="trained">Trained</button><button class="${ui.skFilter==="all"?"on":""}" data-act="sk-filter" data-v="all">All skills</button></div>
    <input id="sk-search" data-ui="skSearch" data-rerender value="${esc(ui.skSearch)}" placeholder="Search skills" aria-label="Search skills">
    <button class="btn sm primary" data-act="ck-open">Skill check…</button>
    <label class="row" style="gap:6px"><span class="label">Target</span><select data-act-change="set-dv" aria-label="Difficulty value">${DVS.map(x=>`<option value="${x[0]}" ${String(ui.dv)===String(x[0])?"selected":""}>${x[1]||"No DV"}</option>`).join("")}</select></label>
    ${ed?`<button class="btn sm" data-act="open-modal" data-m="addskill">+ Custom skill</button>`:""}
  </div>
  ${rg("ipbar",`<div class="panel" style="margin-bottom:14px"><div class="panel-b row" style="justify-content:space-between">
    <div class="row" style="gap:16px"><div><span class="label">IP earned</span><div class="row" style="gap:6px"><b class="mono" style="font-size:18px">${c.ip?.total||0}</b>${ed?`<input type="number" id="ip-add" placeholder="+IP" style="width:80px" aria-label="IP to add"><button class="btn sm" data-act="add-ip">Add</button>`:""}</div></div>
    <div><span class="label">IP free</span><div><b class="mono" style="font-size:18px;color:var(--red)">${ipAvail}</b></div></div></div>
    <div class="faint" style="font-size:12.5px;max-width:42ch">Raising a skill costs current level × 10 IP (× the skill's difficulty). ${last&&ed?`<button class="btn sm ghost" data-act="undo-ip">Undo ${esc(last.skill)} ${last.from}→${last.to}</button>`:""}</div>
  </div></div>`)}
  ${(gs=>gs.length?cols2(gs.map(g=>rg("skg-"+g,`<div class="sk-group"><h4><span>${g==="Special ability"?g:g+" skills"}</span>${g!=="Special ability"?`<span class="mono faint" style="font-size:12px">${g} ${k.eff[g]}</span>`:""}</h4>
    ${groups[g].sort().map(n=>{const def=skillDef(c,n);const lv=skillLevel(c,n);const s=sk(c,n);const base=(k.eff[def.s]||0)+lv;const cost=ipCost(c,n);
      const pips=Array.from({length:10},(_,i)=>`<i class="${i<s.c?"c":i<s.c+s.p?"p":i<lv?"b":""}"></i>`).join("");
      return `<div class="sk ${lv?"":"zero"}"><div class="nm">${esc(n)}${def.m>1?`<em>×${def.m}</em>`:""}${def.custom&&ed?` <button class="btn sm ghost" style="padding:0 4px" data-act="del-skill" data-n="${esc(n)}" aria-label="Remove ${esc(n)}">×</button>`:""}<div class="pips" title="career / pickup / improved">${pips}</div></div>
        <span class="lv num">${lv}</span>
        <div class="acts">${ed&&ui.adjust?`<button class="icon-btn" data-act="adj-skill" data-n="${esc(n)}" data-d="-1" aria-label="Lower">−</button><button class="icon-btn" data-act="adj-skill" data-n="${esc(n)}" data-d="1" aria-label="Raise">+</button>`:""}
        ${ed&&!ui.adjust&&lv<10?`<button class="rollbtn" data-act="buy-skill" data-n="${esc(n)}" ${ipAvail<cost?"disabled style='opacity:.4'":""} title="Improve for ${cost} IP">+${cost}</button>`:""}
        <button class="rollbtn" data-act="roll-skill" data-n="${esc(n)}"><b>${base}</b>+D10</button></div></div>`}).join("")}</div>`)),gs.map(g=>groups[g].length+2)):`<p class="faint">No skills match.</p>`)(order.filter(g=>groups[g]))}`;
}
function tabCombat(c,k,ed){
  const cs=skillLevel(c,"Combat Sense");const initBase=k.eff.REF+(c.role==="Solo"?cs:0)+k.init;
  const res=ui.dmg.result;
  return `<div style="display:grid;gap:14px">
    <div class="panel"><div class="panel-b row" style="justify-content:space-between">
      <div class="row" style="gap:14px"><button class="btn primary" data-act="roll-init" data-b="${initBase}">Initiative ${initBase}+D10</button><button class="btn sm" data-act="roll-init" data-b="${initBase+3}" data-fd="1" title="Fast draw: +3 initiative, −3 to hit this round, no scopes or aiming">Fast draw ${initBase+3}+D10</button>
      <span class="faint" style="font-size:12.5px">REF ${k.eff.REF}${c.role==="Solo"?` + Combat Sense ${cs}`:""}${k.init?` + boosters ${k.init}`:""}</span></div>
      <label class="row" style="gap:6px"><span class="label">Range</span><select data-act-change="set-range" aria-label="Range DV">${RANGE_DVS.map(r=>`<option value="${r[0]}" ${Number(ui.rangeDv)===r[0]?"selected":""}>${r[1]} · DV ${r[0]}</option>`).join("")}</select></label>
    </div></div>
    <section class="panel"><div class="panel-h"><h3>Weapons</h3>${ed?`<div class="row"><button class="btn sm primary" data-act="atk-open">Attack…</button><button class="btn sm" data-act="open-modal" data-m="shop" data-tab="Weapons">+ From catalog</button><button class="btn sm ghost" data-act="add-blank" data-list="weapons">+ Custom</button></div>`:""}</div>
      <div class="panel-b items" style="padding-block:0">
      ${c.weapons.length?c.weapons.map((w,i)=>{const skill=w.skill||WTYPE_SKILL[w.type]||"Handgun";const lvl=skillLevel(c,skill);const toHit=k.eff.REF+lvl+(Number(w.wa)||0)+(k.smart&&w.type!=="MEL"?2:0);
        const mel=w.type==="MEL";const shots=Number(w.shots)||0;
        return rg("w-"+w.id,`<div class="it" data-info="own:weapons:${esc(w.id)}"><div style="min-width:0"><div class="t">${esc(w.name)}</div>
          <div class="m">${esc(w.type)} · WA ${sgn(Number(w.wa)||0)} · ${esc(w.dmg)}${mel&&k.melee?` ${sgn(k.melee)} STR`:""} · ROF ${esc(w.rof)} · ${esc(w.range)} · ${esc(w.rel)} · uses ${esc(skill)} ${lvl}${k.smart&&!mel?" · smartlinked +2":""}</div>
          ${shots?`<div class="row" style="margin-top:6px;gap:8px"><div class="ammo" aria-label="${w.ammo} of ${shots} rounds">${Array.from({length:Math.min(shots,50)},(_,j)=>`<i class="${j<w.ammo?"":"e"}"></i>`).join("")}</div><span class="mono faint" style="font-size:12px">${w.ammo}/${shots}</span>
          ${ed?`<button class="btn sm ghost" data-act="ammo" data-i="${i}" data-d="-1">−1</button>${Number(w.rof)>2?`<button class="btn sm ghost" data-act="ammo" data-i="${i}" data-d="-${Math.min(Number(w.rof),3)}">Burst −3</button><button class="btn sm ghost" data-act="ammo" data-i="${i}" data-d="-${Number(w.rof)}">Full auto −${esc(w.rof)}</button>`:""}<button class="btn sm ghost" data-act="ammo" data-i="${i}" data-d="reload">Reload</button>`:""}</div>`:""}
        </div>
        <div class="a"><button class="btn sm primary" data-act="atk-open" data-id="${esc(w.id)}">Attack…</button><button class="rollbtn" data-act="roll-attack" data-i="${i}" data-b="${toHit}">Hit <b>${toHit}</b>+D10</button>${parseDice(String(w.dmg||"").toUpperCase())?`<button class="rollbtn" data-act="roll-dmg" data-i="${i}">Dmg <b>${esc(w.dmg)}</b></button>`:""}${ed?`<button class="btn sm ghost" data-act="edit-item" data-id="${w.id}">${ui.editItem===w.id?"Close":"Edit"}</button>`:""}</div>
        ${ui.editItem===w.id&&ed?itemEditor(c,"weapons",i,[["name","Name","text"],["type","Type (P/SMG/RIF/SHT/HVY/MEL)","text"],["wa","WA","number"],["dmg","Damage","text"],["shots","Magazine","number"],["rof","ROF","text"],["range","Range","text"],["rel","Reliability","text"],["skill","Skill","text"],["cost","Cost","number"]]):""}
        </div>`)}).join(""):`<p class="faint" style="padding:14px 0;margin:0">No weapons. Add one from the catalog.</p>`}
    </div></section>
    <section class="panel"><div class="panel-h"><h3>Take damage</h3><span class="faint" style="font-size:12.5px">Armor → head ×2 → BTM (${k.btm}) → wounds</span></div><div class="panel-b" style="display:grid;gap:10px">
      <div class="row">
        <input type="number" id="dmg-amt" data-ui="dmg.amount" value="${esc(ui.dmg.amount)}" placeholder="Damage rolled" style="max-width:150px" aria-label="Damage rolled">
        <select data-act-change="dmg-loc" aria-label="Hit location" style="max-width:170px">${LOCS.map(l=>`<option value="${l[0]}" ${ui.dmg.loc===l[0]?"selected":""}>${l[1]} (SP ${spAt(c,l[0])})</option>`).join("")}</select>
        <button class="btn sm ghost" data-act="dmg-rollloc">Roll location</button>
        <label class="row" style="gap:4px"><input type="checkbox" data-act-change="dmg-ap" ${ui.dmg.ap?"checked":""}> AP rounds</label>
        <label class="row" style="gap:4px"><input type="checkbox" data-act-change="dmg-mono" ${ui.dmg.mono?"checked":""}> Mono-edge</label>
        <select data-act-change="dmg-cover" aria-label="Cover" style="max-width:190px"><option value="">No cover</option>${COVER.map(([n,v])=>`<option value="${v}|${esc(n)}" ${ui.dmg.cover===v+"|"+n?"selected":""}>Behind ${esc(n.toLowerCase())} (SP ${v})</option>`).join("")}</select>
        <button class="btn" data-act="dmg-calc">Calculate</button>
      </div>
      ${res?`<div class="calc-out"><div>${esc(res.text)}</div>${res.wounds>0&&ed?`<div class="row"><button class="btn primary sm" data-act="dmg-apply">Apply ${res.wounds} damage${res.ablate?" and ablate armor":""}</button><button class="btn sm ghost" data-act="dmg-clear">Dismiss</button></div>`:`<div><button class="btn sm ghost" data-act="dmg-clear">Dismiss</button></div>`}</div>`:""}
    </div></section>
    <section class="panel"><div class="panel-h"><h3>Armor worn</h3>${ed?`<div class="row"><button class="btn sm" data-act="open-modal" data-m="shop" data-tab="Armor">+ From catalog</button><button class="btn sm ghost" data-act="add-blank" data-list="armor">+ Custom</button></div>`:""}</div><div class="panel-b items" style="padding-block:0">
      ${c.armor.length?c.armor.map((a,i)=>{const dm=Object.entries(a.dmg||{}).filter(x=>x[1]>0);return `<div class="it" data-info="own:armor:${esc(a.id)}"><div style="min-width:0"><div class="t">${esc(a.name)} ${a.worn?`<span class="chip green">Worn</span>`:`<span class="chip ink">Stowed</span>`}</div>
        <div class="m">SP ${esc(a.sp)} · ${a.locs.map(l=>LOCS.find(x=>x[0]===l)?.[1]).join(", ")} · EV ${esc(a.ev)}${dm.length?` · ablated: ${dm.map(([l,v])=>LOCS.find(x=>x[0]===l)?.[1]+" −"+v).join(", ")}`:""}</div></div>
        <div class="a">${ed?`<button class="btn sm" data-act="toggle-worn" data-i="${i}">${a.worn?"Take off":"Wear"}</button>${dm.length?`<button class="btn sm ghost" data-act="repair-armor" data-i="${i}">Repair</button>`:""}<button class="btn sm ghost" data-act="edit-item" data-id="${a.id}">${ui.editItem===a.id?"Close":"Edit"}</button>`:""}</div>
        ${ui.editItem===a.id&&ed?itemEditor(c,"armor",i,[["name","Name","text"],["sp","SP","number"],["ev","EV","number"],["cost","Cost","number"]],`<div class="field" style="grid-column:1/-1"><span class="label">Covers</span><div class="row">${LOCS.map(l=>`<label class="row" style="gap:4px"><input type="checkbox" data-act-change="armor-loc" data-i="${i}" data-loc="${l[0]}" ${a.locs.includes(l[0])?"checked":""}>${l[1]}</label>`).join("")}</div></div>`):""}
      </div>`}).join(""):`<p class="faint" style="padding:14px 0;margin:0">No armor. Street wisdom says buy some.</p>`}
    </div></section>
  </div>`;
}
function itemEditor(c,list,i,fields,extra=""){
  const it=c[list][i];
  return `<div class="edit-box">${fields.map(([f,lab,t])=>`<div class="field"><label class="label" for="ed-${list}-${i}-${f}">${lab}</label><input id="ed-${list}-${i}-${f}" type="${t}" data-f="${list}.${i}.${f}" value="${esc(it[f]??"")}"></div>`).join("")}${extra}
  <div class="field" style="align-self:end"><button class="btn sm danger" data-act="del-item" data-list="${list}" data-i="${i}">${ui.confirm===it.id?"Confirm remove":"Remove"}</button></div></div>`;
}
function tabCyber(c,k,ed){
  const pct=k.humMax?clamp(k.humanity/k.humMax*100,0,100):0;
  const warn=k.eff.EMP<=0?["red","Cyberpsychosis. Humanity is gone; the GM takes over this character."]:k.eff.EMP<=2?["red","Danger zone. EMP is nearly gone; therapy or fewer implants, now."]:k.eff.EMP<=4?["amber","Getting chromed out. Watch the Humanity cost."]:["green","Stable."];
  const cats=[...new Set(c.cyber.map(x=>x.cat||"Other"))];
  return `<div style="display:grid;gap:14px">
    <section class="panel"><div class="panel-b hum">
      <div class="row" style="justify-content:space-between;align-items:flex-end"><div><span class="label">Humanity</span><div class="big-n num">${k.humanity}<span class="faint" style="font-size:24px"> / ${k.humMax}</span></div></div>
        <div style="text-align:right"><span class="label">Current EMP</span><div class="big-n num" style="color:${k.eff.EMP<=2?"var(--red)":"inherit"}">${k.eff.EMP}<span class="faint" style="font-size:24px"> / ${k.base.EMP}</span></div></div></div>
      <div class="hum-bar"><i style="width:${pct}%"></i>${Array.from({length:Math.max(0,k.base.EMP-1)},(_,j)=>`<span style="left:${(j+1)/k.base.EMP*100}%"></span>`).join("")}</div>
      <div class="row"><span class="chip ${warn[0]}">${warn[0]==="green"?"Stable":"Warning"}</span><span style="font-size:14px">${warn[1]}</span></div>
      <div class="row faint" style="font-size:12.5px;gap:14px"><span>Humanity loss from chrome: ${k.hcLoss}</span><span>Every 10 points lost costs 1 EMP.</span>
      ${ed?`<span class="row" style="gap:4px;margin-left:auto">Therapy / adjustments: <b class="mono">${sgn(Number(c.humanityAdj)||0)}</b><button class="icon-btn" data-act="num" data-f="humanityAdj" data-d="-1" aria-label="Lower">−</button><button class="icon-btn" data-act="num" data-f="humanityAdj" data-d="1" aria-label="Raise">+</button></span>`:""}</div>
    </div></section>
    <section class="panel"><div class="panel-h"><h3>Installed cyberware</h3>${ed?`<div class="row"><button class="btn sm" data-act="open-modal" data-m="shop" data-tab="Cyberware">+ From catalog</button><button class="btn sm ghost" data-act="add-blank" data-list="cyber">+ Custom</button></div>`:""}</div>
      <div class="panel-b items" style="padding-block:0">
      ${c.cyber.length?cats.map(cat=>`<div class="label" style="padding-top:12px">${esc(cat)}</div>${c.cyber.map((x,i)=>(x.cat||"Other")!==cat?"":`<div class="it" data-info="own:cyber:${esc(x.id)}"><div style="min-width:0"><div class="t">${esc(x.name)}</div>
        <div class="m">HC ${esc(x.hc||"—")} → lost ${esc(x.hcLoss)} · ${fmtEb(x.cost)}${x.init?` · +${x.init} initiative`:""}${x.armor?` · SP ${x.armor.sp}`:""}${x.mods?Object.entries(x.mods).map(([m,v])=>` · ${sgn(v)} ${m}`).join(""):""}${x.notes?" · "+esc(x.notes):""}</div></div>
        <div class="a">${ed?`<button class="btn sm ghost" data-act="edit-item" data-id="${x.id}">${ui.editItem===x.id?"Close":"Edit"}</button>`:""}</div>
        ${ui.editItem===x.id&&ed?itemEditor(c,"cyber",i,[["name","Name","text"],["cat","Category","text"],["hc","HC dice","text"],["hcLoss","Humanity lost","number"],["cost","Cost","number"],["notes","Notes","text"]]):""}</div>`).join("")}`).join(""):`<p class="faint" style="padding:14px 0;margin:0">Meat only, so far.</p>`}
    </div></section>
  </div>`;
}
function tabGear(c,k,ed){
  const ls=c.lifestyle||{};const monthly=(Number(ls.rent)||0)+(Number(ls.food)||0)+(Number(ls.other)||0);
  const value=[...c.weapons,...c.armor,...c.cyber].reduce((a,x)=>a+(Number(x.cost)||0),0)+c.gear.reduce((a,g)=>a+(Number(g.cost)||0)*(Number(g.qty)||1),0);
  return `<div style="display:grid;gap:14px">
    <section class="panel"><div class="panel-b row" style="justify-content:space-between;align-items:flex-end">
      <div><span class="label">Cash on hand</span><div class="big-n num">${(c.eb||0).toLocaleString("en-US")}<span style="font-size:24px">eb</span></div><span class="faint" style="font-size:12.5px">Gear value on file: ${fmtEb(value)}</span></div>
      ${ed?`<div class="row"><input type="number" id="eb-amt" placeholder="Amount" style="width:120px" aria-label="Amount"><button class="btn" data-act="eb" data-d="1">+ Earn</button><button class="btn" data-act="eb" data-d="-1">− Spend</button></div>`:""}
    </div></section>
    <section class="panel"><div class="panel-h"><h3>Gear</h3>${ed?`<div class="row"><button class="btn sm" data-act="open-modal" data-m="shop" data-tab="Gear">+ From catalog</button><button class="btn sm ghost" data-act="add-blank" data-list="gear">+ Custom</button></div>`:""}</div>
      <div class="panel-b items" style="padding-block:0">${c.gear.length?c.gear.map((g,i)=>`<div class="it"${GEAR_NOTES[g.name]||ITEM_DESC.g[g.name]||g.desc?` data-info="own:gear:${esc(g.id)}"`:""}><div style="min-width:0"><div class="t">${esc(g.name)}${Number(g.qty)>1?` <span class="faint mono">×${esc(g.qty)}</span>`:""}</div><div class="m">${fmtEb(g.cost)} each${g.notes?" · "+esc(g.notes):""}</div></div>
        <div class="a">${ed?`<button class="icon-btn" data-act="qty" data-i="${i}" data-d="-1" aria-label="Fewer">−</button><button class="icon-btn" data-act="qty" data-i="${i}" data-d="1" aria-label="More">+</button><button class="btn sm ghost" data-act="edit-item" data-id="${g.id}">${ui.editItem===g.id?"Close":"Edit"}</button>`:""}</div>
        ${ui.editItem===g.id&&ed?itemEditor(c,"gear",i,[["name","Name","text"],["qty","Qty","number"],["cost","Cost each","number"],["notes","Notes","text"]]):""}</div>`).join(""):`<p class="faint" style="padding:14px 0;margin:0">Empty pockets.</p>`}</div></section>
    <section class="panel"><div class="panel-h"><h3>Lifestyle</h3><span class="mono">${fmtEb(monthly)}/month</span></div><div class="panel-b grid2">
      <div class="field"><label class="label" for="ls-h">Housing</label><input id="ls-h" data-f="lifestyle.housing" value="${esc(ls.housing)}" ${ed?"":"disabled"} placeholder="Cube hotel, apartment, corporate conapt"></div>
      <div class="field"><label class="label" for="ls-r">Rent (eb/month)</label><input id="ls-r" type="number" data-f="lifestyle.rent" value="${esc(ls.rent)}" ${ed?"":"disabled"}></div>
      <div class="field"><label class="label" for="ls-f">Food (eb/month)</label><input id="ls-f" type="number" data-f="lifestyle.food" value="${esc(ls.food)}" ${ed?"":"disabled"}></div>
      <div class="field"><label class="label" for="ls-o">Other (eb/month)</label><input id="ls-o" type="number" data-f="lifestyle.other" value="${esc(ls.other)}" ${ed?"":"disabled"}></div>
      ${ed?`<div style="grid-column:1/-1"><button class="btn sm" data-act="pay-month" data-v="${monthly}">Pay this month (−${fmtEb(monthly)})</button></div>`:""}
    </div></section>
  </div>`;
}
function tabLifepath(c,k,ed){
  return `<div class="panel"><div class="panel-h"><h3>Lifepath</h3>${ed?`<button class="btn sm" data-act="lp-all">Reroll everything</button>`:""}</div><div class="panel-b" style="padding-block:0">${lpBody(c,ed)}</div></div>`;
}
function tabNotes(c,k,ed){
  return `<div style="display:grid;gap:14px">
    <section class="panel"><div class="panel-h"><h3>Contacts</h3>${ed?`<button class="btn sm" data-act="add-blank" data-list="contacts">+ Contact</button>`:""}</div><div class="panel-b items" style="padding-block:0">
      ${c.contacts.length?c.contacts.map((x,i)=>ed?`<div class="it" style="grid-template-columns:minmax(0,1fr)"><div class="grid3"><input data-f="contacts.${i}.name" value="${esc(x.name)}" placeholder="Name" aria-label="Contact name"><input data-f="contacts.${i}.role" value="${esc(x.role)}" placeholder="Who they are" aria-label="Contact role"><div class="row" style="flex-wrap:nowrap"><input data-f="contacts.${i}.notes" value="${esc(x.notes)}" placeholder="Notes" aria-label="Contact notes"><button class="btn sm ghost" data-act="del-item" data-list="contacts" data-i="${i}">${ui.confirm===x.id?"Confirm":"×"}</button></div></div></div>`
        :`<div class="it"><div><div class="t">${esc(x.name)}</div><div class="m">${esc(x.role)}${x.notes?" · "+esc(x.notes):""}</div></div></div>`).join(""):`<p class="faint" style="padding:14px 0;margin:0">Fixers, docs, cops on the take, people who owe you.</p>`}
    </div></section>
    <section class="panel"><div class="panel-h"><h3>Notes</h3></div><div class="panel-b"><textarea data-f="notes" style="min-height:200px" ${ed?"":"disabled"} aria-label="Notes" placeholder="Jobs, debts, secrets, plans">${esc(c.notes)}</textarea></div></section>
    ${ed&&c.id!=="sample"?`<section class="panel"><div class="panel-b row" style="justify-content:space-between"><span class="muted" style="font-size:13.5px">Delete this runner. You can still restore it from Backups → Recently deleted.</span><button class="btn danger" data-act="ask-delete" data-id="${esc(c.id)}">Delete character…</button></div></section>`:""}
  </div>`;
}

/* ============================== WINDOWS ============================== */
Object.assign(MODALS,{
  shop:()=>{const c=curChar();if(!c)return null;return {title:"The shop",body:shopBody(c)}},
  addskill:()=>({title:"Add a skill",body:`<div style="display:grid;gap:12px">
      <p class="muted" style="margin:0">For Expert skills, extra languages, a named martial art style, or anything your GM allows.</p>
      <div class="grid3"><div class="field" style="grid-column:span 2"><label class="label" for="ns-name">Skill name</label><input id="ns-name" placeholder="Know Language: Japanese"></div>
      <div class="field"><label class="label" for="ns-stat">Stat</label><select id="ns-stat">${STAT_KEYS.map(s=>`<option>${s}</option>`).join("")}</select></div></div>
      <div class="row">${["Know Language: ","Expert: ","Martial Art: Karate","Martial Art: Aikido"].map(p=>`<button class="btn sm ghost" data-act="ns-preset" data-v="${esc(p)}">${esc(p.trim())}</button>`).join("")}</div>
      <div class="field" style="max-width:160px"><label class="label" for="ns-mult">IP difficulty ×</label><input id="ns-mult" type="number" min="1" max="5" value="1"></div>
      <div><button class="btn primary" data-act="add-skill">Add skill</button></div></div>`}),
  newchar:()=>({title:"New runner",body:newCharBody()}),
  check:()=>({title:"Skill check",body:checkBody()}),
  attack:()=>({title:"Attack",body:attackBody()}),
});
function shopBody(c){
  const tabs=["Weapons","Armor","Cyberware","Gear","Drugs","Bodyshop","Decks","Programs"];const t=ui.shopTab;
  let rows="";
  if(t==="Weapons") rows=WEAPONS.map((w,i)=>shopRow(w[0],`${w[1]} · WA ${sgn(w[2])} · ${w[5]} · ${w[6]?w[6]+" shots · ":""}ROF ${w[7]} · ${w[9]} · ${w[8]} · Avail ${w[4]}`,w[10],"w",i)).join("");
  if(t==="Armor") rows=ARMOR.map((a,i)=>shopRow(a[0],`SP ${a[1]} · ${a[2].map(l=>LOCS.find(x=>x[0]===l)[1]).join(", ")} · EV ${a[3]}`,a[4],"a",i)).join("");
  if(t==="Cyberware"){let last="";rows=CYBER.map((x,i)=>{const head=x[1]!==last?`<div class="label" style="padding-top:12px">${x[1]}</div>`:"";last=x[1];return head+shopRow(x[0],`HC ${x[3]} (avg ${avgDice(x[3])}) · surgery ${surgOf(x)}`,x[2],"c",i)}).join("")}
  if(t==="Gear") rows=GEAR.map((g,i)=>shopRow(g[0],"",g[1],"g",i)).join("");
  if(t==="Drugs"||t==="Bodyshop") rows=medShopRows(c,t);
  if(t==="Decks") rows=DECKS.map((x,i)=>shopRow(x[0],`${DECK_TYPES[x[1]]||x[1]} · Speed ${sgn(x[2])} · Data walls ${x[3]} · ${x[4]} MU${c.deck?" · replaces your deck":""}`,x[5],"d",i)).join("");
  if(t==="Programs"){let last="";rows=SHOP_LISTS.p().map((x,i)=>{const head=x[1]!==last?`<div class="label" style="padding-top:12px">${esc(x[1])}</div>`:"";last=x[1];return head+shopRow(x[0],`STR ${x[2]} · ${x[3]} MU`,x[4],"p",i)}).join("")}
  return `<div style="display:grid;gap:12px">
    <div class="row" style="justify-content:space-between"><div class="seg">${tabs.map(x=>`<button class="${t===x?"on":""}" data-act="shop-tab" data-t="${x}">${x}</button>`).join("")}</div><span class="mono">Cash: <b>${fmtEb(c.eb)}</b></span></div>
    <div class="row"><label class="row" style="gap:6px"><input type="checkbox" data-act-change="shop-free" ${ui.shopFree?"checked":""}> Add without paying (loot, gifts, GM fiat)</label>
    ${t==="Cyberware"?`<label class="row" style="gap:6px" title="Surgical damage and the surgery fee, by the cyberware's surgery code"><input type="checkbox" data-act-change="shop-surg" ${ui.shopSurg?"checked":""}> Include surgery (damage and fee)</label><span class="seg" style="margin-left:auto"><button class="${ui.hcMode==="roll"?"on":""}" data-act="hc-mode" data-v="roll">Roll Humanity cost</button><button class="${ui.hcMode==="avg"?"on":""}" data-act="hc-mode" data-v="avg">Use average</button></span>`:""}</div>
    <div class="shop-split"><div class="shop-list">${rows}</div><aside class="shop-detail" id="shop-detail" data-keep aria-live="polite"><p class="faint shop-hint">Point at an item, or tap its name, to see exactly what it does for ${esc(c.handle||"this runner")}.</p></aside></div>
    <p class="faint" style="margin:0;font-size:12.5px">Catalog prices and Humanity costs are editable on each item after you add it, so you can match your table's books.</p>
  </div>`;
}
function shopRow(name,meta,cost,kind,i){
  const c=curChar();const short=!ui.shopFree&&c.eb<cost;
  return `<div class="shop-row" data-info="${kind}:${i}"><div style="min-width:0"><div class="t" tabindex="0" role="button" aria-label="${esc(name)}: what it does">${esc(name)} <span class="ii-i" aria-hidden="true">i</span></div>${meta?`<div class="m">${esc(meta)}</div>`:""}</div><span class="pr">${fmtEb(cost)}</span><button class="btn sm ${short?"":"blue"}" data-act="buy" data-k="${kind}" data-i="${i}" ${short?"disabled title='Not enough cash'":""}>${ui.shopFree?"Add":"Buy"}</button></div>`;
}
/* ============================== ACTIONS ============================== */
function mutate(fn,opts={}){const c=curChar();if(!c||!canEditChar(c)){if(c&&c.id==="sample")showNotice("This is the example character. Copy it to your runners to edit.");return}fn(c);saveChar(c,opts.now);render()}
Object.assign(A,{
  "new-char":el=>{const c=blankChar();c.guide=!!(el&&el.dataset&&el.dataset.guide==="1");addChar(c);ui.modal=null;ui.charId=c.id;ui.view="wizard";ui.skSearch="";render();window.scrollTo(0,0)},
  "toggle-guide":()=>{const c=curChar();if(!c)return;if(c.id==="sample"){ui.sampleGuide=!ui.sampleGuide;render();return}c.guide=!c.guide;saveChar(c);render()},
  "reopen-wiz":()=>{ui.view="wizard";render();window.scrollTo(0,0)},
  "toggle-adjust":()=>{ui.adjust=!ui.adjust;render()},
  "tab":el=>{ui.tab=el.dataset.t;ui.editItem=null;ui.confirm=null;render()},
  "wiz-go":el=>{const s=Number(el.dataset.step);const c=curChar();if(!c)return;if(s<0||s>6)return;if(canEditChar(c)){c.wizStep=s;saveChar(c)}else c.wizStep=s;ui.skSearch="";render();window.scrollTo(0,0)},
  "wiz-finish":()=>mutate(c=>{c.created=true;ui.view="sheet";ui.tab="skills"},{now:true}),
  "set-color":el=>mutate(c=>c.color=el.dataset.color),
  "set-role":el=>mutate(c=>{if(c.role===el.dataset.role)return;const old=careerList(c);old.forEach(n=>{if(n&&c.skills[n]){c.skills[n].c=0}});c.role=el.dataset.role;c.roleChoices={}}),
  "roll-age":()=>mutate(c=>{c.age=16+d(6)+d(6)}),
  "stat-method":el=>mutate(c=>{c.statMethod=el.dataset.m;if(c.statMethod==="cinematic"&&!POOLS.some(p=>p[0]===c.statPool))c.statPool=60}),
  "set-pool":el=>mutate(c=>c.statPool=Number(el.dataset.pool)),
  "roll-pool":()=>mutate(c=>{const r=Array.from({length:9},()=>d(10));c.statPool=Math.max(18,r.reduce((a,b)=>a+b,0));checkRollQuiet("Stat pool 9D10",r,c.statPool)}),
  "roll-fast":()=>mutate(c=>{STAT_KEYS.forEach(k=>{let v;do{v=d(10)}while(v<=2);c.stats[k]=v});c.statPool=statSum(c)}),
  "stat-step":el=>mutate(c=>{const k=el.dataset.k;c.stats[k]=clamp((c.stats[k]||2)+Number(el.dataset.d),2,10)}),
  "career-step":el=>mutate(c=>{const n=el.dataset.n;if(!n)return;const s=c.skills[n]||(c.skills[n]={c:0,p:0,b:0});const dd=Number(el.dataset.d);
    if(dd>0&&(careerUsed(c)>=40||skillLevel(c,n)>=10))return;s.c=clamp((s.c||0)+dd,0,10)}),
  "pickup-step":el=>mutate(c=>{const n=el.dataset.n;const s=c.skills[n]||(c.skills[n]={c:0,p:0,b:0});const dd=Number(el.dataset.d);
    if(dd>0&&(pickupUsed(c)>=pickupPool(c)||skillLevel(c,n)>=10))return;s.p=Math.max(0,(s.p||0)+dd)}),
  "lp-all":()=>mutate(c=>rollLifepath(c)),
  "lp-style":()=>mutate(c=>rollStyle(c.lifepath)),
  "lp-family":()=>mutate(c=>rollFamily(c.lifepath)),
  "lp-motive":()=>mutate(c=>rollMotive(c.lifepath)),
  "lp-events":()=>mutate(c=>rollEvents(c.lifepath,c.age||18)),
  "lp-event":el=>mutate(c=>{const i=Number(el.dataset.i);const e=c.lifepath.events[i];c.lifepath.events[i]=lifeEvent(e.age)}),
  "roll-funds":el=>mutate(c=>{const inc=Number(el.dataset.inc);const r=d(6);const months=Math.ceil(r/3);c.eb=inc*months;pushRoll({who:c.handle||"New runner",label:"Starting funds",detail:`1D6 = ${r} → ${months} month${months>1?"s":""} × ${fmtEb(inc)}`,total:c.eb,t:Date.now()})}),
  "shop-tab":el=>{ui.shopTab=el.dataset.t;const p=document.getElementById("shop-detail");if(p){delete p.dataset.key;const c=curChar();p.innerHTML=`<p class="faint shop-hint">Point at an item, or tap its name, to see exactly what it does for ${esc((c&&c.handle)||"this runner")}.</p>`}renderModal()},
  "hc-mode":el=>{ui.hcMode=el.dataset.v;renderModal()},
  "buy":el=>{const c=curChar();if(!c||!canEditChar(c)){showNotice(c&&c.id==="sample"?"This is the example character. Copy it to your runners to edit.":"You can't change this character.");return}
    const i=Number(el.dataset.i),k=el.dataset.k;let item,cost,label;
    if(k==="w"){const row=WEAPONS[i];cost=row[10];const fx=AREA_FX[row[0]];const ex=fx&&ATK_STACK.has(fx.kind)&&c.weapons.find(x=>x.name===row[0]);
      if(ex){ex.shots=String((Number(ex.shots)||0)+1);ex.ammo=(Number(ex.ammo)||0)+1;item=ex}else{item=mkWeapon(row);c.weapons.push(item)}}
    if(k==="a"){item=mkArmor(ARMOR[i]);cost=ARMOR[i][4];c.armor.push(item)}
    if(k==="g"){const g=GEAR[i];cost=g[1];const ex=c.gear.find(x=>x.name===g[0]);if(ex)ex.qty=(Number(ex.qty)||1)+1;else c.gear.push({id:uid(),name:g[0],qty:1,cost:g[1],notes:""});item={name:g[0]}}
    if(k==="c"){const r=CYBER[i];cost=r[2];let loss;if(ui.hcMode==="roll"){const rr=rollDice(r[3]);loss=rr?rr.total:0;pushRoll({who:c.handle||"Runner",label:`Humanity cost: ${r[0]}`,detail:`${r[3]} → ${rr?rr.text:"0"}`,total:loss,t:Date.now()})}else loss=avgDice(r[3]);item=mkCyber(r,loss);c.cyber.push(item);if(ui.shopSurg)cost+=medSurgery(c,r)}
    if(!ui.shopFree)c.eb=(Number(c.eb)||0)-cost;
    saveChar(c);renderModal();if(k!=="c")showNotice(`${ui.shopFree?"Added":"Bought"} ${item.name}.`);if(ui.view!=="roster")render();},
  "add-skill":()=>{const n=document.getElementById("ns-name").value.trim();const s=document.getElementById("ns-stat").value;const m=clamp(Number(document.getElementById("ns-mult").value)||1,1,5);
    if(!n){showNotice("Give the skill a name.");return}
    mutate(c=>{if(skillDef(c,n).custom||SKILL_BY_NAME[n]){return}c.customSkills.push({n,s,m});c.skills[n]=c.skills[n]||{c:0,p:0,b:0}});ui.modal=null;ui.skFilter="all";render()},
  "ns-preset":el=>{const i=document.getElementById("ns-name");i.value=el.dataset.v;i.focus();const s=document.getElementById("ns-stat");s.value=el.dataset.v.startsWith("Martial")?"REF":"INT";document.getElementById("ns-mult").value=el.dataset.v.startsWith("Martial")?3:1},
  "del-skill":el=>mutate(c=>{const n=el.dataset.n;c.customSkills=c.customSkills.filter(s=>s.n!==n);delete c.skills[n]}),
  "sk-filter":el=>{ui.skFilter=el.dataset.v;render()},
  "roll-stat":el=>{const c=curChar();const k=calc(c);const key=el.dataset.k;checkRoll(`${key} check`,k.eff[key],{dv:ui.dv})},
  "roll-skill":el=>{const c=curChar();const k=calc(c);const n=el.dataset.n;const def=skillDef(c,n);let base=(k.eff[def.s]||0)+skillLevel(c,n);
    if(n==="Awareness/Notice"&&c.role==="Solo")base+=skillLevel(c,"Combat Sense");
    checkRoll(`${n} (${def.s})`,base,{dv:ui.dv})},
  "buy-skill":el=>mutate(c=>{const n=el.dataset.n;const cost=ipCost(c,n);const avail=(c.ip.total||0)-(c.ip.spent||0);if(avail<cost)return;const from=skillLevel(c,n);if(from>=10)return;
    const s=c.skills[n]||(c.skills[n]={c:0,p:0,b:0});s.b=(s.b||0)+1;c.ip.spent=(c.ip.spent||0)+cost;(c.ipLog||(c.ipLog=[])).push({skill:n,from,to:from+1,cost,t:Date.now()})}),
  "undo-ip":()=>mutate(c=>{const l=(c.ipLog||[]).pop();if(!l)return;const s=c.skills[l.skill];if(s&&s.b>0)s.b--;c.ip.spent=Math.max(0,(c.ip.spent||0)-l.cost)}),
  "add-ip":()=>{const v=Number(document.getElementById("ip-add").value)||0;if(!v)return;mutate(c=>{c.ip.total=Math.max(0,(c.ip.total||0)+v)})},
  "adj-stat":el=>mutate(c=>{const k=el.dataset.k;c.stats[k]=clamp((c.stats[k]||0)+Number(el.dataset.d),1,20)}),
  "adj-skill":el=>mutate(c=>{const n=el.dataset.n;const s=c.skills[n]||(c.skills[n]={c:0,p:0,b:0});const dd=Number(el.dataset.d);if(dd>0&&skillLevel(c,n)>=10)return;
    if(dd>0)s.b=(s.b||0)+1;else{if(s.b>0)s.b--;else if(s.p>0)s.p--;else if(s.c>0)s.c--}}),
  "num":el=>mutate(c=>{const f=el.dataset.f;let v=(Number(getPath(c,f))||0)+Number(el.dataset.d);if(f==="wounds")v=clamp(v,0,40);if(f==="rep")v=clamp(v,0,10);if(f==="luckSpent")v=clamp(v,0,c.stats.LUCK||0);setPath(c,f,v)}),
  "set":el=>mutate(c=>setPath(c,el.dataset.f,Number(el.dataset.v))),
  "wound":el=>mutate(c=>{const n=Number(el.dataset.n);c.wounds=c.wounds===n?n-1:n}),
  "roll-save":el=>{const c=curChar();const k=calc(c);const t=el.dataset.t;const target=t==="stun"?k.stunSave:k.deathSave;const r=d(10);
    if(t==="death"&&r>target&&canEditChar(c)){medEnsure(c).dying=true;saveChar(c);render()}
    pushRoll({who:whoName(),label:t==="stun"?`Stun save (need ≤ ${target})`:`Death save (need ≤ ${target})`,detail:`D10 = ${r} → ${r<=target?(t==="stun"?"stays conscious":"survives this turn"):(t==="stun"?"knocked out":"dies")}`,total:r,t:Date.now()})},
  "roll-init":el=>{const fd=el.dataset.fd==="1";checkRoll(fd?"Initiative (fast draw)":"Initiative",Number(el.dataset.b),{area:"none"});const st0=atkState();const set=new Set(st0.sits||[]);if(fd)set.add("fastdraw");else set.delete("fastdraw");st0.sits=[...set];if(fd)showNotice("Fast draw: −3 to hit this round. It's switched on in the Attack window.")},
  "set-range":()=>{},
  "roll-attack":el=>{const c=curChar();const w=c.weapons[Number(el.dataset.i)];checkRoll(`Attack · ${w.name}`,Number(el.dataset.b),{dv:ui.rangeDv})},
  "roll-dmg":el=>{const c=curChar();const k=calc(c);const w=c.weapons[Number(el.dataset.i)];exprRoll(`Damage · ${w.name}`,w.dmg,w.type==="MEL"?k.melee:0)},
  "ammo":el=>mutate(c=>{const w=c.weapons[Number(el.dataset.i)];const shots=Number(w.shots)||0;if(el.dataset.d==="reload")w.ammo=shots;else w.ammo=clamp((Number(w.ammo)||0)+Number(el.dataset.d),0,shots)}),
  "edit-item":el=>{ui.editItem=ui.editItem===el.dataset.id?null:el.dataset.id;ui.confirm=null;render()},
  "del-item":el=>{const c=curChar();const list=el.dataset.list,i=Number(el.dataset.i);const it=c[list][i];if(ui.confirm!==it.id){ui.confirm=it.id;render();return}mutate(c=>{c[list].splice(i,1);ui.confirm=null;ui.editItem=null})},
  "add-blank":el=>mutate(c=>{const l=el.dataset.list;const id=uid();
    if(l==="weapons")c.weapons.push({id,name:"New weapon",type:"P",wa:0,conc:"J",avail:"C",dmg:"2D6",shots:10,ammo:10,rof:"2",rel:"ST",range:"50m",cost:0,skill:"Handgun"});
    if(l==="armor")c.armor.push({id,name:"New armor",sp:10,locs:["torso"],ev:0,cost:0,worn:true,dmg:{}});
    if(l==="cyber")c.cyber.push({id,name:"New cyberware",cat:"Other",cost:0,hc:"1D6",hcLoss:0,notes:""});
    if(l==="gear")c.gear.push({id,name:"New item",qty:1,cost:0,notes:""});
    if(l==="contacts"){c.contacts.push({id,name:"",role:"",notes:""});return}
    ui.editItem=id}),
  "toggle-worn":el=>mutate(c=>{const a=c.armor[Number(el.dataset.i)];a.worn=!a.worn}),
  "repair-armor":el=>mutate(c=>{c.armor[Number(el.dataset.i)].dmg={}}),
  "qty":el=>mutate(c=>{const g=c.gear[Number(el.dataset.i)];g.qty=Math.max(0,(Number(g.qty)||0)+Number(el.dataset.d))}),
  "eb":el=>{const v=Math.abs(Number(document.getElementById("eb-amt").value)||0);if(!v)return;mutate(c=>{c.eb=(Number(c.eb)||0)+v*Number(el.dataset.d)})},
  "pay-month":el=>mutate(c=>{c.eb=(Number(c.eb)||0)-Number(el.dataset.v)}),
  "dmg-rollloc":()=>{const r=d(10);ui.dmg.loc=r===1?"head":r<=4?"torso":r===5?"rarm":r===6?"larm":r<=8?"rleg":"lleg";showNotice(`Location roll ${r}: ${LOCS.find(l=>l[0]===ui.dmg.loc)[1]}`);render()},
  "dmg-calc":()=>{const c=curChar();const k=calc(c);const amt=Number(document.getElementById("dmg-amt").value)||0;ui.dmg.amount=amt||"";if(!amt){showNotice("Enter the damage rolled first.");return}
    const loc=ui.dmg.loc;const outerA=c.armor.filter(a=>a.worn&&a.locs.includes(loc)).sort((a,b)=>b.sp-a.sp)[0];const cov=ui.dmg.cover?Number(String(ui.dmg.cover).split("|")[0]):0;
    let sp=hitSP(spAt(c,loc),{ap:ui.dmg.ap,mono:ui.dmg.mono,hard:!!(outerA&&HARD_ARMOR.test(outerA.name)),cover:cov});const locName=LOCS.find(l=>l[0]===loc)[1];
    let pen=amt-sp;if(pen<=0){ui.dmg.result={text:`${amt} damage vs SP ${sp}${cov?" (armor and cover)":""} at the ${locName}: stopped${cov?"":" by armor"}. No wounds.`,wounds:0};render();return}
    let steps=[`${amt} − SP ${sp} = ${pen}`];
    if(ui.dmg.ap){pen=Math.max(1,Math.floor(pen/2));steps.push(`AP halves → ${pen}`)}
    if(loc==="head"){pen*=2;steps.push(`head ×2 → ${pen}`)}
    const fin=Math.max(1,pen+k.btm);steps.push(`BTM ${k.btm} → ${fin}`);
    const outer=c.armor.filter(a=>a.worn&&a.locs.includes(loc)).slice(-1)[0];
    let note="";if(fin>8&&loc!=="torso")note=loc==="head"?" Over 8 to the head: instant death unless the GM rules otherwise.":" Over 8 to a limb: the limb is severed or crushed. Make a death save at Mortal 0.";
    ui.dmg.result={text:`${locName}: ${steps.join(" · ")}. Takes ${fin} damage.${note}`,wounds:fin,ablate:outer?outer.id:null,loc};render()},
  "dmg-apply":()=>mutate(c=>{const r=ui.dmg.result;if(!r)return;c.wounds=clamp((c.wounds||0)+r.wounds,0,40);if(r.ablate){const a=c.armor.find(x=>x.id===r.ablate);if(a){a.dmg=a.dmg||{};a.dmg[r.loc]=(a.dmg[r.loc]||0)+1}}ui.dmg.result=null;ui.dmg.amount=""}),
  "dmg-clear":()=>{ui.dmg.result=null;render()},
  "print-char":el=>{const id=el.dataset.id;const c=id?(id===SAMPLE.id?SAMPLE:S.chars.get(id)):curChar();if(c)printCharacter(c)},
  "print-blank":()=>printBlank(),
});
function checkRollQuiet(label,rolls,total){pushRoll({who:whoName(),label,detail:`[${rolls.join(",")}]`,total,t:Date.now()})}
Object.assign(CHANGE,{
  "role-choice":el=>mutate(c=>{const i=el.dataset.i;const old=c.roleChoices[i];if(old&&c.skills[old])c.skills[old].c=0;c.roleChoices[i]=el.value||null}),
  "set-dv":el=>{ui.dv=el.value},
  "set-range":el=>{ui.rangeDv=Number(el.value);render()},
  "dmg-loc":el=>{ui.dmg.loc=el.value},
  "dmg-ap":el=>{ui.dmg.ap=el.checked},
  "dmg-mono":el=>{ui.dmg.mono=el.checked},
  "dmg-cover":el=>{ui.dmg.cover=el.value},
  "shop-free":el=>{ui.shopFree=el.checked;renderModal()},
  "armor-loc":el=>mutate(c=>{const a=c.armor[Number(el.dataset.i)];const l=el.dataset.loc;if(el.checked){if(!a.locs.includes(l))a.locs.push(l)}else a.locs=a.locs.filter(x=>x!==l)}),
});
document.addEventListener("input",ev=>{
  const el=ev.target;
  if(el.dataset.f){const c=curChar();if(!c||!canEditChar(c))return;const v=el.type==="number"?(el.value===""?0:Number(el.value)):el.value;setPath(c,el.dataset.f,v);saveChar(c);
    if(el.dataset.f.startsWith("weapons.")&&el.dataset.f.endsWith(".type")){const w=getPath(c,el.dataset.f.split(".").slice(0,2).join("."));if(WTYPE_SKILL[String(v).toUpperCase()])w.skill=WTYPE_SKILL[String(v).toUpperCase()]}}
});
/* the shop opens on a chosen tab */
{const _o=A["open-modal"];A["open-modal"]=el=>{if(el.dataset.tab)ui.shopTab=el.dataset.tab;_o(el)}}
