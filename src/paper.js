/* ============================== CYBERPUNK 2020: PAPER SHEETS ============================== */
/* ============================== PAPER SHEET ============================== */
const PAPER_CSS=`
.page{width:8.5in;min-height:11in;padding:.4in;margin:0 auto 24px;background:#fff;color:#111;box-shadow:0 4px 24px rgba(0,0,0,.35);font-family:"Barlow","Segoe UI",Arial,sans-serif;font-size:10px;line-height:1.3;-webkit-print-color-adjust:exact;print-color-adjust:exact;display:flex;flex-direction:column;gap:7px}
.page *{box-sizing:border-box}
.page th{color:#111!important}.page tr:hover td{background:none!important}.page h3,.page h4{letter-spacing:.06em}.page ::selection{background:#111;color:#fff}
.pp-head{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:stretch;border:2px solid #111}
.pp-title{background:#111;color:#fff;padding:8px 12px;display:flex;flex-direction:column;justify-content:center;min-width:1.9in}
.pp-title b{font-family:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;font-size:30px;font-weight:900;font-style:italic;line-height:.9;letter-spacing:.01em}
.pp-title span{font-family:"IBM Plex Mono",Consolas,monospace;font-size:8px;letter-spacing:.18em;text-transform:uppercase;opacity:.8;margin-top:4px}
.pp-fields{display:grid;grid-template-columns:repeat(4,1fr);gap:0;padding:6px 8px 6px 0}
.pf{border-bottom:1px solid #111;padding:2px 6px 1px;margin:0 4px 4px;min-height:24px}
.pf label{display:block;font-family:"IBM Plex Mono",Consolas,monospace;font-size:7px;letter-spacing:.12em;text-transform:uppercase;color:#444}
.pf div{font-size:12px;font-weight:600;min-height:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pf.w2{grid-column:span 2}
.pp-sec{border:1.5px solid #111}
.pp-sec>h3{margin:0;background:#111;color:#fff;font-family:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;font-weight:800;font-size:13px;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;display:flex;justify-content:space-between;align-items:baseline}
.pp-sec>h3 small{font-family:"IBM Plex Mono",Consolas,monospace;font-size:7.5px;font-weight:400;letter-spacing:.1em}
.pp-body{padding:6px 8px}
.pp-stats{display:grid;grid-template-columns:repeat(9,1fr);gap:4px}
.ps{border:1px solid #111;text-align:center;padding:2px 2px 3px}
.ps label{display:block;font-family:"IBM Plex Mono",Consolas,monospace;font-size:8px;font-weight:600;letter-spacing:.08em}
.ps b{display:block;font-family:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;font-size:24px;font-weight:900;line-height:1;min-height:24px}
.ps i{display:block;font-style:normal;border-top:1px dashed #888;font-size:8px;color:#444;padding-top:1px;min-height:12px}
.pp-derived{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;margin-top:5px}
.pd{border:1px solid #111;padding:2px 5px}
.pd label{font-family:"IBM Plex Mono",Consolas,monospace;font-size:7px;letter-spacing:.1em;text-transform:uppercase;color:#444;display:block}
.pd b{font-size:13px;font-weight:700;min-height:16px;display:block}
.pp-two{display:grid;grid-template-columns:2.6in 1fr;gap:8px}
.pp-loc{width:100%;border-collapse:collapse;text-align:center}
.pp-loc th,.pp-loc td{border:1px solid #111;padding:2px 3px}
.pp-loc th{font-family:"IBM Plex Mono",Consolas,monospace;font-size:7px;letter-spacing:.06em;text-transform:uppercase;font-weight:600;background:#eee}
.pp-loc td{font-size:13px;font-weight:700;height:20px}
.pp-loc td.k{font-family:"IBM Plex Mono",Consolas,monospace;font-size:7.5px;font-weight:600;text-transform:uppercase;text-align:left;background:#eee;width:40px}
.pp-wounds{display:grid;grid-template-columns:repeat(10,1fr);gap:3px}
.pw label{display:block;font-family:"IBM Plex Mono",Consolas,monospace;font-size:6.5px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;text-align:center}
.pw .bx{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;border:1px solid #111;padding:1px}
.pw .bx span{aspect-ratio:1;border:1px solid #111;display:block}
.pw .bx span.f{background:#111}
.pw small{display:block;text-align:center;font-family:"IBM Plex Mono",Consolas,monospace;font-size:6.5px;color:#444}
.pp-saves{display:flex;gap:10px;margin-top:5px;font-family:"IBM Plex Mono",Consolas,monospace;font-size:8px}
.pp-saves span{border:1px solid #111;padding:2px 6px}
.pp-skills{columns:3;column-gap:12px}
.pk{break-inside:avoid;margin-bottom:3px}
.pk h4{margin:0 0 1px;font-family:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;font-size:11px;font-weight:800;text-transform:uppercase;border-bottom:1.5px solid #111;display:flex;justify-content:space-between}
.pk h4 span{font-family:"IBM Plex Mono",Consolas,monospace;font-size:7.5px;font-weight:600}
.pr{display:flex;justify-content:space-between;gap:4px;border-bottom:1px dotted #999;line-height:11.6px;min-height:12px;font-size:8.6px}
.pr b{min-width:16px;text-align:center;border-left:1px solid #111;font-weight:700}
.pr.on span{font-weight:600}
.pr .line{flex:1}
table.pt{width:100%;border-collapse:collapse}
table.pt th{font-family:"IBM Plex Mono",Consolas,monospace;font-size:7px;letter-spacing:.06em;text-transform:uppercase;font-weight:600;text-align:left;border-bottom:1.5px solid #111;padding:2px 4px;background:#eee}
table.pt td{border-bottom:1px solid #bbb;padding:2px 4px;height:17px;font-size:9.5px}
table.pt td.n{text-align:center;font-family:"IBM Plex Mono",Consolas,monospace;font-size:9px}
.pp-grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pp-dl{display:grid;grid-template-columns:1.35in 1fr;gap:0}
.pp-dl dt,.pp-dl dd{margin:0;border-bottom:1px solid #bbb;padding:3px 4px;min-height:18px}
.pp-dl dt{font-family:"IBM Plex Mono",Consolas,monospace;font-size:7.5px;letter-spacing:.06em;text-transform:uppercase;color:#444}
.pp-lines div{border-bottom:1px solid #bbb;height:18px;font-size:9.5px;padding:3px 4px;overflow:hidden}
.pp-foot{margin-top:auto;display:flex;justify-content:space-between;font-family:"IBM Plex Mono",Consolas,monospace;font-size:7px;color:#666;letter-spacing:.08em;text-transform:uppercase}
.pp-hum{display:flex;gap:8px;align-items:center;margin-top:4px;font-size:9px}
.pp-hum .bar{flex:1;height:8px;border:1px solid #111;position:relative}
.pp-hum .bar i{position:absolute;inset:0 auto 0 0;background:#111}
.npc-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.npc{border:1.5px solid #111;break-inside:avoid;display:flex;flex-direction:column}
.npc h3{margin:0;background:#111;color:#fff;font-family:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;font-size:15px;font-weight:800;text-transform:uppercase;padding:2px 8px;display:flex;justify-content:space-between;align-items:baseline}
.npc h3 small{font-family:"IBM Plex Mono",Consolas,monospace;font-size:7.5px;font-weight:400}
.npc .b{padding:5px 7px;display:grid;gap:4px;font-size:9px}
.npc .st{display:grid;grid-template-columns:repeat(9,1fr);gap:2px;text-align:center}
.npc .st div{border:1px solid #111;font-family:"IBM Plex Mono",Consolas,monospace;font-size:7px;padding:1px 0}
.npc .st div b{display:block;font-size:12px;font-family:"Big Shoulders Display","Arial Narrow",Impact,sans-serif}
.npc .wt{display:grid;grid-template-columns:repeat(10,1fr);gap:2px}
.npc .wt div{display:grid;grid-template-columns:repeat(4,1fr);gap:1px}
.npc .wt span{aspect-ratio:1;border:1px solid #111}
`;
function paperWounds(w){return `<div class="pp-wounds">${WOUND_LEVELS.map((lab,g)=>`<div class="pw"><label>${lab}</label><div class="bx">${[1,2,3,4].map(j=>`<span class="${g*4+j<=w?"f":""}"></span>`).join("")}</div><small>Stun −${g}</small></div>`).join("")}</div>`}
function padRows(rows,min,cols){const out=[...rows];while(out.length<min)out.push(`<tr>${"<td></td>".repeat(cols)}</tr>`);return out.join("")}
function sheetPages(c,o){
  const B=!!o.blank;const S=!B&&o.state!==false;const k=B?null:calc(c);
  const v=x=>B?"":esc(x??"");const role=B?null:roleOf(c);
  const ab=role?role.ab:"";const abLv=role?skillLevel(c,ab):"";
  const pf=(lab,val,cls="")=>`<div class="pf ${cls}"><label>${lab}</label><div>${val}</div></div>`;
  const statBox=key=>{const b=B?"":c.stats[key];const e=B?"":k.eff[key];return `<div class="ps"><label>${key}</label><b>${b}</b><i>${S&&e!==b?"now "+e:"&nbsp;"}</i></div>`};
  const dv=(lab,val)=>`<div class="pd"><label>${lab}</label><b>${val}</b></div>`;
  // skills
  const groups={};const order=["REF","INT","TECH","COOL","EMP","ATTR","BODY"];
  const names=new Set(SKILL_DEFS.map(x=>x[0]));if(!B)(c.customSkills||[]).forEach(s=>names.add(s.n));if(!B)Object.keys(c.skills||{}).forEach(n=>{if(!ABILITIES[n])names.add(n)});
  [...names].forEach(n=>{const def=B?SKILL_BY_NAME[n]:skillDef(c,n);if(!def)return;const lv=B?0:skillLevel(c,n);if(!B&&!o.allSkills&&!lv)return;(groups[def.s]||(groups[def.s]=[])).push([n,lv])});
  const skillsHTML=`<div class="pp-skills">
    <div class="pk"><h4>Special ability</h4><div class="pr on"><span>${B?`<span class="line" style="display:inline-block;width:1.2in"></span>`:esc(ab)}</span><b>${B?"":abLv}</b></div></div>
    ${order.filter(g=>groups[g]).map(g=>`<div class="pk"><h4>${g}<span>[${B?"&nbsp;&nbsp;":k.eff[g]}]</span></h4>${groups[g].sort((a,b)=>a[0].localeCompare(b[0])).map(([n,lv])=>`<div class="pr ${lv?"on":""}"><span>${esc(n)}${(SKILL_BY_NAME[n]?.m||1)>1?` <small>×${SKILL_BY_NAME[n].m}</small>`:""}</span><b>${lv||""}</b></div>`).join("")}</div>`).join("")}
    <div class="pk"><h4>Other skills</h4>${Array.from({length:3},()=>`<div class="pr"><span class="line"></span><b>&nbsp;</b></div>`).join("")}</div>
  </div>`;
  const ipFree=B?"":(c.ip?.total||0)-(c.ip?.spent||0);
  const foot=n=>`<div class="pp-foot"><span>Night City Dossier · Cyberpunk 2020 character record</span><span>${B?"":esc(c.handle||"")+" · "}page ${n}</span></div>`;
  const p1=`<div class="page">
    <div class="pp-head"><div class="pp-title"><b>CYBERPUNK<br>2020</b><span>Character record</span></div>
      <div class="pp-fields">${pf("Handle",v(c.handle),"w2")}${pf("Role",v(c.role))}${pf("Age",v(c.age))}
        ${pf("Real name",v(c.name),"w2")}${pf("Special ability",B?"":esc(ab)+" "+abLv)}${pf("Reputation",B?"":c.rep||0)}
        ${pf("Character points",B?"":statSum(c))}${pf("IP earned / free",B?"":(c.ip?.total||0)+" / "+ipFree)}${pf("Gender",v(c.gender))}${pf("Cash",B?"":S?fmtEb(c.eb):"")}</div></div>
    <div class="pp-sec"><h3>Stats <small>base value · current below when modified</small></h3><div class="pp-body">
      <div class="pp-stats">${STAT_KEYS.map(statBox).join("")}</div>
      <div class="pp-derived">${dv("Run",B?"":k.run+"m")}${dv("Leap",B?"":k.leap+"m")}${dv("Lift",B?"":k.lift+"kg")}${dv("Carry",B?"":k.carry+"kg")}${dv("Save",B?"":k.save)}${dv("BTM",B?"":k.btm)}${dv("Humanity",B?"":k.humanity+" / "+k.humMax)}${dv("Current EMP",B?"":k.eff.EMP)}</div>
    </div></div>
    <div class="pp-two">
      <div class="pp-sec"><h3>Armor <small>${B?"":"EV "+(k.ev||0)}</small></h3><div class="pp-body"><table class="pp-loc"><tr><td class="k">Location</td>${LOCS.map(l=>`<th>${l[1]}</th>`).join("")}</tr><tr><td class="k">Roll</td>${LOCS.map(l=>`<td style="font-size:9px;font-weight:600">${l[2]}</td>`).join("")}</tr><tr><td class="k">SP</td>${LOCS.map(l=>`<td>${B?"":spAt(c,l[0])||""}</td>`).join("")}</tr></table></div></div>
      <div class="pp-sec"><h3>Damage <small>${B?"":S?woundLabel(k.level)+" · "+k.w+"/40":""}</small></h3><div class="pp-body">${paperWounds(S?k.w:0)}
        <div class="pp-saves"><span>Stun save ≤ ${B?"___":S?k.stunSave:k.save}</span>${!B&&S&&k.deathSave!=null?`<span>Death save ≤ ${k.deathSave}</span>`:`<span>Death save ≤ BODY − mortal level</span>`}<span>Serious −2 REF · Critical ½ · Mortal ⅓</span></div></div></div>
    </div>
    <div class="pp-sec"><h3>Skills <small>${!B&&!o.allSkills?"trained skills":"all skills · level in the box"}</small></h3><div class="pp-body">${skillsHTML}</div></div>
    ${foot(1)}</div>`;
  const wRows=B?[]:(c.weapons||[]).map(w=>`<tr><td>${esc(w.name)}</td><td class="n">${esc(w.type)}</td><td class="n">${sgn(Number(w.wa)||0)}</td><td class="n">${esc(w.conc||"")}</td><td class="n">${esc(w.avail||"")}</td><td class="n">${esc(w.dmg)}</td><td class="n">${esc(w.shots||"")}${S&&w.shots?` <small>(${w.ammo})</small>`:""}</td><td class="n">${esc(w.rof)}</td><td class="n">${esc(w.rel)}</td><td class="n">${esc(w.range)}</td></tr>`);
  const aRows=B?[]:(c.armor||[]).map(a=>`<tr><td>${esc(a.name)}${S&&!a.worn?" <small>(stowed)</small>":""}</td><td class="n">${esc(a.sp)}</td><td>${(a.locs||[]).map(locName).join(", ")}</td><td class="n">${esc(a.ev)}</td></tr>`);
  const cRows=B?[]:(c.cyber||[]).map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.cat||"")}</td><td class="n">${esc(x.hc||"")}</td><td class="n">${esc(x.hcLoss)}</td><td class="n">${fmtEb(x.cost)}</td></tr>`);
  const gRows=B?[]:(c.gear||[]).map(g=>`<tr><td>${esc(g.name)}</td><td class="n">${esc(g.qty)}</td><td class="n">${fmtEb(g.cost)}</td></tr>`).concat(B?[]:(c.vehicles||[]).map(v=>`<tr><td>${esc(v.name)}${v.cyber?" (cyber controls)":""} · SDP ${Math.max(0,(Number(v.sdp)||0)-(Number(v.sdpDmg)||0))}/${esc(v.sdp)}${v.sp?" · SP "+esc(v.sp):""}</td><td class="n">1</td><td class="n">${fmtEb(v.cost)}</td></tr>`));
  const ls=B?{}:(c.lifestyle||{});
  const p2=`<div class="page">
    <div class="pp-sec"><h3>Weapons</h3><div class="pp-body"><table class="pt"><tr><th style="width:30%">Weapon</th><th>Type</th><th>WA</th><th>Conc</th><th>Avail</th><th>Damage</th><th>Shots</th><th>ROF</th><th>Rel</th><th>Range</th></tr>${padRows(wRows,7,10)}</table></div></div>
    <div class="pp-grid2">
      <div class="pp-sec"><h3>Armor worn</h3><div class="pp-body"><table class="pt"><tr><th style="width:45%">Item</th><th>SP</th><th>Covers</th><th>EV</th></tr>${padRows(aRows,5,4)}</table></div></div>
      <div class="pp-sec"><h3>Money & lifestyle</h3><div class="pp-body"><dl class="pp-dl"><dt>Cash on hand</dt><dd>${B||!S?"":fmtEb(c.eb)}</dd><dt>Housing</dt><dd>${v(ls.housing)}</dd><dt>Rent / month</dt><dd>${B?"":fmtEb(ls.rent)}</dd><dt>Food / month</dt><dd>${B?"":fmtEb(ls.food)}</dd><dt>Other / month</dt><dd>${B?"":fmtEb(ls.other)}</dd></dl></div></div>
    </div>
    <div class="pp-sec"><h3>Cyberware <small>${B?"Humanity ____ / ____":"Humanity "+k.humanity+" / "+k.humMax+" · loss "+k.hcLoss}</small></h3><div class="pp-body"><table class="pt"><tr><th style="width:40%">Cyberware</th><th>Type</th><th>HC dice</th><th>Hum. lost</th><th>Cost</th></tr>${padRows(cRows,9,5)}</table>
      ${B?"":`<div class="pp-hum"><span>Humanity</span><div class="bar"><i style="width:${k.humMax?clamp(k.humanity/k.humMax*100,0,100):0}%"></i></div><span>${k.humanity}</span></div>`}</div></div>
    <div class="pp-grid2">
      <div class="pp-sec"><h3>Gear</h3><div class="pp-body"><table class="pt"><tr><th style="width:62%">Item</th><th>Qty</th><th>Cost</th></tr>${padRows(gRows,12,3)}</table></div></div>
      <div class="pp-sec"><h3>Contacts</h3><div class="pp-body"><table class="pt"><tr><th style="width:38%">Name</th><th>Who / notes</th></tr>${padRows(B?[]:(c.contacts||[]).map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.role)}${x.notes?" · "+esc(x.notes):""}</td></tr>`),12,2)}</table></div></div>
    </div>
    ${foot(2)}</div>`;
  let p3="";
  if(o.lifepath!==false){
    const lp=B?{}:(c.lifepath||{});const st=lp.style||{},f=lp.family||{},m=lp.motive||{};
    const ev=B?[]:(lp.events||[]).map(e=>`<tr><td class="n">${esc(e.age)}</td><td>${esc(e.kind)}</td><td>${esc(e.text)}</td></tr>`);
    const noteLines=B?[]:String(c.notes||"").split(/\n/).flatMap(line=>line.match(/.{1,110}(\s|$)/g)||[""]);
    p3=`<div class="page">
      <div class="pp-grid2">
        <div class="pp-sec"><h3>Style & origins</h3><div class="pp-body"><dl class="pp-dl"><dt>Clothes</dt><dd>${v(st.clothes)}</dd><dt>Hairstyle</dt><dd>${v(st.hair)}</dd><dt>Affectations</dt><dd>${v(st.affect)}</dd><dt>Ethnic origin</dt><dd>${v(lp.ethnic)}</dd><dt>Language</dt><dd>${v(lp.language)}</dd></dl></div></div>
        <div class="pp-sec"><h3>Motivations</h3><div class="pp-body"><dl class="pp-dl"><dt>Personality</dt><dd>${v(m.trait)}</dd><dt>Valued person</dt><dd>${v(m.person)}</dd><dt>Values most</dt><dd>${v(m.value)}</dd><dt>Feels about people</dt><dd>${v(m.people)}</dd><dt>Valued possession</dt><dd>${v(m.possession)}</dd></dl></div></div>
      </div>
      <div class="pp-sec"><h3>Family background</h3><div class="pp-body"><dl class="pp-dl"><dt>Family ranking</dt><dd>${v(f.ranking)}</dd><dt>Parents</dt><dd>${v(f.parents)}</dd><dt>Family status</dt><dd>${v(f.status)}</dd><dt>Childhood</dt><dd>${v(f.childhood)}</dd><dt>Siblings</dt><dd>${B?"":(f.siblings||[]).length?(f.siblings).map(s=>`${esc(s.gender)} (${esc(s.age)}) — ${esc(s.feel)}`).join("; "):"Only child"}</dd></dl></div></div>
      <div class="pp-sec"><h3>Life events</h3><div class="pp-body"><table class="pt"><tr><th style="width:36px">Age</th><th style="width:80px">Event</th><th>What happened</th></tr>${padRows(ev,10,3)}</table></div></div>
      <div class="pp-sec" style="flex:1"><h3>Notes</h3><div class="pp-body pp-lines">${Array.from({length:Math.max(14,noteLines.length)},(_,i)=>`<div>${esc(noteLines[i]||"")}</div>`).join("")}</div></div>
      ${foot(3)}</div>`;
  }
  let p4="";
  if(B?o.deck:(o.deck!==false&&(c.deck||(c.programs||[]).length))){const dk=B?{}:(c.deck||{});const used=B?"":muUsed(c);
    const pRows=B?[]:(c.programs||[]).map(p=>`<tr><td>${esc(p.in?progLabelPaper(c,p):p.name)}</td><td>${esc(p.cls)}</td><td class="n">${esc(p.str)}</td><td class="n">${esc(p.mu)}</td><td>${p.in?"Demon":p.loaded?"Deck":"Chip"}</td><td class="n">${fmtEb(p.cost)}</td></tr>`);
    const conn=B?"":(["cyberlimb","cellimb"].includes(dk.type)?"Hardwired":(CONN[dk.conn]||CONN.plugs).label);
    p4=`<div class="page">
      <div class="pp-sec"><h3>Cyberdeck</h3><div class="pp-body"><dl class="pp-dl"><dt>Model</dt><dd>${v(dk.name)}</dd><dt>Kind</dt><dd>${B?"Table · Portable · Combat · Cellular · Cyberlimb":esc(DECK_TYPES[dk.type]||"")}</dd><dt>Speed</dt><dd>${B?"":sgn(Number(dk.speed)||0)}</dd><dt>Data walls</dt><dd>${v(dk.wall)}</dd><dt>Memory</dt><dd>${B?"":`${used} / ${esc(dk.mu)} MU`}</dd><dt>Connection</dt><dd>${conn}</dd><dt>Options</dt><dd>${B?"":esc((dk.opts||[]).join(", "))}${!B&&dk.chips?` · ${esc(dk.chips)} chips`:""}</dd><dt>Net initiative</dt><dd>${B?"REF + Speed + 1D10":`${netInitParts(c,k).base} + 1D10`}</dd><dt>Interface</dt><dd>${B?"":skillLevel(c,"Interface")}</dd></dl></div></div>
      <div class="pp-sec"><h3>Programs</h3><div class="pp-body"><table class="pt"><tr><th style="width:38%">Program</th><th>Class</th><th>STR</th><th>MU</th><th>Where</th><th>Cost</th></tr>${padRows(pRows,22,6)}</table></div></div>
      <div class="pp-sec"><h3>Net rolls</h3><div class="pp-body"><dl class="pp-dl"><dt>Walls, gates, anti-system</dt><dd>Program STR + 1D10 vs wall or gate STR + 1D10</dd><dt>Stealth & detection</dt><dd>STR + 1D10 vs STR + 1D10</dd><dt>Anti-personnel</dt><dd>STR + INT + Interface + 1D10, both sides</dd><dt>Controllers, utilities</dt><dd>1D10 ≤ STR · Log off: 1D10 ≤ 8</dd></dl></div></div>
      ${foot(p3?4:3)}</div>`}
  return p1+p2+p3+p4;
}
function progLabelPaper(c,p){const d0=(c.programs||[]).find(x=>x.id===p.in);return d0?`${d0.name} › ${p.name}`:p.name}
function printCharacter(c){Print.open({css:PAPER_CSS,title:`Paper sheet · ${c.handle||"Unnamed"}`,options:[{key:"allSkills",label:"All skills (paper style)",def:true},{key:"state",label:"Current wounds, cash & ammo",def:true},{key:"lifepath",label:"Lifepath & notes page",def:true},...((c.deck||(c.programs||[]).length)?[{key:"deck",label:"Cyberdeck & programs page",def:true}]:[])],render:o=>sheetPages(c,o)})}
function printBlank(){Print.open({css:PAPER_CSS,title:"Blank character sheet",options:[{key:"lifepath",label:"Lifepath & notes page",def:true},{key:"deck",label:"Cyberdeck & programs page",def:false}],render:o=>sheetPages(blankChar(),{...o,blank:true,allSkills:true})})}
