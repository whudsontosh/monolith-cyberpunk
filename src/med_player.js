/* Cyberpunk 2020 · the player's Medical tab (1.1.2): condition, treatment, healing over time, Trauma Team,
   drugs and the drug lab, treating someone else, surgery when you install cyberware, and the shop's Drugs and
   Bodyshop counters. The rules and shared panels are in med.js. */

function medEdit(id,fn){mutate(fn)}
function medUI(id){ui.med=ui.med||{};const k=id||"_";if(!ui.med[k])ui.med[k]={who:"other",tot:"",adv:[],days:""};return ui.med[k]}

function tabMed(c,k,ed){const u=medUI(c.id);const ctx={ed,u,gm:false};
  return `<div class="med-cols"><div style="display:grid;gap:14px;min-width:0">${medCondHTML(c,k,ctx)}${medTreatHTML(c,k,ctx)}${medHealHTML(c,k,ctx)}</div>
    <div style="display:grid;gap:14px;min-width:0">${medDrugsHTML(c,k,ed)}${medTTHTML(c,k,ctx)}${medMedicHTML(c,k,ed)}</div></div>`}
function medDrugsHTML(c,k,ed){const carried=drugCarried(c);const fx=medFxHTML(c,{ed});
  return `<section class="panel"><div class="panel-h"><h3>Drugs & effects</h3>${ed?`<div class="row" style="gap:6px"><button class="btn sm" data-act="open-modal" data-m="shop" data-tab="Drugs">+ Buy</button><button class="btn sm ghost" data-act="open-modal" data-m="druglab">Drug lab…</button></div>`:""}</div><div class="panel-b med-grid">
    ${carried.length?`<div class="items">${carried.map(g=>`<div class="it" data-info="own:gear:${esc(g.id)}"><div style="min-width:0"><div class="t">${esc(g.name)} <span class="faint mono">×${esc(g.qty)}</span></div><div class="m">${esc(drugSummary(g.drug))}</div></div>${ed?`<button class="btn sm" data-act="med-dose" data-gid="${esc(g.id)}">Take a dose</button>`:""}</div>`).join("")}</div>`:`<p class="faint med-p">No drugs on you.</p>`}
    ${fx?`<span class="label">Running now</span>${fx}`:""}${medSavesHTML(c,{ed})}</div></section>`}
function medMedicHTML(c,k,ed){const u=medUI(c.id);const p=medMedicParts(c,k);
  return `<section class="panel"><div class="panel-h"><h3>Treat someone else</h3></div><div class="panel-b med-grid">
    <p class="faint med-p">TECH ${p.t} · First Aid ${p.fa} · Medical Tech ${p.mt}. Tell the GM or the patient's player the result, or they can roll it on their own Medical tab with your total.</p>
    <label class="row" style="gap:6px"><span class="label">Their damage</span><input type="number" min="0" max="40" data-medui="pdmg" data-id="${esc(c.id)}" value="${esc(u.pdmg||"")}" style="width:72px" placeholder="—" aria-label="Patient's total damage"></label>
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-act="med-medic" data-s="stab">Stabilize (${p.t}+${Math.max(p.fa,p.mt)})</button><button class="btn sm" data-act="med-medic" data-s="first">First Aid (${p.t+p.fa})</button>${p.mt?`<button class="btn sm" data-act="med-medic" data-s="medtech">Medical Tech (${p.t+p.mt})</button>`:""}</div>
    ${u.medicLast?`<p class="med-p">${esc(u.medicLast)}</p>`:""}</div></section>`}

/* ---------- surgery when cyberware goes in ---------- */
function medSurgery(c,r){const code=surgOf(r);const s=SURGERY[code];const rr=rollDice(s.dmg);const dmg=rr?rr.total:0;
  c.wounds=clamp((Number(c.wounds)||0)+dmg,0,40);const k=calc(c);
  Dice.raw(`Surgery: ${r[0]}`,`${s.name} (${code}): ${s.where}, ${s.hrs} hr. Surgical damage ${s.dmg} → ${rr?rr.text:dmg} = ${dmg}. Fee ${s.cost?fmtEb(s.cost):"included"}. Now ${woundLabel(k.level)} (${k.w}).`,dmg,whoOf(c),[{t:code,c:"ink"}]);
  const m=medEnsure(c);if(!m.treat)m.treat="medtech";m.log=[`${r[0]} installed: ${dmg} surgical damage. The surgeon's Medical Tech check is part of the operation, so it heals at the Medical Tech rate.`,...(m.log||[])].slice(0,12);
  return s.cost}

/* ---------- shop counters ---------- */
function medShopList(c){return [...DRUGS.map(x=>({...clone(x),book:true})),...(c.drugsMade||[])]}
function medShopRows(c,t){
  if(t==="Drugs"){const L=medShopList(c);return `<div class="label" style="padding-top:12px">Street drugs</div>`+L.map((x,i)=>(i===DRUGS.length?`<div class="label" style="padding-top:12px">Your formulas</div>`:"")+shopRow(x.name,`${x.type||"Designer drug"} · Str +${x.str} · Diff ${drugDiff(x)} · ${(DRUG_DUR.find(y=>y[0]===x.dur)||[])[1]} · ${drugSummary(x)}`,x.pack?x.packCost:drugCost(x),"dr",i)).join("")}
  let last="";return BODYSHOP.map((x,i)=>{const g={look:"Bodysculpting",attr:"Bodysculpting",exotic:"Exotics",part:"Body bank",vat:"Vat-grown tissue",store:"Body bank storage",tt:"Trauma Team",nano:"Treatments"}[x[2]];const head=g!==last?`<div class="label" style="padding-top:12px">${g}</div>`:"";last=g;return head+shopRow(x[0],x[3].note||"",x[1],"bs",i)}).join("")}
function medBuy(el){const c=curChar();if(!c||!canEditChar(c)){showNotice("You can't change this character.");return}if(typeof shopLocked==="function"&&shopLocked(c)){showNotice("The shop is closed. Your GM opens it when you reach a vendor.");return}const i=Number(el.dataset.i);const free=ui.shopFree;
  const shop=typeof charShop==="function"?charShop(c):null;const kind=el.dataset.k;
  if(el.dataset.k==="dr"){const x=medShopList(c)[i];if(!x)return;if(x.book&&shopHidden(shop,"dr",x.name))return;const cost=x.book?shopPrice(shop,"dr",[x.name,x.pack?x.packCost:drugCost(x)]):drugCost(x);const n=x.pack||1;
    const ex=c.gear.find(g=>g.drug&&g.name===x.name);if(ex)ex.qty=(Number(ex.qty)||0)+n;else c.gear.push({id:uid(),name:x.name,qty:n,cost:Math.round(cost/n),notes:x.type||"Drug",desc:x.text||"",drug:clone(x)});
    if(!free)c.eb=(Number(c.eb)||0)-cost;saveChar(c);renderModal();render();showNotice(`${free?"Added":"Bought"} ${x.pack?x.pack+" × ":""}${x.name}.`);return}
  const r=BODYSHOP[i];if(!r||shopHidden(shop,"bs",r[0]))return;const [name,,kind2,ex]=r;const cost=shopPrice(shop,"bs",r);const kindB=kind2;let msg=`${free?"Added":"Bought"}: ${name}.`;
  if(kindB==="part"){const roll=d(10);if(roll<=3){Dice.raw(`Body bank: ${name.replace(/^Body bank: /,"")}`,`1D10 = ${roll}: not in today. Try again tomorrow.`,roll,whoOf(c),[{t:"Not in",c:"amber"}]);showNotice("Not in today (1D10 "+roll+"). Try again tomorrow.");return}
    c.gear.push({id:uid(),name:`Replacement ${name.replace(/^Body bank: /,"")} (body bank)`,qty:1,cost,notes:roll<=5?"A different color, or another small mismatch":"A good match",desc:"Needs Critical (CR) surgery to attach."});
    Dice.raw(`Body bank: ${name.replace(/^Body bank: /,"")}`,`1D10 = ${roll}: ${roll<=5?"in, but a different color or another small mismatch":"in, and a good match"}.`,roll,whoOf(c),[{t:"In stock",c:"green"}])}
  if(kindB==="vat")c.gear.push({id:uid(),name:`Replacement ${name.replace(/^Vat-grown: /,"")} (vat-grown)`,qty:1,cost,notes:"Matches your genes",desc:"Needs Critical (CR) surgery to attach."});
  if(kindB==="store")c.gear.push({id:uid(),name,qty:1,cost,notes:ex.note,desc:ex.note});
  if(kindB==="tt"){medEnsure(c).tt="account";msg="Trauma Team account paid for this month.";}
  if(kindB==="nano"){const roll=d(10);if(roll!==1){Dice.raw("Nanotech: does this hospital have it?",`1D10 = ${roll}: no (only 1 in 10 do).`,roll,whoOf(c),[{t:"Not here",c:"amber"}]);showNotice("This hospital doesn't have nanotech. Only 1 in 10 do.");return}medEnsure(c).nano=true;msg="Nanotech treatment: +1 healing a day while you're treated."}
  if(kindB==="look"||kindB==="attr"||kindB==="exotic"){const item={id:uid(),name:kindB==="attr"?"Bodysculpt (+1 ATTR)":name.replace(/^Exotic: /,"Exotic "),cat:"Bodysculpt",cost,hc:"0",hcLoss:0,notes:ex.note||"",surg:"M",...(kindB==="attr"?{mods:{ATTR:1}}:{}),...(ex.mods?{mods:clone(ex.mods)}:{})};c.cyber.push(item);
    if(ex.cancer){const roll=d(10);Dice.raw("Skin alteration: cancer check",`1D10 = ${roll}${roll===1?": the graft mutates into skin cancer.":": no cancer."}`,roll,whoOf(c),[{t:roll===1?"Cancer":"Clear",c:roll===1?"red":"green"}])}}
  if(!free)c.eb=(Number(c.eb)||0)-cost;saveChar(c);renderModal();render();showNotice(msg)}
{const _buy=A.buy;A.buy=el=>{if(el&&(el.dataset.k==="dr"||el.dataset.k==="bs"))return medBuy(el);return _buy(el)}}
{const _ii=itemInfoHTML;itemInfoHTML=function(key){const [k,a,b]=String(key).split(":");const c=curChar();
  if(k==="dr"&&c){const x=medShopList(c)[a];return x?drugInfo(x):""}
  if(k==="bs"){const x=BODYSHOP[a];return x?iiCard(x[0],"Bodyshop","",x[3].note||"",iiFoot()):""}
  if(k==="own"&&a==="gear"&&c){const g=(c.gear||[]).find(y=>y.id===b);if(g&&g.drug)return drugInfo(g.drug)}
  return _ii(key)}}
{const _ci=cyberInfo;cyberInfo=function(x,c){const h=_ci(x,c);const code=surgOf(x);const s=SURGERY[code];if(!s)return h;
  const row=iiRow("Surgery",`${esc(code)} · ${s.name}: ${esc(s.where)}, ${s.hrs} hr, ${s.dmg} damage, ${s.cost?fmtEb(s.cost):"no extra fee"}, Difficulty ${s.dv}.`);
  return /<\/div><div class="ii-f">/.test(h)?h.replace(/<\/div>(<div class="ii-f">)/,row+"</div>$1"):h+row}}
function drugInfo(x){const sides=(x.sides||[]).map(id=>DRUG_SIDES.find(s=>s[0]===id)).filter(Boolean);
  const body=iiRow("Effect",esc(drugSummary(x)))+iiRow("Lasts",esc((DRUG_DUR.find(y=>y[0]===x.dur)||[])[1]||""))+(sides.length?iiRow("Side effects",sides.map(s=>`<b>${esc(s[1])}</b>: ${esc(s[3])}`).join("<br>")):"")+iiRow("Making it",`Pharmaceuticals vs Difficulty ${drugDiff(x)}. ${fmtEb(drugCost(x))} a dose.`);
  return iiCard(x.name,(x.type||"Designer drug")+" · Strength +"+(x.str||1),body,x.text||"",iiFoot())}

/* ---------- the drug lab ---------- */
function labState(){if(!ui.lab)ui.lab={name:"",type:"",fx:[],str:1,sides:[],dur:"minutes",last:null};return ui.lab}
MODALS.druglab=()=>{const c=curChar();if(!c)return null;const L=labState();const dr={...L,book:false};const diff=drugDiff(dr);const k=calc(c);const base=k.eff.TECH+skillLevel(c,"Pharmaceuticals");
  const chk=(list,arr,key)=>list.map(x=>`<label class="lab-opt"><input type="checkbox" data-act-change="lab-tog" data-k="${key}" data-v="${x[0]}" ${arr.includes(x[0])?"checked":""}><span><b>${esc(x[1])}</b> <span class="faint mono">${key==="sides"?"−":""}${x[2]}</span>${x[3]?`<small>${esc(x[3])}</small>`:""}</span></label>`).join("");
  return {title:"Drug lab",wide:true,body:`<div style="display:grid;gap:14px">
    <p class="faint" style="margin:0">Design a drug by the book: pick its effects and Strength, buy the Difficulty down with side effects, and choose how long it lasts. Then make it with a Pharmaceuticals check.</p>
    <div class="grid2"><div class="field"><label class="label" for="lab-name">Name</label><input id="lab-name" data-labui="name" value="${esc(L.name)}" placeholder="Sindementaphilinine"></div><div class="field"><label class="label" for="lab-type">Type</label><input id="lab-type" data-labui="type" value="${esc(L.type)}" placeholder="Stimulant"></div></div>
    <div class="lab-cols"><div><span class="label">Effects</span><div class="lab-list">${chk(DRUG_EFFECTS,L.fx,"fx")}</div></div><div><span class="label">Side effects</span><div class="lab-list">${chk(DRUG_SIDES,L.sides,"sides")}</div></div></div>
    <div class="row" style="gap:14px;flex-wrap:wrap"><span class="row" style="gap:6px"><span class="label">Strength</span><span class="seg">${[1,2,3].map(n=>`<button class="${Number(L.str)===n?"on":""}" data-act="lab-str" data-v="${n}">+${n}</button>`).join("")}</span></span>
      <span class="row" style="gap:6px"><span class="label">Lasts</span><span class="seg">${DRUG_DUR.map(x=>`<button class="${L.dur===x[0]?"on":""}" data-act="lab-dur" data-v="${x[0]}">${x[1]} ×${x[2]}</button>`).join("")}</span></span></div>
    <div class="lab-sum"><div><span class="label">Difficulty</span><b class="num">${diff}</b></div><div><span class="label">Street price</span><b class="num">${fmtEb(drugCost(dr))}</b><small>a dose</small></div><div style="min-width:0"><span class="label">Effect</span><span>${esc(L.fx.length||L.sides.length?drugSummary(dr):"Pick at least one effect")}</span></div></div>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn primary" data-act="lab-make" ${L.fx.length?"":"disabled"}>Make it: TECH + Pharmaceuticals ${base} + D10 vs ${diff}</button><button class="btn ghost" data-act="lab-save" ${L.fx.length?"":"disabled"}>Save the formula (GM says it works)</button></div>
    ${L.last?`<div class="banner">${esc(L.last)}</div>`:""}
    ${(c.drugsMade||[]).length?`<div><span class="label">Your formulas</span><div class="items">${c.drugsMade.map(x=>`<div class="it"><div style="min-width:0"><div class="t">${esc(x.name)}</div><div class="m">Diff ${drugDiff(x)} · ${fmtEb(drugCost(x))} a dose · ${esc(drugSummary(x))}</div></div><button class="btn sm ghost" data-act="lab-del" data-n="${esc(x.name)}">Delete</button></div>`).join("")}</div><p class="faint" style="margin:6px 0 0;font-size:12.5px">Buy or brew doses at the shop's Drugs counter.</p></div>`:""}
  </div>`}};
function labDrug(){const L=labState();return {name:(L.name||"").trim().slice(0,60)||"Unnamed drug",type:(L.type||"").trim().slice(0,40)||"Designer drug",fx:[...L.fx],str:clamp(Number(L.str)||1,1,3),sides:[...L.sides],dur:L.dur,text:"Designed in your lab."}}
function labKeep(c,dr){c.drugsMade=(c.drugsMade||[]).filter(x=>x.name!==dr.name);c.drugsMade.push(dr)}
Object.assign(A,{
  "lab-str":el=>{labState().str=Number(el.dataset.v);renderModal()},
  "lab-dur":el=>{labState().dur=el.dataset.v;renderModal()},
  "lab-make":()=>{const c=curChar();if(!c)return;const dr=labDrug();const diff=drugDiff(dr);const k=calc(c);const base=k.eff.TECH+skillLevel(c,"Pharmaceuticals");
    const e=Dice.check(`Pharmaceuticals: ${dr.name} (TECH)`,base,{dv:diff,who:whoOf(c)});const ok=e.total>=diff;
    labState().last=ok?`${dr.name} works (${e.total} vs ${diff}). The formula is saved: buy doses at ${fmtEb(drugCost(dr))} each in the shop.`:`It doesn't come out right (${e.total} vs ${diff}). Try again.`;
    if(ok&&canEditChar(c)){labKeep(c,dr);saveChar(c)}renderModal()},
  "lab-save":()=>{const c=curChar();if(!c||!canEditChar(c))return;const dr=labDrug();labKeep(c,dr);saveChar(c);labState().last=`Saved ${dr.name}.`;renderModal()},
  "lab-del":el=>{const c=curChar();if(!c||!canEditChar(c))return;c.drugsMade=(c.drugsMade||[]).filter(x=>x.name!==el.dataset.n);saveChar(c);renderModal()},
  "med-dose":el=>mutate(c=>{const g=(c.gear||[]).find(x=>x.id===el.dataset.gid);if(!g||!g.drug||!(Number(g.qty)>0))return;g.qty=Number(g.qty)-1;const lines=drugTake(c,g.drug);
    if(!g.qty)c.gear=c.gear.filter(x=>x!==g);Dice.raw(`${whoOf(c)} takes ${g.name}`,lines.join(" "),"",whoOf(c),[{t:drugSummary(g.drug).slice(0,40),c:"ink"}])}),
  "med-medic":el=>{const c=curChar();if(!c)return;const u=medUI(c.id);const w=Number(u.pdmg);if(!u.pdmg||isNaN(w)){showNotice("Fill in the patient's total damage.");return}const k=calc(c);const p=medMedicParts(c,k);const s=el.dataset.s;
    const sk=s==="stab"?(p.mt>p.fa?["Medical Tech",p.mt]:["First Aid",p.fa]):s==="medtech"?["Medical Tech",p.mt]:["First Aid",p.fa];
    const r=medRoll(s==="stab"?"Stabilize a patient":`${sk[0]} on a patient`,p.t+sk[1],w,s==="stab"?"ge":"gt",whoOf(c),` (TECH ${p.t} + ${sk[0]} ${sk[1]})`);
    u.medicLast=s==="stab"?(r.ok?`Stabilized (${r.tot} vs ${w}). Mark them stabilized.`:`Not stabilized (${r.tot} vs ${w}). They keep making death saves.`):(r.ok?`${sk[0]} worked (${r.tot} vs ${w}): they heal ${s==="medtech"?"1 point":"half a point"} a day.`:`${sk[0]} failed (${r.tot} vs ${w}). Try again tomorrow.`);render()},
});
Object.assign(CHANGE,{
  "lab-tog":el=>{const L=labState();const k=el.dataset.k;const s=new Set(L[k]);el.checked?s.add(el.dataset.v):s.delete(el.dataset.v);L[k]=[...s];renderModal()},
  "shop-surg":el=>{ui.shopSurg=el.checked;renderModal()},
});
document.addEventListener("input",ev=>{const el=ev.target;if(el.dataset&&el.dataset.labui){labState()[el.dataset.labui]=el.value}});
