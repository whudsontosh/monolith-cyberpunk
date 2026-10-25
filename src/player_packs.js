/* ============================== PLAYER: HOMEBREW & CAMPAIGN RULES (1.5.0) ==============================
   Installed homebrew packs live in this app. Each runner lists the packs it's built with
   (c.packs) and, once it has joined a table, which campaign it belongs to (c.campaign: id, name,
   the packs the GM uses, and the GM's shop setup including whether the shop is open). */
const PPK=Monolith.store.key("player-packs"),PPK_META=Monolith.store.key("player-packs-meta");
let PLIB=packLib(PPK);const PLIB_META=LS.get(PPK_META,{})||{};
function plSave(){packLibSave(PPK,PLIB);lsSet(PPK_META,PLIB_META)}
function installedPacks(){return Object.values(PLIB).sort((a,b)=>a.name.localeCompare(b.name))}
function installPack(pack,source){const old=PLIB[pack.id];
  if(old&&old.rev>=pack.rev){if(source&&!PLIB_META[pack.id])PLIB_META[pack.id]={source,at:Date.now()};return old.rev===pack.rev?"same":"older"}
  PLIB[pack.id]=pack;PLIB_META[pack.id]={source:source||(PLIB_META[pack.id]||{}).source||"file",at:Date.now()};plSave();RULES_KEY="";return old?"updated":"new"}
function packsForChar(c){if(!c)return [];const ids=[...new Set([...(c.packs||[]),...((c.campaign&&c.campaign.packs)||[])])];return ids.map(id=>PLIB[id]).filter(Boolean)}
function rulesChar(){return ui.view==="table"&&typeof myChar==="function"&&myChar()?myChar():curChar()}
function syncRules(){activateRules(packsForChar(rulesChar()))}
function charShop(c){return c&&c.campaign&&c.campaign.shop||null}
function shopLocked(c){const s=charShop(c);return !!(s&&s.locked)}
BEFORE_RENDER.push(syncRules);
function cpBeforeSave(c){if(c&&c.id!=="sample"){try{stampHomebrew(c,packsForChar(c))}catch(e){}}}

/* ---------- new runner: which homebrew to use ---------- */
function newPacksSel(){if(!ui.newPacks){const pc=ui.pendingCampaign;ui.newPacks=new Set(pc?pc.packs.filter(id=>PLIB[id]):installedPacks().map(p=>p.id))}return ui.newPacks}
{const _nc=newCharBody;newCharBody=function(){const base=_nc();const packs=installedPacks();const pc=ui.pendingCampaign;
  if(!packs.length&&!pc)return base;const sel=newPacksSel();
  const extra=`<div class="ncpacks">${pc?`<div class="banner" style="margin:0"><span class="chip green">Campaign</span> Building for <b>${esc(pc.name)}</b>. This runner uses that campaign's shop${pc.packs.length?" and homebrew":""}.</div>`:""}
    ${packs.length?`<div class="field"><span class="label">Homebrew to use</span>${packs.map(p=>{const fromC=pc&&pc.packs.includes(p.id);return `<label class="row" style="gap:8px;padding:3px 0"><input type="checkbox" data-act-change="nc-pack" value="${esc(p.id)}" ${sel.has(p.id)?"checked":""} ${fromC?"disabled":""}> <b>${esc(p.name)}</b> <span class="faint" style="font-size:12.5px">${esc(packCounts(p))}${fromC?" · required by the campaign":""}</span></label>`}).join("")}
      <span class="faint" style="font-size:12.5px">Homebrew roles show up in the Role step, and homebrew skills and gear everywhere else. You can change this later under Homebrew.</span></div>`:""}</div>`;
  return base.replace(/<\/div>$/,extra+"</div>")}}
{const _new=A["new-char"];A["new-char"]=function(el){_new(el);const c=curChar();if(!c)return;const pc=ui.pendingCampaign;
  c.packs=[...newPacksSel()];if(pc){c.packs=[...new Set([...c.packs,...pc.packs])];c.campaign={id:pc.id,name:pc.name,packs:pc.packs.slice(),shop:pc.shop}}
  ui.newPacks=null;ui.pendingCampaign=null;saveChar(c,true);render()}}

/* ---------- the Homebrew window ---------- */
const packFileIn=document.createElement("input");packFileIn.type="file";packFileIn.accept=".cp2020homebrew,.json,application/json";packFileIn.multiple=true;packFileIn.hidden=true;document.body.appendChild(packFileIn);
packFileIn.addEventListener("change",()=>{const fs=[...packFileIn.files];packFileIn.value="";installPackFiles(fs)});
async function installPackFiles(files){let n=0;const msgs=[];
  for(const f of files){try{const r=await readPackageFile(f);
      if(r.kind==="campaign"){msgs.push(`${f.name} is a campaign package. Campaign packages are for GMs: open it from Cyberpunk's GM screens.`);continue}
      const st=installPack(r.pack,"file");n++;msgs.push(`${st==="same"?"Already installed":st==="older"?"You already have a newer copy of":st==="updated"?"Updated":"Installed"} "${r.pack.name}".${r.problems.length?" "+r.problems.length+" entries were skipped.":""}`)}
    catch(e){msgs.push(`${f.name}: ${e.message||e}`)}}
  if(msgs.length)showNotice(msgs.join(" "));render();if(ui.modal)renderModal()}
function homebrewBody(){const packs=installedPacks();const c=curChar();const ed=c&&canEditChar(c)&&ui.view!=="roster"&&ui.view!=="table";const camp=c&&c.campaign;
  const mine=ed?`<section style="display:grid;gap:8px"><h3 style="font-size:20px;font-weight:800">${esc(c.handle||"This runner")} uses</h3>
      ${packs.length?packs.map(p=>{const fromC=camp&&(camp.packs||[]).includes(p.id);const on=fromC||(c.packs||[]).includes(p.id);
        return `<label class="row" style="gap:8px"><input type="checkbox" data-act-change="char-pack" value="${esc(p.id)}" ${on?"checked":""} ${fromC?"disabled":""}> <b>${esc(p.name)}</b>${fromC?` <span class="faint" style="font-size:12.5px">required by ${esc(camp.name)}</span>`:""}</label>`}).join(""):`<p class="faint" style="margin:0">No homebrew installed yet.</p>`}
      ${camp?`<p class="faint" style="margin:0;font-size:12.5px">Campaign: <b>${esc(camp.name)}</b>. Its shop setup${camp.packs&&camp.packs.length?" and homebrew":""} apply to this runner.</p>`:""}</section>`:"";
  const list=packs.length?`<div class="items">${packs.map(p=>{const m=PLIB_META[p.id]||{};const open=ui.packView===p.id;
      return `<div class="it" style="display:block"><div class="row" style="justify-content:space-between;align-items:flex-start;flex-wrap:nowrap"><div style="min-width:0"><div class="t">${esc(p.name)} <span class="faint mono" style="font-size:11px">v${p.rev}</span></div>
        <div class="m">${esc(packCounts(p))}${p.author?" · by "+esc(p.author):""}${m.source&&m.source!=="file"?" · from "+esc(m.source):""}</div>${p.description?`<div class="faint" style="font-size:12.5px;margin-top:2px">${esc(p.description)}</div>`:""}</div>
        <div class="a" style="flex:none"><button class="btn sm ghost" data-act="pack-view" data-id="${esc(p.id)}">${open?"Hide":"What's in it"}</button><button class="btn sm ghost danger" data-act="pack-remove" data-id="${esc(p.id)}">${ui.confirm==="rmpack-"+p.id?"Confirm remove":"Remove"}</button></div></div>
        ${open?packContentsHTML(p):""}</div>`}).join("")}</div>`:`<p class="faint" style="margin:0">Homebrew packs add roles, skills and gear made by your GM or your group. Get a <b>.cp2020homebrew</b> file from your GM, or join their game: the homebrew it uses installs by itself.</p>`;
  return `<div style="display:grid;gap:18px">${mine}
    <section style="display:grid;gap:8px"><div class="row" style="justify-content:space-between"><h3 style="font-size:20px;font-weight:800">Installed homebrew</h3><button class="btn sm primary" data-act="pack-install">Install a homebrew pack…</button></div>${list}
      <span class="faint" style="font-size:12.5px">Removing a pack keeps every runner that uses it working: each runner keeps a copy of the role, skills and gear it uses. Only the shop loses that pack's items.</span></section></div>`}
function packContentsHTML(p){const sec=(t,l,f)=>l.length?`<div><span class="label">${t}</span><div class="pkc">${l.map(f).join("")}</div></div>`:"";
  return `<div style="display:grid;gap:8px;margin-top:8px">
    ${sec("Roles",p.roles,r=>`<div><b>${esc(r.name)}</b> <span class="faint">· ${esc(r.ability.name)} (${esc(r.ability.stat)})</span>${r.blurb?`<div class="faint" style="font-size:12.5px">${esc(r.blurb)}</div>`:""}</div>`)}
    ${sec("Skills",p.skills,s=>`<div><b>${esc(s.name)}</b> <span class="faint">· ${esc(s.stat)}${s.mult>1?" ×"+s.mult:""}</span>${s.desc?`<div class="faint" style="font-size:12.5px">${esc(s.desc)}</div>`:""}</div>`)}
    ${sec("Weapons",p.weapons,w=>`<div><b>${esc(w.name)}</b> <span class="faint">· ${esc(w.dmg)} · ${fmtEb(w.cost)}</span></div>`)}
    ${sec("Armor",p.armor,a=>`<div><b>${esc(a.name)}</b> <span class="faint">· SP ${a.sp} · ${fmtEb(a.cost)}</span></div>`)}
    ${sec("Cyberware",p.cyber,x=>`<div><b>${esc(x.name)}</b> <span class="faint">· HC ${esc(x.hc)} · ${fmtEb(x.cost)}</span></div>`)}
    ${sec("Gear",p.gear,g=>`<div><b>${esc(g.name)}</b> <span class="faint">· ${fmtEb(g.cost)}</span></div>`)}</div>`}
MODALS.homebrew=()=>({title:"Homebrew",body:homebrewBody()});
function cpNavExtra(){return `<button data-act="open-modal" data-m="homebrew">Homebrew${installedPacks().length?` · ${installedPacks().length}`:""}</button><button data-act="print-blank">Blank sheet</button>`}
Object.assign(A,{
  "pack-install":()=>packFileIn.click(),
  "pack-view":el=>{ui.packView=ui.packView===el.dataset.id?null:el.dataset.id;renderModal()},
  "pack-remove":el=>{const id=el.dataset.id;if(ui.confirm!=="rmpack-"+id){ui.confirm="rmpack-"+id;renderModal();return}ui.confirm=null;const p=PLIB[id];delete PLIB[id];delete PLIB_META[id];plSave();RULES_KEY="";showNotice(`Removed "${p?p.name:"pack"}".`);render();renderModal()},
});
Object.assign(CHANGE,{
  "nc-pack":el=>{const s=newPacksSel();if(el.checked)s.add(el.value);else s.delete(el.value)},
  "char-pack":el=>{const c=curChar();if(!c||!canEditChar(c))return;const s=new Set(c.packs||[]);if(el.checked)s.add(el.value);else s.delete(el.value);c.packs=[...s];saveChar(c);render();renderModal()},
});
// drop or load .cp2020homebrew files anywhere
FILE_HANDLERS.push(async list=>{const pk=list.filter(f=>isPackFileName(f.name));const rest=list.filter(f=>!isPackFileName(f.name));
  const heads=await Promise.all(rest.map(f=>f.slice(0,400).text().catch(()=>"")));const other=[];rest.forEach((f,i)=>(/"format"\s*:\s*"monolith-pack"/.test(heads[i])?pk:other).push(f));
  if(pk.length)installPackFiles(pk);return other});

/* ---------- the shop: campaign setup and the GM's lock ---------- */
{const _sb=shopBody;shopBody=function(c0){const c=c0||curChar();const shop=charShop(c);const locked=shopLocked(c);
  let html=_sb(c);
  if(c&&c.campaign){const banner=locked?`<div class="banner warnb shopbanner" style="margin:0"><b>The shop is closed.</b> ${esc(c.campaign.name)}'s GM opens it when your crew reaches a vendor. You can still look around.</div>`
      :shop&&shop.vendor?`<div class="banner shopbanner" style="margin:0;border-style:solid"><span class="chip green">Open</span> <b>${esc(shop.vendor)}</b> is open for business.</div>`:"";
    html=html.replace('<div style="display:grid;gap:12px">','<div style="display:grid;gap:12px">'+banner)}
  return html}}
{const _row=shopRow;shopRow=function(name,meta,cost,kind,i){const c=curChar();const shop=charShop(c);const list=SHOP_LISTS[kind]();const row=list[i];
  if(row&&shopHidden(shop,kind,row[0]))return "";
  const price=row?shopPrice(shop,kind,row):cost;const hb=PACK_SRC[kind]&&PACK_SRC[kind][name];
  let h=_row(name,meta,price,kind,i);
  if(hb)h=h.replace('<span class="ii-i"',`<span class="chip amber hbchip" title="From ${esc(hb)}">Homebrew</span><span class="ii-i"`);
  if(shopLocked(c))h=h.replace(/<button class="btn sm[^"]*" data-act="buy"[^>]*>[^<]*<\/button>/,`<button class="btn sm" disabled title="The shop is closed">${ui.shopFree?"Add":"Buy"}</button>`);
  return h}}
{const _buy=A.buy;A.buy=function(el){const c=curChar();if(c&&shopLocked(c)){showNotice("The shop is closed. Your GM opens it when you reach a vendor.");return}
  const k=el.dataset.k,i=Number(el.dataset.i);const list=SHOP_LISTS[k]&&SHOP_LISTS[k]();const row=list&&list[i];const shop=charShop(c);
  if(!row||shopHidden(shop,k,row[0]))return;
  const price=shopPrice(shop,k,row);const ix=SHOP_COST_IX[k];const orig=row[ix];
  if(!ui.shopFree&&(Number(c.eb)||0)<price){showNotice("Not enough cash.");return}
  const before={w:c.weapons.length,a:c.armor.length,c:c.cyber.length};
  row[ix]=price;try{_buy(el)}finally{row[ix]=orig}
  const desc=ITEM_DESC[k]&&ITEM_DESC[k][row[0]];if(desc){const L={w:c.weapons,a:c.armor,c:c.cyber}[k];if(L&&L.length>before[k]){L[L.length-1].desc=desc;saveChar(c)}
    if(k==="g"){const g=c.gear.find(x=>x.name===row[0]);if(g&&!g.desc){g.desc=desc;saveChar(c)}}}}}
{const _free=CHANGE["shop-free"];CHANGE["shop-free"]=function(el){const c=curChar();if(c&&shopLocked(c)){el.checked=false;ui.shopFree=false;showNotice("The shop is closed, so nothing can be added right now.");return}if(_free)_free(el);else{ui.shopFree=el.checked;renderModal()}}}

/* ---------- campaign rules from the GM (joining, or "build a runner for this campaign") ---------- */
function applyCampaignRules(m){const ids=(Array.isArray(m.packIds)?m.packIds:[]).map(x=>String(x).replace(/[^A-Za-z0-9_-]/g,"")).filter(Boolean).slice(0,40);
  const info={id:String(m.campaign&&m.campaign.id||"").replace(/[^A-Za-z0-9_-]/g,"").slice(0,40)||"campaign",name:cleanText(m.campaign&&m.campaign.name,60)||Net.table||"Campaign",packs:ids.filter(id=>PLIB[id]),shop:sanitizeShop(m.shop)};
  if(m.peek){ui.pendingCampaign=info;ui.newPacks=null;return}
  const c=myChar();if(!c)return;const was=JSON.stringify(c.campaign||null);
  c.campaign=info;c.packs=[...new Set([...(c.packs||[]),...info.packs])];
  if(JSON.stringify(c.campaign)!==was){const wasLocked=was!=="null"&&JSON.parse(was)&&JSON.parse(was).shop&&JSON.parse(was).shop.locked;
    S.chars.set(c.id,c);persist();RULES_KEY="";requestRender();if(ui.modal)renderModal();
    if(was!=="null"&&wasLocked!==info.shop.locked)showNotice(info.shop.locked?"The GM closed the shop.":`The shop is open${info.shop.vendor?": "+info.shop.vendor:""}.`)}}
/* game messages from the GM's table */
function cpPlayerMessage(type,m){
  if(type==="pack"){try{const r=sanitizeHomebrew(m.pack);installPack(r.pack,cleanText(Net.table,60)||"a campaign")}catch(e){}return}
  if(type==="rules"){applyCampaignRules(m);return}}
/* "build a runner for this campaign": the rules arrived, open the builder */
function cpOnPeek(info){ui.view="roster";ui.charId=null;ui.modal="newchar";render();renderModal();const pc=ui.pendingCampaign;
  showNotice(`Got ${(pc&&pc.name)||info.name}'s rules${pc&&pc.packs.length?` and ${pc.packs.length} homebrew pack${pc.packs.length===1?"":"s"}`:""}. Build your runner, then join.`)}
