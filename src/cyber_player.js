/* Cyberpunk 2020 · the player's side of 1.1.4: cyberlimbs and cyberoptics with their options on the
   Cyberware tab, structure points, switching implants off and therapy, chipware, the adrenal booster,
   facedowns and Reputation, and pay. The rules are in cyber.js. */

/* ---------- the installed cyberware list ---------- */
function cyRow(c,x,ed,extra=""){const i=c.cyber.indexOf(x);const spec=optSpec(x);
  const btns=ed?`<div class="a">${/^Adrenal booster/.test(x.name)&&!x.off?`<button class="btn sm" data-act="cy-adrenal" data-id="${esc(x.id)}" title="+1 REF for 1D6+2 turns, three times a day">Boost (${ADRENAL_USES-(Number(c.adrenalUsed)||0)} left)</button>`:""}
    <button class="btn sm ghost" data-act="cy-off" data-id="${esc(x.id)}" title="${x.off?"Switch it back on":"Switch it off (for therapy, or when it's broken)"}">${x.off?"Switch on":"Off"}</button>
    <button class="btn sm ghost" data-act="edit-item" data-id="${x.id}">${ui.editItem===x.id?"Close":"Edit"}</button></div>`:"";
  return `<div class="it ${x.off?"cy-off":""}" data-info="own:cyber:${esc(x.id)}"><div style="min-width:0"><div class="t">${esc(x.name)}${x.off?` <span class="chip ink">Off</span>`:""}${spec&&spec.slots>1?` <span class="faint mono" style="font-size:12px">${spec.slots} spaces</span>`:""}</div>
    <div class="m">HC ${esc(x.hc||"—")} → lost ${esc(x.hcLoss)} · ${fmtEb(x.cost)}${x.init?` · +${x.init} initiative`:""}${x.armor?` · SP ${x.armor.sp}`:""}${x.mods?Object.entries(x.mods).map(([m,v])=>` · ${sgn(v)} ${m}`).join(""):""}${x.notes?" · "+esc(x.notes):""}</div>${extra}</div>
    ${btns}
    ${ui.editItem===x.id&&ed?itemEditor(c,"cyber",i,[["name","Name","text"],["cat","Category","text"],["hc","HC dice","text"],["hcLoss","Humanity lost","number"],["cost","Cost","number"],["notes","Notes","text"]]):""}</div>`}
function cyHostHTML(c,h,ed){const kind=hostKind(h);const K=HOST_KINDS[kind];const used=hostUsed(c,h);const opts=optsOn(c,h);
  const locSel=ed?`<select data-act-change="cy-loc" data-id="${esc(h.id)}" aria-label="Which side" class="sm">${K.locs.map(l=>`<option value="${l}" ${h.loc===l?"selected":""}>${HOST_LOC_NAMES[l]}</option>`).join("")}</select>`:`<b>${esc(hostLabel(h))}</b>`;
  let sdp="";if(kind!=="eye"){const s=limbSDP(c,h);const st=limbState(c,h);
    sdp=`<div class="cy-sdp"><span class="label">Structure</span><div class="sdp-bar" title="${s.dmg} of ${s.des} structural damage"><i style="width:${Math.min(100,s.dmg/s.des*100)}%"></i><span style="left:${s.dis/s.des*100}%"></span></div>
      <span class="mono">${s.dmg}/${s.des}</span><span class="chip ${st==="working"?"green":st==="disabled"?"amber":"red"}">${st==="working"?"Working":st==="disabled"?"Useless":"Destroyed"}</span>
      ${ed?`<span class="row" style="gap:2px;flex-wrap:nowrap"><button class="icon-btn" data-act="cy-sdp" data-id="${esc(h.id)}" data-d="-1" aria-label="Repair 1">−</button><button class="icon-btn" data-act="cy-sdp" data-id="${esc(h.id)}" data-d="1" aria-label="Damage 1">+</button>${s.dmg?`<button class="btn sm ghost" data-act="cy-sdp" data-id="${esc(h.id)}" data-d="reset">Repaired</button>`:""}</span>`:""}
      <span class="faint" style="font-size:12px">Useless at ${s.dis}, destroyed at ${s.des}. ${esc(limbAttacks(c,h))}.</span></div>`}
  return `<div class="cy-host"><div class="row" style="justify-content:space-between;gap:8px"><div class="row" style="gap:8px">${locSel}<span class="faint mono" style="font-size:12px">${used}/${K.slots} option spaces</span></div></div>
    ${cyRow(c,h,ed,sdp)}
    <div class="cy-opts">${opts.length?opts.map(o=>cyRow(c,o,ed)).join(""):`<p class="faint" style="margin:4px 0;font-size:12.5px">No options yet. ${kind==="eye"?"Up to 4 per eye.":kind==="arm"?"Up to 4, a hand counts as one.":"Up to 3, a foot counts as one."}</p>`}</div></div>`}
function cyberListHTML(c,k,ed){if(!c.cyber.length)return `<p class="faint" style="padding:14px 0;margin:0">Meat only, so far.</p>`;
  const hosts=hostsOf(c);const ids=new Set(hosts.map(h=>h.id));
  const loose=c.cyber.filter(x=>!hostKind(x)&&optSpec(x)&&!ids.has(x.on));
  const rest=c.cyber.filter(x=>!hostKind(x)&&!(optSpec(x)&&ids.has(x.on))&&!loose.includes(x));
  const cats=[...new Set(rest.map(x=>x.cat||"Other"))];
  return `${hosts.length?`<div class="label" style="padding-top:12px">Cyberlimbs & cyberoptics</div>${hosts.map(h=>cyHostHTML(c,h,ed)).join("")}`:""}
    ${loose.length?`<div class="label" style="padding-top:12px">Options with nowhere to go</div>${loose.map(x=>{const spec=optSpec(x);const fit=hosts.filter(h=>hostRoom(c,h,spec,x));
      return cyRow(c,x,ed,`<div class="row" style="gap:6px;margin-top:4px">${fit.length&&ed?`<select data-act-change="cy-attach" data-id="${esc(x.id)}" class="sm" aria-label="Put it on"><option value="">Put it on…</option>${fit.map(h=>`<option value="${esc(h.id)}">${esc(hostLabel(h))}</option>`).join("")}</select>`:`<span class="faint" style="font-size:12.5px">Needs ${OPT_ON_LABEL[spec.on]} with room.</span>`}</div>`)}).join("")}`:""}
    ${cats.map(cat=>`<div class="label" style="padding-top:12px">${esc(cat)}</div>${rest.filter(x=>(x.cat||"Other")===cat).map(x=>cyRow(c,x,ed)).join("")}`).join("")}
    ${chipsHTML(c,k,ed)}`}

/* ---------- therapy ---------- */
function therapyHTML(c,k,ed){if(!ed)return "";const lost=Math.max(0,k.humMax-k.humanity);if(!lost)return "";const on=(c.cyber||[]).filter(x=>!x.off).length;
  return `<span class="row cy-therapy" style="gap:6px;margin-left:auto">${on?`<span class="faint">Therapy needs every implant removed or switched off (${on} still on).</span>`:`<span>Therapy: 2 EMP a week</span><input type="number" min="1" max="20" data-cyui="weeks" value="${esc((ui.cy&&ui.cy.weeks)||1)}" style="width:56px" aria-label="Weeks of therapy"><button class="btn sm" data-act="cy-therapy">Weeks done</button>`}</span>`}

/* ---------- chipware ---------- */
function chipsHTML(c,k,ed){const hw=chipHW(c);const chips=c.chips||[];const inN=chipsIn(c).length;const u=ui.cy||(ui.cy={});
  if(!chips.length&&!hw)return "";
  const sel=CHIPS.find(r=>r[0]===u.chip)||CHIPS[0];const lvl=clamp(Number(u.clvl)||1,1,3);
  return `<div class="label" style="padding-top:12px">Chipware</div>
    <p class="faint" style="margin:4px 0 6px;font-size:12.5px">${hw?`A working chip sets the skill to the chip's level, higher or lower. Chips slotted: ${inN} of ${k.eff.INT} (your INT).`:"Chips need a neural processor and interface plugs or a chipware socket."} Reflex (APTR) chips need 2 days of practice per level before they work fully.</p>
    ${chips.map(x=>{const eff=chipEff(x);return `<div class="it"><div style="min-width:0"><div class="t">${esc(x.skill)} +${x.lvl} <span class="chip ${x.kind==="APTR"?"blue":"ink"}">${esc(x.kind)}</span>${x.slot?` <span class="chip green">Slotted</span>`:""}</div>
      <div class="m">${x.kind==="APTR"?`Chipped in ${Number(x.days)||0} of ${x.lvl*2} days → works at +${eff}`:"Works at once"} · ${fmtEb(x.cost)}</div></div>
      ${ed?`<div class="a">${x.kind==="APTR"&&eff<x.lvl?`<button class="btn sm ghost" data-act="chip-day" data-id="${esc(x.id)}">+1 day practice</button>`:""}<button class="btn sm" data-act="chip-slot" data-id="${esc(x.id)}" ${!x.slot&&(!hw||inN>=k.eff.INT)?"disabled":""}>${x.slot?"Pull it":"Slot it"}</button><button class="btn sm ghost" data-act="chip-del" data-id="${esc(x.id)}">${ui.confirm===x.id?"Confirm":"Remove"}</button></div>`:""}</div>`}).join("")}
    ${ed?`<div class="chip-buy row" style="gap:6px;flex-wrap:wrap;padding:8px 0"><select data-act-change="chip-pick" class="sm" aria-label="Chip">${CHIPS.map(r=>`<option value="${esc(r[0])}" ${r[0]===sel[0]?"selected":""}>${esc(r[0])} (${r[1]}, ${r[2]}eb a level)</option>`).join("")}</select>
      ${sel[3]?`<input data-cyui="csub" value="${esc(u.csub||"")}" placeholder="${esc(sel[3])}" style="width:120px" aria-label="${esc(sel[3])}">`:""}
      <span class="seg">${[1,2,3].map(n=>`<button class="${lvl===n?"on":""}" data-act="chip-lvl" data-v="${n}">+${n}</button>`).join("")}</span>
      <button class="btn sm blue" data-act="chip-buy">Buy chip (${fmtEb(chipCost(sel,lvl))})</button></div>`:""}`}

/* ---------- pay ---------- */
function jobHTML(c,ed){const j=jobOf(c);if(!j)return "";
  return `<div class="field" style="grid-column:1/-1"><span class="label">Job · ${esc(c.role)}, ${esc(abilityOf(c))} ${skillNatural(c,abilityOf(c))}</span>
    <div class="row" style="justify-content:space-between;gap:8px"><span>${c.unemployed?`<span class="chip amber">Out of work</span> `:""}<b>${esc(j.title)}</b> · ${fmtEb(j.pay)} a month</span>
    ${ed?`<span class="row" style="gap:6px">${c.unemployed?`<button class="btn sm ghost" data-act="job-back">Found work</button>`:`<button class="btn sm" data-act="get-paid" data-v="${j.pay}">Get paid this month (+${fmtEb(j.pay)})</button>`}</span>`:""}</div></div>`}

/* ---------- facedowns ---------- */
MODALS.facedown=()=>{const c=curChar();if(!c)return null;const k=calc(c);const u=ui.fd||(ui.fd={name:"",cool:"",rep:""});
  return {title:"Facedown",body:`<div style="display:grid;gap:12px">
    <p class="muted" style="margin:0">A duel of wills before a fight. Both sides roll COOL + Reputation + 1D10. The loser backs down, or attacks the winner at −3 until they beat them once. A tie: no penalty.</p>
    <div class="row" style="gap:10px"><span><b>${esc(c.handle||"You")}</b>: COOL ${k.eff.COOL} + Rep ${c.repCoward?"−":""}${c.rep||0}</span>${canEditChar(c)?`<label class="row" style="gap:6px"><input type="checkbox" data-act-change="rep-coward" ${c.repCoward?"checked":""}> My reputation is for cowardice</label>`:""}</div>
    <div class="grid3"><div class="field"><label class="label" for="fd-n">Who you're facing</label><input id="fd-n" data-fdui="name" value="${esc(u.name)}" placeholder="Ironmaster"></div>
      <div class="field"><label class="label" for="fd-c">Their COOL</label><input id="fd-c" type="number" min="0" max="20" data-fdui="cool" value="${esc(u.cool)}" placeholder="Ask the GM"></div>
      <div class="field"><label class="label" for="fd-r">Their Rep</label><input id="fd-r" type="number" min="-10" max="10" data-fdui="rep" value="${esc(u.rep)}" placeholder="0"></div></div>
    <div class="row"><button class="btn primary" data-act="fd-roll">Stare them down</button><span class="faint" style="font-size:12.5px">Leave their numbers blank to roll just yours and let the GM roll theirs.</span></div>
    ${u.last?`<div class="banner">${esc(u.last)}</div>`:""}</div>`}};
document.addEventListener("input",ev=>{const el=ev.target;if(!el.dataset)return;if(el.dataset.fdui){(ui.fd||(ui.fd={}))[el.dataset.fdui]=el.value}if(el.dataset.cyui){(ui.cy||(ui.cy={}))[el.dataset.cyui]=el.value}});

/* ---------- the shop: which limb or eye an option goes on ---------- */
{const _sb=shopBody;shopBody=function(c0){const c=c0||curChar();let h=_sb(c0);if(ui.shopTab!=="Cyberware"||!c)return h;const hosts=hostsOf(c);if(!hosts.length)return h;
  const pick=`<label class="row" style="gap:6px"><span class="label">Options go on</span><select data-act-change="shop-host" class="sm" aria-label="Options go on"><option value="">The first with room</option>${hosts.map(x=>`<option value="${esc(x.id)}" ${ui.shopHost===x.id?"selected":""}>${esc(hostLabel(x))} (${hostUsed(c,x)}/${HOST_KINDS[hostKind(x)].slots})</option>`).join("")}</select></label>`;
  return h.replace('<div class="shop-split">',`<div class="row">${pick}</div><div class="shop-split">`)}}
{const _ci=cyberInfo;cyberInfo=function(x,c){let h=_ci(x,c);const spec=optSpec(x);const k=hostKind(x);
  const row=k?iiRow("Options",`Holds ${HOST_KINDS[k].slots} options${k==="eye"?"":`. Takes 20 structural damage before it's useless and 30 before it's destroyed, with no pain or stun`}.`):spec?iiRow("Goes on",`${OPT_ON_LABEL[spec.on].replace(/^a /,"A ")}${spec.cover?", as its covering (one per limb)":spec.slots>1?`, taking ${spec.slots} option spaces`:""}.`):"";
  if(!row)return h;return /<\/div><div class="ii-f">/.test(h)?h.replace(/<\/div>(<div class="ii-f">)/,row+"</div>$1"):h+row}}

Object.assign(A,{
  "cy-off":el=>mutate(c=>{const x=c.cyber.find(y=>y.id===el.dataset.id);if(x)x.off=!x.off}),
  "cy-sdp":el=>mutate(c=>{const x=c.cyber.find(y=>y.id===el.dataset.id);if(!x)return;const s=limbSDP(c,x);x.sdpDmg=el.dataset.d==="reset"?0:clamp((Number(x.sdpDmg)||0)+Number(el.dataset.d),0,s.des)}),
  "cy-adrenal":el=>mutate(c=>{const used=Number(c.adrenalUsed)||0;if(used>=ADRENAL_USES){showNotice("Used three times today. It recharges when a day passes (Medical tab).");return}
    const n=d(6)+2;c.adrenalUsed=used+1;c.fx=[...(c.fx||[]).filter(f=>f.name!=="Adrenal booster"),{id:uid(),name:"Adrenal booster",mods:{REF:1},until:`${n} turns`,notes:""}];
    Dice.raw(`${whoOf(c)} kicks in the adrenal booster`,`+1 REF for 1D6+2 = ${n} turns. ${ADRENAL_USES-c.adrenalUsed} use${ADRENAL_USES-c.adrenalUsed===1?"":"s"} left today.`,n,whoOf(c))}),
  "cy-therapy":()=>mutate(c=>{const k=calc(c);const w=clamp(Number((ui.cy&&ui.cy.weeks)||1),1,52);const lost=Math.max(0,k.humMax-k.humanity);const back=Math.min(lost,w*20);
    c.humanityAdj=(Number(c.humanityAdj)||0)+back;Dice.raw(`${whoOf(c)}: ${w} week${w===1?"":"s"} of therapy`,`+${back} Humanity (2 EMP a week). Now ${calc(c).humanity}.`,"",whoOf(c))}),
  "chip-lvl":el=>{(ui.cy||(ui.cy={})).clvl=Number(el.dataset.v);render()},
  "chip-buy":()=>mutate(c=>{const u=ui.cy||{};const r=CHIPS.find(x=>x[0]===u.chip)||CHIPS[0];const lvl=clamp(Number(u.clvl)||1,1,3);const cost=chipCost(r,lvl);
    if(!ui.shopFree&&(Number(c.eb)||0)<cost){showNotice("Not enough cash.");return}const sub=(u.csub||"").trim().slice(0,40);
    const skill=r[3]==="style"?`Martial Art${sub?": "+sub:""}`:r[3]?`${r[0]}${sub?": "+sub:""}`:r[0];
    c.chips=[...(c.chips||[]),{id:uid(),skill,kind:r[1],lvl,days:0,slot:false,cost}];if(!ui.shopFree)c.eb=(Number(c.eb)||0)-cost;showNotice(`Bought a ${skill} +${lvl} chip.`)}),
  "chip-slot":el=>mutate(c=>{const x=(c.chips||[]).find(y=>y.id===el.dataset.id);if(!x)return;if(!x.slot){if(!chipHW(c)){showNotice("You need a neural processor and interface plugs or a chipware socket.");return}if(chipsIn(c).length>=calc(c).eff.INT){showNotice("You can run as many chips as your INT. Pull one first.");return}}x.slot=!x.slot}),
  "chip-day":el=>mutate(c=>{const x=(c.chips||[]).find(y=>y.id===el.dataset.id);if(x)x.days=Math.min(x.lvl*2,(Number(x.days)||0)+1)}),
  "chip-del":el=>{const c=curChar();const x=c&&(c.chips||[]).find(y=>y.id===el.dataset.id);if(!x)return;if(ui.confirm!==x.id){ui.confirm=x.id;render();return}mutate(c=>{c.chips=c.chips.filter(y=>y.id!==x.id);ui.confirm=null})},
  "rep-known":()=>{const c=curChar();if(!c)return;const r=d(10);const rep=Number(c.rep)||0;const known=r<=rep;
    Dice.raw(`Has someone heard of ${whoOf(c)}?`,`1D10 = ${r} vs Rep ${rep}: ${known?(c.repCoward?"they know you, as a coward":"they know who you are"):"they've never heard of you"}. ${repText(rep)}`,r,whoOf(c),[{t:known?"Known":"Unknown",c:known?"amber":"ink"}])},
  "fd-roll":()=>{const c=curChar();if(!c)return;const k=calc(c);const u=ui.fd||(ui.fd={});const me={name:whoOf(c),cool:k.eff.COOL,rep:Number(c.rep)||0,coward:!!c.repCoward};
    if(u.cool===""||u.cool==null){const r=d10x();const t=me.cool+(me.coward?-me.rep:me.rep)+r.reduce((a,b)=>a+b,0);Dice.raw(`Facedown: ${me.name}`,`COOL ${me.cool} + Rep ${me.coward?"−":""}${me.rep} + D10 (${r.join("+")}) = ${t}. The GM rolls the other side.`,t,me.name);u.last=`You rolled ${t}. The GM rolls the other side; the lower total backs down or fights at −3.`}
    else{const o={name:(u.name||"").trim()||"Them",cool:Number(u.cool)||0,rep:Number(u.rep)||0};u.last=facedown(me,o,me.name).text}renderModal()},
  "get-paid":el=>mutate(c=>{const v=Number(el.dataset.v)||0;c.eb=(Number(c.eb)||0)+v;Dice.raw(`${whoOf(c)} gets paid`,`+${fmtEb(v)} for the month.`,v,whoOf(c))}),
  "job-back":()=>mutate(c=>{c.unemployed=false}),
});
Object.assign(CHANGE,{
  "cy-loc":el=>mutate(c=>{const x=c.cyber.find(y=>y.id===el.dataset.id);if(!x)return;const other=hostsOf(c).find(h=>h!==x&&hostKind(h)===hostKind(x)&&h.loc===el.value);if(other)other.loc=x.loc;x.loc=el.value}),
  "cy-attach":el=>mutate(c=>{const x=c.cyber.find(y=>y.id===el.dataset.id);if(x&&el.value)x.on=el.value}),
  "chip-pick":el=>{(ui.cy||(ui.cy={})).chip=el.value;render()},
  "shop-host":el=>{ui.shopHost=el.value||null;renderModal()},
  "rep-coward":el=>{mutate(c=>{c.repCoward=el.checked});renderModal()},
});
