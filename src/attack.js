/* ============================== ATTACK (1.1.1) ==============================
   Pick a weapon, say how far away the target is, and roll: to hit, then damage for every
   round that hits, each with its own hit location. Uses ammo and handles bursts, full auto,
   suppressive fire, aimed shots, the book's attack modifiers, fumbles and jams, shotgun patterns,
   grenades and other area weapons, melee against a defender's roll, and martial arts moves.
   Numbers from Cyberpunk 2020's Friday Night Firefight chapter. */
const ATK_RANGES=[[10,"Point blank","1 m"],[15,"Close",r=>`≤${Math.round(r/4)} m`],[20,"Medium",r=>`≤${Math.round(r/2)} m`],[25,"Long",r=>`≤${r} m`],[30,"Extreme",r=>`≤${r*2} m`]];
const ATK_UNARMED=[{id:"_punch",name:"Punch",type:"MEL",wa:0,dmg:"1D6/2",skill:"Brawling",rof:"1",unarmed:true,move:"Strike"},{id:"_kick",name:"Kick",type:"MEL",wa:0,dmg:"1D6",skill:"Brawling",rof:"1",unarmed:true,move:"Kick"}];
const ATK_ATTACK_MOVES=["Strike","Kick","Throw","Choke","Sweep","Grapple","Hold","Escape","Disarm"];
const ATK_JAM={VR:3,ST:5,UR:8};
const ATK_STACK=new Set(["grenade","gas","explosive","mine","molotov"]);
function atkState(){return ui.atk||(ui.atk={wid:"",dv:15,mode:"single",rounds:10,aim:"",mod:0,useAmmo:true,hits:1,last:null,sits:[],aimTurns:0,action:1,def:"",move:"",style:"",units:1,gas:"Teargas",gid:"",width:2,mine:"land",shots:1,burn:null})}
function atkWeapons(c){return [...(c.weapons||[]),...ATK_UNARMED]}
function atkWeapon(c,id){return atkWeapons(c).find(w=>w.id===id)||null}
function atkMartialSkill(c){return Object.keys(c.skills||{}).filter(n=>/^Martial Art/.test(n)&&skillLevel(c,n)>0).sort((a,b)=>skillLevel(c,b)-skillLevel(c,a))[0]||null}
function atkSkill(c,w){if(w.unarmed){const ma=atkMartialSkill(c);return ma&&skillLevel(c,ma)>skillLevel(c,"Brawling")?ma:"Brawling"}return w.skill||WTYPE_SKILL[w.type]||"Handgun"}
function atkStyle(c,skill,s){if(!/^Martial Art/.test(skill||""))return null;return maStyleOf(skill)||(MA_STYLES[s.style]?s.style:null)}
function atkMelee(w){return w.type==="MEL"}
function atkArea(w){return AREA_FX[w&&w.name]||null}
function atkShotgun(w){return w&&w.type==="SHT"}
function atkAuto(w){return !atkMelee(w)&&!atkArea(w)&&Number(w.rof)>2}
function atkThrown(w){return /^thrown$/i.test(String(w.range||""))}
function atkPlaced(w,s){const a=atkArea(w);return !!a&&(a.kind==="mine"||(a.kind==="explosive"&&s.place!=="throw"))}
function atkThrowMult(w){return atkArea(w)?10:3}
function atkRange(w,c){if(atkThrown(w)||(atkArea(w)&&atkArea(w).kind==="explosive")){const k=c?calc(c):null;return atkThrowMult(w)*Math.max(1,k?k.eff.BODY:5)}return parseInt(w.range)||50}
// lasers dial 1D6 to 5D6 a shot from a 10D6 powerpack (pg. 108)
function atkLaser(w){return /^1-5D6$/i.test(String(w&&w.dmg||""))}
function atkAmmo(w){return Number(w.shots)>0?Number(w.ammo)||0:null}
function atkLauncherGrenades(c){return (c.weapons||[]).filter(w=>{const a=atkArea(w);return a&&(a.kind==="grenade"||a.kind==="gas")})}
function atkShot(c,w,s){if(atkArea(w)&&atkArea(w).kind==="launcher"){const g=atkLauncherGrenades(c);return g.find(x=>x.id===s.gid)||g[0]||null}return w}
function atkRoundsFor(s,w){if(atkMelee(w))return 0;if(atkLaser(w))return clamp(Number(s.power)||3,1,5);const a=atkArea(w);if(a)return a.perUnit?clamp(Number(s.units)||1,1,99):1;
  if(atkShotgun(w)&&s.mode==="auto"&&Number(w.rof)>2)return clamp(Number(s.shots)||1,1,Number(w.rof)||1);
  if((s.mode==="burst")&&atkAuto(w)&&!atkShotgun(w))return 3;if((s.mode==="auto"||s.mode==="suppress")&&atkAuto(w))return clamp(Number(s.rounds)||1,1,Number(w.rof)||1);return 1}
function atkHasScope(c){return (c.cyber||[]).some(x=>/targeting scope/i.test(x.name||""))}
function atkGoggles(c){return (c.gear||[]).some(g=>/smartgoggles/i.test(g.name||"")&&Number(g.qty||1)>0)}
function atkMods(c,w,s){const k=calc(c);const out=[];const skill=atkSkill(c,w);const sits=new Set(s.sits||[]);const mel=atkMelee(w);const auto=(s.mode==="auto"||s.mode==="suppress")&&atkAuto(w);const fast=sits.has("fastdraw");
  out.push(["REF",k.eff.REF]);out.push([skill,skillLevel(c,skill)]);
  if(Number(w.wa))out.push(["Weapon accuracy",Number(w.wa)]);
  const smart=k.smart||atkGoggles(c);
  const gun=!mel&&!atkThrown(w)&&!(atkArea(w)&&["explosive","mine","molotov"].includes(atkArea(w).kind));
  if(smart&&gun)out.push([k.smart?"Smartgun link":"Smartgoggles",2]);
  const dv=Number(s.dv)||0;const close=dv&&dv<=15;
  if(!mel&&atkAuto(w)&&s.mode==="burst"&&!atkShotgun(w)&&dv&&dv<=20)out.push(["3-round burst",3]);
  if(!mel&&atkAuto(w)&&s.mode==="auto"&&!atkShotgun(w)&&dv){const n=Math.floor(atkRoundsFor(s,w)/10);if(n)out.push([`Full auto, ${atkRoundsFor(s,w)} rounds`,close?n:-n])}
  if(atkShotgun(w)&&s.mode==="auto"){const n=atkRoundsFor(s,w);if(n>1)out.push([`${n} autoshotgun blasts`,-2*(n-1)])}
  if(s.aim)out.push(["Aimed shot",-4]);
  // aiming, scopes and sights don't work on a fast draw or full auto (pg. 98, 106)
  const aiming=!fast&&!auto&&!mel;
  if(aiming&&Number(s.aimTurns))out.push([`Aiming ${s.aimTurns} turn${s.aimTurns>1?"s":""}`,clamp(Number(s.aimTurns),0,3)]);
  if(aiming&&gun&&smart&&atkHasScope(c)&&!sits.has("scope"))out.push(["Targeting scope (cyberoptic, smartgun)",1]);
  if(mel&&w.unarmed||mel&&/^Martial Art/.test(skill)){const st=atkStyle(c,skill,s);const mv=s.move||w.move;const b=st&&MA_STYLES[st][1][mv];if(b)out.push([`${st} key attack (${mv})`,b])}
  for(const [id,label,v] of ATK_SITUATIONS){if(!sits.has(id))continue;if(id==="dodging"&&!mel)continue;if(["laser","telescopic","scope","goggles"].includes(id)&&!aiming)continue;
    if(id==="goggles"&&smart)continue;let val=v;if(id==="telescopic")val=dv>=25?2:dv===20?1:0;if(val)out.push([label,val])}
  const act=clamp(Number(s.action)||1,1,4);if(act>1)out.push([`Action ${act} this turn`,-3*(act-1)]);
  if(Number(s.mod))out.push(["Modifier",Number(s.mod)]);
  return out}
function atkLocRoll(){const r=d(10);return {r,loc:r===1?"head":r<=4?"torso":r===5?"rarm":r===6?"larm":r<=8?"rleg":"lleg"}}
const atkLocName=l=>(LOCS.find(x=>x[0]===l)||[l,l])[1];
function atkDmgExpr(c,w,s){if(atkLaser(w))return `${clamp(Number(s.power)||3,1,5)}D6`;if(atkShotgun(w))return shotgunAt(Number(s.dv)||15).dmg;if(w.unarmed||atkMelee(w)&&/^Martial Art/.test(atkSkill(c,w))){const mv=UNARMED_MOVES[s.move||w.move];if(w.unarmed)return mv&&mv.dmg||null}return w.dmg}
function atkDmgBonus(c,w,s){const k=calc(c);if(!atkMelee(w))return 0;let b=0;const mv=w.unarmed?UNARMED_MOVES[s.move||w.move]:null;
  if(!w.unarmed||mv&&mv.dmgMod)b+=k.melee;const sk=atkSkill(c,w);if(w.unarmed&&/^Martial Art/.test(sk))b+=skillLevel(c,sk);return b}
function atkDamage(c,w,n,aim,s,dbl){s=s||atkState();const expr=atkDmgExpr(c,w,s);const mb=atkDmgBonus(c,w,s);const hits=[];if(!expr)return hits;
  for(let i=0;i<n;i++){const r=rollDice(expr)||{total:0,text:"?"};const L=aim?{loc:aim,r:null}:atkLocRoll();let dmg=Math.max(0,r.total+mb);if(dbl)dmg*=2;
    hits.push({loc:L.loc,lr:L.r,dmg,text:r.text+(mb?" "+sgn(mb):"")+(dbl?" ×2":"")})}
  return hits}
function atkOpen(wid){const c=ckChar();if(!c){showNotice("Open a runner first.");return}const s=atkState();
  const ws=atkWeapons(c);s.wid=wid&&ws.some(w=>w.id===wid)?wid:(ws.find(w=>w.id===s.wid)?s.wid:ws[0].id);
  s.last=null;s.mod=0;s.aim="";s.hits=1;s.aimTurns=0;s.action=1;s.def="";s.burn=null;if(ui.rangeDv)s.dv=Number(ui.rangeDv)||s.dv;
  atkPicked(c,s);
  Tray.open=false;Tray.render();if(typeof ItemTip!=="undefined")ItemTip.hide();ui.modal="attack";renderModal()}
function atkPicked(c,s){const w=c&&atkWeapon(c,s.wid);if(!w)return;if(atkMelee(w))s.dv=0;else if(!s.dv)s.dv=15;if(!atkAuto(w)&&!(atkShotgun(w)&&s.mode==="auto"))s.mode="single";if(w.unarmed)s.move=w.move;else s.move="";s.units=1;s.burn=null}
function atkSitsHTML(c,w,s){const sits=new Set(s.sits||[]);const mel=atkMelee(w);const groups=["Target","You","Weapon"];
  return `<details class="atk-sits" ${sits.size||s.aimTurns||Number(s.action)>1?"open":""}><summary><span class="label">Situation</span> <span class="faint" style="font-size:12.5px">${sits.size?`${sits.size} modifier${sits.size===1?"":"s"} on`:"the book's attack modifiers"}</span></summary>
    ${groups.map(g=>`<div class="atk-sitg"><span class="label">${g}</span><div class="row" style="gap:4px">${ATK_SITUATIONS.filter(x=>x[3]===g&&!(x[0]==="dodging"&&!mel)&&!(mel&&g==="Weapon")).map(([id,label,v,,note])=>`<button class="chipbtn ${sits.has(id)?"on":""}" data-act="atk-sit" data-v="${id}" title="${esc(note||"")}">${esc(label)} <b>${id==="telescopic"?"+1/+2":sgn(v)}</b></button>`).join("")}</div></div>`).join("")}
    <div class="row" style="gap:14px;margin-top:6px">${!mel?`<span class="row" style="gap:6px"><span class="label">Aiming</span><span class="seg">${[0,1,2,3].map(n=>`<button class="${Number(s.aimTurns)===n?"on":""}" data-act="atk-aimturns" data-v="${n}">${n?"+"+n:"No"}</button>`).join("")}</span><span class="faint" style="font-size:12px">+1 for each turn spent aiming, up to 3</span></span>`:""}
      <span class="row" style="gap:6px"><span class="label">Action this turn</span><span class="seg">${[1,2,3].map(n=>`<button class="${Number(s.action)===n?"on":""}" data-act="atk-action" data-v="${n}">${n===1?"First":n===2?"Second (−3)":"Third (−6)"}</button>`).join("")}</span></span></div></details>`}
function attackBody(){const c=ckChar();if(!c)return `<p class="muted">Open a runner first.</p>`;const s=atkState();const w=atkWeapon(c,s.wid)||atkWeapons(c)[0];const k=calc(c);
  const mel=atkMelee(w),auto=atkAuto(w);const area=atkArea(w);const shot=atkShot(c,w,s);const sg=atkShotgun(w);const placed=atkPlaced(w,s);
  const mods=atkMods(c,w,s);const base=mods.reduce((a,m)=>a+m[1],0);const ammoW=area&&area.kind==="launcher"?shot:w;const ammo=ammoW?atkAmmo(ammoW):null;const need=atkRoundsFor(s,w);
  const ed=canEditChar(c);const short=ammo!=null&&s.useAmmo&&ed&&ammo<need||area&&area.kind==="launcher"&&!shot;
  const list=atkWeapons(c).map(x=>{const m=atkMods(c,x,{...s,mode:"single",aim:"",mod:0,sits:[],aimTurns:0,action:1,move:x.move||""});const b=m.reduce((a,y)=>a+y[1],0);const am=atkAmmo(x);
    return `<button class="ck-sk${x.id===w.id?" on":""}" data-act="atk-pick" data-id="${esc(x.id)}"><span class="n">${esc(x.name)}</span><span class="s">${esc(x.dmg)}${am!=null?` · ${am}/${esc(x.shots)}`:""}</span><b>${b}</b></button>`}).join("");
  const r=atkRange(w,c);
  const dvs=mel||placed?"":`<div><span class="label">How far away?${atkThrown(w)?` <span class="faint" style="text-transform:none;letter-spacing:0">Thrown: up to ${atkThrowMult(w)===10?"10 × BODY":"BODY × 3"} = ${r}m</span>`:""}</span><div class="ck-dv">${ATK_RANGES.map(([v,l,m])=>`<button class="${Number(s.dv)===v?"on":""}" data-act="atk-dv" data-v="${v}"><b>${v}</b><span>${l} · ${typeof m==="function"?m(r):m}</span></button>`).join("")}<button class="${!Number(s.dv)?"on":""}" data-act="atk-dv" data-v="0"><b>—</b><span>GM decides</span></button></div></div>`;
  const sgAuto=sg&&Number(w.rof)>2;
  const modes=auto||sgAuto?`<div><span class="label">Fire mode</span><div class="row" style="gap:6px"><span class="seg" role="group" aria-label="Fire mode">${(sg?[["single","One blast"],["auto","Several blasts"]]:[["single","Single shot"],["burst","3-round burst"],["auto","Full auto"],["suppress","Suppressive fire"]]).map(([m,l])=>`<button class="${s.mode===m?"on":""}" data-act="atk-mode" data-v="${m}">${l}</button>`).join("")}</span>
      ${s.mode==="auto"||s.mode==="suppress"?`<span class="row ck-num" style="flex-wrap:nowrap"><button class="icon-btn" data-act="atk-rounds" data-d="${sg?-1:-10}" aria-label="Fewer">−</button><b class="num">${need}</b><button class="icon-btn" data-act="atk-rounds" data-d="${sg?1:10}" aria-label="More">+</button><span class="faint" style="font-size:12px">${sg?"blasts":"rounds"} (max ${esc(w.rof)})</span></span>`:""}
      ${s.mode==="suppress"?`<span class="row ck-num" style="flex-wrap:nowrap"><button class="icon-btn" data-act="atk-width" data-d="-1" aria-label="Narrower zone">−</button><b class="num">${s.width}m</b><button class="icon-btn" data-act="atk-width" data-d="1" aria-label="Wider zone">+</button><span class="faint" style="font-size:12px">fire zone (at least 2m)</span></span>`:""}</div>
      <span class="faint" style="font-size:12px">${sg?(s.mode==="auto"?"Autoshotgun: every blast lands within 1m of the last, at −2 for each blast after the first.":"One pattern of shot."):s.mode==="burst"?"Burst: +3 to hit at close or medium range; if it hits, 1D6/2 rounds land.":s.mode==="auto"?"Full auto: +1 to hit per 10 rounds up close, −1 per 10 farther out. Every point you beat the DV by is another round that hits. No aiming or scopes.":s.mode==="suppress"?`Suppressive fire: anyone entering or crossing the zone rolls Athletics + REF + 1D10 against ${Math.floor(need/Math.max(2,s.width))} (rounds ÷ zone width) or takes 1D6 rounds.`:"One aimed round."}</span></div>`:"";
  const aim=mel||area||sg||s.mode==="suppress"?"":`<div class="field"><span class="label">Aim</span><select data-act-change="atk-aim" aria-label="Aim at"><option value="">Random hit location</option>${LOCS.map(l=>`<option value="${l[0]}" ${s.aim===l[0]?"selected":""}>${l[1]} (−4 to hit)</option>`).join("")}</select></div>`;
  // melee: martial arts moves, and the defender's roll
  const skill=atkSkill(c,w);const style=atkStyle(c,skill,s);
  const meleeBox=mel?`<div style="display:grid;gap:8px">
      ${w.unarmed?`<div class="field"><span class="label">Move</span><div class="row" style="gap:4px">${ATK_ATTACK_MOVES.map(m=>{const b=style&&MA_STYLES[style][1][m];return `<button class="chipbtn ${(s.move||w.move)===m?"on":""}" data-act="atk-move" data-v="${m}">${m}${b?` <b>+${b}</b>`:""}</button>`}).join("")}</div>
        <span class="faint" style="font-size:12.5px">${esc((UNARMED_MOVES[s.move||w.move]||{}).text||"")}${(UNARMED_MOVES[s.move||w.move]||{}).needs?` Needs ${esc(UNARMED_MOVES[s.move||w.move].needs)}.`:""}</span></div>`:""}
      ${/^Martial Art/.test(skill)?`<div class="row" style="gap:8px">${maStyleOf(skill)?`<span class="chip blue">${esc(maStyleOf(skill))}</span>`:`<label class="row" style="gap:6px"><span class="label">Style</span><select data-act-change="atk-style" aria-label="Martial arts style"><option value="">Pick your style</option>${Object.keys(MA_STYLES).map(n=>`<option ${s.style===n?"selected":""}>${esc(n)}</option>`).join("")}</select></label>`}
        <span class="faint" style="font-size:12.5px">Martial arts add your skill level (${skillLevel(c,skill)}) to damage.${style?` ${style} defends with ${["Block","Dodge"].map(m=>MA_STYLES[style][1][m]?`${m} +${MA_STYLES[style][1][m]}`:"").filter(Boolean).join(", ")||"no Block or Dodge bonus"}.`:""}</span></div>`:""}
      <div class="row" style="gap:8px"><label class="row" style="gap:6px"><span class="label">Defender's REF + skill</span><input type="number" min="0" max="40" data-atkui="def" value="${esc(s.def)}" style="width:72px" placeholder="—" aria-label="Defender's REF plus skill"></label>
        <span class="faint" style="font-size:12.5px">Melee is opposed: the defender rolls REF + Dodge, Melee, a martial art or Athletics + 1D10. Fill this in and the app rolls for them; leave it empty and tell your GM your total.</span></div></div>`:"";
  // area weapons
  let areaBox="";if(area){const fx=atkArea(shot||w)||area;
    areaBox=`<div class="atk-area"><div class="row" style="justify-content:space-between;gap:8px"><b>${esc(fx.kind==="launcher"?"Grenade launcher":(shot||w).name)}</b>${fx.area?`<span class="chip amber">${fx.perUnit?`${fx.area*(Number(s.units)||1)}m`:`${fx.area}m`} radius</span>`:""}</div>
      <p class="faint" style="margin:0;font-size:13px">${esc(fx.text)}</p>
      ${area.kind==="launcher"?(atkLauncherGrenades(c).length?`<label class="row" style="gap:6px"><span class="label">Load</span><select data-act-change="atk-gid" aria-label="Grenade to fire">${atkLauncherGrenades(c).map(g=>`<option value="${esc(g.id)}" ${shot&&shot.id===g.id?"selected":""}>${esc(g.name)} (${atkAmmo(g)} left)</option>`).join("")}</select></label>`:`<div class="banner warnb" style="margin:0">No grenades to load. Buy some in the shop.</div>`):""}
      ${fx.kind==="gas"?`<label class="row" style="gap:6px"><span class="label">Gas</span><select data-act-change="atk-gas" aria-label="Gas type">${GAS_TYPES.map(([g,e])=>`<option value="${esc(g)}" ${s.gas===g?"selected":""}>${esc(g)}: ${esc(e)}</option>`).join("")}</select></label>`:""}
      ${area.perUnit?`<span class="row ck-num" style="flex-wrap:nowrap"><span class="label">${area.perUnit==="kg"?"Kilograms":"Liters"}</span><button class="icon-btn" data-act="atk-units" data-d="-1" aria-label="Less">−</button><b class="num">${need}</b><button class="icon-btn" data-act="atk-units" data-d="1" aria-label="More">+</button></span>`:""}
      ${area.kind==="explosive"?`<span class="seg" role="group" aria-label="How"><button class="${s.place!=="throw"?"on":""}" data-act="atk-place" data-v="place">Placed</button><button class="${s.place==="throw"?"on":""}" data-act="atk-place" data-v="throw">Thrown</button></span>`:""}
      ${area.kind==="mine"?`<span class="seg" role="group" aria-label="Mine type"><button class="${s.mine!=="claymore"?"on":""}" data-act="atk-mine" data-v="land">Land mine</button><button class="${s.mine==="claymore"?"on":""}" data-act="atk-mine" data-v="claymore">Claymore</button></span>`:""}
      <span class="faint" style="font-size:12px">${placed?"Placed: no attack roll. It goes off when it's triggered or detonated.":"If the attack misses, the app rolls where it lands: 1D10 for direction and 1D10 for meters from the target."}</span></div>`}
  const sgBox=sg?`<p class="faint" style="margin:0;font-size:12.5px">Shotgun pattern at ${esc(shotgunAt(Number(s.dv)||15).label.toLowerCase())} range: ${shotgunAt(Number(s.dv)||15).w}m wide, ${shotgunAt(Number(s.dv)||15).dmg}. Anyone in the pattern, or between you and the target, takes it.</p>`:"";
  const how=mods.map(([l,v],i)=>`${i?(v<0?" − ":" + "):""}${esc(l)} ${i?Math.abs(v):v}`).join("");
  const res=s.last?atkResultHTML(s.last):"";
  const dmgTxt=area?(atkArea(shot||w)||{}).nodmg?"no damage":esc((shot||w).dmg):atkDmgExpr(c,w,s)?`${esc(atkDmgExpr(c,w,s))}${atkDmgBonus(c,w,s)?" "+sgn(atkDmgBonus(c,w,s)):""}`:"no damage";
  const goLabel=placed?"Set it off":s.mode==="suppress"?`Fire ${need} rounds into a ${Math.max(2,s.width)}m zone`:`Attack: ${base} + D10${!mel&&Number(s.dv)?` vs DV ${s.dv}`:mel&&s.def!==""?` vs ${s.def} + D10`:""}`;
  return `<div class="ck">
    <div class="ck-pick"><span class="label">Weapon</span><div class="ck-list">${list}</div>
      ${!c.weapons.length?`<p class="faint" style="margin:0;font-size:12.5px">No weapons yet. Buy one in the shop (Combat or Gear tab).</p>`:""}</div>
    <div class="ck-roll">
      <div><span class="label">${esc(c.handle||"Your runner")} attacks with</span><div class="ck-name">${esc(w.name)}${w.unarmed&&(s.move||w.move)!==w.move?` · ${esc(s.move)}`:""}</div>
        <div class="faint mono" style="font-size:12.5px">${placed?"No attack roll":`${how} = ${base} + 1D10 to hit`} · ${dmgTxt==="no damage"?"no damage":"damage "+dmgTxt}${isMono(w)?" · mono-edge":""}</div></div>
      ${mel?`<p class="faint" style="margin:0;font-size:12.5px">Melee is opposed: beat the defender's roll to hit.</p>`:dvs}
      ${meleeBox}${areaBox}${sgBox}
      ${modes}
      ${placed||s.mode==="suppress"?"":atkSitsHTML(c,w,s)}
      <div class="grid2">${atkLaser(w)?`<div class="field"><span class="label">Laser power</span><span class="seg">${[1,2,3,4,5].map(n=>`<button class="${clamp(Number(s.power)||3,1,5)===n?"on":""}" data-act="atk-power" data-v="${n}">${n}D6</button>`).join("")}</span><span class="faint" style="font-size:12px">The powerpack holds 10D6. Recharge: 1D6 an hour from wall current.</span></div>`:""}${aim}
        <div class="field"><span class="label">Modifier</span><div class="row ck-num" style="flex-wrap:nowrap"><button class="icon-btn" data-act="atk-mod" data-d="-1" aria-label="Lower modifier">−</button><b class="num">${sgn(Number(s.mod)||0)}</b><button class="icon-btn" data-act="atk-mod" data-d="1" aria-label="Raise modifier">+</button></div><span class="faint" style="font-size:12px">Anything else your GM calls</span></div></div>
      ${ammo!=null?`<div class="row" style="justify-content:space-between"><span class="mono" style="font-size:13px">${ATK_STACK.has((atkArea(ammoW)||{}).kind)?`Carrying <b>${ammo}</b>`:`${atkLaser(ammoW)?"Charge":"Ammo"} <b>${ammo}</b> / ${esc(ammoW.shots)}${atkLaser(ammoW)?"D6":""}`}${need?` · this uses ${need}`:""}</span><span class="row" style="gap:8px">${ed?`<label class="row" style="gap:6px;font-size:13px"><input type="checkbox" data-act-change="atk-ammo" ${s.useAmmo?"checked":""}> Use ammo</label>${ATK_STACK.has((atkArea(ammoW)||{}).kind)?"":`<button class="btn sm ghost" data-act="atk-reload">Reload</button>`}`:""}</span></div>`:""}
      ${short?`<div class="banner warnb" style="margin:0"><b>Not enough ammo.</b> ${ammo?`Only ${ammo} left.`:"None left."} ${ATK_STACK.has((atkArea(ammoW)||{}).kind)?"Buy more, or untick Use ammo.":"Reload (it takes your turn), or untick Use ammo."}</div>`:""}
      <div class="row" style="gap:8px"><button class="btn primary ck-go" style="flex:1" data-act="atk-roll" ${short?"disabled":""}>${goLabel}</button>
        ${placed||s.mode==="suppress"?"":`<span class="row ck-num" style="flex-wrap:nowrap" title="Hits for Damage only"><button class="btn" data-act="atk-dmg">Damage only</button>${s.mode==="auto"&&auto?`<button class="icon-btn" data-act="atk-hits" data-d="-1" aria-label="Fewer hits">−</button><b class="num" style="min-width:24px">${s.hits}</b><button class="icon-btn" data-act="atk-hits" data-d="1" aria-label="More hits">+</button>`:""}</span>`}</div>
      ${res}
      ${s.burn&&s.burn.left.length?`<div class="row" style="gap:8px"><button class="btn sm" data-act="atk-burn">Next turn's burn: ${esc(s.burn.left[0])}</button><span class="faint" style="font-size:12px">${esc(s.burn.label)} keeps burning for ${s.burn.left.length} more turn${s.burn.left.length===1?"":"s"}.</span></div>`:""}
      <p class="faint" style="margin:0;font-size:12px">Damage only is for when your GM says you hit. Damage is before the target's armor, cover and body type. A head hit counts double after armor.</p>
    </div></div>`}
function atkResultHTML(r){const total=r.hits.reduce((a,h)=>a+h.dmg,0);const cls=r.jam?"bad":r.hit===false&&!r.area?"bad":r.hit?"good":"";
  return `<div class="ck-res ${cls}" role="status"><div class="tot num">${r.area?(r.area.dmg!=null?r.area.dmg:"—"):r.hits.length?total:r.atk?r.atk.total:"—"}</div><div style="min-width:0">
    <div class="verdict">${r.jam?"Jammed!":r.broke?"Broken!":r.fumble?"Fumble: miss":r.verdict?esc(r.verdict):r.hit===false?"Miss":r.hits.length?`${r.hits.length} hit${r.hits.length===1?"":"s"} · ${total} damage`:"Rolled"}</div>
    ${r.atk?`<div class="det mono">To hit: ${esc(r.atk.detail)}${r.atk.dv?` vs DV ${r.atk.dv}`:""}${r.atk.def?` vs defender ${esc(r.atk.def)}`:""} = ${r.atk.total}</div>`:""}
    ${r.fumbleRoll?`<div class="det"><span class="chip red">Fumble table ${r.fumbleRoll.r}</span> ${esc(r.fumbleRoll.text)}</div>`:""}
    ${r.area?`<div class="det">${esc(r.area.where)}</div>${r.area.dmg!=null?`<div class="det mono">${esc(r.area.dmgText)}</div>`:""}`:""}
    ${r.hits.length&&/Microwaver/i.test(r.wname||"")?`<div class="row" style="gap:6px"><button class="btn sm" data-act="atk-microwave">Roll microwaver side effects</button><span class="faint" style="font-size:12px">For anyone within 1m of the beam.</span></div>`:""}
    ${r.hits.length?`<div class="atk-hits">${r.hits.map(h=>`<span class="chip${h.loc==="head"?" red":""}">${esc(atkLocName(h.loc))}${h.lr?` (${h.lr})`:""} · <b>${h.dmg}</b>${h.loc==="head"?" ×2 after armor":""}</span>`).join("")}</div>`:""}
    <div class="faint" style="font-size:12.5px">${esc(r.note||"")}</div></div></div>`}
/* A fumble (pg. 42, 106): automatic weapons check reliability; everything else rolls the combat fumble table. */
function atkFumble(w,out){if(atkMelee(w)){if(isMono(w)){out.broke=true;out.note="A natural 1 with a mono-edge: the blade breaks.";return}const fr=fumbleRoll("combat");out.fumbleRoll=fr;out.note="";return}
  if(atkAuto(w)||(atkShotgun(w)&&Number(w.rof)>2)){const j=d(10);if(j<=(ATK_JAM[w.rel]||5)){out.jam=true;out.note=`Fumble with an automatic weapon: 1D10 = ${j}, so it jams (${w.rel||"ST"} jams on ${ATK_JAM[w.rel]||5} or less). Clearing it takes 1D6 turns.`}else out.note=`Fumble with an automatic weapon: 1D10 = ${j}, no jam.`;return}
  const fr=fumbleRoll("combat");out.fumbleRoll=fr;
  if((fr.r===6||fr.r===7)&&w.rel){const j=d(10);const jam=j<=(ATK_JAM[w.rel]||5);if(fr.r===7&&jam)out.jam=true;out.note=`Reliability roll 1D10 = ${j}: ${jam?(fr.r===7?"it jams. Clearing it takes 1D6 turns.":"it goes off."):"nothing happens."}`}
  else if(fr.r===8){const L=atkLocRoll();out.note=`You hit yourself in the ${atkLocName(L.loc).toLowerCase()} (1D10 ${L.r}). Roll your weapon's damage against yourself.`}}
function atkAreaRoll(c,w,s,out,hit){const shot=atkShot(c,w,s);const fx=atkArea(shot)||atkArea(w);const units=fx.perUnit?clamp(Number(s.units)||1,1,99):1;
  const area=fx.kind==="mine"&&s.mine==="claymore"?null:fx.area*(fx.perUnit?units:1);
  let where=hit===null?"It goes off where it was placed.":hit?"Right on target.":`It misses: ${scatterRoll().text}.`;
  if(fx.kind==="mine"&&s.mine==="claymore")where+=" Claymore: an hourglass 6m wide, 75m long in front and 6m long behind.";
  else if(area)where+=` Everything within ${area}m takes it.`;
  let dmg=null,dmgText="";const name=shot.name;
  if(!fx.nodmg){const r=rollDice(shot.dmg);if(r){dmg=r.total;dmgText=`${shot.dmg} → ${r.text}${fx.kind==="explosive"||fx.kind==="molotov"?" · to the whole body":""}`}}
  if(fx.kind==="gas"){const g=GAS_TYPES.find(x=>x[0]===s.gas)||GAS_TYPES[0];const dm=/(\d+D\d+)/.exec(g[1]);where+=` ${g[0]}: ${g[1]}. Each target saves; a success halves the effect.`;if(dm){const r=rollDice(dm[1]);dmg=r.total;dmgText=`${dm[1]} → ${r.text} (half on a successful save)`}}
  if(fx.burn)s.burn={label:name,left:Array(fx.burn-1).fill(shot.dmg)};else if(fx.kind==="flame")s.burn={label:name,left:["1D10","1D6"]};else s.burn=null;
  out.area={where,dmg,dmgText};out.verdict=hit===null?"Boom":hit?"On target":"Scattered";out.note=fx.text}
function atkRoll(damageOnly){const c=ckChar();if(!c)return;const s=atkState();const w=atkWeapon(c,s.wid);if(!w)return;const ed=canEditChar(c);const who=c.handle||c.name||"Unnamed";
  const mel=atkMelee(w),auto=atkAuto(w);const area=atkArea(w);const shot=atkShot(c,w,s);const ammoW=area&&area.kind==="launcher"?shot:w;const ammo=ammoW?atkAmmo(ammoW):null;let need=atkRoundsFor(s,w);const label=w.name;
  if(area&&area.kind==="launcher"&&!shot){showNotice("Load a grenade first.");return}
  const out={hits:[],note:"",hit:null,wname:w.name};
  if(s.mode==="suppress"&&auto&&!damageOnly){const width=Math.max(2,Number(s.width)||2);const save=Math.floor(need/width);
    Dice.raw(`Suppressive fire · ${label}`,`${need} rounds into a ${width}m zone: anyone entering or crossing it rolls Athletics + REF + 1D10 against ${save}, or takes 1D6 rounds (${w.dmg} each, random locations)`,save,who,[{t:`Save ${save}`,c:"amber"}]);
    out.verdict=`Fire zone: save ${save}`;out.note=`Anyone entering or crossing the ${width}m zone this turn rolls Athletics + REF + 1D10. Under ${save}, they take 1D6 rounds of ${w.dmg}, each in a random location.`}
  else if(area&&atkPlaced(w,s)){atkAreaRoll(c,w,s,out,null);if(out.area.dmg!=null)Dice.raw(`${label} goes off`,out.area.dmgText+" · "+out.area.where,out.area.dmg,who)}
  else if(damageOnly){if(area){atkAreaRoll(c,w,s,out,true);if(out.area.dmg!=null)Dice.raw(`Damage · ${shot.name}`,out.area.dmgText,out.area.dmg,who)}
    else{const n=s.mode==="burst"&&auto?Math.ceil(d(6)/2):s.mode==="auto"&&auto?clamp(Number(s.hits)||1,1,need):atkShotgun(w)?need:1;
      out.hits=atkDamage(c,w,n,s.aim,s);out.hit=true;out.note=s.mode==="burst"&&auto?`1D6/2 = ${n} rounds of the burst hit.`:"";}need=area?need:0}
  else{const mods=atkMods(c,w,s);const base=mods.reduce((a,m)=>a+m[1],0);const dv=mel?0:Number(s.dv)||0;
    const e=Dice.check(`Attack · ${label}${s.mode!=="single"&&auto?` (${s.mode==="burst"?"burst":"full auto "+need})`:""}${s.aim?" at "+atkLocName(s.aim):""}${w.unarmed&&s.move&&s.move!==w.move?" · "+s.move:""}`,base,{dv:dv||null,who,area:"none"});
    out.atk={detail:e.detail,total:e.total,dv};out.fumble=e.fumble;
    let defTot=null;if(mel&&s.def!==""&&!e.fumble){const dr=d10x();defTot=(Number(s.def)||0)+dr.reduce((a,b)=>a+b,0);out.atk.def=`${Number(s.def)||0} + D10 (${dr.join("+")}) = ${defTot}`}
    if(e.fumble){out.hit=false;atkFumble(w,out);if(out.fumbleRoll)Dice.raw("Fumble table (combat)",`1D10 ${out.fumbleRoll.r}: ${out.fumbleRoll.text}${out.note?" "+out.note:""}`,out.fumbleRoll.r,who,[{t:out.jam?"Jammed":"Fumble",c:"red"}])}
    else if(area){const hit=dv?e.total>=dv:true;atkAreaRoll(c,w,s,out,hit);if(!dv)out.area.where="No DV set: "+out.area.where;if(out.area.dmg!=null)Dice.raw(`Damage · ${shot.name}`,out.area.dmgText+" · "+out.area.where,out.area.dmg,who)}
    else if(mel&&defTot!=null){if(e.total>defTot){out.hit=true;const dbl=isMono(w)&&e.crit;const mv=UNARMED_MOVES[s.move||w.move];
        out.hits=atkDamage(c,w,1,"",s,dbl);out.note=`Beat the defender by ${e.total-defTot}.${dbl?" A natural 10 with a mono-edge: double damage.":""}${w.unarmed&&mv?" "+mv.text:""}${isMono(w)?" Mono-edge: soft armor counts at 1/3 SP, hard armor at 2/3.":""}`}
      else{out.hit=false;out.note=`The defender's ${defTot} beats your ${e.total}.`}}
    else if(mel||!dv){out.hit=null;out.note=mel?"Tell your GM your total. If it beats the defender's roll, press Damage only.":"No DV set. If your GM says it hits, press Damage only."}
    else if(e.total>=dv){out.hit=true;let n=1;
      if(atkShotgun(w)){n=need;const p=shotgunAt(dv);out.note=`Hit! A ${p.w}m pattern${n>1?` ×${n}`:""}: anyone in it takes ${p.dmg}.`}
      else if(auto&&s.mode==="burst"){n=Math.ceil(d(6)/2);out.note=`Hit! 1D6/2 = ${n} round${n===1?"":"s"} of the burst land.`}
      else if(auto&&s.mode==="auto"){n=clamp(Math.max(1,e.total-dv),1,need);out.note=`Hit! You beat DV ${dv} by ${e.total-dv}, so ${n} of ${need} rounds land.`}
      else out.note=`Hit! You beat DV ${dv} by ${e.total-dv}.`;
      out.hits=atkDamage(c,w,n,s.aim,s)}
    else{out.hit=false;out.note=`Missed DV ${dv} by ${dv-e.total}.`}}
  if(out.hits.length){const total=out.hits.reduce((a,h)=>a+h.dmg,0);
    Dice.raw(`Damage · ${label}${w.unarmed&&s.move&&s.move!==w.move?" ("+s.move+")":""}`,out.hits.map(h=>`${atkLocName(h.loc)} ${h.dmg}${h.loc==="head"?" (×2 after armor)":""}`).join(", ")+` · ${atkDmgExpr(c,w,s)} each`,total,who)}
  if(ammo!=null&&ed&&s.useAmmo&&need&&!(out.fumble&&false)){const i=c.weapons.findIndex(x=>x.id===ammoW.id);if(i>=0){c.weapons[i].ammo=Math.max(0,ammo-need);c.updatedAt=Date.now();saveChar(c)}}
  s.last=out;renderModal();if(ui.view==="sheet")render()}
Object.assign(A,{
  "atk-open":el=>atkOpen(el&&el.dataset?el.dataset.id:""),
  "atk-pick":el=>{const s=atkState();s.wid=el.dataset.id;s.last=null;s.aim="";s.mod=0;s.def="";const c=ckChar();atkPicked(c,s);renderModal()},
  "atk-dv":el=>{atkState().dv=Number(el.dataset.v)||0;renderModal()},
  "atk-mode":el=>{const s=atkState();s.mode=el.dataset.v;const c=ckChar(),w=c&&atkWeapon(c,s.wid);if(w&&(s.mode==="auto"||s.mode==="suppress")&&!atkShotgun(w)){const a=atkAmmo(w);s.rounds=clamp(Math.min(Number(w.rof)||10,a==null?99:a||10),1,Number(w.rof)||10)}if(w&&atkShotgun(w)&&s.mode==="auto")s.shots=Math.max(2,Number(s.shots)||2);renderModal()},
  "atk-rounds":el=>{const s=atkState();const c=ckChar(),w=c&&atkWeapon(c,s.wid);if(!w)return;const cur=atkRoundsFor(s,w);const d0=Number(el.dataset.d);
    if(atkShotgun(w)){s.shots=clamp(cur+d0,1,Number(w.rof)||1)}else s.rounds=clamp(cur<10&&d0>0?10:cur+d0,1,Number(w.rof)||10);renderModal()},
  "atk-width":el=>{const s=atkState();s.width=clamp((Number(s.width)||2)+Number(el.dataset.d),2,50);renderModal()},
  "atk-power":el=>{atkState().power=Number(el.dataset.v);renderModal()},
  "atk-microwave":()=>{const c=ckChar();microwaveRoll(c?(c.handle||c.name):"")},
  "atk-hits":el=>{const s=atkState();s.hits=clamp((Number(s.hits)||1)+Number(el.dataset.d),1,99);renderModal()},
  "atk-mod":el=>{const s=atkState();s.mod=clamp((Number(s.mod)||0)+Number(el.dataset.d),-20,20);renderModal()},
  "atk-sit":el=>{const s=atkState();const id=el.dataset.v;const set=new Set(s.sits||[]);if(set.has(id))set.delete(id);else{set.add(id);if(MOVING_SITS.includes(id))MOVING_SITS.filter(x=>x!==id).forEach(x=>set.delete(x));if(["small","tiny","large"].includes(id))["small","tiny","large"].filter(x=>x!==id).forEach(x=>set.delete(x))}s.sits=[...set];renderModal()},
  "atk-aimturns":el=>{atkState().aimTurns=Number(el.dataset.v)||0;renderModal()},
  "atk-action":el=>{atkState().action=Number(el.dataset.v)||1;renderModal()},
  "atk-move":el=>{atkState().move=el.dataset.v;renderModal()},
  "atk-units":el=>{const s=atkState();s.units=clamp((Number(s.units)||1)+Number(el.dataset.d),1,99);renderModal()},
  "atk-place":el=>{atkState().place=el.dataset.v;renderModal()},
  "atk-mine":el=>{atkState().mine=el.dataset.v;renderModal()},
  "atk-burn":()=>{const s=atkState();const c=ckChar();if(!s.burn||!s.burn.left.length)return;const e=s.burn.left.shift();Dice.expr(`${s.burn.label} keeps burning`,e,0,c&&(c.handle||c.name));renderModal()},
  "atk-reload":()=>{const c=ckChar();const s=atkState();if(!c||!canEditChar(c))return;const i=c.weapons.findIndex(x=>x.id===s.wid);if(i<0)return;c.weapons[i].ammo=Number(c.weapons[i].shots)||0;c.updatedAt=Date.now();saveChar(c);showNotice(`${c.weapons[i].name} reloaded.`);renderModal();if(ui.view==="sheet")render()},
  "atk-roll":()=>atkRoll(false),
  "atk-dmg":()=>atkRoll(true),
});
Object.assign(CHANGE,{"atk-aim":el=>{atkState().aim=el.value;renderModal()},"atk-ammo":el=>{atkState().useAmmo=el.checked;renderModal()},
  "atk-style":el=>{atkState().style=el.value;const c=ckChar();if(c&&canEditChar(c)&&el.value){c.maStyle=el.value;saveChar(c)}renderModal()},"atk-gid":el=>{atkState().gid=el.value;renderModal()},"atk-gas":el=>{atkState().gas=el.value;renderModal()}});
document.addEventListener("input",ev=>{const el=ev.target;if(el.dataset&&el.dataset.atkui&&ui.atk){ui.atk[el.dataset.atkui]=el.value;const b=document.querySelector(".ck-go");const c=ckChar();if(b&&c){const w=atkWeapon(c,ui.atk.wid);if(w&&atkMelee(w)){const base=atkMods(c,w,ui.atk).reduce((a,m)=>a+m[1],0);b.textContent=`Attack: ${base} + D10${el.value!==""?` vs ${el.value} + D10`:""}`}}}});
{const _o=atkOpen;atkOpen=function(wid){const c=ckChar();const s=atkState();if(c&&c.maStyle&&!s.style)s.style=c.maStyle;return _o(wid)}}
{const _x=Tray.extra;Tray.extra=()=>ckChar()?`<div class="row" style="gap:6px"><button class="btn sm primary" style="flex:1" data-act="ck-open">Skill check…</button><button class="btn sm primary" style="flex:1" data-act="atk-open">Attack…</button></div>`:(_x?_x():"")}
