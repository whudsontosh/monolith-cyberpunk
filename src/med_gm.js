/* Cyberpunk 2020 · the GM's medical tools (1.1.2): each runner's condition, treatment, healing and Trauma
   Team on their page, downtime that heals the whole party, stabilizing in the combat tracker, and the medical
   rules reference. The rules and shared panels are in med.js. */

function medEdit(id,fn){withPc(id,fn)}
function medUI(id){ui.medg=ui.medg||{};const k=id||"_";if(!ui.medg[k])ui.medg[k]={who:"other",tot:"",adv:[],days:""};return ui.medg[k]}

{const _vp=viewPc;viewPc=function(c){const h=_vp(c);const k=calc(c);const ctx={ed:true,gm:true,u:medUI(c.id)};
  const fx=medFxHTML(c,{ed:true});
  const med=`${medCondHTML(c,k,ctx)}${medTreatHTML(c,k,ctx)}${medHealHTML(c,k,ctx)}${fx?`<section class="panel"><div class="panel-h"><h3>Drugs & effects</h3></div><div class="panel-b">${fx}</div></section>`:""}${medTTHTML(c,k,ctx)}`;
  const mark=`<section class="panel"><div class="panel-h"><h3>Armor SP</h3>`;return h.includes(mark)?h.replace(mark,med+mark):h+med}}
{const _pa=cpPartyActions;cpPartyActions=function(){return _pa()+`<button class="btn" data-act="open-modal" data-m="downtime">Downtime…</button>`}}
MODALS.downtime=()=>{const u=medUI("_party");return {title:"Downtime",body:`<div style="display:grid;gap:12px">
  <p class="muted" style="margin:0">Time passes for the whole party. Treated runners heal at their rate. Untreated ones get 2 points worse a day, with a daily death save while mortal. Effects that last days, like speedheal's REF penalty, count down.</p>
  <label class="row" style="gap:8px"><span class="label">Days</span><input id="dt-days" type="number" min="1" max="365" data-medui="days" data-id="_party" value="${esc(u.days||7)}" style="width:80px"></label>
  <div class="row"><button class="btn primary" data-act="med-downtime" ${st.party.length?"":"disabled"}>Let the days pass</button></div>
  ${u.out?`<div class="med-dt">${u.out.map(([n,lines])=>`<div><b>${esc(n)}</b><ul class="med-log">${lines.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div>`:""}</div>`}};
Object.assign(A,{
  "med-downtime":()=>{const u=medUI("_party");const n=clamp(Number(u.days||7)||7,1,365);u.out=[];
    st.party.forEach(c=>{const hurt=medDmg(c)||(c.fx||[]).length;if(!hurt){u.out.push([whoOf(c),["Nothing to heal."]]);return}const lines=medDays(c,n);c.updatedAt=Date.now();u.out.push([whoOf(c),lines])});
    Dice.raw(`Downtime: ${n} day${n===1?"":"s"}`,u.out.map(([w,l])=>`${w}: ${l[l.length-1]}`).join(" · "),"","GM");save();render();renderModal()},
  "cb-stab":el=>{const cb=st.encounter.list.find(x=>x.cid===el.dataset.cid);const i=cb&&cbInfo(cb);if(!i||ui.medic===""||ui.medic==null)return;
    const r=medRoll(`Stabilize ${i.name}`,Number(ui.medic)||0,i.w,"ge","GM");
    const mark=o=>{const m=medEnsure(o);m.stab=true;m.stabW=i.w;m.dying=false};
    if(r.ok){if(cb.kind==="pc")withPc(cb.ref,mark);else mark(cb.npc)}
    withCb(cb.cid,x=>{x.last=r.ok?`Stabilized (${r.tot} vs ${i.w}): no more death saves unless they're hit again.`:`Stabilization failed (${r.tot} vs ${i.w}). Death save this turn.`})},
});
{const _vr=viewReference;viewReference=function(){const t=(title,head,rows)=>`<section class="panel"><div class="panel-h"><h3>${title}</h3></div><div class="panel-b tbl-wrap"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
  return _vr()+`<div class="roster-head" style="margin-top:22px"><h1><small>Quick reference</small>Trauma Team</h1></div><div class="ref-grid">${medRefTables(t)}</div>`}}
