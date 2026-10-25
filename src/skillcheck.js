/* ============================== SKILL CHECK (1.3.3) ==============================
   A simple way to make a check: pick a skill (or a plain stat), pick how hard it is, roll.
   Total = STAT + skill + 1D10 (+ modifier, + any Luck you spend). Meet or beat the
   difficulty to succeed. A 10 rolls again and adds; a 1 is a fumble (automatic failure). */
const CK_DVS=[[0,"None"],[10,"Easy"],[15,"Average"],[20,"Difficult"],[25,"Very difficult"],[30,"Nearly impossible"]];
function ckState(){return ui.ck||(ui.ck={skill:"",q:"",all:false,dv:15,mod:0,luck:0,last:null})}
function ckChar(){if(ui.view==="table"&&typeof myChar==="function"&&myChar())return myChar();return curChar()||(typeof myChar==="function"?myChar():null)}
function ckSkillNames(c){const names=new Set(SKILL_DEFS.map(x=>x[0]));const ab=abilityOf(c);if(ab)names.add(ab);
  (c.customSkills||[]).forEach(s=>names.add(s.n));Object.keys(c.skills||{}).forEach(n=>names.add(n));return [...names]}
function ckParts(c,n){const k=calc(c);
  if(n.startsWith("stat:")){const s=n.slice(5);return {label:`${s} check`,stat:s,statV:k.eff[s]||0,lvl:0,extra:0,base:k.eff[s]||0}}
  const def=skillDef(c,n);const statV=k.eff[def.s]||0;const lvl=skillLevel(c,n);
  const extra=n==="Awareness/Notice"&&c.role==="Solo"?skillLevel(c,"Combat Sense"):0;
  return {label:n,stat:def.s,statV,lvl,extra,base:statV+lvl+extra}}
function ckLuckLeft(c){return Math.max(0,(Number(c.stats&&c.stats.LUCK)||0)-(Number(c.luckSpent)||0))}
function ckOpen(){const c=ckChar();if(!c){showNotice("Open a runner first, then make a skill check.");return}
  const s=ckState();if(!s.skill||(!s.skill.startsWith("stat:")&&!ckSkillNames(c).includes(s.skill))){const top=ckTrained(c)[0];s.skill=top||"stat:REF"}
  s.luck=0;s.mod=0;s.last=null;if(ui.dv!==""&&ui.dv!=null&&ui.modal!=="check")s.dv=Number(ui.dv)||s.dv;
  Tray.open=false;Tray.render();ui.modal="check";renderModal();setTimeout(()=>document.getElementById("ck-q")?.focus(),40)}
function ckTrained(c){return ckSkillNames(c).filter(n=>skillLevel(c,n)>0).sort((a,b)=>skillLevel(c,b)-skillLevel(c,a)||a.localeCompare(b))}
function checkBody(){const c=ckChar();if(!c)return `<p class="muted">Open a runner first.</p>`;const s=ckState();const k=calc(c);
  const q=(s.q||"").trim().toLowerCase();
  let names=q||s.all?ckSkillNames(c).sort((a,b)=>(skillLevel(c,b)>0)-(skillLevel(c,a)>0)||a.localeCompare(b)):ckTrained(c);
  if(q)names=names.filter(n=>n.toLowerCase().includes(q)||skillDef(c,n).s.toLowerCase()===q);
  const pick=ckParts(c,s.skill||"stat:REF");
  const list=names.length?names.map(n=>{const p=ckParts(c,n);return `<button class="ck-sk${s.skill===n?" on":""}" data-act="ck-pick" data-n="${esc(n)}"><span class="n">${esc(n)}</span><span class="s">${esc(p.stat)}${p.lvl?" + "+p.lvl:""}</span><b>${p.base}</b></button>`}).join("")
    :`<p class="faint" style="margin:6px 0;font-size:13px">${q?"No skill matches that.":"No trained skills yet. Show all skills, or roll a plain stat below."}</p>`;
  const stats=STAT_KEYS.filter(x=>x!=="MA"&&x!=="LUCK").map(x=>`<button class="ck-st${s.skill==="stat:"+x?" on":""}" data-act="ck-pick" data-n="stat:${x}">${x} <b>${k.eff[x]||0}</b></button>`).join("");
  const left=ckLuckLeft(c);const canLuck=canEditChar(c)&&left>0;
  const total=pick.base+(Number(s.mod)||0)+(Number(s.luck)||0);
  const how=pick.stat&&!s.skill.startsWith("stat:")?`${esc(pick.stat)} ${pick.statV} + ${esc(pick.label)} ${pick.lvl}${pick.extra?` + Combat Sense ${pick.extra}`:""}`:`${esc(pick.stat)} ${pick.statV}`;
  const r=s.last;
  const res=r?`<div class="ck-res ${r.fumble?"bad":r.dv?(r.total>=r.dv?"good":"bad"):""}" role="status"><div class="tot num">${r.total}</div><div style="min-width:0">
      <div class="verdict">${r.fumble?"Fumble: automatic failure":r.dv?(r.total>=r.dv?"Success":"Failure"):"Rolled"}${r.crit?" · critical":""}</div>
      <div class="det mono">${esc(r.detail)}</div>
      <div class="faint" style="font-size:12.5px">${r.fumble?"A natural 1. Your GM may ask you to roll on the fumble table.":r.crit?"A natural 10: rolled again and added.":r.dv?(r.total>=r.dv?`Beat DV ${r.dv} by ${r.total-r.dv}.`:`Missed DV ${r.dv} by ${r.dv-r.total}.`):"No difficulty set: tell your GM the total."}</div>
      ${r.fumble?`<button class="btn sm" data-act="ck-fumble">Roll 1D10 for the fumble table</button>`:""}</div></div>`:"";
  return `<div class="ck">
    <div class="ck-pick">
      <div class="row" style="flex-wrap:nowrap;gap:6px"><input id="ck-q" value="${esc(s.q||"")}" placeholder="Search skills" aria-label="Search skills" autocomplete="off"><span class="seg" role="group" aria-label="Show"><button class="${s.all?"":"on"}" data-act="ck-all" data-v="0">Trained</button><button class="${s.all?"on":""}" data-act="ck-all" data-v="1">All</button></span></div>
      <div class="ck-list">${list}</div>
      <div><span class="label">Or a plain stat</span><div class="ck-stats">${stats}</div></div>
    </div>
    <div class="ck-roll">
      <div><span class="label">${esc(c.handle||"Your runner")} rolls</span><div class="ck-name">${esc(pick.label)}</div><div class="faint mono" style="font-size:12.5px">${how}${k.level>=2?` · ${esc(woundLabel(k.level))} wound penalty included`:""}</div></div>
      <div><span class="label">How hard is it?</span><div class="ck-dv">${CK_DVS.map(([v,l])=>`<button class="${Number(s.dv)===v?"on":""}" data-act="ck-dv" data-v="${v}">${v?`<b>${v}</b>`:""}<span>${l}</span></button>`).join("")}</div><span class="faint" style="font-size:12px">Your GM tells you the difficulty. Pick None if they'd rather keep it secret.</span></div>
      <div class="grid2">
        <div class="field"><span class="label">Modifier</span><div class="row ck-num" style="flex-wrap:nowrap"><button class="icon-btn" data-act="ck-mod" data-d="-1" aria-label="Lower modifier">−</button><b class="num">${sgn(Number(s.mod)||0)}</b><button class="icon-btn" data-act="ck-mod" data-d="1" aria-label="Raise modifier">+</button></div><span class="faint" style="font-size:12px">Gear, cover, aiming, GM calls</span></div>
        <div class="field"><span class="label">Spend Luck</span><div class="row ck-num" style="flex-wrap:nowrap"><button class="icon-btn" data-act="ck-luck" data-d="-1" aria-label="Spend less Luck" ${s.luck>0?"":"disabled"}>−</button><b class="num">${s.luck||0}</b><button class="icon-btn" data-act="ck-luck" data-d="1" aria-label="Spend more Luck" ${canLuck&&s.luck<left?"":"disabled"}>+</button></div><span class="faint" style="font-size:12px">${left} of ${c.stats.LUCK||0} left this session</span></div>
      </div>
      <button class="btn primary ck-go" data-act="ck-roll">Roll ${total} + D10${Number(s.dv)?` vs DV ${s.dv}`:""}</button>
      ${res}
      <p class="faint" style="margin:0;font-size:12px">Total = stat + skill + 1D10. Meet or beat the difficulty to succeed. A 10 rolls again and adds; a 1 is a fumble.</p>
    </div></div>`}
Object.assign(A,{
  "ck-open":()=>ckOpen(),
  "ck-pick":el=>{const s=ckState();if(s.skill!==el.dataset.n)s.mod=0;s.skill=el.dataset.n;s.last=null;renderModal()},
  "ck-all":el=>{ckState().all=el.dataset.v==="1";renderModal()},
  "ck-dv":el=>{ckState().dv=Number(el.dataset.v)||0;renderModal()},
  "ck-mod":el=>{const s=ckState();s.mod=clamp((Number(s.mod)||0)+Number(el.dataset.d),-20,20);renderModal()},
  "ck-luck":el=>{const c=ckChar();if(!c)return;const s=ckState();s.luck=clamp((Number(s.luck)||0)+Number(el.dataset.d),0,canEditChar(c)?ckLuckLeft(c):0);renderModal()},
  "ck-roll":()=>{const c=ckChar();if(!c)return;const s=ckState();const p=ckParts(c,s.skill||"stat:REF");
    const luck=canEditChar(c)?Math.min(Number(s.luck)||0,ckLuckLeft(c)):0;
    const label=p.label+(p.stat&&!s.skill.startsWith("stat:")?` (${p.stat})`:"");
    s.last=Dice.check(label,p.base,{dv:Number(s.dv)||null,mod:s.mod,luck,who:c.handle||c.name||"Unnamed"});
    if(luck){c.luckSpent=(Number(c.luckSpent)||0)+luck;c.updatedAt=Date.now();saveChar(c);s.luck=0}
    renderModal();if(luck)render()},
  "ck-fumble":()=>{const r=d(10);Dice.raw("Fumble table",`1D10 = ${r}. Your GM reads the result from the fumble table for this skill.`,r,(ckChar()||{}).handle)},
});
document.addEventListener("input",ev=>{if(ev.target.id==="ck-q"){ckState().q=ev.target.value;renderModal()}});
document.addEventListener("keydown",ev=>{if(ev.target.id==="ck-q"&&ev.key==="Enter"){ev.preventDefault();const first=document.querySelector(".ck-list .ck-sk");if(first){ckState().skill=first.dataset.n;ckState().q="";renderModal()}}});
// the dice tray gets a "Skill check" button whenever there's a runner to roll for
Tray.extra=()=>ckChar()?`<button class="btn sm primary" data-act="ck-open">Skill check…</button>`:"";
