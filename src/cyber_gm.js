/* Cyberpunk 2020 · the GM's side of 1.1.4: hits on a runner's cyberlimb go to the limb, facedowns in the
   combat tracker, cyberpsychosis and the Stabilized/Dying chip on the party screens, and reference tables. */

// a hit on a runner's working cyberlimb goes to its structure points, not their wounds
{const _hit=A["cb-hit"];A["cb-hit"]=el=>{const cid=el.dataset.cid;const cb=st.encounter.list.find(x=>x.cid===cid);const dm=(ui.dmg&&ui.dmg[cid])||{loc:"torso"};
  const ch=cb&&cb.kind==="pc"?pc(cb.ref):null;const h=ch&&limbAt(ch,dm.loc);
  if(!h||limbState(ch,h)==="destroyed")return _hit(el);
  const amt=Number(document.getElementById("dmg-"+cid).value)||0;if(!amt){showNotice("Enter the damage rolled first.");return}
  const sp=hitSP(spAt(ch,dm.loc),{ap:dm.ap,mono:dm.mono,cover:Number(cb.cover)||0});const r=limbHit(ch,h,amt,sp,dm.ap);
  if(r.pen>0)withPc(ch.id,x=>{const hh=x.cyber.find(y=>y.id===h.id);if(hh)hh.sdpDmg=(Number(hh.sdpDmg)||0)+r.pen});
  withCb(cid,x=>{x.last=r.text})}}

/* ---------- facedowns in the tracker ---------- */
{const _ev=viewEncounter;viewEncounter=function(){const h=_ev();return h.replace('<button class="btn sm" data-act="enc-scatter"','<button class="btn sm" data-act="open-modal" data-m="facedown" title="COOL + Reputation + 1D10, both sides">Facedown</button><button class="btn sm" data-act="enc-scatter"')}}
function fdSide(cid){const cb=st.encounter.list.find(x=>x.cid===cid);const i=cb&&cbInfo(cb);if(!i)return null;const o=i.obj||{};
  const u=(ui.fdg||{})[cid]||{};return {name:i.name,cool:i.eff.COOL||0,rep:u.rep!=null&&u.rep!==""?Number(u.rep)||0:Number(o.rep)||0,coward:!!o.repCoward}}
MODALS.facedown=()=>{const L=st.encounter.list;const u=ui.fdgSel||(ui.fdgSel={a:(L[0]||{}).cid,b:(L[1]||{}).cid});
  const opt=sel=>L.map(cb=>{const i=cbInfo(cb);return i?`<option value="${esc(cb.cid)}" ${sel===cb.cid?"selected":""}>${esc(i.name)}</option>`:""}).join("");
  const side=(k,cid)=>{const s=cid&&fdSide(cid);return `<div class="field"><span class="label">${k==="a"?"One side":"The other"}</span><select data-act-change="fdg-pick" data-k="${k}">${opt(cid)}</select>
    ${s?`<span class="faint" style="font-size:12.5px">COOL ${s.cool} · Rep <input type="number" min="-10" max="10" data-fdg="${esc(cid)}" value="${esc(s.rep)}" style="width:52px" aria-label="Reputation"></span>`:""}</div>`};
  return {title:"Facedown",body:L.length<2?`<p class="muted">Put at least two people in the fight first.</p>`:`<div style="display:grid;gap:12px">
    <p class="muted" style="margin:0">Both roll COOL + Reputation + 1D10. The loser backs down, or attacks the winner at −3 until beating them once. A tie: no penalty. NPCs start at Rep 0; set it here.</p>
    <div class="grid2">${side("a",u.a)}${side("b",u.b)}</div><div class="row"><button class="btn primary" data-act="fdg-roll" ${u.a===u.b?"disabled":""}>Roll the facedown</button></div>${u.last?`<div class="banner">${esc(u.last)}</div>`:""}</div>`}};
Object.assign(A,{"fdg-roll":()=>{const u=ui.fdgSel||{};const a=fdSide(u.a),b=fdSide(u.b);if(!a||!b||u.a===u.b)return;const r=facedown(a,b,"GM");u.last=r.text;
  const loser=r.win?(r.win===a.name?u.b:u.a):null;if(loser)withCb(loser,x=>{x.note=[(x.note||"").trim(),`Lost a facedown: −3 to attack ${r.win} until beating them once.`].filter(Boolean).join(" ")});renderModal()}});
Object.assign(CHANGE,{"fdg-pick":el=>{(ui.fdgSel||(ui.fdgSel={}))[el.dataset.k]=el.value;ui.fdgSel.last="";renderModal()}});
document.addEventListener("input",ev=>{const el=ev.target;if(el.dataset&&el.dataset.fdg){ui.fdg=ui.fdg||{};ui.fdg[el.dataset.fdg]={rep:el.value}}});

/* ---------- party screens ---------- */
{const _pt=cpPartyTable;cpPartyTable=function(list){let h=_pt(list);list.forEach(c=>{const k=calc(c);if(!(k.eff.EMP<=0&&k.humMax))return;
  const a=h.indexOf(`data-act="open-pc" data-id="${esc(c.id)}"`);if(a<0)return;const b=h.indexOf("</tr>",a);const row=h.slice(a,b);
  // flag them next to their name
  h=h.slice(0,a)+row.replace(`</b>`,`</b> <span class="chip red">Cyberpsycho</span>`)+h.slice(b)});return h}}
{const _vp=viewPc;viewPc=function(c){let h=_vp(c);const s=medState(c);const k=calc(c);
  const chip=["ok","healing","hurt"].includes(s.id)?"":`<span class="chip ${s.chip}">${esc(s.label)}</span>`;
  h=h.replace(`<h3>Wounds</h3><span class="chip ${woundChipClass(k.level)}">`,`<h3>Wounds</h3>${chip?`<span class="row" style="gap:6px">${chip}`:""}<span class="chip ${woundChipClass(k.level)}">`);
  if(chip)h=h.replace(`${woundLabel(k.level)} · ${k.w}/40</span></div>`,`${woundLabel(k.level)} · ${k.w}/40</span></span></div>`);
  const limbs=hostsOf(c).filter(x=>hostKind(x)!=="eye");
  if(limbs.length)h=h.replace(`<section class="panel"><div class="panel-h"><h3>Armor SP</h3>`,`<section class="panel"><div class="panel-h"><h3>Cyberlimbs</h3></div><div class="panel-b" style="display:grid;gap:6px">${limbs.map(x=>{const sd=limbSDP(c,x);const st0=limbState(c,x);
    return `<div class="row" style="justify-content:space-between;gap:6px"><span>${esc(hostLabel(x))}</span><span class="row" style="gap:6px"><span class="mono">${sd.dmg}/${sd.des}</span><span class="chip ${st0==="working"?"green":st0==="disabled"?"amber":"red"}">${st0==="working"?"Working":st0==="disabled"?"Useless":"Destroyed"}</span><button class="icon-btn" data-act="pc-sdp" data-id="${esc(c.id)}" data-h="${esc(x.id)}" data-d="-1" aria-label="Repair 1">−</button><button class="icon-btn" data-act="pc-sdp" data-id="${esc(c.id)}" data-h="${esc(x.id)}" data-d="1" aria-label="Damage 1">+</button></span></div>`}).join("")}</div></section><section class="panel"><div class="panel-h"><h3>Armor SP</h3>`);
  if(k.eff.EMP<=0&&k.humMax)h=h.replace(`<div class="sheet">`,`<div class="banner warnb" style="margin-bottom:14px"><span class="chip red">Cyberpsychosis</span> ${esc(c.handle||"This runner")}'s Humanity is gone. By the book you run them as an NPC now, until therapy brings EMP back.</div><div class="sheet">`);
  return h}}
Object.assign(A,{"pc-sdp":el=>withPc(el.dataset.id,c=>{const x=c.cyber.find(y=>y.id===el.dataset.h);if(x)x.sdpDmg=clamp((Number(x.sdpDmg)||0)+Number(el.dataset.d),0,limbSDP(c,x).des)})});

/* ---------- reference ---------- */
{const _vr=viewReference;viewReference=function(){const t=(title,head,rows)=>`<section class="panel"><div class="panel-h"><h3>${title}</h3></div><div class="panel-b tbl-wrap"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
  return _vr()+`<div class="roster-head" style="margin-top:22px"><h1><small>Quick reference</small>Chrome and the Street</h1></div><div class="ref-grid">
  ${t("Cyberlimbs",["Rule","Detail"],[["Structure","Useless at 20 SDP, destroyed at 30. Hydraulic rams 30/40; myomar and reinforced joints +5 each"],["Hits","Armor first, AP halves; no BTM, no stun save, no wound"],["Options","Arm 4, leg 3, eye 4. A hand or foot is one; coverings and limb armor take none (one each)"],["Attacks","Punch 1D6, crush 2D6, kick 2D6. ×2 with myomar, ×3 with rams"],["Leaps","Two cyberlegs: 6m up or 8m running"]])}
  ${t("Chipware",["Rule","Detail"],[["Needs","A neural processor, and interface plugs or a chipware socket"],["Running","As many chips as your INT"],["Level","+1 to +3. A working chip sets the skill to its level, higher or lower"],["Reflex (APTR)","2 days of practice per level; until then it works at the level practiced"],["Memory (MRAM)","Works at once"],["Price","Per level, from 100eb (grooming) to 400eb (heavy weapons)"]])}
  ${t("Reputation",["Rep","Who knows you"],REP_LEVELS.slice(1,10).map((x,i)=>[i+1,esc(x)]))}
  ${t("Facedowns",["Step","Rule"],[["Roll","COOL + Reputation + 1D10, both sides"],["Cowards","A reputation for cowardice counts as negative"],["Loser","Backs down, or attacks the winner at −3 until beating them once"],["Tie","Both unsure; no penalty"],["Recognized?","Strangers know you on 1D10 ≤ Rep"]])}
  ${t("Occupations (eb a month)",["Role","1–5","6","7","8","9","10"],Object.keys(JOB_TITLES).map(r=>[r,...(ROLES[r]?ROLES[r].income:[]).map(fmtEb)]))}
  ${t("Linear frames",["Frame","Strength","Melee damage","Lifts"],FRAMES.slice().reverse().map(([re,str,dm])=>[["Σ Sigma","β Beta","Ω Omega"][str===12?0:str===14?1:2],str,"+"+dm,str*50+"kg"]))}
  ${t("Microwaver side effects (1D6)",["Roll","Effect"],MICROWAVE_FX.map((x,i)=>[i+1,esc(x)]))}
  ${t("Therapy",["Rule","Detail"],[["First","Remove or switch off every implant"],["Then","2 EMP (20 Humanity) back for each week of therapy"]])}</div>`}}
