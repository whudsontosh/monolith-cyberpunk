/* ============================== CYBERPUNK 2020 GM: HOMEBREW, SHOP & CAMPAIGN PACKAGES ============================== */
const GPK=Monolith.store.key("gm-packs");
let HLIB=packLib(GPK);                 // homebrew library shared by every campaign (edited in place)
const hbDirty=new Set();let hbT=null;const hbCache={};
function hbSanitized(p){const k=p.id+":"+p.rev;if(!hbCache[k]){try{hbCache[k]=sanitizeHomebrew(p).pack}catch(e){hbCache[k]=null}}return hbCache[k]}
function hbTouch(id){hbDirty.add(id);for(const k of Object.keys(hbCache))if(k.startsWith(id+":"))delete hbCache[k];clearTimeout(hbT);hbT=setTimeout(hbPersist,500);if((st.packs||[]).includes(id))RULES_KEY="";requestRender()}
function hbPersist(){clearTimeout(hbT);hbT=null;const changed=[...hbDirty];hbDirty.clear();
  for(const id of changed){const p=HLIB[id];if(p){p.rev=(Number(p.rev)||1)+1;p.updated=Date.now()}}
  const out={};for(const [id,p] of Object.entries(HLIB)){const s=hbSanitized(p);if(s)out[id]=s}
  if(!packLibSave(GPK,out))showNotice("Browser storage is full, so homebrew changes couldn't be saved.");
  RULES_KEY="";if(changed.some(id=>(st.packs||[]).includes(id)))queueRulesBroadcast()}
window.addEventListener("beforeunload",()=>{if(hbT)hbPersist()});
function campaignPacks(){return (st.packs||[]).map(id=>HLIB[id]).filter(Boolean).map(hbSanitized).filter(Boolean)}
function gmSyncRules(){activateRules(campaignPacks())}
function gmPacksInit(){if(!Array.isArray(st.packs))st.packs=[];st.packs=st.packs.filter(id=>typeof id==="string");st.shop=sanitizeShop(st.shop);gmSyncRules()}
BEFORE_RENDER.push(()=>{if(st)gmSyncRules()});

/* ---------- sending the campaign's rules to players ---------- */
function rulesMsg(peek){return {peek:!!peek,campaign:{id:st.campaign.uid,name:st.campaign.name||"Night City"},packIds:campaignPacks().map(p=>p.id),shop:st.shop}}
function sendRules(conn,peek){for(const p of campaignPacks())gameSendTo(conn,"pack",{pack:p});gameSendTo(conn,"rules",rulesMsg(peek))}
let rulesT=null;
function queueRulesBroadcast(){clearTimeout(rulesT);rulesT=setTimeout(()=>{if(Host.status!=="online")return;for(const conn of Host.conns.keys())sendRules(conn,false)},400)}


/* ---------- the shop: lock and setup ---------- */
function shopSummary(){const s=st.shop;const hid=["w","a","c","g"].reduce((a,k)=>a+s.hide[k].length,0);const pr=["w","a","c","g"].reduce((a,k)=>a+Object.keys(s.price[k]).length,0);
  return hid||pr?[hid?`${hid} item${hid===1?"":"s"} not sold`:"",pr?`${pr} price change${pr===1?"":"s"}`:""].filter(Boolean).join(" · "):"Everything sold at list price"}
function shopLockHTML(compact){const s=st.shop;
  return `<div class="shoplock ${s.locked?"closed":"open"}"><div class="row" style="justify-content:space-between;gap:8px"><span><span class="chip ${s.locked?"red":"green"}">Shop ${s.locked?"closed":"open"}</span>${!s.locked&&s.vendor?` <b>${esc(s.vendor)}</b>`:""}</span>
    <button class="btn sm ${s.locked?"primary":""}" data-act="shop-toggle">${s.locked?"Open the shop":"Close the shop"}</button></div>
    ${compact?"":`<div class="row" style="flex-wrap:nowrap;gap:6px"><input id="shop-vendor" value="${esc(s.vendor||"")}" placeholder="Vendor name players see (optional), e.g. Afterlife armory" maxlength="60" aria-label="Vendor name"></div>`}
    <span class="faint" style="font-size:12px">${s.locked?"Players in this campaign can browse but can't buy or add items until you open it.":"Players in this campaign can buy now."} Applies straight away to connected players.</span></div>`}
function shopSetupBody(){const t=ui.shopSetTab||"w";const q=(ui.shopSetQ||"").toLowerCase();const s=st.shop;
  const L=SHOP_LISTS[t]();const tabs=[["w","Weapons"],["a","Armor"],["c","Cyberware"],["g","Gear"]];
  const rows=L.map((r,i)=>{if(q&&!r[0].toLowerCase().includes(q))return "";const hidden=s.hide[t].includes(r[0]);const pr=s.price[t][r[0]];const hb=PACK_SRC[t][r[0]];
    return `<div class="shop-row ssrow ${hidden?"off":""}"><label class="row" style="gap:8px;min-width:0;flex:1"><input type="checkbox" data-act-change="shop-sold" data-k="${t}" data-n="${esc(r[0])}" ${hidden?"":"checked"}><span class="t">${esc(r[0])}</span>${hb?`<span class="chip amber hbchip" title="${esc(hb)}">Homebrew</span>`:""}</label>
      <span class="faint mono" style="font-size:12px">list ${fmtEb(r[SHOP_COST_IX[t]])}</span><input type="number" min="0" class="ssprice" data-shop-price="${t}" data-n="${esc(r[0])}" value="${pr!=null?pr:""}" placeholder="${r[SHOP_COST_IX[t]]}" aria-label="Price for ${esc(r[0])}"></div>`}).join("");
  return `<div style="display:grid;gap:12px">
    <p class="muted" style="margin:0">Choose what players in <b>${esc(st.campaign.name)}</b> can buy, and at what price. Unticked items don't appear in their shop. Leave a price blank to use the list price.</p>
    ${shopLockHTML()}
    <div class="row" style="justify-content:space-between"><span class="seg">${tabs.map(([k,l])=>`<button class="${t===k?"on":""}" data-act="shopset-tab" data-v="${k}">${l}</button>`).join("")}</span>
      <span class="row" style="gap:6px"><input id="shopset-q" value="${esc(ui.shopSetQ||"")}" placeholder="Search" style="width:160px" aria-label="Search items"><button class="btn sm ghost" data-act="shopset-all" data-v="1">Sell all</button><button class="btn sm ghost" data-act="shopset-all" data-v="0">Sell none</button></span></div>
    <div class="ss-list">${rows||`<p class="faint">Nothing matches.</p>`}</div>
    <div class="row" style="justify-content:space-between"><span class="faint" style="font-size:12.5px">${esc(shopSummary())}</span><button class="btn sm ghost" data-act="shopset-reset">Reset to the full catalog</button></div></div>`}

/* ---------- homebrew editor ---------- */
const HB_SECS=[["roles","Roles"],["skills","Skills"],["weapons","Weapons"],["armor","Armor"],["cyber","Cyberware"],["gear","Gear"]];
const HB_NEW={roles:()=>({name:"New role",ability:{name:"",stat:"INT",desc:""},skills:["Awareness/Notice","","","","","","","",""],income:[1000,1500,2000,3000,4500,6000],blurb:"",does:"",keyStats:[]}),
  skills:()=>({name:"New skill",stat:"INT",mult:1,desc:""}),
  weapons:()=>({name:"New weapon",type:"P",wa:0,conc:"J",avail:"C",dmg:"2D6",shots:10,rof:2,rel:"ST",range:50,cost:200,skill:"",desc:""}),
  armor:()=>({name:"New armor",sp:10,locs:["torso"],ev:0,cost:100,desc:""}),
  cyber:()=>({name:"New cyberware",cat:"Implants",cost:500,hc:"1D6",init:0,smart:false,mods:{},armor:null,desc:""}),
  gear:()=>({name:"New item",cost:50,desc:""})};
function hbPack(){return HLIB[ui.hbSel]||null}
function hbEntry(){const p=hbPack();const sec=ui.hbSec||"roles";return p&&ui.hbIdx!=null?(p[sec]||[])[ui.hbIdx]:null}
function hbNewPack(){const p={format:PACK_FORMAT,kind:"homebrew",id:"hb"+uid(),name:"New homebrew pack",author:"",description:"",rev:1,updated:Date.now(),roles:[],skills:[],weapons:[],armor:[],cyber:[],gear:[]};HLIB[p.id]=p;hbTouch(p.id);return p}
function hbBaseClash(sec,name){const n=String(name||"").toLowerCase();if(!n)return "";
  const base={roles:BASE_RULES.roles,skills:SKILL_DEFS.slice(0,BASE_RULES.skills).map(d0=>d0[0]).concat(BASE_RULES.abilities),weapons:WEAPONS.slice(0,BASE_RULES.w).map(r=>r[0]),armor:ARMOR.slice(0,BASE_RULES.a).map(r=>r[0]),cyber:CYBER.slice(0,BASE_RULES.c).map(r=>r[0]),gear:GEAR.slice(0,BASE_RULES.g).map(r=>r[0])}[sec]||[];
  return base.some(b=>b.toLowerCase()===n)?"Same name as a built-in one, so it won't be added. Rename it.":""}
function hbSummary(sec,e){if(sec==="roles")return `${e.ability&&e.ability.name||"no ability yet"} · ${(e.skills||[]).filter(Boolean).length} career skills`;
  if(sec==="skills")return `${e.stat}${Number(e.mult)>1?" · ×"+e.mult+" IP":""}`;
  if(sec==="weapons")return `${e.type} · ${e.dmg} · ${fmtEb(Number(e.cost)||0)}`;
  if(sec==="armor")return `SP ${e.sp} · ${(e.locs||[]).length} location${(e.locs||[]).length===1?"":"s"} · ${fmtEb(Number(e.cost)||0)}`;
  if(sec==="cyber")return `${e.cat} · HC ${e.hc} · ${fmtEb(Number(e.cost)||0)}`;
  return fmtEb(Number(e.cost)||0)}
const hbIn=(lab,path,val,o={})=>`<div class="field"${o.span?` style="grid-column:span ${o.span}"`:""}><label class="label">${lab}</label>${o.ta?`<textarea data-hbe="${path}" maxlength="${o.max||600}" placeholder="${esc(o.ph||"")}">${esc(val??"")}</textarea>`:o.sel?`<select data-hbe="${path}">${o.sel.map(x=>{const [v,l]=Array.isArray(x)?x:[x,x];return `<option value="${esc(v)}" ${String(val)===String(v)?"selected":""}>${esc(l)}</option>`}).join("")}</select>`:`<input data-hbe="${path}" ${o.num?`type="number" ${o.min!=null?`min="${o.min}"`:""} ${o.maxn!=null?`max="${o.maxn}"`:""}`:`maxlength="${o.max||60}"`} value="${esc(val??"")}" placeholder="${esc(o.ph||"")}" ${o.list?`list="${o.list}"`:""}>`}${o.help?`<span class="faint" style="font-size:12px">${o.help}</span>`:""}</div>`;
const hbChecks=(lab,path,opts,sel)=>`<div class="field"><span class="label">${lab}</span><div class="row" style="gap:10px">${opts.map(([v,l])=>`<label class="row" style="gap:4px;font-size:13.5px"><input type="checkbox" data-hbck="${path}" value="${esc(v)}" ${(sel||[]).includes(v)?"checked":""}>${esc(l)}</label>`).join("")}</div></div>`;
function hbForm(sec,e){const statOpts=STAT_KEYS.map(s=>[s,s]);const w=hbBaseClash(sec,e.name);const warn=w?`<div class="banner warnb" style="margin:0">${esc(w)}</div>`:"";
  const name=hbIn("Name","name",e.name);
  if(sec==="roles")return `${warn}<div class="grid2">${name}${hbIn("One-line description","blurb",e.blurb,{max:200,ph:"Shown on the role card"})}</div>
    ${hbIn("What they do","does",e.does,{ta:1,max:300,ph:"Shown in the guided build"})}
    ${hbChecks("Key stats (up to 3)","keyStats",statOpts,e.keyStats)}
    <div class="grid3">${hbIn("Special ability","ability.name",e.ability&&e.ability.name,{ph:"e.g. Ghost Walk"})}${hbIn("Ability stat","ability.stat",e.ability&&e.ability.stat,{sel:statOpts})}<div></div></div>
    ${hbIn("What the ability does","ability.desc",e.ability&&e.ability.desc,{ta:1,ph:"Explained to players in the guided build and on the sheet"})}
    <div class="field"><span class="label">Career skills (9, plus the ability)</span><div class="grid3">${Array.from({length:9},(_,i)=>{const v=(e.skills||[])[i];const txt=v&&typeof v==="object"?(v.pick||[]).join(" / "):(v||"");return `<input data-hbe="skills.${i}" value="${esc(txt)}" list="hb-skill-names" placeholder="Skill ${i+1}" aria-label="Career skill ${i+1}">`}).join("")}</div>
      <span class="faint" style="font-size:12px">Type "Brawling / Martial Art" to let the player choose one of several.</span></div>
    <div class="field"><span class="label">Monthly income by ability level</span><div class="row" style="gap:6px;flex-wrap:wrap">${["1–5","6","7","8","9","10"].map((l,i)=>`<label class="row" style="gap:4px"><span class="faint mono" style="font-size:11px">${l}</span><input type="number" min="0" data-hbe="income.${i}" value="${esc((e.income||[])[i]??"")}" style="width:90px"></label>`).join("")}</div></div>`;
  if(sec==="skills")return `${warn}<div class="grid3">${name}${hbIn("Stat","stat",e.stat,{sel:statOpts})}${hbIn("IP cost","mult",e.mult,{sel:[[1,"×1 (normal)"],[2,"×2"],[3,"×3"]]})}</div>${hbIn("What it's for","desc",e.desc,{ta:1})}`;
  if(sec==="weapons"){const mel=e.type==="MEL";return `${warn}<div class="grid3">${name}${hbIn("Type","type",e.type,{sel:[["P","Pistol"],["SMG","Submachinegun"],["RIF","Rifle"],["SHT","Shotgun"],["HVY","Heavy weapon"],["MEL","Melee"]]})}${hbIn("Damage","dmg",e.dmg,{ph:"e.g. 3D6+1",max:16})}</div>
    <div class="grid3">${hbIn("Accuracy (WA)","wa",e.wa,{num:1,min:-5,maxn:5})}${mel?"":hbIn("Magazine","shots",e.shots,{num:1,min:0,maxn:999})}${mel?"":hbIn("Rate of fire","rof",e.rof,{num:1,min:1,maxn:999})}</div>
    <div class="grid3">${mel?"":hbIn("Range (m)","range",e.range,{num:1,min:1,maxn:9999})}${mel?"":hbIn("Reliability","rel",e.rel,{sel:[["VR","Very reliable"],["ST","Standard"],["UR","Unreliable"]]})}${hbIn("Concealability","conc",e.conc,{sel:[["P","Pocket"],["J","Jacket"],["L","Long coat"],["N","Can't hide"]]})}</div>
    <div class="grid3">${hbIn("Availability","avail",e.avail,{sel:[["E","Excellent"],["C","Common"],["P","Poor"],["R","Rare"]]})}${hbIn("Cost (eb)","cost",e.cost,{num:1,min:0})}${hbIn("Skill (optional)","skill",e.skill,{list:"hb-skill-names",ph:"Default for the type"})}</div>
    ${hbIn("Description","desc",e.desc,{ta:1,ph:"Shown when players point at it in the shop"})}`}
  if(sec==="armor")return `${warn}<div class="grid3">${name}${hbIn("SP","sp",e.sp,{num:1,min:0,maxn:60})}${hbIn("Encumbrance (−REF)","ev",e.ev,{num:1,min:0,maxn:6})}</div>
    ${hbChecks("Covers","locs",LOCS.map(l=>[l[0],l[1]]),e.locs)}<div class="grid3">${hbIn("Cost (eb)","cost",e.cost,{num:1,min:0})}</div>${hbIn("Description","desc",e.desc,{ta:1})}`;
  if(sec==="cyber"){const arm=e.armor||{};return `${warn}<div class="grid3">${name}${hbIn("Category","cat",e.cat,{list:"hb-cyber-cats",max:30})}${hbIn("Humanity cost","hc",e.hc,{ph:"e.g. 2D6, or 0",max:16})}</div>
    <div class="grid3">${hbIn("Cost (eb)","cost",e.cost,{num:1,min:0})}${hbIn("Initiative bonus","init",e.init,{num:1,min:0,maxn:5})}<div class="field"><span class="label">Smartgun link</span><label class="row" style="gap:6px"><input type="checkbox" data-hbbool="smart" ${e.smart?"checked":""}> +2 to hit with smartguns</label></div></div>
    <div class="field"><span class="label">Stat changes</span><div class="row" style="gap:6px;flex-wrap:wrap">${STAT_KEYS.map(s=>`<label class="row" style="gap:3px"><span class="faint mono" style="font-size:11px">${s}</span><input type="number" min="-5" max="5" data-hbe="mods.${s}" value="${esc((e.mods||{})[s]??"")}" style="width:58px"></label>`).join("")}</div></div>
    <div class="grid3">${hbIn("Built-in armor SP","armor.sp",arm.sp,{num:1,min:0,maxn:60,help:"0 for none"})}</div>${Number(arm.sp)?hbChecks("Armor covers","armor.locs",LOCS.map(l=>[l[0],l[1]]),arm.locs||LOC_KEYS):""}
    ${hbIn("What it does","desc",e.desc,{ta:1,ph:"Shown when players point at it in the shop"})}`}
  return `${warn}<div class="grid3">${name}${hbIn("Cost (eb)","cost",e.cost,{num:1,min:0})}</div>${hbIn("What it's for","desc",e.desc,{ta:1})}`}
function viewHomebrew(){const packs=Object.values(HLIB).sort((a,b)=>String(a.name).localeCompare(String(b.name)));
  if(ui.hbSel&&!HLIB[ui.hbSel])ui.hbSel=null;if(!ui.hbSel&&packs.length)ui.hbSel=packs[0].id;
  const p=hbPack();const sec=ui.hbSec||"roles";const list=p?(p[sec]||[]):[];const e=hbEntry();
  const lib=`<div class="panel"><div class="panel-h"><h3>Homebrew packs</h3></div><div class="panel-b" style="display:grid;gap:8px">
    <div class="row" style="gap:6px"><button class="btn sm primary" data-act="hb-new">+ New pack</button><button class="btn sm" data-act="hb-import">Import…</button></div>
    ${packs.length?packs.map(x=>{const on=(st.packs||[]).includes(x.id);return `<div class="hbpack ${x.id===ui.hbSel?"on":""}"><button class="hbpack-n" data-act="hb-sel" data-id="${esc(x.id)}"><b>${esc(x.name||"Untitled")}</b><span class="faint">${esc(packCounts(hbSanitized(x)||x))}</span></button>
      <label class="row hbuse" style="gap:6px" title="Use this pack in ${esc(st.campaign.name)}"><input type="checkbox" data-act-change="hb-use" value="${esc(x.id)}" ${on?"checked":""}> In this campaign</label></div>`}).join(""):`<p class="faint" style="margin:0;font-size:13px">Make roles, skills and gear of your own, then share the pack with your players or use it in a campaign.</p>`}
    </div></div>`;
  const ed=p?`<section class="panel"><div class="panel-h"><div style="min-width:0;flex:1"><input class="npc-name" data-hbf="name" value="${esc(p.name)}" maxlength="60" aria-label="Pack name"></div>
      <div class="row" style="gap:6px"><button class="btn sm primary" data-act="hb-export">Save pack file…</button><button class="btn sm ghost" data-act="hb-dup">Duplicate</button><button class="btn sm ghost danger" data-act="hb-del">${ui.confirm==="hbdel-"+p.id?"Confirm delete":"Delete"}</button></div></div>
    <div class="panel-b" style="display:grid;gap:12px">
      <div class="grid2"><div class="field"><label class="label">Author</label><input data-hbf="author" value="${esc(p.author||"")}" maxlength="60"></div><div class="field"><label class="label">Version</label><div class="mono" style="padding:8px 0">v${p.rev} · changes as you edit</div></div></div>
      <div class="field"><label class="label">Description</label><textarea data-hbf="description" maxlength="600" placeholder="What's in this pack, for players and other GMs">${esc(p.description||"")}</textarea></div>
      <div class="seg hbsecs" role="group" aria-label="Section">${HB_SECS.map(([k,l])=>`<button class="${sec===k?"on":""}" data-act="hb-sec" data-v="${k}">${l}${(p[k]||[]).length?` · ${(p[k]||[]).length}`:""}</button>`).join("")}</div>
      <div class="hb-split"><div class="hb-list">${list.map((x,i)=>`<button class="hb-item ${ui.hbIdx===i?"on":""}" data-act="hb-edit" data-i="${i}"><b>${esc(x.name||"Untitled")}</b><span class="faint">${esc(hbSummary(sec,x))}</span>${hbBaseClash(sec,x.name)?`<span class="chip red">Name clash</span>`:""}</button>`).join("")}
          <button class="btn sm" data-act="hb-add">+ Add ${({roles:"role",skills:"skill",weapons:"weapon",armor:"armor",cyber:"cyberware",gear:"gear item"})[sec]}</button></div>
        <div class="hb-form">${e?`<div style="display:grid;gap:10px">${hbForm(sec,e)}<div class="row" style="justify-content:space-between"><button class="btn sm ghost" data-act="hb-copy">Duplicate</button><button class="btn sm ghost danger" data-act="hb-rm">${ui.confirm==="hbrm"?"Confirm remove":"Remove"}</button></div></div>`:`<p class="faint" style="margin:0">Pick something on the left to edit it, or add a new one.</p>`}</div></div>
    </div></section>`:`<div class="empty"><h3>No homebrew yet</h3><p class="muted" style="margin:0">Create a pack to add your own roles, skills, weapons, armor, cyberware and gear. Packs you use in a campaign install on your players' apps when they join.</p></div>`;
  return `<div class="roster-head"><h1><small>Homebrew</small>Your own rules</h1></div>
    <datalist id="hb-skill-names">${[...SKILL_DEFS.map(x=>x[0]),...(p?(p.skills||[]).map(s=>s.name):[])].map(n=>`<option value="${esc(n)}">`).join("")}</datalist>
    <datalist id="hb-cyber-cats">${CYBER_CATS.map(n=>`<option value="${esc(n)}">`).join("")}</datalist>
    <div class="hb-layout">${lib}<div style="min-width:0">${ed}</div></div>`}
function hbSet(obj,path,val){const ks=path.split(".");let o=obj;for(let i=0;i<ks.length-1;i++){const k=ks[i];if(o[k]==null||typeof o[k]!=="object")o[k]=/^\d+$/.test(ks[i+1])?[]:{};o=o[k]}o[ks[ks.length-1]]=val}
document.addEventListener("input",ev=>{const el=ev.target;if(!el.dataset)return;
  if(el.dataset.hbf!==undefined){const p=hbPack();if(!p)return;p[el.dataset.hbf]=el.value;hbTouch(p.id);return}
  if(el.dataset.hbe){const p=hbPack(),e=hbEntry();if(!p||!e)return;const path=el.dataset.hbe;let v=el.value;
    if(el.type==="number")v=el.value===""?(path.startsWith("mods.")?0:""):Number(el.value);
    if(/^skills\.\d+$/.test(path)){const parts=String(v).split("/").map(x=>x.trim()).filter(Boolean);v=parts.length>1?{pick:parts}:(parts[0]||"")}
    if(path==="mult")v=Number(v);
    if(path==="armor.sp"){if(!e.armor)e.armor={sp:0,locs:LOC_KEYS.slice()};}
    hbSet(e,path,v);if(path.startsWith("mods.")){for(const k of Object.keys(e.mods||{}))if(!Number(e.mods[k]))delete e.mods[k]}
    hbTouch(p.id);return}
  if(el.id==="shop-vendor"){st.shop.vendor=pkStr(el.value,60);save();queueRulesBroadcast();return}
  if(el.dataset.shopPrice){const k=el.dataset.shopPrice,n=el.dataset.n;if(el.value==="")delete st.shop.price[k][n];else st.shop.price[k][n]=pkNum(el.value,0,1e7,0);save();queueRulesBroadcast();return}
  if(el.id==="shopset-q"){ui.shopSetQ=el.value;renderModal();return}});
document.addEventListener("change",ev=>{const el=ev.target;if(!el.dataset)return;
  if(el.dataset.hbck){const p=hbPack(),e=hbEntry();if(!p||!e)return;const path=el.dataset.hbck;const cur=path.split(".").reduce((o,k)=>o&&o[k],e);const set=new Set(Array.isArray(cur)?cur:[]);
    if(el.checked)set.add(el.value);else set.delete(el.value);let arr=[...set];if(path==="keyStats")arr=arr.slice(0,3);hbSet(e,path,arr);hbTouch(p.id);return}
  if(el.dataset.hbbool){const p=hbPack(),e=hbEntry();if(!p||!e)return;e[el.dataset.hbbool]=el.checked;hbTouch(p.id)}});
const hbFileIn=document.createElement("input");hbFileIn.type="file";hbFileIn.accept=".cp2020homebrew,.cp2020campaign,.json,.zip";hbFileIn.multiple=true;hbFileIn.hidden=true;document.body.appendChild(hbFileIn);
let hbFileMode="any";
hbFileIn.addEventListener("change",()=>{const fs=[...hbFileIn.files];hbFileIn.value="";gmOpenPackageFiles(fs,hbFileMode)});
function hbInstall(pack){const old=HLIB[pack.id];if(old&&Number(old.rev)>=pack.rev)return old.rev===pack.rev?"same":"older";HLIB[pack.id]=clone(pack);hbPersistNow();return old?"updated":"new"}
function hbPersistNow(){const out={};for(const [id,p] of Object.entries(HLIB)){const s=hbSanitized(p);if(s)out[id]=s}packLibSave(GPK,out);RULES_KEY=""}
function hbUse(id,on){const s=new Set(st.packs||[]);if(on)s.add(id);else s.delete(id);st.packs=[...s];save();RULES_KEY="";queueRulesBroadcast();requestRender()}
async function gmOpenPackageFiles(files,mode){const msgs=[];
  for(const f of files){try{const r=await readPackageFile(f);
      if(r.kind==="homebrew"){const s=hbInstall(r.pack);hbUse(r.pack.id,true);ui.hbSel=r.pack.id;msgs.push(`${s==="same"?"Already had":s==="older"?"You already have a newer copy of":s==="updated"?"Updated":"Added"} "${r.pack.name}" and turned it on for this campaign.${r.problems.length?` ${r.problems.length} entries were skipped.`:""}`)}
      else{ui.pkgPending={file:f,raw:r.raw,files:r.files,mode};ui.modal="pkg-import";renderModal()}}
    catch(e){msgs.push(`${f.name}: ${e.message||e}`)}}
  if(msgs.length)showNotice(msgs.join(" "));render()}
Object.assign(A,{
  "hb-new":()=>{const p=hbNewPack();ui.hbSel=p.id;ui.hbSec="roles";ui.hbIdx=null;render()},
  "hb-import":()=>{hbFileMode="any";hbFileIn.click()},
  "hb-sel":el=>{ui.hbSel=el.dataset.id;ui.hbIdx=null;ui.confirm=null;render()},
  "hb-sec":el=>{ui.hbSec=el.dataset.v;ui.hbIdx=null;ui.confirm=null;render()},
  "hb-edit":el=>{ui.hbIdx=Number(el.dataset.i);ui.confirm=null;render()},
  "hb-add":()=>{const p=hbPack();if(!p)return;const sec=ui.hbSec||"roles";p[sec]=p[sec]||[];const e=HB_NEW[sec]();const names=new Set(p[sec].map(x=>x.name));let n=e.name,i=2;while(names.has(n))n=`${e.name} ${i++}`;e.name=n;p[sec].push(e);ui.hbIdx=p[sec].length-1;hbTouch(p.id);render();setTimeout(()=>{const i0=document.querySelector('.hb-form [data-hbe="name"]');if(i0){i0.focus();i0.select()}},40)},
  "hb-copy":()=>{const p=hbPack(),e=hbEntry();if(!p||!e)return;const sec=ui.hbSec;const c=clone(e);c.name=e.name+" (copy)";p[sec].splice(ui.hbIdx+1,0,c);ui.hbIdx++;hbTouch(p.id);render()},
  "hb-rm":()=>{const p=hbPack();if(!p||ui.hbIdx==null)return;if(ui.confirm!=="hbrm"){ui.confirm="hbrm";render();return}ui.confirm=null;p[ui.hbSec].splice(ui.hbIdx,1);ui.hbIdx=null;hbTouch(p.id);render()},
  "hb-dup":()=>{const p=hbPack();if(!p)return;const c=clone(p);c.id="hb"+uid();c.name=p.name+" (copy)";c.rev=1;HLIB[c.id]=c;hbTouch(c.id);ui.hbSel=c.id;render()},
  "hb-del":()=>{const p=hbPack();if(!p)return;if(ui.confirm!=="hbdel-"+p.id){ui.confirm="hbdel-"+p.id;render();return}ui.confirm=null;delete HLIB[p.id];hbUse(p.id,false);hbPersistNow();ui.hbSel=null;showNotice(`Deleted "${p.name}". Runners built with it keep working.`);render()},
  "hb-export":()=>{const p=hbPack();if(!p)return;if(hbT)hbPersist();const s=hbSanitized(HLIB[p.id]);if(!s){showNotice("This pack has a problem and couldn't be saved.");return}if(downloadText(packFileName(s,"cp2020homebrew"),homebrewFileText(s)))showNotice(`Saved ${packFileName(s,"cp2020homebrew")}. Send it to your players, or let it install when they join.`)},
  "shop-toggle":()=>{st.shop.locked=!st.shop.locked;save();render();renderModal();queueRulesBroadcast();addLog&&Host.status==="online"&&addLog({kind:"sys",text:st.shop.locked?"The shop is closed.":`The shop is open${st.shop.vendor?": "+st.shop.vendor:""}.`});showNotice(st.shop.locked?"Shop closed for players.":"Shop open for players.")},
  "shopset-tab":el=>{ui.shopSetTab=el.dataset.v;renderModal()},
  "shopset-all":el=>{const k=ui.shopSetTab||"w";st.shop.hide[k]=el.dataset.v==="1"?[]:SHOP_LISTS[k]().map(r=>r[0]);save();renderModal();queueRulesBroadcast()},
  "shopset-reset":()=>{const keep={locked:st.shop.locked,vendor:st.shop.vendor};st.shop={...sanitizeShop(null),...keep};save();renderModal();render();queueRulesBroadcast()},
  "pkg-save-open":()=>{ui.pkgOpts=ui.pkgOpts||{npcs:true,maps:true,encounter:true,notes:true,shop:true,homebrew:true,name:st.campaign.name||"Campaign",author:"",description:""};ui.modal="pkg-export";renderModal()},
  "pkg-do-save":()=>exportCampaignPackage(),
  "pkg-add":()=>{hbFileMode="merge";hbFileIn.click()},
  "pkg-new":()=>{hbFileMode="new";hbFileIn.click()},
  "pkg-import-go":el=>importCampaignPackage(el.dataset.mode),
  "npc-portrait":el=>{const id=el.dataset.id;pickImage(512,asset=>{const n=st.npcs.find(x=>x.id===id);if(n){n.img=asset;save();render();showNotice("Portrait set. It's used on this NPC's map tokens.")}})},
  "npc-portrait-rm":el=>{const n=st.npcs.find(x=>x.id===el.dataset.id);if(n){delete n.img;save();render()}},
});
Object.assign(CHANGE,{
  "hb-use":el=>hbUse(el.value,el.checked),
  "shop-sold":el=>{const k=el.dataset.k,n=el.dataset.n;const s=new Set(st.shop.hide[k]);if(el.checked)s.delete(n);else s.add(n);st.shop.hide[k]=[...s];save();renderModal();queueRulesBroadcast()},
});
FILE_HANDLERS.push(async list=>{const pk=list.filter(f=>isPackFileName(f.name));const rest=list.filter(f=>!isPackFileName(f.name));
  const heads=await Promise.all(rest.map(f=>f.slice(0,400).text().catch(()=>"")));const other=[];rest.forEach((f,i)=>(/"format"\s*:\s*"monolith-pack"/.test(heads[i])||/^PK/.test(heads[i])?pk:other).push(f));
  if(pk.length)gmOpenPackageFiles(pk,"any");return other});

/* ---------- NPC portraits ---------- */
{const _nd=npcDetail;npcDetail=function(n){let h=_nd(n);if(n.template)return h;
  const img=n.img&&Host.port?`<img class="npc-portrait" src="${esc(mapAssetUrl(n.img))}" alt="">`:`<div class="npc-portrait empty" aria-hidden="true">${esc((n.name||"?").charAt(0).toUpperCase())}</div>`;
  const row=`<div class="row" style="gap:12px;align-items:center">${img}<div style="display:grid;gap:4px"><span class="label">Portrait</span><div class="row" style="gap:6px">${Desk?`<button class="btn sm" data-act="npc-portrait" data-id="${esc(n.id)}">${n.img?"Change portrait…":"Add portrait…"}</button>${n.img?`<button class="btn sm ghost" data-act="npc-portrait-rm" data-id="${esc(n.id)}">Remove</button>`:""}`:`<span class="faint" style="font-size:12.5px">Portraits need the Monolith desktop app.</span>`}</div><span class="faint" style="font-size:12px">Used on this NPC's map tokens.</span></div></div>`;
  return h.replace('<div class="panel-b" style="display:grid;gap:14px">','<div class="panel-b" style="display:grid;gap:14px">'+row)}}
{const _vn=viewNpcs;viewNpcs=function(){let h=_vn();if(!Host.port)return h;
  for(const n of st.npcs)if(n.img)h=h.replace(`data-act="npc-sel" data-id="${esc(n.id)}"><b>`,`data-act="npc-sel" data-id="${esc(n.id)}"><img class="npc-thumb" src="${esc(mapAssetUrl(n.img))}" alt=""><b>`);return h}}
A["map-place-enc"]=()=>{const m=curMap();if(!m)return;const c0=viewCenter(m);let n=0;st.encounter.list.filter(x=>x.kind==="npc").forEach(cb=>{if(m.tokens.some(t=>t.kind==="npc"&&t.ref===cb.cid))return;const p=freeSpot(m,c0.x,c0.y);
    m.tokens.push({id:uid(),kind:"npc",ref:cb.cid,label:cb.npc.name,color:"#3d4352",size:1,x:p.x,y:p.y,hidden:false,img:cb.npc.img||null});n++});save();render();MapV.invalidate();showNotice(n?`Placed ${n} NPC${n>1?"s":""}.`:"Those NPCs are already on this map.")};

/* ---------- campaign packages ---------- */
const HEXC=/^#[0-9a-f]{3,8}$/i;
function pkColor(v,def){return HEXC.test(String(v||""))?String(v):def}
function pkFloat(v,lo,hi,def){const n=Number(v);return Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):def}
function sanNpc(n,assetOk){if(!n||typeof n!=="object")return null;const stats={};STAT_KEYS.forEach(k=>stats[k]=pkNum(n.stats&&n.stats[k],0,20,5));
  const skills=(Array.isArray(n.skills)?n.skills:[]).slice(0,80).map(s=>Array.isArray(s)?[pkStr(s[0]),pkNum(s[1],0,10,0)]:null).filter(s=>s&&s[0]);
  const weapons=(Array.isArray(n.weapons)?n.weapons:[]).slice(0,20).map(w=>{if(!w||typeof w!=="object")return null;const type=pkEnum(w.type,Object.keys(WTYPE_SKILL),"P");
    return {id:uid(),name:pkStr(w.name)||"Weapon",type,wa:pkNum(w.wa,-5,5,0),conc:pkEnum(w.conc,["P","J","L","N"],"J"),avail:pkEnum(w.avail,["E","C","P","R"],"C"),dmg:pkDice(w.dmg),shots:type==="MEL"?"":String(pkNum(w.shots,0,999,0)||""),ammo:pkNum(w.ammo,0,999,0),rof:String(pkNum(w.rof,1,999,1)),rel:pkEnum(w.rel,["VR","ST","UR"],"ST"),range:pkStr(w.range,12)||"50m",cost:pkNum(w.cost,0,1e7,0),skill:pkStr(w.skill)||WTYPE_SKILL[type]}}).filter(Boolean);
  const armor={};LOC_KEYS.forEach(l=>{const v=pkNum(n.armor&&n.armor[l],0,60,0);if(v)armor[l]=v});
  const out={id:uid(),name:pkStr(n.name)||"NPC",type:pkStr(n.type,30),stats,skills,weapons,armor,init:pkNum(n.init,-5,10,0),notes:pkText(n.notes,1500),custom:true};
  const img=pkStr(n.img,64);if(img&&assetOk(img))out.img=img;return out}
function sanMap(m,assetOk,cidMap){if(!m||typeof m!=="object")return null;const g=m.grid||{};const asset=pkStr(m.asset,64);
  const out={id:uid(),name:pkStr(m.name)||"Map",asset:asset&&assetOk(asset)?asset:null,w:pkNum(m.w,100,10000,2100),h:pkNum(m.h,100,10000,1400),bg:pkColor(m.bg,"#1d2029"),
    grid:{size:pkNum(g.size,8,400,70),ox:pkNum(g.ox,-5000,5000,0),oy:pkNum(g.oy,-5000,5000,0),show:g.show!==false,snap:g.snap!==false,color:pkColor(g.color,"#ffffff"),alpha:pkFloat(g.alpha,0,1,0.22),m:pkFloat(g.m,0.1,100,2)},
    tokens:[],drawings:[],fog:{on:!!(m.fog&&m.fog.on),shapes:[]},created:Date.now()};
  for(const t of (Array.isArray(m.tokens)?m.tokens:[]).slice(0,600)){if(!t||typeof t!=="object")continue;const kind=t.kind==="npc"&&cidMap[t.ref]?"npc":"marker";if(t.kind==="pc")continue;
    const tok={id:uid(),kind,label:pkStr(t.label)||"Token",color:pkColor(t.color,"#3d4352"),size:pkNum(t.size,1,4,1),x:pkFloat(t.x,-1e5,1e5,0),y:pkFloat(t.y,-1e5,1e5,0),hidden:!!t.hidden,owner:null};
    if(kind==="npc")tok.ref=cidMap[t.ref];const img=pkStr(t.img,64);if(img&&assetOk(img))tok.img=img;out.tokens.push(tok)}
  for(const d0 of (Array.isArray(m.drawings)?m.drawings:[]).slice(0,600)){const d1=cleanDrawing(d0);if(d1){d1.by="gm";out.drawings.push(d1)}}
  for(const f of (m.fog&&Array.isArray(m.fog.shapes)?m.fog.shapes:[]).slice(0,800)){if(!f||typeof f!=="object")continue;const pts=(Array.isArray(f.pts)?f.pts:[]).slice(0,4000).map(Number).filter(Number.isFinite);if(pts.length<4||pts.length%2)continue;
    out.fog.shapes.push({id:uid(),op:f.op==="cut"?"cut":"add",type:f.type==="poly"?"poly":"rect",pts:pts.map(v=>Math.round(v))})}
  return out}
function pkgAssetsOf(data){const ids=new Set();(data.npcs||[]).forEach(n=>n.img&&ids.add(n.img));(data.maps||[]).forEach(m=>{if(m.asset)ids.add(m.asset);(m.tokens||[]).forEach(t=>t.img&&ids.add(t.img))});(data.encounter&&data.encounter.list||[]).forEach(cb=>cb.npc&&cb.npc.img&&ids.add(cb.npc.img));return [...ids]}
function pkgExportBody(){const o=ui.pkgOpts;const camp=campaignPacks();const npcEnc=st.encounter.list.filter(x=>x.kind==="npc").length;const ck=(k,l)=>`<label class="row" style="gap:8px"><input type="checkbox" data-act-change="pkg-opt" data-k="${k}" ${o[k]?"checked":""}> ${l}</label>`;
  return `<div style="display:grid;gap:12px">
    <p class="muted" style="margin:0">A campaign package is a ready-made campaign another GM (or you, later) can start from. It never includes your players, their runners, the session log or the room password.</p>
    <div class="grid2"><div class="field"><label class="label" for="pkg-name">Package name</label><input id="pkg-name" data-pkgo="name" value="${esc(o.name)}" maxlength="60"></div><div class="field"><label class="label" for="pkg-author">Author</label><input id="pkg-author" data-pkgo="author" value="${esc(o.author)}" maxlength="60"></div></div>
    <div class="field"><label class="label" for="pkg-desc">Description</label><textarea id="pkg-desc" data-pkgo="description" maxlength="600" placeholder="The pitch: setting, length, what the crew gets into">${esc(o.description)}</textarea></div>
    <div class="field"><span class="label">Include</span>
      ${ck("npcs",`Your NPCs (${st.npcs.length}) with portraits`)}${ck("maps",`Maps (${(st.maps||[]).length}) with images, tokens, drawings and fog`)}${ck("encounter",`The current encounter (${npcEnc} NPCs)`)}${ck("notes","Campaign summary and GM notes")}${ck("shop",`Shop setup (${esc(shopSummary())})`)}${ck("homebrew",`Homebrew packs it uses (${camp.length})`)}</div>
    ${!Desk&&(st.maps||[]).length?`<div class="banner warnb" style="margin:0">Images can only be packaged from the desktop app.</div>`:""}
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-act="close-modal">Cancel</button><button class="btn primary" data-act="pkg-do-save" ${ui.pkgBusy?"disabled":""}>${ui.pkgBusy?esc(ui.pkgBusy):"Save campaign package…"}</button></div></div>`}
async function exportCampaignPackage(){const o=ui.pkgOpts;if(ui.pkgBusy)return;ui.pkgBusy="Packing…";renderModal();
  try{if(hbT)hbPersist();const data={format:PACK_FORMAT,kind:"campaign",id:"cp"+uid(),name:pkStr(o.name)||"Campaign",author:pkStr(o.author),description:pkText(o.description),rev:1,created:Date.now(),app:"Night City Dossier",
      campaign:{name:st.campaign.name||"Campaign",summary:o.notes?st.campaign.summary||"":"",notes:o.notes?st.campaign.notes||"":""},npcs:[],maps:[],encounter:{round:1,turn:0,list:[]},shop:null,homebrew:[]};
    if(o.npcs)data.npcs=clone(st.npcs);
    if(o.encounter)data.encounter={round:1,turn:0,list:clone(st.encounter.list.filter(x=>x.kind==="npc").map(cb=>({cid:cb.cid,kind:"npc",npc:{...cb.npc,wounds:0,armorDmg:{}},init:0,out:false,note:cb.note||"",last:""})))};
    if(o.maps){const enc=new Set(data.encounter.list.map(cb=>cb.cid));data.maps=clone(st.maps).map(m=>({...m,tokens:m.tokens.filter(t=>t.kind!=="pc").map(t=>t.kind==="npc"&&!enc.has(t.ref)?{...t,kind:"marker",ref:null}:t)}));data.activeMap=st.activeMap}
    if(o.shop)data.shop={...st.shop,locked:false,vendor:""};
    if(o.homebrew)data.homebrew=campaignPacks();
    const files=[];let missing=0;
    if(Host.port){const ids=pkgAssetsOf(data);let i=0;for(const id of ids){i++;ui.pkgBusy=`Packing images ${i}/${ids.length}…`;renderModal();
        try{const r=await fetch(mapAssetUrl(id));if(!r.ok)throw 0;files.push({name:"assets/"+id,data:new Uint8Array(await r.arrayBuffer())})}catch(e){missing++}}}
    data.counts={npcs:data.npcs.length,maps:data.maps.length,encounter:data.encounter.list.length,homebrew:data.homebrew.length,images:files.length};
    files.unshift({name:"package.json",data:new TextEncoder().encode(JSON.stringify(data))});
    const blob=zipBuild(files);const name=packFileName(data,"cp2020campaign");
    if(downloadText(name,blob,"application/zip")){ui.modal=null;renderModal();showNotice(`Saved ${name}${missing?` (${missing} image${missing===1?"":"s"} couldn't be read)`:""}.`)}}
  catch(e){showNotice("Couldn't save the package: "+(e.message||e))}
  finally{ui.pkgBusy=null;if(ui.modal)renderModal()}}
function pkgImportBody(){const p=ui.pkgPending;if(!p)return "";const r=p.raw;const c=r.counts||{npcs:(r.npcs||[]).length,maps:(r.maps||[]).length,encounter:(r.encounter&&r.encounter.list||[]).length,homebrew:(r.homebrew||[]).length};
  const bits=[c.npcs&&`${c.npcs} NPC${c.npcs===1?"":"s"}`,c.maps&&`${c.maps} map${c.maps===1?"":"s"}`,c.encounter&&`an encounter (${c.encounter})`,c.homebrew&&`${c.homebrew} homebrew pack${c.homebrew===1?"":"s"}`,r.shop&&"a shop setup",(r.campaign&&(r.campaign.notes||r.campaign.summary))&&"campaign notes"].filter(Boolean);
  const busy=ui.pkgBusy;
  return `<div style="display:grid;gap:14px">
    <div class="delcard"><div class="portrait" style="background:#3d4352">${icon?icon("map"):""}</div><div style="min-width:0"><b class="delname">${esc(pkStr(r.name)||"Campaign package")}</b><div class="muted" style="font-size:14px">${r.author?"by "+esc(pkStr(r.author))+" · ":""}${esc(bits.join(", ")||"empty")}</div></div></div>
    ${r.description?`<p style="margin:0;white-space:pre-wrap">${esc(pkText(r.description))}</p>`:""}
    ${!Desk&&(c.maps||c.images)?`<div class="banner warnb" style="margin:0">Maps and portraits need the desktop app. In the browser they're added without images.</div>`:""}
    ${p.mode!=="merge"?`<div class="hostopt rec"><div><h3>Start a new campaign</h3><p>Creates a campaign called "${esc(pkStr(r.name)||"Campaign")}" with everything in the package, and opens it.</p></div><button class="btn primary" data-act="pkg-import-go" data-mode="new" ${busy?"disabled":""}>Start campaign</button></div>`:""}
    ${p.mode!=="new"?`<div class="hostopt ${p.mode==="merge"?"rec":""}"><div><h3>Add to ${esc(st.campaign.name)}</h3><p>Adds the NPCs, maps and homebrew to the open campaign. Your party and notes stay as they are.</p></div><button class="btn ${p.mode==="merge"?"primary":""}" data-act="pkg-import-go" data-mode="merge" ${busy?"disabled":""}>Add to this campaign</button></div>`:""}
    ${busy?`<div class="banner"><span class="dot warn"></span> ${esc(busy)}</div>`:""}</div>`}
async function importCampaignPackage(mode){const p=ui.pkgPending;if(!p||ui.pkgBusy)return;const r=p.raw;ui.pkgBusy="Reading the package…";renderModal();
  try{const files=p.files;const assetOk=id=>/^[A-Za-z0-9_.-]{1,64}$/.test(id)&&files.has("assets/"+id);
    // homebrew first, so NPC weapons and the shop can refer to it
    const hbIds=[];for(const raw of (Array.isArray(r.homebrew)?r.homebrew:[]).slice(0,40)){try{const s=sanitizeHomebrew(raw).pack;hbInstall(s);hbIds.push(s.id)}catch(e){}}
    const enc=[];const cidMap={};
    for(const cb of (r.encounter&&Array.isArray(r.encounter.list)?r.encounter.list:[]).slice(0,200)){if(!cb||cb.kind!=="npc")continue;const n=sanNpc(cb.npc,assetOk);if(!n)continue;n.wounds=0;n.armorDmg={};n.weapons.forEach(w=>{w.ammo=Number(w.shots)||0});
      const cid=uid();cidMap[String(cb.cid||"")]=cid;enc.push({cid,kind:"npc",npc:n,init:0,out:false,note:pkText(cb.note,200),last:""})}
    const npcs=(Array.isArray(r.npcs)?r.npcs:[]).slice(0,500).map(n=>sanNpc(n,assetOk)).filter(Boolean);
    const maps=(Array.isArray(r.maps)?r.maps:[]).slice(0,60).map(m=>sanMap(m,assetOk,cidMap)).filter(Boolean);
    const activeIdx=(Array.isArray(r.maps)?r.maps:[]).findIndex(m=>m&&m.id===r.activeMap);
    // images: re-encode every one through the canvas (so only real images get in), then store them
    const ids=pkgAssetsOf({npcs,maps,encounter:{list:enc}});const remap={};
    if(Host.port){let i=0;for(const id of ids){i++;ui.pkgBusy=`Adding images ${i}/${ids.length}…`;renderModal();
        try{const big=maps.some(m=>m.asset===id);const img=await prepareMapImage(new Blob([files.get("assets/"+id)]),big?4096:512);remap[id]=await uploadAsset(img.blob,img.ext)}catch(e){}}}
    const fix=id=>id&&remap[id]?remap[id]:undefined;
    npcs.forEach(n=>{n.img=fix(n.img);if(!n.img)delete n.img});enc.forEach(cb=>{cb.npc.img=fix(cb.npc.img);if(!cb.npc.img)delete cb.npc.img});
    maps.forEach(m=>{m.asset=fix(m.asset)||null;m.tokens.forEach(t=>{t.img=fix(t.img);if(!t.img)delete t.img})});
    const shop=r.shop?sanitizeShop(r.shop):null;const name=pkStr(r.name)||"Campaign";
    const summary=pkText(r.campaign&&r.campaign.summary,4000),notes=pkText(r.campaign&&r.campaign.notes,20000);
    const pkg={id:pkId(r.id),name,rev:pkNum(r.rev,1,1e6,1)};
    if(mode==="new"){const data={...defaultState(),campaign:{name,summary,notes,sessions:[]},npcs,maps,activeMap:maps[activeIdx]?maps[activeIdx].id:(maps[0]?maps[0].id:null),encounter:{round:1,turn:0,list:enc},packs:hbIds,shop:shop||sanitizeShop(null),pkg};
      const id=campCreate(name,data,{freshPassword:true,clearLog:true});ui.pkgPending=null;ui.pkgBusy=null;ui.modal=null;renderModal();
      if(id){showNotice(`Created "${campEntry(id).name}" from the package.`);campSwitch(id,"open")}}
    else{st.npcs.push(...npcs);st.maps.push(...maps);if(!st.activeMap&&maps[0])st.activeMap=maps[0].id;st.encounter.list.push(...enc);st.packs=[...new Set([...(st.packs||[]),...hbIds])];
      if(shop&&shopIsDefault(st.shop))st.shop={...shop,locked:st.shop.locked,vendor:st.shop.vendor};
      if(summary||notes)st.campaign.notes=[st.campaign.notes,`--- From "${name}" ---`,summary,notes].filter(Boolean).join("\n\n");
      snapshot(`Added package "${name}"`,true);persist();RULES_KEY="";queueRulesBroadcast();ui.pkgPending=null;ui.pkgBusy=null;ui.modal=null;render();
      showNotice(`Added "${name}": ${npcs.length} NPCs, ${maps.length} maps${hbIds.length?`, ${hbIds.length} homebrew pack${hbIds.length===1?"":"s"}`:""}.`)}}
  catch(e){ui.pkgBusy=null;showNotice("Couldn't open the package: "+(e.message||e));renderModal()}}
document.addEventListener("input",ev=>{const el=ev.target;if(el.dataset&&el.dataset.pkgo&&ui.pkgOpts)ui.pkgOpts[el.dataset.pkgo]=el.value});
Object.assign(CHANGE,{"pkg-opt":el=>{if(ui.pkgOpts){ui.pkgOpts[el.dataset.k]=el.checked;renderModal()}}});
Object.assign(MODALS,{
  "shop-setup":()=>({title:"Shop for this campaign",body:shopSetupBody()}),
  "pkg-export":()=>({title:"Save as a campaign package",body:pkgExportBody()}),
  "pkg-import":()=>ui.pkgPending?{title:"Campaign package",body:pkgImportBody()}:null,
});

/* ---------- where it shows up ---------- */
function packagesPanel(){const camp=campaignPacks();
  return `<section class="panel"><div class="panel-h"><h3>Shop & packages</h3></div><div class="panel-b" style="display:grid;gap:14px">
    <div style="display:grid;gap:6px"><span class="label">Shop</span>${shopLockHTML()}<div class="row" style="justify-content:space-between"><span class="faint" style="font-size:12.5px">${esc(shopSummary())}</span><button class="btn sm" data-act="open-modal" data-m="shop-setup">Set up the shop…</button></div></div>
    <div style="display:grid;gap:6px"><span class="label">Homebrew in this campaign</span>${camp.length?camp.map(p=>`<div class="row" style="justify-content:space-between"><span><b>${esc(p.name)}</b> <span class="faint" style="font-size:12.5px">${esc(packCounts(p))}</span></span></div>`).join(""):`<span class="faint" style="font-size:13px">None. Turn packs on in the Homebrew tab.</span>`}
      <span class="faint" style="font-size:12px">Players get these, plus your shop setup, when they join.</span></div>
    <div style="display:grid;gap:6px"><span class="label">Campaign package</span><div class="row" style="gap:6px"><button class="btn sm primary" data-act="pkg-save-open">Save as a campaign package…</button><button class="btn sm" data-act="pkg-add">Add a package to this campaign…</button></div>
      ${st.pkg?`<span class="faint" style="font-size:12.5px">Started from "${esc(st.pkg.name)}".</span>`:""}</div>
  </div></section>`}
function cpMapSideShop(){return `<section class="ms ms-shop">${shopLockHTML(true)}</section>`}
function cpCampaignsActions(){return `<button class="btn primary" data-act="pkg-new">New campaign from a package…</button>`}
