/* ============================== CYBERPUNK 2020: YOUR RUNNER AT THE TABLE ==============================
   The panel beside the map: top skills to roll, weapons, and the skill check and attack windows. */
function cpTablePanel(c){const k=calc(c);const top=Object.keys(c.skills||{}).filter(n=>skillLevel(c,n)>0).sort((a,b)=>skillLevel(c,b)-skillLevel(c,a)).slice(0,6);
  return `<div class="row" style="justify-content:space-between"><h3>${esc(c.handle||"Your runner")}</h3><span class="chip ${woundChipClass(k.level)}">${woundLabel(k.level)} · ${k.w}</span></div>
      <div class="row" style="gap:4px">${top.map(n=>{const def=skillDef(c,n);let base=(k.eff[def.s]||0)+skillLevel(c,n);if(n==="Awareness/Notice"&&c.role==="Solo")base+=skillLevel(c,"Combat Sense");return `<button class="rollbtn" data-act="pt-roll" data-l="${esc(n)}" data-b="${base}">${esc(n)} <b>${base}</b></button>`}).join("")}</div>
      <div class="row" style="gap:4px">${(c.weapons||[]).slice(0,4).map(w=>`<button class="rollbtn" data-act="atk-open" data-id="${esc(w.id)}" title="Attack with ${esc(w.name)}">${esc(w.name)} <b>${esc(w.dmg)}</b></button>`).join("")}<button class="btn sm ghost" data-act="open-char" data-id="${esc(c.id)}">Open sheet</button></div>
      <div class="row" style="gap:6px"><button class="btn primary" style="flex:1" data-act="ck-open">Skill check…</button><button class="btn primary" style="flex:1" data-act="atk-open">Attack…</button></div>`}
A["pt-roll"]=el=>Dice.check(el.dataset.l,Number(el.dataset.b),{who:whoName()});
