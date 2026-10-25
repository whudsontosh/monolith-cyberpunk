/* ============================== ATTACK (1.4.1) ==============================
   Pick a weapon, say how far away the target is, and roll: to hit, then damage for every
   round that hits, each with its own hit location. Uses ammo and handles bursts, full auto,
   aimed shots, fumbles and jams. Rules are a plain-language take on Cyberpunk 2020. */
const ATK_RANGES=[[10,"Point blank","1 m"],[15,"Close",r=>`≤${Math.round(r/4)} m`],[20,"Medium",r=>`≤${Math.round(r/2)} m`],[25,"Long",r=>`≤${r} m`],[30,"Extreme",r=>`≤${r*2} m`]];
const ATK_UNARMED=[{id:"_punch",name:"Punch",type:"MEL",wa:0,dmg:"1D6/2",skill:"Brawling",rof:"1",unarmed:true},{id:"_kick",name:"Kick",type:"MEL",wa:0,dmg:"1D6",skill:"Brawling",rof:"1",unarmed:true}];
const ATK_JAM={VR:3,ST:5,UR:8};
function atkState(){return ui.atk||(ui.atk={wid:"",dv:15,mode:"single",rounds:10,aim:"",mod:0,useAmmo:true,hits:1,last:null})}
function atkWeapons(c){return [...(c.weapons||[]),...ATK_UNARMED]}
function atkWeapon(c,id){return atkWeapons(c).find(w=>w.id===id)||null}
function atkSkill(c,w){if(w.unarmed){const ma=Object.keys(c.skills||{}).filter(n=>n.startsWith("Martial Art")&&skillLevel(c,n)>skillLevel(c,"Brawling")).sort((a,b)=>skillLevel(c,b)-skillLevel(c,a))[0];return ma||"Brawling"}return w.skill||WTYPE_SKILL[w.type]||"Handgun"}
function atkMelee(w){return w.type==="MEL"}
function atkAuto(w){return !atkMelee(w)&&Number(w.rof)>2}
function atkRange(w){return parseInt(w.range)||50}
function atkAmmo(w){return Number(w.shots)>0?Number(w.ammo)||0:null}
function atkRoundsFor(s,w){if(atkMelee(w))return 0;if(s.mode==="burst"&&atkAuto(w))return 3;if(s.mode==="auto"&&atkAuto(w))return clamp(Number(s.rounds)||1,1,Number(w.rof)||1);return 1}
function atkMods(c,w,s){const k=calc(c);const out=[];const skill=atkSkill(c,w);
  out.push(["REF",k.eff.REF]);out.push([skill,skillLevel(c,skill)]);
  if(Number(w.wa))out.push(["Weapon accuracy",Number(w.wa)]);
  if(k.smart&&!atkMelee(w))out.push(["Smartgun link",2]);
  const dv=Number(s.dv)||0;const close=dv&&dv<=15;
  if(!atkMelee(w)&&atkAuto(w)&&s.mode==="burst"&&dv&&dv<=20)out.push(["3-round burst",3]);
  if(!atkMelee(w)&&atkAuto(w)&&s.mode==="auto"&&dv){const n=Math.floor(atkRoundsFor(s,w)/10);if(n)out.push([`Full auto, ${atkRoundsFor(s,w)} rounds`,close?n:-n])}
  if(s.aim)out.push(["Aimed shot",-4]);
  if(Number(s.mod))out.push(["Modifier",Number(s.mod)]);
  return out}
function atkLocRoll(){const r=d(10);return {r,loc:r===1?"head":r<=4?"torso":r===5?"rarm":r===6?"larm":r<=8?"rleg":"lleg"}}
const atkLocName=l=>(LOCS.find(x=>x[0]===l)||[l,l])[1];
function atkDamage(c,w,n,aim){const k=calc(c);const mb=atkMelee(w)?k.melee:0;const hits=[];
  for(let i=0;i<n;i++){const r=rollDice(w.dmg)||{total:0,text:"?"};const L=aim?{loc:aim,r:null}:atkLocRoll();hits.push({loc:L.loc,lr:L.r,dmg:Math.max(0,r.total+mb),text:r.text+(mb?" "+sgn(mb):"")})}
  return hits}
function atkOpen(wid){const c=ckChar();if(!c){showNotice("Open a runner first.");return}const s=atkState();
  const ws=atkWeapons(c);s.wid=wid&&ws.some(w=>w.id===wid)?wid:(ws.find(w=>w.id===s.wid)?s.wid:ws[0].id);
  s.last=null;s.mod=0;s.aim="";s.hits=1;if(ui.rangeDv)s.dv=Number(ui.rangeDv)||s.dv;
  const w=atkWeapon(c,s.wid);if(w&&atkMelee(w))s.dv=0;else if(!s.dv)s.dv=15;if(w&&!atkAuto(w))s.mode="single";
  Tray.open=false;Tray.render();if(typeof ItemTip!=="undefined")ItemTip.hide();ui.modal="attack";renderModal()}
function attackBody(){const c=ckChar();if(!c)return `<p class="muted">Open a runner first.</p>`;const s=atkState();const w=atkWeapon(c,s.wid)||atkWeapons(c)[0];const k=calc(c);
  const mel=atkMelee(w),auto=atkAuto(w);const mods=atkMods(c,w,s);const base=mods.reduce((a,m)=>a+m[1],0);const ammo=atkAmmo(w);const need=atkRoundsFor(s,w);
  const ed=canEditChar(c);const short=ammo!=null&&s.useAmmo&&ed&&ammo<need;
  const list=atkWeapons(c).map(x=>{const m=atkMods(c,x,{...s,mode:"single",aim:"",mod:0});const b=m.reduce((a,y)=>a+y[1],0);const am=atkAmmo(x);
    return `<button class="ck-sk${x.id===w.id?" on":""}" data-act="atk-pick" data-id="${esc(x.id)}"><span class="n">${esc(x.name)}</span><span class="s">${esc(x.dmg)}${am!=null?` · ${am}/${esc(x.shots)}`:""}</span><b>${b}</b></button>`}).join("");
  const r=atkRange(w);
  const dvs=mel?"":`<div><span class="label">How far away?</span><div class="ck-dv">${ATK_RANGES.map(([v,l,m])=>`<button class="${Number(s.dv)===v?"on":""}" data-act="atk-dv" data-v="${v}"><b>${v}</b><span>${l} · ${typeof m==="function"?m(r):m}</span></button>`).join("")}<button class="${!Number(s.dv)?"on":""}" data-act="atk-dv" data-v="0"><b>—</b><span>GM decides</span></button></div></div>`;
  const modes=auto?`<div><span class="label">Fire mode</span><div class="row" style="gap:6px"><span class="seg" role="group" aria-label="Fire mode">${[["single","Single shot"],["burst","3-round burst"],["auto","Full auto"]].map(([m,l])=>`<button class="${s.mode===m?"on":""}" data-act="atk-mode" data-v="${m}">${l}</button>`).join("")}</span>
      ${s.mode==="auto"?`<span class="row ck-num" style="flex-wrap:nowrap"><button class="icon-btn" data-act="atk-rounds" data-d="-10" aria-label="Fewer rounds">−</button><b class="num">${need}</b><button class="icon-btn" data-act="atk-rounds" data-d="10" aria-label="More rounds">+</button><span class="faint" style="font-size:12px">rounds (max ${esc(w.rof)})</span></span>`:""}</div>
      <span class="faint" style="font-size:12px">${s.mode==="burst"?"Burst: +3 to hit at close or medium range; if it hits, 1D6/2 rounds land.":s.mode==="auto"?"Full auto: +1 to hit per 10 rounds up close, −1 per 10 farther out. Every point you beat the DV by is another round that hits.":"One aimed round."}</span></div>`:"";
  const aim=`<div class="field"><span class="label">Aim</span><select data-act-change="atk-aim" aria-label="Aim at"><option value="">Random hit location</option>${LOCS.map(l=>`<option value="${l[0]}" ${s.aim===l[0]?"selected":""}>${l[1]} (−4 to hit)</option>`).join("")}</select></div>`;
  const how=mods.map(([l,v],i)=>`${i?(v<0?" − ":" + "):""}${esc(l)} ${i?Math.abs(v):v}`).join("");
  const res=s.last?atkResultHTML(s.last):"";
  return `<div class="ck">
    <div class="ck-pick"><span class="label">Weapon</span><div class="ck-list">${list}</div>
      ${!c.weapons.length?`<p class="faint" style="margin:0;font-size:12.5px">No weapons yet. Buy one in the shop (Combat or Gear tab).</p>`:""}</div>
    <div class="ck-roll">
      <div><span class="label">${esc(c.handle||"Your runner")} attacks with</span><div class="ck-name">${esc(w.name)}</div>
        <div class="faint mono" style="font-size:12.5px">${how} = ${base} + 1D10 to hit · damage ${esc(w.dmg)}${mel&&k.melee?` ${sgn(k.melee)} melee bonus`:""}</div></div>
      ${mel?`<p class="faint" style="margin:0;font-size:12.5px">Melee is opposed: the defender rolls REF + Dodge (or their own Melee) + 1D10. Beat it and you hit. Tell your GM your total.</p>`:dvs}
      ${modes}
      <div class="grid2">${aim}
        <div class="field"><span class="label">Modifier</span><div class="row ck-num" style="flex-wrap:nowrap"><button class="icon-btn" data-act="atk-mod" data-d="-1" aria-label="Lower modifier">−</button><b class="num">${sgn(Number(s.mod)||0)}</b><button class="icon-btn" data-act="atk-mod" data-d="1" aria-label="Raise modifier">+</button></div><span class="faint" style="font-size:12px">Cover, moving, GM calls</span></div></div>
      ${ammo!=null?`<div class="row" style="justify-content:space-between"><span class="mono" style="font-size:13px">Ammo <b>${ammo}</b> / ${esc(w.shots)}${need?` · this uses ${need}`:""}</span><span class="row" style="gap:8px">${ed?`<label class="row" style="gap:6px;font-size:13px"><input type="checkbox" data-act-change="atk-ammo" ${s.useAmmo?"checked":""}> Use ammo</label><button class="btn sm ghost" data-act="atk-reload">Reload</button>`:""}</span></div>`:""}
      ${short?`<div class="banner warnb" style="margin:0"><b>Not enough ammo.</b> ${ammo?`Only ${ammo} left.`:"The magazine is empty."} Reload (it takes your turn), or untick Use ammo.</div>`:""}
      <div class="row" style="gap:8px"><button class="btn primary ck-go" style="flex:1" data-act="atk-roll" ${short?"disabled":""}>Attack: ${base} + D10${!mel&&Number(s.dv)?` vs DV ${s.dv}`:""}</button>
        <span class="row ck-num" style="flex-wrap:nowrap" title="Hits for Damage only"><button class="btn" data-act="atk-dmg">Damage only</button>${s.mode==="auto"&&auto?`<button class="icon-btn" data-act="atk-hits" data-d="-1" aria-label="Fewer hits">−</button><b class="num" style="min-width:24px">${s.hits}</b><button class="icon-btn" data-act="atk-hits" data-d="1" aria-label="More hits">+</button>`:""}</span></div>
      ${res}
      <p class="faint" style="margin:0;font-size:12px">Damage only is for when your GM says you hit (melee, or when they set the DV). Damage is before the target's armor and body type. A head hit counts double after armor.</p>
    </div></div>`}
function atkResultHTML(r){const total=r.hits.reduce((a,h)=>a+h.dmg,0);const cls=r.jam?"bad":r.hit===false?"bad":r.hit?"good":"";
  return `<div class="ck-res ${cls}" role="status"><div class="tot num">${r.hits.length?total:r.atk?r.atk.total:"—"}</div><div style="min-width:0">
    <div class="verdict">${r.jam?"Jammed!":r.fumble?"Fumble: miss":r.hit===false?"Miss":r.hits.length?`${r.hits.length} hit${r.hits.length===1?"":"s"} · ${total} damage`:"Rolled"}</div>
    ${r.atk?`<div class="det mono">To hit: ${esc(r.atk.detail)}${r.atk.dv?` vs DV ${r.atk.dv}`:""} = ${r.atk.total}</div>`:""}
    ${r.hits.length?`<div class="atk-hits">${r.hits.map(h=>`<span class="chip${h.loc==="head"?" red":""}">${esc(atkLocName(h.loc))}${h.lr?` (${h.lr})`:""} · <b>${h.dmg}</b>${h.loc==="head"?" ×2 after armor":""}</span>`).join("")}</div>`:""}
    <div class="faint" style="font-size:12.5px">${r.note||""}</div></div></div>`}
function atkRoll(damageOnly){const c=ckChar();if(!c)return;const s=atkState();const w=atkWeapon(c,s.wid);if(!w)return;const ed=canEditChar(c);const who=c.handle||c.name||"Unnamed";
  const mel=atkMelee(w),auto=atkAuto(w);const ammo=atkAmmo(w);let need=atkRoundsFor(s,w);const label=w.name;
  const out={hits:[],note:"",hit:null};
  if(damageOnly){const n=s.mode==="burst"&&auto?Math.ceil(d(6)/2):s.mode==="auto"&&auto?clamp(Number(s.hits)||1,1,need):1;
    out.hits=atkDamage(c,w,n,s.aim);out.hit=true;out.note=s.mode==="burst"&&auto?`1D6/2 = ${n} rounds of the burst hit.`:"";need=0}
  else{const mods=atkMods(c,w,s);const base=mods.reduce((a,m)=>a+m[1],0);const dv=mel?0:Number(s.dv)||0;
    const e=Dice.check(`Attack · ${label}${s.mode!=="single"&&auto?` (${s.mode==="burst"?"burst":"full auto "+need})`:""}${s.aim?" at "+atkLocName(s.aim):""}`,base,{dv:dv||null,who});
    out.atk={detail:e.detail,total:e.total,dv};out.fumble=e.fumble;
    if(e.fumble){out.hit=false;if(!mel&&w.rel){const j=d(10);if(j<=(ATK_JAM[w.rel]||5)){out.jam=true;out.note=`Fumble, then 1D10 = ${j}: the weapon jams (${esc(w.rel)} jams on ${ATK_JAM[w.rel]||5} or less). Clearing it takes a turn.`}else out.note=`Fumble, but 1D10 = ${j}: no jam. Your GM may still have something go wrong.`}else out.note="A natural 1. Your GM may roll on the fumble table."}
    else if(mel||!dv){out.hit=null;out.note=mel?"Tell your GM your total. If it beats the defender's roll, press Damage only.":"No DV set. If your GM says it hits, press Damage only."}
    else if(e.total>=dv){out.hit=true;let n=1;
      if(auto&&s.mode==="burst"){n=Math.ceil(d(6)/2);out.note=`Hit! 1D6/2 = ${n} round${n===1?"":"s"} of the burst land.`}
      else if(auto&&s.mode==="auto"){n=clamp(Math.max(1,e.total-dv),1,need);out.note=`Hit! You beat DV ${dv} by ${e.total-dv}, so ${n} of ${need} rounds land.`}
      else out.note=`Hit! You beat DV ${dv} by ${e.total-dv}.`;
      out.hits=atkDamage(c,w,n,s.aim)}
    else{out.hit=false;out.note=`Missed DV ${dv} by ${dv-e.total}.`}}
  if(out.hits.length){const total=out.hits.reduce((a,h)=>a+h.dmg,0);
    Dice.raw(`Damage · ${label}`,out.hits.map(h=>`${atkLocName(h.loc)} ${h.dmg}${h.loc==="head"?" (×2 after armor)":""}`).join(", ")+` · ${w.dmg} each`,total,who)}
  if(ammo!=null&&ed&&s.useAmmo&&need){const i=c.weapons.findIndex(x=>x.id===w.id);if(i>=0){c.weapons[i].ammo=Math.max(0,ammo-need);c.updatedAt=Date.now();saveChar(c)}}
  s.last=out;renderModal();if(ui.view==="sheet")render()}
Object.assign(A,{
  "atk-open":el=>atkOpen(el&&el.dataset?el.dataset.id:""),
  "atk-pick":el=>{const s=atkState();s.wid=el.dataset.id;s.last=null;s.aim="";s.mod=0;const c=ckChar();const w=c&&atkWeapon(c,s.wid);if(w){if(atkMelee(w))s.dv=0;else if(!s.dv)s.dv=15;if(!atkAuto(w))s.mode="single"}renderModal()},
  "atk-dv":el=>{atkState().dv=Number(el.dataset.v)||0;renderModal()},
  "atk-mode":el=>{const s=atkState();s.mode=el.dataset.v;if(s.mode==="auto"){const c=ckChar(),w=c&&atkWeapon(c,s.wid);if(w){const a=atkAmmo(w);s.rounds=clamp(Math.min(Number(w.rof)||10,a==null?99:a||10),1,Number(w.rof)||10)}}renderModal()},
  "atk-rounds":el=>{const s=atkState();const c=ckChar(),w=c&&atkWeapon(c,s.wid);if(!w)return;const cur=atkRoundsFor(s,w);const d0=Number(el.dataset.d);s.rounds=clamp(cur<10&&d0>0?10:cur+d0,1,Number(w.rof)||10);renderModal()},
  "atk-hits":el=>{const s=atkState();s.hits=clamp((Number(s.hits)||1)+Number(el.dataset.d),1,99);renderModal()},
  "atk-mod":el=>{const s=atkState();s.mod=clamp((Number(s.mod)||0)+Number(el.dataset.d),-20,20);renderModal()},
  "atk-reload":()=>{const c=ckChar();const s=atkState();if(!c||!canEditChar(c))return;const i=c.weapons.findIndex(x=>x.id===s.wid);if(i<0)return;c.weapons[i].ammo=Number(c.weapons[i].shots)||0;c.updatedAt=Date.now();saveChar(c);showNotice(`${c.weapons[i].name} reloaded.`);renderModal();if(ui.view==="sheet")render()},
  "atk-roll":()=>atkRoll(false),
  "atk-dmg":()=>atkRoll(true),
});
Object.assign(CHANGE,{"atk-aim":el=>{atkState().aim=el.value;renderModal()},"atk-ammo":el=>{atkState().useAmmo=el.checked;renderModal()}});
{const _x=Tray.extra;Tray.extra=()=>ckChar()?`<div class="row" style="gap:6px"><button class="btn sm primary" style="flex:1" data-act="ck-open">Skill check…</button><button class="btn sm primary" style="flex:1" data-act="atk-open">Attack…</button></div>`:(_x?_x():"")}
