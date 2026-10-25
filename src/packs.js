/* ============================== CYBERPUNK 2020: HOMEBREW & CAMPAIGN PACKAGES ==============================
   Two kinds of package:
   - Homebrew packs (.cp2020homebrew, JSON): roles, skills, weapons, armor, cyberware and gear.
     Public rules content: players install them (from a file, or automatically when they join
     a campaign that uses them) so they can build characters with them.
   - Campaign packages (.cp2020campaign, zip): a ready-made campaign for the GM: NPCs (with
     portraits), maps, the encounter, notes, a shop setup, and the homebrew packs it uses.
   Packages are data only. Everything in them is validated and clamped when read; nothing in
   a package is ever run. The rules registry merges active homebrew packs into the base
   catalogs (ROLES, SKILL_DEFS, WEAPONS, ARMOR, CYBER, GEAR) without touching the base data. */

const PACK_FORMAT="monolith-pack";const PACK_GAME="cyberpunk",PACK_RULESET="cp2020";
const BASE_RULES={roles:ROLE_NAMES.slice(),skills:SKILL_DEFS.length,w:WEAPONS.length,a:ARMOR.length,c:CYBER.length,g:GEAR.length,abilities:Object.keys(ABILITIES)};
const PACK_SRC={role:{},skill:{},w:{},a:{},c:{},g:{}};      // name -> pack name, for "Homebrew" labels
const ITEM_DESC={w:{},a:{},c:{},g:{},skill:{}};               // name -> description written in the pack
const CYBER_CATS=["Fashionware","Neuralware","Cyberoptics","Cyberaudio","Implants","Cyberweapons","Cyberlimbs"];
const PK_LIMITS={roles:60,skills:300,items:600,text:600,name:60};
let RULES_KEY="";

/* ---------- validation ---------- */
function pkStr(v,max=PK_LIMITS.name){return String(v==null?"":v).replace(/[\u0000-\u001f\u007f<>]/g," ").replace(/\s+/g," ").trim().slice(0,max)}
function pkText(v,max=PK_LIMITS.text){return String(v==null?"":v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,"").replace(/[<>]/g,"").trim().slice(0,max)}
function pkNum(v,lo,hi,def=0){const n=Number(v);return Number.isFinite(n)?Math.round(clamp(n,lo,hi)):def}
function pkEnum(v,list,def){v=String(v||"").toUpperCase();return list.includes(v)?v:def}
function pkDice(v,def="1D6"){const s=pkStr(v,16).toUpperCase().replace(/\s+/g,"");return parseDice(s)?s:def}
function pkId(v){const s=String(v||"").replace(/[^A-Za-z0-9_-]/g,"").slice(0,40);return s||("pk"+uid())}
function pkLocs(v){const l=Array.isArray(v)?v.filter(x=>LOC_KEYS.includes(x)):[];return [...new Set(l)]}
/* Returns {pack, problems[]} for a homebrew pack, or throws if it isn't one. */
function sanitizeHomebrew(raw){
  if(!raw||typeof raw!=="object"||raw.format!==PACK_FORMAT||raw.kind!=="homebrew")throw new Error("That isn't a homebrew pack.");
  if((raw.game&&raw.game!==PACK_GAME)||(raw.ruleset&&raw.ruleset!==PACK_RULESET))throw new Error("That homebrew pack is for another game or ruleset.");
  const problems=[];const seen=new Set();
  const uniq=(kind,name)=>{const k=kind+"|"+name.toLowerCase();if(!name){problems.push(`A ${kind} without a name was skipped.`);return false}if(seen.has(k)){problems.push(`Duplicate ${kind} "${name}" was skipped.`);return false}seen.add(k);return true};
  const p={format:PACK_FORMAT,kind:"homebrew",game:PACK_GAME,ruleset:PACK_RULESET,id:pkId(raw.id),name:pkStr(raw.name)||"Homebrew pack",author:pkStr(raw.author),description:pkText(raw.description),rev:pkNum(raw.rev,1,1e6,1),updated:pkNum(raw.updated,0,9e15,Date.now()),
    roles:[],skills:[],weapons:[],armor:[],cyber:[],gear:[]};
  (Array.isArray(raw.skills)?raw.skills:[]).slice(0,PK_LIMITS.skills).forEach(s=>{const name=pkStr(s&&s.name);if(!uniq("skill",name))return;
    p.skills.push({name,stat:pkEnum(s.stat,STAT_KEYS,"INT"),mult:pkNum(s.mult,1,5,1),desc:pkText(s.desc)})});
  (Array.isArray(raw.roles)?raw.roles:[]).slice(0,PK_LIMITS.roles).forEach(r=>{const name=pkStr(r&&r.name);if(!uniq("role",name))return;
    const ab=r.ability||{};const abName=pkStr(ab.name)||name+" ability";
    const skills=(Array.isArray(r.skills)?r.skills:[]).slice(0,12).map(x=>{
      if(x&&typeof x==="object"&&Array.isArray(x.pick)){const l=x.pick.map(y=>pkStr(y)).filter(Boolean).slice(0,30);return l.length>1?{pick:l}:(l[0]||null)}
      return pkStr(x)||null}).filter(Boolean);
    const income=(Array.isArray(r.income)?r.income:[]).slice(0,6).map(v=>pkNum(v,0,1e7,0));while(income.length<6)income.push(income[income.length-1]||1000);
    p.roles.push({name,ability:{name:abName,stat:pkEnum(ab.stat,STAT_KEYS,"INT"),desc:pkText(ab.desc)},skills,income,blurb:pkText(r.blurb,200),does:pkText(r.does,300),
      keyStats:(Array.isArray(r.keyStats)?r.keyStats:[]).map(s=>pkEnum(s,STAT_KEYS,"")).filter(Boolean).slice(0,4)})});
  (Array.isArray(raw.weapons)?raw.weapons:[]).slice(0,PK_LIMITS.items).forEach(w=>{const name=pkStr(w&&w.name);if(!uniq("weapon",name))return;
    const type=pkEnum(w.type,Object.keys(WTYPE_SKILL),"P");
    p.weapons.push({name,type,wa:pkNum(w.wa,-5,5,0),conc:pkEnum(w.conc,["P","J","L","N"],"J"),avail:pkEnum(w.avail,["E","C","P","R"],"C"),dmg:pkDice(w.dmg),
      shots:type==="MEL"?0:pkNum(w.shots,0,999,10),rof:pkNum(w.rof,1,999,type==="MEL"?1:2),rel:pkEnum(w.rel,["VR","ST","UR"],"ST"),range:type==="MEL"?1:pkNum(parseInt(w.range),1,9999,50),
      cost:pkNum(w.cost,0,1e7,0),skill:pkStr(w.skill)||"",desc:pkText(w.desc)})});
  (Array.isArray(raw.armor)?raw.armor:[]).slice(0,PK_LIMITS.items).forEach(a=>{const name=pkStr(a&&a.name);if(!uniq("armor",name))return;
    const locs=pkLocs(a.locs);p.armor.push({name,sp:pkNum(a.sp,0,60,10),locs:locs.length?locs:["torso"],ev:pkNum(a.ev,0,6,0),cost:pkNum(a.cost,0,1e7,0),desc:pkText(a.desc)})});
  (Array.isArray(raw.cyber)?raw.cyber:[]).slice(0,PK_LIMITS.items).forEach(x=>{const name=pkStr(x&&x.name);if(!uniq("cyberware",name))return;
    const mods={};if(x.mods&&typeof x.mods==="object")for(const k of STAT_KEYS){const v=pkNum(x.mods[k],-5,5,0);if(v)mods[k]=v}
    const arm=x.armor&&typeof x.armor==="object"&&pkNum(x.armor.sp,0,60,0)?{sp:pkNum(x.armor.sp,0,60,0),locs:pkLocs(x.armor.locs).length?pkLocs(x.armor.locs):LOC_KEYS.slice()}:null;
    const hc=String(x.hc||"0").trim()==="0"?"0":pkDice(x.hc,"1D6");
    p.cyber.push({name,cat:pkStr(x.cat,30)||"Implants",cost:pkNum(x.cost,0,1e7,0),hc,init:pkNum(x.init,0,5,0),smart:!!x.smart,mods,armor:arm,desc:pkText(x.desc)})});
  (Array.isArray(raw.gear)?raw.gear:[]).slice(0,PK_LIMITS.items).forEach(g=>{const name=pkStr(g&&g.name);if(!uniq("gear",name))return;
    p.gear.push({name,cost:pkNum(g.cost,0,1e7,0),desc:pkText(g.desc)})});
  return {pack:p,problems}}
function sanitizeShop(raw){const out={hide:{w:[],a:[],c:[],g:[]},price:{w:{},a:{},c:{},g:{}},locked:false,vendor:""};if(!raw||typeof raw!=="object")return out;
  out.locked=!!raw.locked;out.vendor=pkStr(raw.vendor,60);
  for(const k of ["w","a","c","g"]){out.hide[k]=[...new Set((Array.isArray(raw.hide&&raw.hide[k])?raw.hide[k]:[]).map(n=>pkStr(n,80)).filter(Boolean))].slice(0,3000);
    const pr=raw.price&&raw.price[k];if(pr&&typeof pr==="object")Object.entries(pr).slice(0,3000).forEach(([n,v])=>{n=pkStr(n,80);if(n)out.price[k][n]=pkNum(v,0,1e7,0)})}
  return out}
function shopIsDefault(s){return !s||["w","a","c","g"].every(k=>!(s.hide&&s.hide[k]||[]).length&&!Object.keys(s.price&&s.price[k]||{}).length)}
function packCounts(p){const parts=[];const n=(l,one,many)=>{if(l&&l.length)parts.push(`${l.length} ${l.length===1?one:many}`)};
  n(p.roles,"role","roles");n(p.skills,"skill","skills");n(p.weapons,"weapon","weapons");n(p.armor,"armor","armor");n(p.cyber,"cyberware","cyberware");n(p.gear,"gear item","gear items");
  return parts.join(" · ")||"Empty"}
function packRef(p){return {id:p.id,name:p.name,rev:p.rev}}

/* ---------- the rules registry ---------- */
function activateRules(packs){packs=(packs||[]).filter(Boolean);const key=packs.map(p=>p.id+":"+p.rev).join(",");if(key===RULES_KEY)return false;RULES_KEY=key;
  // back to the base rules
  for(const n of Object.keys(ROLES))if(!BASE_RULES.roles.includes(n))delete ROLES[n];
  ROLE_NAMES.length=0;ROLE_NAMES.push(...BASE_RULES.roles);
  for(const n of Object.keys(ABILITIES))if(!BASE_RULES.abilities.includes(n))delete ABILITIES[n];
  for(const d0 of SKILL_DEFS.splice(BASE_RULES.skills))delete SKILL_BY_NAME[d0[0]];
  WEAPONS.length=BASE_RULES.w;ARMOR.length=BASE_RULES.a;CYBER.length=BASE_RULES.c;GEAR.length=BASE_RULES.g;
  for(const k in PACK_SRC)PACK_SRC[k]={};for(const k in ITEM_DESC)ITEM_DESC[k]={};
  const taken=kind=>({w:new Set(WEAPONS.map(r=>r[0].toLowerCase())),a:new Set(ARMOR.map(r=>r[0].toLowerCase())),c:new Set(CYBER.map(r=>r[0].toLowerCase())),g:new Set(GEAR.map(r=>r[0].toLowerCase()))})[kind];
  for(const p of packs){
    for(const s of p.skills||[]){if(SKILL_BY_NAME[s.name]||ABILITIES[s.name])continue;SKILL_DEFS.push([s.name,s.stat,s.mult]);SKILL_BY_NAME[s.name]={n:s.name,s:s.stat,m:s.mult,pack:p.name};PACK_SRC.skill[s.name]=p.name;if(s.desc)ITEM_DESC.skill[s.name]=s.desc}
    for(const r of p.roles||[]){if(ROLES[r.name]||ABILITIES[r.ability.name]||SKILL_BY_NAME[r.ability.name])continue;ROLES[r.name]=roleFromPack(r,p);ROLE_NAMES.push(r.name);
      ABILITIES[r.ability.name]={n:r.ability.name,s:r.ability.stat,m:1,special:true};PACK_SRC.role[r.name]=p.name}
    const add=(kind,list,row)=>{const t=taken(kind);for(const x of list||[]){if(t.has(x.name.toLowerCase()))continue;row(x);PACK_SRC[kind][x.name]=p.name;if(x.desc)ITEM_DESC[kind][x.name]=x.desc}};
    add("w",p.weapons,w=>WEAPONS.push([w.name,w.type,w.wa,w.conc,w.avail,w.dmg,w.shots?String(w.shots):"",String(w.rof),w.rel,w.range+"m",w.cost,w.skill||""]));
    add("a",p.armor,a=>ARMOR.push([a.name,a.sp,a.locs.slice(),a.ev,a.cost]));
    add("c",p.cyber,x=>{const ex={};if(x.init)ex.init=x.init;if(x.smart)ex.smart=1;if(Object.keys(x.mods||{}).length)ex.mods={...x.mods};if(x.armor)ex.armor={sp:x.armor.sp,locs:x.armor.locs.slice()};CYBER.push([x.name,x.cat,x.cost,x.hc,ex])});
    add("g",p.gear,g=>GEAR.push([g.name,g.cost]))}
  return true}
function roleFromPack(r,p){return {ab:r.ability.name,abStat:r.ability.stat,blurb:r.blurb||r.does||"Homebrew role.",skills:r.skills.slice(),income:r.income.slice(),homebrew:true,pack:p?p.name:(r.pack||""),
  guide:{does:r.does||r.blurb||"",stats:r.keyStats&&r.keyStats.length?r.keyStats.slice():[r.ability.stat],ability:r.ability.desc||""}}}
/* A character's role: the active rules first, then the copy the character carries (so a runner
   built with a homebrew role still works where that pack isn't installed). */
function roleOf(c){if(!c)return null;if(ROLES[c.role])return ROLES[c.role];const r=c.homebrew&&c.homebrew.roles&&c.homebrew.roles[c.role];return r&&r.ability?roleFromPack(r,null):null}
function abilityOf(c){const r=roleOf(c);return r?r.ab:""}
/* Copy whatever homebrew rules this character uses into the character itself. */
function stampHomebrew(c,packs){if(!c||c.id==="sample")return;const hb={roles:{},skills:{}};
  const all=packs||[];const findRole=n=>{for(const p of all){const r=(p.roles||[]).find(x=>x.name===n);if(r)return {...clone(r),pack:p.name}}return c.homebrew&&c.homebrew.roles&&c.homebrew.roles[n]||null};
  const findSkill=n=>{for(const p of all){const s=(p.skills||[]).find(x=>x.name===n);if(s)return {...clone(s),pack:p.name}}return c.homebrew&&c.homebrew.skills&&c.homebrew.skills[n]||null};
  if(!BASE_RULES.roles.includes(c.role)){const r=findRole(c.role);if(r)hb.roles[c.role]=r}
  const names=new Set([...Object.keys(c.skills||{}),...((roleOf(c)||{}).skills||[]).flatMap(s=>typeof s==="string"?[s]:s.pick||[])]);
  for(const n of names){if(BASE_SKILL(n))continue;const s=findSkill(n);if(s)hb.skills[n]=s}
  if(Object.keys(hb.roles).length||Object.keys(hb.skills).length)c.homebrew=hb;else delete c.homebrew}
function BASE_SKILL(n){return SKILL_DEFS.slice(0,BASE_RULES.skills).some(d0=>d0[0]===n)}

/* ---------- campaign shop ---------- */
const SHOP_LISTS={w:()=>WEAPONS,a:()=>ARMOR,c:()=>CYBER,g:()=>GEAR};
const SHOP_COST_IX={w:10,a:4,c:2,g:1};
function shopHidden(shop,kind,name){return !!(shop&&shop.hide&&(shop.hide[kind]||[]).includes(name))}
function shopPrice(shop,kind,row){const o=shop&&shop.price&&shop.price[kind];const n=row[0];return o&&o[n]!=null?o[n]:row[SHOP_COST_IX[kind]]}

/* ---------- reading package files ---------- */
async function readPackageFile(file){const buf=await file.arrayBuffer();const u8=new Uint8Array(buf);
  if(u8[0]===0x50&&u8[1]===0x4b){const files=await zipParse(buf);const j=files.get("package.json");if(!j)throw new Error("That zip isn't a campaign package.");
    let raw;try{raw=JSON.parse(new TextDecoder().decode(j))}catch(e){throw new Error("The package's contents are damaged.")}
    if(!raw||raw.format!==PACK_FORMAT||raw.kind!=="campaign")throw new Error("That zip isn't a campaign package.");
    if((raw.game&&raw.game!==PACK_GAME)||(raw.ruleset&&raw.ruleset!==PACK_RULESET))throw new Error("That campaign package is for another game or ruleset.");return {kind:"campaign",raw,files}}
  let raw;try{raw=JSON.parse(new TextDecoder().decode(u8))}catch(e){throw new Error("That file isn't a package.")}
  if(raw&&raw.format===PACK_FORMAT&&raw.kind==="homebrew"){const r=sanitizeHomebrew(raw);return {kind:"homebrew",pack:r.pack,problems:r.problems}}
  throw new Error("That file isn't a package.")}
function homebrewFileText(p){return JSON.stringify({...p,game:PACK_GAME,ruleset:PACK_RULESET,app:"Monolith · Cyberpunk",exported:new Date().toISOString()},null,1)}
function packFileName(p,ext){return (String(p.name||"pack").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"pack")+`.${ext}`}
function isPackFileName(n){return /\.(cp2020homebrew|cp2020campaign)$/i.test(n||"")}

/* ---------- a small library of installed homebrew packs ---------- */
function packLib(key){const o=LS.get(key,{})||{};const out={};for(const [id,p] of Object.entries(o)){try{out[id]=sanitizeHomebrew(p).pack}catch(e){}}return out}
function packLibSave(key,lib){return lsSet(key,lib)}
