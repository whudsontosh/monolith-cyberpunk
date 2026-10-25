/* ============================== CYBERPUNK 2020: NETRUNNING (GM) ==============================
   The Netrunning tab: build data fortresses on a 20 × 20 subgrid (by hand, or with the rulebook's
   Fast Fortress rolls), then run them against the party. The GM's app is the referee: players send
   moves and programs, the GM's app rolls both sides by the book and sends each runner only what
   their runner can see. */
Object.assign(ui,{netTab:"forts",netFort:null,netTool:"select",netCell:null,netProg:"Watchdog",netRemote:"Terminal",netRSel:null,netISel:null,netRProg:null,netRMode:"move",netPick:null,netPaint:false});
function netState(){if(!st.net||typeof st.net!=="object")st.net={forts:[],run:null};if(!Array.isArray(st.net.forts))st.net.forts=[];return st.net}
function netFortSel(){const n=netState();let f=n.forts.find(x=>x.id===ui.netFort);if(!f&&n.forts.length){f=n.forts[0];ui.netFort=f.id}return f||null}
function netRun(){const r=netState().run;return r&&r.fort?r:null}
function netSaved(){save();requestRender()}

/* ============================== THE TAB ============================== */
function viewNet(){const n=netState();const run=netRun();if(ui.netTab==="run"&&!run)ui.netTab="forts";
  const tabs=[["forts","Data fortresses"],...(run?[["run",`Run: ${run.fname}`]]:[]),["rules","Net rules"]];
  const body=ui.netTab==="run"?viewNetRun(run):ui.netTab==="rules"?`<div class="ref-grid">${netRefTables()}</div>`:viewNetForts();
  return `<div class="roster-head"><h1><small>Netrunning</small>${ui.netTab==="run"?"The run":ui.netTab==="rules"?"Net rules":"Data fortresses"}</h1>
    <div class="seg" role="tablist">${tabs.map(([k,l])=>`<button class="${ui.netTab===k?"on":""}" data-act="net-tab" data-v="${k}">${esc(l)}</button>`).join("")}</div></div>${body}`}
function viewNetForts(){const n=netState();const f=netFortSel();
  const list=`<div class="panel"><div class="panel-h"><h3>Systems</h3></div><div class="panel-b" style="display:grid;gap:8px">
    <div class="row" style="gap:6px"><button class="btn sm primary" data-act="nf-new">+ New</button><button class="btn sm" data-act="nf-fast" title="The rulebook's Fast Fortress Construction rolls">Roll a fast fortress</button><button class="btn sm ghost" data-act="nf-sample">Sample</button></div>
    ${n.forts.length?n.forts.map(x=>{const s=fortStats(x);return `<button class="npc-item ${f&&f.id===x.id?"on":""}" data-act="nf-sel" data-id="${esc(x.id)}"><b>${esc(x.name)}</b><span class="faint">${s.cpus} CPU · INT ${s.INT}${s.ai?" · AI":""} · ${x.progs.length} defences</span></button>`}).join("")
      :`<p class="faint" style="margin:0;font-size:13px">Build a system on the subgrid, roll one with the Fast Fortress tables, or start from the sample.</p>`}</div></div>`;
  return `<div class="npc-layout nf-layout">${list}<div style="min-width:0">${f?nfEditor(f):`<div class="empty"><h3>No data fortress yet</h3><p class="muted" style="margin:0">A data fortress is a computer system armoured with data walls and guarded by programs. Build one here, then start a run when your netrunners jack in.</p></div>`}</div></div>`}
const NF_TOOLS=[["select","Select"],["wall","Data wall"],["gate","Code gate"],["cpu","CPU"],["mem","Memory"],["remote","Remote"],["ldl","LDL"],["entry","Way in"],["prog","Program"],["erase","Erase"]];
function nfEditor(f){const s=fortStats(f);const k=ui.netCell;const cell=k?f.cells[k]:null;const [sx,sy]=k?fxy(k):[0,0];const here=k?f.progs.filter(p=>p.x===sx&&p.y===sy):[];
  const marks=f.progs.map(p=>({kind:"ice",x:p.x,y:p.y,label:p.name,title:`${p.name} (${p.cls}, STR ${p.str})${p.hidden?", hidden":""}`,cls:p.hidden?"hidden":""}));
  const iceList=PROGRAMS.filter(r=>r[1]!=="Controller"&&r[1]!=="Demon"||true);
  const tool=ui.netTool;
  const toolbar=`<div class="nf-tools"><div class="seg" role="group" aria-label="Tool">${NF_TOOLS.map(([t,l])=>`<button class="${tool===t?"on":""}" data-act="nf-tool" data-v="${t}">${l}</button>`).join("")}</div>
    ${tool==="remote"?`<select data-act-change="nf-remote" aria-label="Remote kind">${REMOTE_KINDS.map(r=>`<option ${ui.netRemote===r?"selected":""}>${esc(r)}</option>`).join("")}</select>`:""}
    ${tool==="prog"?`<select data-act-change="nf-prog" aria-label="Program to place">${PROG_CLASSES.map(cl=>`<optgroup label="${esc(cl)}">${iceList.filter(r=>r[1]===cl).map(r=>`<option value="${esc(r[0])}" ${ui.netProg===r[0]?"selected":""}>${esc(r[0])} · STR ${r[2]} · ${fmtEb(r[4])}${r.ice?" · ICE":""}</option>`).join("")}</optgroup>`).join("")}</select>`:""}</div>`;
  const hint={select:"Click a space to edit what's there.",wall:"Click or drag to draw data walls.",gate:"Code gates go in openings in the walls.",cpu:"Each CPU adds 3 INT and comes with 4 memories, a code gate and a terminal.",mem:"Memories go next to a CPU or another memory.",remote:"Remotes are things in Realspace the system controls.",ldl:"A Long Distance Link to another system.",entry:"Where runners start when they jack in.",prog:"Click to place a defence. Programs can sit in a memory, a CPU or an empty space.",erase:"Click or drag to clear spaces."}[tool];
  let ed="";
  if(k){const [x,y]=fxy(k);ed=`<div class="nf-cell"><div class="row" style="justify-content:space-between"><b>${esc(fcoord(x,y))} · ${esc(cell?CELL_TYPES[cell.t]:"Empty")}</b>${cell?`<button class="btn sm ghost danger" data-act="nf-clear">Clear</button>`:""}</div>
    ${cell&&cell.t==="gate"?`<div class="field"><label class="label" for="nc-str">Strength</label><input id="nc-str" type="number" min="0" max="10" data-nc="str" value="${esc(cell.str)}"><span class="faint" style="font-size:12px">Starts at 2; each level above costs 1,000eb (to 10).</span></div>`:""}
    ${cell&&(cell.t==="remote"||cell.t==="ldl")?`<div class="grid2">${cell.t==="remote"?`<div class="field"><label class="label" for="nc-kind">Kind</label><select id="nc-kind" data-nc="kind">${REMOTE_KINDS.map(r=>`<option ${cell.kind===r?"selected":""}>${esc(r)}</option>`).join("")}</select></div>`:""}<div class="field"><label class="label" for="nc-label">Label</label><input id="nc-label" data-nc="label" value="${esc(cell.label||"")}" maxlength="60" placeholder="${cell.t==="ldl"?"Where it leads":"Lobby camera"}"></div></div>`:""}
    ${cell&&cell.t==="mem"?nfMemEditor(cell):""}
    ${here.length?`<div class="field"><span class="label">Programs here</span>${here.map(p=>`<div class="nf-prog"><b>${esc(p.name)}</b><span class="faint" style="font-size:12px">${esc(p.cls)} · ${p.mu} MU · ${fmtEb(p.cost)}</span>
        <label class="row" style="gap:4px"><span class="label">STR</span><input type="number" min="0" max="10" data-np="${esc(p.id)}|str" value="${esc(p.str)}" style="width:60px"></label>
        <label class="row" style="gap:4px"><input type="checkbox" data-act-change="nf-hidden" data-id="${esc(p.id)}" ${p.hidden?"checked":""}> Hidden</label>
        ${p.hidden?`<label class="row" style="gap:4px" title="Runners' detection programs must beat this + 1D10"><span class="label">Stealth</span><input type="number" min="0" max="10" data-np="${esc(p.id)}|stealth" value="${esc(p.stealth||0)}" style="width:60px"></label>`:""}
        <button class="btn sm ghost danger" data-act="nf-prog-rm" data-id="${esc(p.id)}">Remove</button></div>`).join("")}</div>`:""}
    ${!cell&&!here.length?`<p class="faint" style="margin:0;font-size:13px">Empty space. Pick a tool and click to fill it.</p>`:""}</div>`}
  const aiSel=(lab,path,list,val)=>`<div class="field"><label class="label">${lab}</label><select data-nf="${path}"><option value="">—</option>${list.filter((v,i,a)=>a.indexOf(v)===i).map(v=>`<option ${val===v?"selected":""}>${esc(v)}</option>`).join("")}</select></div>`;
  return `<section class="panel"><div class="panel-h"><div style="min-width:0;flex:1"><input class="npc-name" data-nf="name" value="${esc(f.name)}" maxlength="60" aria-label="System name"></div>
      <div class="row" style="gap:6px"><button class="btn sm primary" data-act="nf-run" ${st.party.length?"":"disabled title='Add runners to the party first'"}>Start a run…</button><button class="btn sm ghost" data-act="nf-dup">Duplicate</button><button class="btn sm ghost danger" data-act="nf-del">${ui.confirm==="nf-"+f.id?"Confirm delete":"Delete"}</button></div></div>
    <div class="panel-b nf-body">
      <div style="min-width:0;display:grid;gap:8px;align-content:start">${toolbar}<p class="faint" style="margin:0;font-size:12.5px">${esc(hint)}</p>
        <div class="ng-wrap">${netGridHTML({cell:kk=>f.cells[kk]||null,marks,sel:k,act:"nf-cell",gm:true,wallStr:s.wallStr,cls:"build",label:f.name})}</div></div>
      <aside class="nf-side">
        <div class="derived nfstats"><div><span class="label">CPUs</span><b class="num">${s.cpus}</b></div><div><span class="label">INT</span><b class="num">${s.INT}</b></div><div><span class="label">Interface</span><b class="num">10</b></div><div><span class="label">Actions</span><b class="num">${s.actions}</b></div><div><span class="label">Memory</span><b class="num ${s.used>s.cap?"over":""}">${s.used}<small>/${s.cap}</small></b></div>${s.ai?`<div><span class="label">AI</span><b>Yes</b></div>`:""}</div>
        <div class="field"><label class="label" for="nf-wall">Data wall Strength</label><div class="row" style="flex-wrap:nowrap"><input id="nf-wall" type="number" min="${s.cpus}" max="10" data-nf="wallStr" value="${esc(Math.max(s.wallStr,s.cpus))}" style="width:80px"><span class="faint" style="font-size:12px">Equal to the CPUs; each level above costs 1,000eb (to 10).</span></div></div>
        ${ed}
        ${s.warn.length?`<div class="nf-warn">${s.warn.map(w=>`<div class="row" style="gap:6px;flex-wrap:nowrap"><span class="chip amber">Check</span><span style="font-size:13px">${esc(w)}</span></div>`).join("")}</div>`:""}
        <details class="nf-det"><summary><span class="label">Cost</span> <b class="mono">${fmtEb(s.total)}</b></summary><div class="nf-cost">${s.cost.map(([l,v])=>`<div><span>${esc(l)}</span><span class="mono">${fmtEb(v)}</span></div>`).join("")||`<div class="faint">Nothing yet.</div>`}<p class="faint" style="margin:4px 0 0;font-size:12px">Remotes other than extra terminals have no price in the rulebook.</p></div></details>
        <details class="nf-det" ${ui.netSkillsOpen?"open":""}><summary><span class="label">Skills</span> ${f.skills.length}/${Math.ceil(s.cpus/2)*5}</summary><div style="display:grid;gap:6px;margin-top:6px">${f.skills.map((sk0,i)=>`<div class="row" style="gap:6px;flex-wrap:nowrap"><select data-nsk="${i}|name" aria-label="Skill">${COMPUTER_SKILLS.map(n0=>`<option ${sk0.name===n0?"selected":""}>${esc(n0)}</option>`).join("")}</select><input type="number" min="4" max="10" data-nsk="${i}|lv" value="${esc(sk0.lv)}" style="width:60px" aria-label="Level"><button class="icon-btn" data-act="nf-skill-rm" data-i="${i}" aria-label="Remove skill">×</button></div>`).join("")}
          <button class="btn sm ghost" data-act="nf-skill-add">+ Skill</button><span class="faint" style="font-size:12px">Computer skills use the system's INT. They start at 4 (200eb) and cost 100eb a level.</span></div></details>
        ${s.ai?`<div class="grid2">${aiSel("AI personality","ai.pers",AI_PERSONALITY,f.ai.pers)}${aiSel("Reaction to runners","ai.react",AI_REACTION,f.ai.react)}${aiSel("ICON","ai.icon",AI_ICON,f.ai.icon)}</div>`:""}
        <div class="field"><label class="label" for="nf-notes">Notes</label><textarea id="nf-notes" data-nf="notes" style="min-height:70px">${esc(f.notes||"")}</textarea></div>
      </aside></div></section>`}
function nfMemEditor(m){return `<div class="field"><label class="label" for="nc-n">Memory number</label><input id="nc-n" type="number" min="0" max="999" data-nc="n" value="${esc(m.n)}" style="width:80px"></div>
  <div class="field"><span class="label">Files (1 MU each)</span>${(m.files||[]).map((fl,i)=>`<div class="nf-file"><div class="row" style="gap:6px;flex-wrap:nowrap"><input data-nc="files.${i}.name" value="${esc(fl.name)}" maxlength="80" aria-label="File name"><select data-nc="files.${i}.type" aria-label="File type">${FILE_TYPES.map(t=>`<option ${fl.type===t?"selected":""}>${esc(t)}</option>`).join("")}</select>
      <label class="row" style="gap:3px" title="File lock: a Decryption program must beat this + 1D10. 0 for none"><span class="label">Lock</span><input type="number" min="0" max="10" data-nc="files.${i}.lock" value="${esc(fl.lock||0)}" style="width:52px"></label><button class="icon-btn" data-act="nf-file-rm" data-i="${i}" aria-label="Remove file">×</button></div>
      <textarea data-nc="files.${i}.docs" placeholder="Documents inside, one per line" style="min-height:44px">${esc(fl.docs||"")}</textarea></div>`).join("")}
    <button class="btn sm ghost" data-act="nf-file-add">+ File</button></div>
  <div class="grid2"><div class="field"><label class="label">Virtual reality</label><select data-act-change="nf-virtual"><option value="">None</option>${VIRTUALS.map(v=>`<option ${m.virtual&&m.virtual.type===v[0]?"selected":""}>${esc(v[0])}</option>`).join("")}</select></div>
    ${m.virtual?`<div class="field"><label class="label">Realism</label><select data-nc="virtual.realism">${REALISM.map(r=>`<option ${m.virtual.realism===r[0]?"selected":""}>${esc(r[0])}</option>`).join("")}</select><span class="faint" style="font-size:12px">${virtualMU(m.virtual)} MU · ${fmtEb(virtualCost(m.virtual))}</span></div>`:""}</div>`}

/* ---------- editing ---------- */
function nfPaintCell(f,x,y,tool){const k=fkey(x,y);const cells=f.cells;
  if(tool==="erase"){delete cells[k];f.progs=f.progs.filter(p=>!(p.x===x&&p.y===y));return}
  if(tool==="wall"){if(!cells[k]||cells[k].t!=="wall")cells[k]={t:"wall"};return}}
function nfClick(f,x,y){const k=fkey(x,y);const t=ui.netTool;const cells=f.cells;
  if(t==="select"){ui.netCell=k;return}
  if(t==="wall"||t==="erase"){nfPaintCell(f,x,y,t);return}
  if(t==="prog"){const r=progRow(ui.netProg)||PROGRAMS[0];f.progs.push(fortProgFrom(r,x,y));ui.netCell=k;return}
  if(cells[k]&&cells[k].t===t){delete cells[k];return}
  if(t==="gate")cells[k]={t:"gate",str:2};
  else if(t==="mem"){const used=new Set(Object.values(cells).filter(c=>c.t==="mem").map(c=>c.n));let n=1;while(used.has(n))n++;cells[k]={t:"mem",n,files:[]}}
  else if(t==="remote")cells[k]={t:"remote",kind:ui.netRemote,label:""};
  else if(t==="ldl")cells[k]={t:"ldl",label:""};
  else if(t==="entry"){for(const kk of Object.keys(cells))if(cells[kk].t==="entry")delete cells[kk];cells[k]={t:"entry"}}
  else cells[k]={t};
  ui.netCell=k}
Object.assign(A,{
  "net-tab":el=>{ui.netTab=el.dataset.v;render()},
  "nf-new":()=>{const f=blankFort("New system");netState().forts.unshift(f);ui.netFort=f.id;ui.netCell=null;netSaved()},
  "nf-fast":()=>{const f=fastFortress("System "+(netState().forts.length+1));netState().forts.unshift(f);ui.netFort=f.id;ui.netCell=null;netSaved();showNotice("Rolled a fast fortress. The rolls are in its notes.")},
  "nf-sample":()=>{const f=sampleFortress();netState().forts.unshift(f);ui.netFort=f.id;ui.netCell=null;netSaved()},
  "nf-sel":el=>{ui.netFort=el.dataset.id;ui.netCell=null;ui.confirm=null;render()},
  "nf-dup":()=>{const f=netFortSel();if(!f)return;const g=clone(f);g.id=uid();g.name=f.name+" (copy)";g.progs.forEach(p=>p.id=uid());netState().forts.unshift(g);ui.netFort=g.id;netSaved()},
  "nf-del":()=>{const f=netFortSel();if(!f)return;if(ui.confirm!=="nf-"+f.id){ui.confirm="nf-"+f.id;render();return}ui.confirm=null;const n=netState();n.forts=n.forts.filter(x=>x.id!==f.id);ui.netFort=null;netSaved()},
  "nf-tool":el=>{ui.netTool=el.dataset.v;render()},
  "nf-cell":el=>{if(["wall","erase"].includes(ui.netTool))return;const f=netFortSel();if(!f)return;nfClick(f,Number(el.dataset.x),Number(el.dataset.y));f.updated=Date.now();netSaved()},
  "nf-clear":()=>{const f=netFortSel();if(!f||!ui.netCell)return;delete f.cells[ui.netCell];netSaved()},
  "nf-prog-rm":el=>{const f=netFortSel();if(!f)return;f.progs=f.progs.filter(p=>p.id!==el.dataset.id);netSaved()},
  "nf-file-add":()=>{const f=netFortSel();const c=f&&f.cells[ui.netCell];if(!c||c.t!=="mem")return;(c.files||(c.files=[])).push({name:"New file",type:"Inter-Office",mu:1,lock:0,docs:""});netSaved()},
  "nf-file-rm":el=>{const f=netFortSel();const c=f&&f.cells[ui.netCell];if(!c||c.t!=="mem")return;c.files.splice(Number(el.dataset.i),1);netSaved()},
  "nf-skill-add":()=>{const f=netFortSel();if(!f)return;ui.netSkillsOpen=true;f.skills.push({name:COMPUTER_SKILLS.find(n0=>!f.skills.some(s=>s.name===n0))||"Programming",lv:4});netSaved()},
  "nf-skill-rm":el=>{const f=netFortSel();if(!f)return;f.skills.splice(Number(el.dataset.i),1);netSaved()},
  "nf-run":()=>{const f=netFortSel();if(!f)return;ui.netPick=st.party.filter(c=>c.deck).map(c=>c.id);if(!ui.netPick.length)ui.netPick=st.party.filter(c=>c.role==="Netrunner").map(c=>c.id);ui.modal="net-start";renderModal()},
});
Object.assign(CHANGE,{
  "nf-remote":el=>{ui.netRemote=el.value},
  "nf-prog":el=>{ui.netProg=el.value},
  "nf-hidden":el=>{const f=netFortSel();const p=f&&f.progs.find(x=>x.id===el.dataset.id);if(p){p.hidden=el.checked;if(p.hidden&&!p.stealth)p.stealth=3;netSaved()}},
  "nf-virtual":el=>{const f=netFortSel();const c=f&&f.cells[ui.netCell];if(!c||c.t!=="mem")return;if(el.value)c.virtual={type:el.value,realism:(c.virtual&&c.virtual.realism)||"Simple"};else delete c.virtual;netSaved()},
});
document.addEventListener("input",ev=>{const el=ev.target;if(!el.dataset||typeof st==="undefined"||!st)return;const num=el.type==="number";const val=num?(el.value===""?0:Number(el.value)):el.value;
  if(el.dataset.nf){const f=netFortSel();if(!f)return;setPath(f,el.dataset.nf,el.dataset.nf==="wallStr"?clamp(val,0,10):val);f.updated=Date.now();save();if(el.tagName==="SELECT"||num)requestRender();return}
  if(el.dataset.nc){const f=netFortSel();const c=f&&f.cells[ui.netCell];if(!c)return;setPath(c,el.dataset.nc,el.dataset.nc==="str"?clamp(val,0,10):val);save();if(el.tagName==="SELECT"||num)requestRender();return}
  if(el.dataset.np){const [id,path]=el.dataset.np.split("|");const f=netFortSel();const p=f&&f.progs.find(x=>x.id===id);if(p){setPath(p,path,clamp(val,0,10));save();requestRender()}return}
  if(el.dataset.nsk){const [i,path]=el.dataset.nsk.split("|");const f=netFortSel();const s=f&&f.skills[Number(i)];if(s){setPath(s,path,path==="lv"?clamp(val,0,10):val);save();requestRender()}return}});
// drag to draw walls or erase
document.addEventListener("pointerdown",ev=>{const b=ev.target.closest&&ev.target.closest('[data-act="nf-cell"]');if(!b||!["wall","erase"].includes(ui.netTool))return;const f=netFortSel();if(!f)return;ev.preventDefault();
  ui.netPaint=true;nfPaintCell(f,Number(b.dataset.x),Number(b.dataset.y),ui.netTool);requestRender()});
document.addEventListener("pointerover",ev=>{if(!ui.netPaint)return;const b=ev.target.closest&&ev.target.closest('[data-act="nf-cell"]');if(!b)return;const f=netFortSel();if(!f)return;nfPaintCell(f,Number(b.dataset.x),Number(b.dataset.y),ui.netTool);requestRender()});
document.addEventListener("pointerup",()=>{if(ui.netPaint){ui.netPaint=false;const f=netFortSel();if(f)f.updated=Date.now();save()}});

/* ============================== STARTING A RUN ============================== */
MODALS["net-start"]=()=>{const f=netFortSel();if(!f)return null;const pick=new Set(ui.netPick||[]);
  return {title:`Run ${f.name}`,body:`<div style="display:grid;gap:12px">
    <p class="muted" style="margin:0">Who's jacking in? Connected players see the Net from their runner's position; you can act for anyone who isn't connected.</p>
    <div class="field">${st.party.map(c=>{const dk=c.deck;const lp=(c.programs||[]).filter(p=>p.loaded).length;return `<label class="row" style="gap:8px;padding:4px 0"><input type="checkbox" class="ns-who" value="${esc(c.id)}" ${pick.has(c.id)?"checked":""}> <b>${esc(c.handle||"Unnamed")}</b> <span class="faint" style="font-size:13px">${esc(c.role)} · ${dk?`${esc(dk.name)} · ${lp} program${lp===1?"":"s"} loaded`:"no cyberdeck"}${isOnline(c.id)?" · online":""}</span></label>`}).join("")}</div>
    <p class="faint" style="margin:0;font-size:12.5px">Runners start at the way in${Object.values(f.cells).some(c=>c.t==="entry")?"":" (this system has none, so outside its first code gate)"}. Their deck's loaded programs come with them.</p>
    <div><button class="btn primary" data-act="nr-start">Start the run</button></div></div>`}};
function netEntry(f){const cells=f.cells;let e=Object.keys(cells).find(k=>cells[k].t==="entry");if(e)return fxy(e);
  const g=Object.keys(cells).find(k=>cells[k].t==="gate");if(g){const [x,y]=fxy(g);for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<FORT_W&&ny<FORT_H&&!cells[fkey(nx,ny)]){
    // outside = the side with fewer walls behind it
    const ox=x-dx,oy=y-dy;if(cells[fkey(ox,oy)]&&cells[fkey(ox,oy)].t!=="wall"||!cells[fkey(ox,oy)])return [nx,ny]}}}
  for(let y=0;y<FORT_H;y++)for(let x=0;x<FORT_W;x++)if(!cells[fkey(x,y)])return [x,y];return [0,0]}
function runProgsFor(c){const ps=c.programs||[];const out=[];
  for(const p of ps){if(p.in){const d0=ps.find(x=>x.id===p.in);if(!d0||!d0.loaded)continue}else if(!p.loaded)continue;
    out.push({id:p.id,name:p.name,cls:p.cls,str:Number(p.str)||0,max:Number(p.str)||0,in:p.in||null,fx:clone(progFx(p)),derez:false})}
  return out}
A["nr-start"]=()=>{const f=netFortSel();if(!f)return;const ids=[...document.querySelectorAll(".ns-who:checked")].map(x=>x.value).filter(id=>pc(id));if(!ids.length){showNotice("Pick at least one runner.");return}
  const fort=clone(f);const [ex,ey]=netEntry(fort);
  const run={fid:f.id,fname:f.name,fort,round:1,order:[],turn:-1,breach:{},open:{},opening:{},wallDmg:{},ctrl:{},ice:fort.progs.map(p=>({...clone(p),max:Number(p.str)||0,alive:true,alerted:false,revealed:!p.hidden})),
    sys:{status:[],crash:0},runners:{},log:[],started:Date.now()};
  for(const id of ids){const c=pc(id);run.runners[id]={id,x:ex,y:ey,seen:[],vis:[],status:[],progs:runProgsFor(c),detected:false,out:false,acted:0,moved:0,read:{},active:{},intLoss:0}}
  netState().run=run;netSight(run);netLog(run,`${ids.map(id=>pc(id).handle||"A runner").join(", ")} jack${ids.length===1?"s":""} into ${f.name}.`);
  ui.modal=null;renderModal();ui.netTab="run";ui.netRSel=ids[0];ui.netISel=null;ui.netRProg=null;snapshot(`Started a run on ${f.name}`,true);netChanged()};

/* ============================== THE RUN ENGINE ============================== */
function netLog(run,text){run.log.push({r:run.round,text});if(run.log.length>120)run.log.splice(0,run.log.length-120)}
function runState(run){return {breach:run.breach,open:run.open,opening:run.opening,wallDmg:run.wallDmg,ctrl:run.ctrl}}
function netSight(run){const st0=runState(run);for(const r of Object.values(run.runners)){if(r.out){r.vis=[];continue}const v=fortVisible(run.fort,st0,r.x,r.y,20);r.vis=[...v];const s=new Set(r.seen);v.forEach(k=>s.add(k));r.seen=[...s]}}
function runnerName(r){const c=pc(r.id);return c?(c.handle||c.name||"A runner"):"A runner"}
function runSys(run){return fortStats(run.fort)}
function wallCur(run,k){return Math.max(0,runSys(run).wallStr-(run.wallDmg[k]||0))}
function iceAt(run,x,y){return run.ice.filter(i=>i.alive&&i.x===x&&i.y===y)}
function runnerAt(run,x,y,except){return Object.values(run.runners).find(r=>!r.out&&r.x===x&&r.y===y&&r.id!==except)||null}
function rProgStr(r,p){if(p.in){const d0=r.progs.find(x=>x.id===p.in);return d0&&!d0.derez?d0.str:0}return p.str}
function rINT(c,r){return Math.max(0,calc(c).eff.INT-(r.intLoss||0))}
function hasStatus(r,...names){return (r.status||[]).some(s=>names.includes(s.t))}
function addStatus(run,r,t,turns,note,perm){r.status=(r.status||[]).filter(s=>s.t!==t||perm);r.status.push({t,until:turns?run.round+turns:null,note:note||"",perm:!!perm})}
function rollN(e){const r=rollDice(e);return r?r.total:0}
function inRange(run,x0,y0,x1,y1){return fortSees(run.fort,runState(run),x0,y0,x1,y1,20)}
function alertNear(run,x,y,dist){let n=0;for(const i of run.ice)if(i.alive&&!i.alerted&&(dist==null||fortDist(i.x,i.y,x,y)<=dist)){i.alerted=true;n++}return n}
function derezProg(r,p){p.derez=true;p.str=0;for(const s of r.progs)if(s.in===p.id){s.derez=true;s.str=0}if(Object.values(r.active).includes(p.id))for(const k of Object.keys(r.active))if(r.active[k]===p.id)delete r.active[k]}
function netRollLine(a,b,res){return `${partsText(a.parts)} + D10 (${res.aRoll}) = ${res.aTot} vs ${partsText(b.parts)} + D10 (${res.bRoll}) = ${res.bTot}`}
function netDice(label,detail,total,who,ok,okT,badT){Dice.raw(label,detail,total,who,[ok?{t:okT,c:"green"}:{t:badT,c:"red"}])}

/* A runner runs a program. Returns an error message, or "" when it happened. */
function runnerAct(run,r,pid,x,y,byGM){const c=pc(r.id);if(!c)return "That runner isn't in the party any more.";if(r.out)return `${runnerName(r)} is out of the Net.`;
  if(hasStatus(r,"Frozen","Knocked out"))return `${runnerName(r)} is ${hasStatus(r,"Frozen")?"frozen":"out cold"} and can't act.`;
  if(!byGM&&r.acted===run.round)return "You've already acted this round. Wait for the next one.";
  const p=r.progs.find(q=>q.id===pid);if(!p)return "That program isn't loaded.";if(p.derez)return `${p.name} has been de-rezzed.`;if(p.cls==="Demon")return "Run one of the Demon's subroutines instead.";
  const s=rProgStr(r,p);const fx=p.fx||{};const who=runnerName(r);const I=ifaceOf(c),N=rINT(c,r);const sys=runSys(run);const lab=`${p.in?r.progs.find(q=>q.id===p.in).name+" › ":""}${p.name}`;
  const targeted=NET_TARGETS.has(p.cls);let k=null,cell=null;
  if(targeted){if(x==null||y==null)return `Pick a target for ${p.name}.`;k=fkey(x,y);cell=run.fort.cells[k];if(!inRange(run,r.x,r.y,x,y))return "That's out of sight or more than 20 spaces away."}
  const done=()=>{if(!byGM)r.acted=run.round;return ""};
  switch(p.cls){
    case "Intrusion":{const isWall=cell&&cell.t==="wall"&&!run.breach[k];const isGate=cell&&cell.t==="gate"&&!run.open[k]&&fx.worm;if(!isWall&&!isGate)return cell&&cell.t==="gate"?`${p.name} can't open code gates. Use a Decryption program.`:"Pick a data wall.";
      const def=isWall?wallCur(run,k):Number(cell.str)||0;const a={base:s,parts:[[p.name,s]]},b={base:def,parts:[[isWall?"Data wall":"Code gate",def]]};const res=netOpposed(a,b,"def");
      let txt=`${who} runs ${lab} at the ${isWall?"data wall":"code gate"} at ${fcoord(x,y)}: ${res.win?"it gets through":"it holds"}.`;
      if(res.win){if(fx.open){run.opening[k]=run.round+fx.open;txt+=` It opens in ${fx.open} turns.`}else if(isWall)run.breach[k]=1;else run.open[k]=1}
      if(isWall&&fx.wall&&!run.breach[k]){const n=rollN(fx.wall);run.wallDmg[k]=(run.wallDmg[k]||0)+n;txt+=` The wall loses ${n} Strength.`;if(wallCur(run,k)<=0&&!run.opening[k]){run.breach[k]=1;txt+=" It's down."}}
      if(fx.alert==="always"){const n=alertNear(run,x,y,10);txt+=n?` The noise alerts ${n} defence${n===1?"":"s"} within 10 spaces.`:" The noise alerts the system."}
      else if(fx.alert){const ar=nd10();if(ar>=fx.alert){alertNear(run,x,y,null);txt+=` (Alarm roll ${ar}: the system is alerted.)`}}
      netDice(lab,netRollLine(a,b,res),res.aTot,who,res.win,"Breaks through","Holds");netLog(run,txt);return done()}
    case "Decryption":{if(cell&&cell.t==="gate"&&!run.open[k]){const ss=fx.vsGate||s;const a={base:ss,parts:[[p.name,ss]]},b={base:Number(cell.str)||0,parts:[["Code gate",Number(cell.str)||0]]};const res=netOpposed(a,b,"def");
        if(res.win)run.open[k]=1;netDice(lab,netRollLine(a,b,res),res.aTot,who,res.win,"Gate opens","Holds");netLog(run,`${who} runs ${lab} on the code gate at ${fcoord(x,y)}: ${res.win?"it opens":"it holds"}.`);return done()}
      if(cell&&cell.t==="mem"){const locked=(cell.files||[]).filter(fl=>Number(fl.lock)>0).sort((a0,b0)=>b0.lock-a0.lock);if(!locked.length)return "Nothing in that memory is locked.";
        if(fortDist(r.x,r.y,x,y)>1)return "Get next to the memory first.";const fl=locked[0];const a={base:s,parts:[[p.name,s]]},b={base:Number(fl.lock),parts:[["File lock",Number(fl.lock)]]};const res=netOpposed(a,b,"def");
        if(res.win){fl.lock=0;netReadInto(run,r,k)}netDice(lab,netRollLine(a,b,res),res.aTot,who,res.win,"Unlocked","Holds");netLog(run,`${who} runs ${lab} on "${fl.name}": ${res.win?"unlocked":"the lock holds"}.`);return done()}
      return "Pick a code gate, or a memory with a locked file."}
    case "Anti-System":{if(cell&&(runnerAt(run,x,y,r.id))){const t=runnerAt(run,x,y,r.id);return netAntiSystemDeck(run,{name:lab,str:s,fx,by:who},t)||done()}
      if(fx.deckOnly)return `${p.name} only works on cyberdecks.`;
      const a={base:s,parts:[[p.name,s]]},b={base:sys.wallStr,parts:[["System data walls",sys.wallStr]]};const res=netOpposed(a,b,"def");let txt=`${who} runs ${lab} against the system: ${res.win?"it gets through":"the data walls hold"}.`;
      if(res.win){if(fx.crash){const n=rollN(fx.crash);run.sys.crash=run.round+1+n;txt+=` From next turn the CPU is down for ${n} turns.`}else if(fx.sys){run.sys.status.push({t:fx.sys,from:run.round+1});txt+=` From next turn: ${fx.sys.toLowerCase()}.`}}
      netDice(lab,netRollLine(a,b,res),res.aTot,who,res.win,"Gets in","Walls hold");netLog(run,txt);return done()}
    case "Anti-IC":{const ices=iceAt(run,x,y).filter(i=>!i.hidden||i.revealed);if(!ices.length)return "Pick a program to attack.";const ice=ices[0];
      if(fx.kills&&!(fx.kills==="Demon"?ice.cls==="Demon":/worm/i.test(ice.name)||(ice.fx||{}).worm))return `${p.name} only attacks ${fx.kills}s.`;
      const a={base:I+s,parts:[["Interface",I],[p.name,s]]},b={base:ice.str+10,parts:[[ice.name,ice.str],["System Interface",10]]};const res=netOpposed(a,b,"att");let txt=`${who} runs ${lab} at ${ice.name}: `;
      if(res.win){if(fx.kills){ice.alive=false;ice.str=0;txt+="it's de-rezzed instantly."}else{const n=rollN(fx.prog||"1D6");ice.str=Math.max(0,ice.str-n);txt+=`${n} Strength damage`;if(ice.str<=0){ice.alive=false;txt+=", and it de-rezzes."}else txt+=`, down to ${ice.str}.`}}else txt+="it misses.";
      ice.alerted=true;netDice(lab,netRollLine(a,b,res),res.aTot,who,res.win,"Hits","Misses");netLog(run,txt);return done()}
    case "Anti-Personnel":{const t=runnerAt(run,x,y,r.id);if(!t)return iceAt(run,x,y).length?"Anti-personnel programs only hurt netrunners.":"Pick a netrunner.";
      return netAntiPersonnel(run,{name:p.name,label:lab,str:s,fx,INT:N,iface:I,by:who,dog:false},t)||done()}
    case "Controller":{if(!cell||cell.t!=="remote")return "Pick a remote.";if(fx.ctrl&&fx.ctrl.length&&!fx.ctrl.includes(cell.kind))return `${p.name} can't control a ${cell.kind.toLowerCase()}.`;
      const ck=netCheckUnder(s);if(ck.ok)run.ctrl[k]=r.id;netDice(lab,`D10 = ${ck.roll}, needs ${s} or less`,ck.roll,who,ck.ok,"In control","Fails");netLog(run,`${who} runs ${lab} on the ${cell.kind.toLowerCase()}${cell.label?" ("+cell.label+")":""}: ${ck.ok?"it's theirs.":"it fails."}`);return done()}
    case "Detection/Alarm":{const range=fx.speedtrap?10:20;
      if(fx.speedtrap){const n=run.ice.filter(i=>i.alive&&["Anti-IC","Anti-Personnel","Anti-System"].includes(i.cls)&&fortDist(i.x,i.y,r.x,r.y)<=range).length;const ck=netCheckUnder(10);netLog(run,`${who} runs Speedtrap: ${n?"something hostile is within 10 spaces":"nothing hostile within 10 spaces"}.`);Dice.raw(lab,n?"Attack programs nearby":"Nothing nearby",n,who,[n?{t:"Danger",c:"red"}:{t:"Clear",c:"green"}]);return done()}
      if(fx.detect&&!fx.see){netLog(run,`${who} sets ${p.name} to watch this part of the system.`);return done()}
      const hid=run.ice.filter(i=>i.alive&&i.hidden&&!i.revealed&&fortDist(i.x,i.y,r.x,r.y)<=range&&inRange(run,r.x,r.y,i.x,i.y));let found=0;
      for(const i of hid){const a={base:s,parts:[[p.name,s]]},b={base:Number(i.stealth)||0,parts:[["Stealth",Number(i.stealth)||0]]};const res=netOpposed(a,b,"att");if(res.win){i.revealed=true;found++}}
      Dice.raw(lab,hid.length?`${hid.length} hidden, ${found} found`:"Nothing hidden in range",found,who,[found?{t:`Found ${found}`,c:"green"}:{t:"Nothing found",c:"ink"}]);netLog(run,`${who} runs ${lab}: ${found?`reveals ${found} hidden program${found===1?"":"s"}`:"finds nothing hidden"}.`);return done()}
    case "Evasion/Stealth":case "Protection":{r.active[p.cls]=p.id;netLog(run,`${who} runs ${lab}${p.cls==="Evasion/Stealth"?": their signal fades":""}.`);return done()}
    case "Utility":{const ck=netCheckUnder(s);let txt=`${who} runs ${lab}: ${ck.ok?"it works":"it fails"}.`;
      if(ck.ok&&fx.rerezz){const dmg=r.progs.filter(q=>q.id!==p.id&&!q.in&&q.str<q.max).sort((a0,b0)=>(b0.derez-a0.derez)||(b0.max-b0.str)-(a0.max-a0.str))[0];if(dmg){dmg.derez=false;dmg.str=dmg.max;r.progs.forEach(q=>{if(q.in===dmg.id){q.derez=false;q.str=q.max}});txt+=` ${dmg.name} is restored.`}}
      if(ck.ok&&p.name==="GateMaster"){r.status=r.status.filter(x=>!/virizz|viral/i.test(x.t));r.pending=(r.pending||[]).filter(pe=>!/virizz|viral/i.test(pe.name));txt+=" Viruses cleared."}
      netDice(lab,`D10 = ${ck.roll}, needs ${s} or less`,ck.roll,who,ck.ok,"Works","Fails");netLog(run,txt);return done()}}
  return "That program has no effect here."}
const NET_TARGETS=new Set(["Intrusion","Decryption","Anti-System","Anti-IC","Anti-Personnel","Controller"]);

/* An anti-personnel attack on a runner (from ICE or another runner): pg. 153. */
function netAntiPersonnel(run,att,t){const c=pc(t.id);if(!c)return "That runner isn't in the party any more.";const who=runnerName(t);const fx=att.fx||{};const lab=att.label||att.name;
  if((c.deck||{}).conn==="keyboard"&&!["cyberlimb","cellimb"].includes(c.deck.type)&&!fx.fire){netLog(run,`${att.by}'s ${att.name} can't touch ${who}: they're on a keyboard.`);Dice.raw(lab,"Keyboards are immune to anti-personnel attacks",0,att.by,[{t:"No effect",c:"ink"}]);return ""}
  const pr=t.active["Protection"]&&t.progs.find(q=>q.id===t.active["Protection"]&&!q.derez);const pfx=pr?pr.fx||{}:{};
  const applies=pr&&!(pfx.only&&!pfx.only.includes(att.name));const pStr=applies?(att.dog&&pfx.vsDog?pfx.vsDog:rProgStr(t,pr)):0;
  const I=ifaceOf(c),N=rINT(c,t);
  const a={base:att.str+att.INT+att.iface,parts:[[att.name,att.str],["INT",att.INT],["Interface",att.iface]]};
  const b={base:pStr+N+I,parts:[...(applies?[[pr.name,pStr]]:[]),["INT",N],["Interface",I]]};
  const res=netOpposed(a,b,"att");let txt=`${att.by}'s ${att.name} attacks ${who}`+(pr&&!applies?` (${pr.name} can't stop it)`:"")+": ";
  if(!res.win){txt+=`${applies?pr.name:"they"} hold${applies?"s":""} it off.`;netDice(lab,netRollLine(a,b,res),res.aTot,att.by,false,"Hits","Stopped");netLog(run,txt);return ""}
  const fxt=[];
  if(fx.wound){let n=rollN(fx.wound);if(pr&&pfx.reduce&&(pfx.reduces||[]).includes(att.name)){n=Math.max(0,n-pfx.reduce);fxt.push(`${pr.name} takes ${pfx.reduce} off`)}
    withPc(t.id,ch=>{ch.wounds=clamp((Number(ch.wounds)||0)+n,0,40)});const k=calc(pc(t.id));fxt.push(`${n} damage: now ${woundLabel(k.level)} (${k.w}). Stun save${k.deathSave!=null?" and death save":""}`)}
  if(fx.int){let n=rollN(fx.int);if(pr&&pfx.reduce&&(pfx.reduces||[]).includes(att.name)){n=Math.max(0,n-pfx.reduce);fxt.push(`${pr.name} takes ${pfx.reduce} off`)}
    t.intLoss=(t.intLoss||0)+n;addStatus(run,t,`INT −${t.intLoss}`,null,fx.lasting?"Lost INT never comes back. Adjust the character's INT.":"",false);t.status=t.status.filter(s=>!/^INT −/.test(s.t)||s.t===`INT −${t.intLoss}`);
    fxt.push(`${n} off INT${fx.lasting?" for good":""}`);if(rINT(c,t)<=0){fxt.push(att.name==="Liche"?"their mind is gone, replaced by a pseudo-personality":"their mind is gone");t.out=true}}
  if(fx.status){const n=fx.dur?rollN(fx.dur):0;addStatus(run,t,fx.status,n||null,fx.durText||"");fxt.push(`${fx.status.toLowerCase()}${n?` for ${n} turns`:fx.durText?` for ${fx.durText}`:""}`)}
  if(fx.fire){addStatus(run,t,"Deck on fire",null,"The Referee decides the damage.");fxt.push("their deck bursts into flames: the Referee sets the damage")}
  if(fx.out){t.out=true;fxt.push("dumped out of the Net")}
  txt+=fxt.join("; ")+".";netDice(lab,netRollLine(a,b,res)+" · "+fxt.join("; "),res.aTot,att.by,true,"Hits","Stopped");netLog(run,txt);return ""}
/* An anti-system attack on a runner's deck: against its data walls (pg. 152). */
function netAntiSystemDeck(run,att,t){const c=pc(t.id);const dk=c&&c.deck;const who=runnerName(t);const fx=att.fx||{};const w=dk?Number(dk.wall)||0:0;
  const a={base:att.str,parts:[[att.name,att.str]]},b={base:w,parts:[["Deck data walls",w]]};const res=netOpposed(a,b,"def");let txt=`${att.by}'s ${att.name} hits ${who}'s deck: `;
  if(!res.win){txt+="the data walls hold.";netDice(att.name,netRollLine(a,b,res),res.aTot,att.by,false,"Gets in","Walls hold");netLog(run,txt);return ""}
  // it's through the walls; it takes effect next turn (pg. 153) unless something kills it first
  (t.pending||(t.pending=[])).push({name:att.name,by:att.by,fx:clone(fx),at:run.round+1});addStatus(run,t,`${att.name} inside the deck`,null,"Takes effect next turn. A Killer or GateMaster might stop it.");
  txt+=`${att.name} gets through the data walls and takes effect next turn.`;netDice(att.name,netRollLine(a,b,res),res.aTot,att.by,true,"Gets in","Walls hold");netLog(run,txt);return ""}
function netDeckEffect(run,t,pe){const fx=pe.fx||{};const who=runnerName(t);const fxt=[];t.status=t.status.filter(s=>s.t!==`${pe.name} inside the deck`);
  if(fx.crash){const n=rollN(fx.crash);t.out=true;addStatus(run,t,"Deck crashed",n,"Back in "+n+" turns");fxt.push(`the deck crashes for ${n} turns and drops them out of the Net`)}
  else if(fx.deck){fxt.push(fx.deck.toLowerCase());if(fx.out)t.out=true;addStatus(run,t,fx.wreck?"Deck wrecked":"Interface fried",null,fx.deck,true)}
  else if(fx.deckFx){fxt.push(fx.deckFx.toLowerCase());addStatus(run,t,pe.name,null,fx.deckFx,true)}
  netLog(run,`${pe.by}'s ${pe.name} goes off in ${who}'s deck: ${fxt.join("; ")||"no effect"}.`)}

/* A defence program acts against a runner. tpid: the runner's program, for Anti-IC. */
function iceAct(run,ice,tid,tpid){if(!ice||!ice.alive)return "That program is gone.";const t=run.runners[tid];if(!t||t.out)return "That runner isn't in the Net.";
  if(run.sys.crash&&run.round<run.sys.crash)return `The system is down (Krash) until round ${run.sys.crash}.`;
  if(!inRange(run,ice.x,ice.y,t.x,t.y))return `${ice.name} can't see ${runnerName(t)} from there.`;
  const fx=ice.fx||{};const by=run.fname;const who=runnerName(t);const sys=runSys(run);ice.alerted=true;
  // a runner running Stealth or Invisibility has to be noticed first (pg. 152)
  const ev=t.active["Evasion/Stealth"]&&t.progs.find(q=>q.id===t.active["Evasion/Stealth"]&&!q.derez);
  if(ev&&!t.detected){const efx=ev.fx||{};const es=fx.dog&&efx.vsDog?efx.vsDog:rProgStr(t,ev);const a={base:ice.str,parts:[[ice.name,ice.str]]},b={base:es,parts:[[ev.name,es]]};const res=netOpposed(a,b,"att");
    netDice(`${ice.name} looks for ${who}`,netRollLine(a,b,res),res.aTot,by,res.win,"Spotted","Unseen");
    if(!res.win){netLog(run,`${ice.name} doesn't notice ${who} under ${ev.name}.`);return ""}
    netLog(run,`${ice.name} sees through ${who}'s ${ev.name}.`);if(ice.cls!=="Detection/Alarm")t.detected=true}
  switch(ice.cls){
    case "Detection/Alarm":{t.detected=true;const n=alertNear(run,ice.x,ice.y,null);let txt=`${ice.name} detects ${who} and raises the alarm${n?` (${n} defence${n===1?"":"s"} alerted)`:""}.`;
      if(fx.trace)txt+=` It traces ${who}'s real location.`;if(fx.cut){t.out=true;addStatus(run,t,"Line cut",null,"Pit Bull cuts the line every time they log on from there.",true);txt+=` It cuts ${who}'s line: they're out of the Net.`}
      if(!ev)Dice.raw(`${ice.name} detects ${who}`,"No evasion program running",0,by,[{t:"Detected",c:"red"}]);netLog(run,txt);return ""}
    case "Anti-IC":{const pool=t.progs.filter(q=>!q.derez&&!q.in);let tp=tpid?t.progs.find(q=>q.id===tpid&&!q.derez):null;if(tp&&tp.in)tp=t.progs.find(q=>q.id===tp.in)||tp;
      if(fx.kills==="Demon")tp=pool.find(q=>q.cls==="Demon");else if(fx.kills==="Worm")tp=t.progs.find(q=>!q.derez&&(/worm/i.test(q.name)||(q.fx||{}).worm));
      if(!tp)tp=pool.slice().sort((a0,b0)=>(b0.cls==="Demon")-(a0.cls==="Demon")||rProgStr(t,b0)-rProgStr(t,a0))[0];
      if(!tp){netLog(run,`${ice.name} finds nothing of ${who}'s to attack.`);return fx.kills?`${ice.name} only attacks ${fx.kills}s, and ${who} has none.`:""}
      const c=pc(tid);const I=ifaceOf(c);const ts=rProgStr(t,tp);const a={base:ice.str+10,parts:[[ice.name,ice.str],["System Interface",10]]},b={base:ts+I,parts:[[tp.name,ts],["Interface",I]]};const res=netOpposed(a,b,"att");
      let txt=`${ice.name} attacks ${who}'s ${tp.name}: `;if(res.win){if(fx.kills){derezProg(t,tp);txt+="de-rezzed instantly."}else{const n=rollN(fx.prog||"1D6");tp.str=Math.max(0,tp.str-n);txt+=`${n} Strength damage`;if(tp.str<=0){derezProg(t,tp);txt+=`. ${tp.name} de-rezzes${t.progs.some(q=>q.in===tp.id)?", taking its subroutines with it":""}.`}else txt+=`, down to ${tp.str}.`}}else txt+="it misses.";
      netDice(`${ice.name} → ${tp.name}`,netRollLine(a,b,res),res.aTot,by,res.win,"Hits","Misses");netLog(run,txt);return ""}
    case "Anti-Personnel":return netAntiPersonnel(run,{name:ice.name,label:`${ice.name} → ${who}`,str:ice.str,fx,INT:sys.INT,iface:10,by,dog:!!fx.dog},t);
    case "Anti-System":return netAntiSystemDeck(run,{name:ice.name,str:ice.str,fx,by},t);}
  return `${ice.name} has nothing to attack with.`}

/* Moving: five spaces a turn, through the sides of squares (pg. 144). */
function runnerMove(run,r,x,y,byGM){if(r.out)return `${runnerName(r)} is out of the Net.`;if(hasStatus(r,"Frozen","Glued","Knocked out"))return `${runnerName(r)} can't move right now.`;
  if(!byGM&&r.moved===run.round)return "You've already moved this round.";
  if(!byGM){const reach=fortReach(run.fort,runState(run),r.x,r.y,5);if(!reach.has(fkey(x,y)))return "You can only move 5 spaces a turn, and not through walls or closed gates."}
  else if(cellBlocks(run.fort.cells[fkey(x,y)],runState(run),fkey(x,y)))return "That space is a wall or a closed gate.";
  r.x=x;r.y=y;if(!byGM)r.moved=run.round;return ""}
function netReadInto(run,r,k){const c=run.fort.cells[k];if(!c||c.t!=="mem")return;r.read[k]={n:c.n,files:(c.files||[]).map(fl=>({name:fl.name,type:fl.type,lock:Number(fl.lock)||0,docs:Number(fl.lock)?"":fl.docs||"",copied:(r.copied||[]).includes(k+"|"+fl.name)}))}}
function runnerMenu(run,r,m,byGM){const who=runnerName(r);
  if(m.cmd==="logoff"){if(r.out)return "You're already out.";if(hasStatus(r,"Can't jack out","Glued","Frozen"))return `${who} can't jack out right now.`;
    if(!byGM&&r.acted===run.round)return "You've already acted this round.";const ck=netCheckUnder(8);if(!byGM)r.acted=run.round;
    if(ck.ok){r.out=true;netLog(run,`${who} logs off.`)}else netLog(run,`${who} tries to log off and fails (rolled ${ck.roll}).`);netDice("Log off",`D10 = ${ck.roll}, needs 8 or less`,ck.roll,who,ck.ok,"Logged off","Still in");return ""}
  if(r.out)return `${who} is out of the Net.`;
  if(m.cmd==="read"){const k=fkey(m.x,m.y);const c=run.fort.cells[k];if(!c||c.t!=="mem")return "Pick a memory.";if(fortDist(r.x,r.y,m.x,m.y)>1)return "Get next to the memory first.";
    if(!byGM&&r.acted===run.round)return "You've already acted this round.";netReadInto(run,r,k);if(!byGM)r.acted=run.round;const n=(c.files||[]).length;netLog(run,`${who} reads memory ${c.n}: ${n} file${n===1?"":"s"}${c.virtual?` and a ${c.virtual.type.toLowerCase()}`:""}.`);return ""}
  if(m.cmd==="copy"){const rd=r.read[m.k];const c=run.fort.cells[m.k];const fl=rd&&c&&(c.files||[])[m.i];if(!fl)return "Read the memory first.";if(Number(fl.lock))return "That file is locked. Decrypt it first.";
    if(!byGM&&r.acted===run.round)return "You've already acted this round.";if(!byGM)r.acted=run.round;r.copied=[...(r.copied||[]),m.k+"|"+fl.name];netReadInto(run,r,m.k);
    withPc(r.id,ch=>{ch.notes=[(ch.notes||"").trim(),`Copied from ${run.fname}, memory ${c.n}: ${fl.name} (${fl.type})${fl.docs?"\n"+fl.docs:""}`].filter(Boolean).join("\n\n")});
    netLog(run,`${who} copies "${fl.name}".`);return ""}
  return "Unknown command."}
/* A new round: statuses tick down, Worms finish, crashed CPUs reboot (pg. 151). */
function netNewRound(run){run.round++;for(const r of Object.values(run.runners)){const crashed=hasStatus(r,"Deck crashed");
    const due=(r.pending||[]).filter(pe=>run.round>=pe.at);r.pending=(r.pending||[]).filter(pe=>run.round<pe.at);if(!r.out)due.forEach(pe=>netDeckEffect(run,r,pe));r.status=r.status.filter(s=>s.until==null||run.round<s.until);
    for(const s of (r.status||[]))if(s.t==="Deck crashed")s.note=`Back in ${s.until-run.round} turns`;
    if(crashed&&!hasStatus(r,"Deck crashed"))netLog(run,`${runnerName(r)}'s deck has rebooted. They can jack back in.`)}
  for(const [k,until] of Object.entries(run.opening))if(run.round>=until){delete run.opening[k];const c=run.fort.cells[k];if(c&&c.t==="gate")run.open[k]=1;else run.breach[k]=1;netLog(run,`The Worm opens the ${c&&c.t==="gate"?"code gate":"data wall"} at ${fcoord(...fxy(k))}.`)}
  if(run.sys.crash&&run.round>=run.sys.crash){run.sys.crash=0;netLog(run,"The system's CPU reboots.")}}
function netRollInit(run){const sys=runSys(run);const order=[];
  for(const r of Object.values(run.runners)){if(r.out)continue;const c=pc(r.id);if(!c)continue;const ini=netInitParts(c,calc(c),r.status);const d1=nd10();order.push({id:r.id,label:runnerName(r),tot:ini.base+d1,detail:`${partsText(ini.parts)} + ${d1}`})}
  if(sys.cpus){const d1=nd10();order.push({id:"sys",label:run.fname,tot:sys.INT+d1,detail:`INT ${sys.INT} + ${d1}`})}
  order.sort((a,b)=>b.tot-a.tot);run.order=order;run.turn=0;Dice.raw("Net initiative",order.map(o=>`${o.label} ${o.tot}`).join(" · ").slice(0,220),order[0]?order[0].tot:0,"GM");netLog(run,`Initiative: ${order.map(o=>`${o.label} ${o.tot}`).join(", ")}.`)}
function netTurnLabel(run){const o=run.order[run.turn];return o?o.label+(o.id==="sys"?` (${runSys(run).actions} action${runSys(run).actions===1?"":"s"})`:""):""}

/* ---------- what each runner sees ---------- */
function netViewFor(run,id){const r=run.runners[id];if(!r)return null;const f=run.fort;const vis=new Set(r.vis||[]);const c=pc(id);
  const cells=(r.seen||[]).filter(k=>f.cells[k]).map(k=>{const c0=f.cells[k];const o={k,t:c0.t};if(c0.t==="mem")o.n=c0.n;if(c0.t==="remote"){o.kind=c0.kind;o.label=c0.label}if(c0.t==="ldl")o.label=c0.label;
    if(run.breach[k])o.breach=1;if(run.open[k])o.open=1;if(run.opening[k])o.opening=1;if(run.wallDmg[k])o.dmg=1;if(run.ctrl[k]===id)o.ctrl=1;return o});
  return {fname:run.fname,round:run.round,turn:netTurnLabel(run),cells,vis:[...vis],
    ice:run.ice.filter(i=>i.alive&&vis.has(fkey(i.x,i.y))&&(!i.hidden||i.revealed)).map(i=>({id:i.id,name:i.name,cls:i.cls,x:i.x,y:i.y,alerted:!!i.alerted})),
    runners:Object.values(run.runners).map(o=>{const ch=pc(o.id);return {id:o.id,handle:ch?ch.handle||ch.name||"Runner":"Runner",color:ch?charColor(ch):"#3ef2ff",x:o.x,y:o.y,out:!!o.out}}),
    me:{id,x:r.x,y:r.y,out:!!r.out,detected:!!r.detected,status:(r.status||[]).map(s=>({t:s.t,note:s.note,left:s.until!=null?Math.max(0,s.until-run.round):null})),
      progs:r.progs.map(p=>({id:p.id,name:p.name,label:p.in?`${(r.progs.find(q=>q.id===p.in)||{}).name} › ${p.name}`:p.name,cls:p.cls,str:rProgStr(r,p),max:p.in?((r.progs.find(q=>q.id===p.in)||{}).max||0):p.max,derez:!!p.derez,active:Object.values(r.active).includes(p.id)})).filter(p=>p.cls!=="Demon")},
    read:r.read,log:run.log.slice(-14).map(l=>l.text)}}
const netSent=new Set();let netBT=null;
function netBroadcast(){clearTimeout(netBT);netBT=setTimeout(()=>{if(typeof Host==="undefined"||Host.status!=="online")return;const run=netRun();
  for(const [conn,info] of Host.conns){if(run&&run.runners[info.charId]){gameSendTo(conn,"net",{run:netViewFor(run,info.charId)});netSent.add(conn)}else if(netSent.has(conn)){gameSendTo(conn,"net",{run:null});netSent.delete(conn)}}},60)}
function netJoined(conn){const run=netRun();const info=Host.conns.get(conn);if(run&&info&&run.runners[info.charId]){gameSendTo(conn,"net",{run:netViewFor(run,info.charId)});netSent.add(conn)}else{gameSendTo(conn,"net",{run:null});netSent.delete(conn)}}
function netChanged(){const run=netRun();if(run)netSight(run);save();render();netBroadcast()}
/* players' moves and programs */
function cpGmMessage(conn,info,type,m){if(!["net-move","net-act","net-menu"].includes(type))return;const run=netRun();const err=msg=>gameSendTo(conn,"net-err",{msg});
  if(!run)return err("There's no run going on.");const r=run.runners[info.charId];if(!r)return err("Your runner isn't in this run.");
  const num=(v,max)=>{v=Number(v);return Number.isInteger(v)&&v>=0&&v<max?v:null};let e="";
  if(type==="net-move"){const x=num(m.x,FORT_W),y=num(m.y,FORT_H);if(x==null||y==null)return;e=runnerMove(run,r,x,y,false)}
  if(type==="net-act"){const pid=String(m.pid||"").slice(0,40);const x=m.x==null?null:num(m.x,FORT_W),y=m.y==null?null:num(m.y,FORT_H);e=runnerAct(run,r,pid,x,y,false)}
  if(type==="net-menu"){const cmd=String(m.cmd||"");if(!["logoff","read","copy"].includes(cmd))return;e=runnerMenu(run,r,{cmd,x:num(m.x,FORT_W),y:num(m.y,FORT_H),k:String(m.k||"").slice(0,8),i:num(m.i,40)},false)}
  if(e)return err(e);netChanged()}

/* ============================== THE RUN VIEW (GM) ============================== */
function viewNetRun(run){const f=run.fort;const sys=runSys(run);const rs=run.runners;const selR=ui.netRSel&&rs[ui.netRSel];const selI=ui.netISel&&run.ice.find(i=>i.id===ui.netISel&&i.alive);
  const anySeen=new Set();Object.values(rs).forEach(r=>(r.seen||[]).forEach(k=>anySeen.add(k)));const vis=selR?new Set(selR.vis||[]):null;
  const marks=[...run.ice.filter(i=>i.alive).map(i=>({kind:"ice",x:i.x,y:i.y,label:i.name,title:`${i.name} (${i.cls}, STR ${i.str}/${i.max})${i.alerted?", alerted":""}${i.hidden&&!i.revealed?", hidden":""}`,cls:[i.alerted?"alert":"",i.hidden&&!i.revealed?"hidden":"",selI&&selI.id===i.id?"on":""].join(" ")})),
    ...Object.values(rs).filter(r=>!r.out).map(r=>{const c=pc(r.id);return {kind:"runner",x:r.x,y:r.y,label:runnerName(r),color:c?charColor(c):"#3ef2ff",title:runnerName(r),cls:selR&&selR.id===r.id?"me":""}})];
  const selP=selR&&ui.netRProg&&selR.progs.find(p=>p.id===ui.netRProg);
  const reach=selR&&!selR.out&&!selP&&ui.netRMode==="move"?new Set(fortReach(f,runState(run),selR.x,selR.y,5).keys()):null;
  const hint=selI?`Click a space to move ${selI.name} there.`:selP?`Click a target for ${runnerName(selR)}'s ${selP.name}.`:selR&&ui.netRMode==="read"?"Click a memory to read.":selR?`Click a space to move ${runnerName(selR)}. Highlighted spaces are within 5.`:"Select a runner or a defence.";
  const order=run.order.length?`<div class="row" style="gap:4px">${run.order.map((o,i)=>`<span class="chip ${i===run.turn?"red":"ink"}" title="${esc(o.detail)}">${esc(o.label)} ${o.tot}</span>`).join("")}</div>`:"";
  const runnerCard=r=>{const c=pc(r.id);if(!c)return "";const k=calc(c);const on=selR&&selR.id===r.id;
    return `<div class="nr-card ${on?"on":""}"><button class="nr-name" data-act="nr-sel" data-id="${esc(r.id)}"><span class="portrait sm" style="background:${esc(charColor(c))}">${esc((c.handle||"?").charAt(0).toUpperCase())}</span><b>${esc(runnerName(r))}</b><span class="faint">${r.out?"out of the Net":fcoord(r.x,r.y)}${isOnline(r.id)?" · online":""}</span></button>
      <div class="row" style="gap:4px"><span class="chip ${woundChipClass(k.level)}">${woundLabel(k.level)} ${k.w}</span>${r.detected?`<span class="chip red">Detected</span>`:""}${(r.status||[]).map(s=>`<span class="chip amber" title="${esc(s.note||"")}">${esc(s.t)}${s.until!=null?` · ${Math.max(0,s.until-run.round)}`:""}</span>`).join("")}${r.acted===run.round?`<span class="chip ink">Acted</span>`:""}</div>
      ${on?`<div class="nr-progs">${r.progs.filter(p=>p.cls!=="Demon").map(p=>`<button class="netprog ${ui.netRProg===p.id?"on":""} ${p.derez?"derez":""} ${Object.values(r.active).includes(p.id)?"active":""}" data-act="nr-prog" data-id="${esc(p.id)}" ${p.derez||r.out?"disabled":""}><b>${esc(p.in?(r.progs.find(q=>q.id===p.in)||{}).name+" › "+p.name:p.name)}</b><span>${esc(p.cls)} · STR ${rProgStr(r,p)}</span></button>`).join("")||`<span class="faint" style="font-size:12.5px">No programs loaded.</span>`}</div>
        <div class="row" style="gap:4px"><button class="btn sm ${ui.netRMode==="read"?"blue":""}" data-act="nr-read" ${r.out?"disabled":""}>Read memory</button><button class="btn sm" data-act="nr-logoff" ${r.out?"disabled":""}>Log off roll</button><button class="btn sm ghost" data-act="nr-out">${r.out?"Jack back in":"Pull out"}</button>${r.status.length?`<button class="btn sm ghost" data-act="nr-clear">Clear statuses</button>`:""}</div>`:""}</div>`};
  const iceRow=i=>{const on=selI&&selI.id===i.id;return `<div class="nr-ice ${on?"on":""} ${i.alive?"":"dead"}"><div class="row nr-ice-h"><button class="nr-name" data-act="ni-sel" data-id="${esc(i.id)}" ${i.alive?"":"disabled"}><b>${esc(i.name)}</b><span class="faint">${esc(i.cls)} · STR ${i.str}/${i.max} · ${fcoord(i.x,i.y)}${i.alive?"":" · de-rezzed"}</span></button>
    ${i.alive?`<span class="row" style="gap:4px">${i.alerted?`<span class="chip red">Alerted</span>`:`<span class="chip ink">Waiting</span>`}${i.hidden?`<span class="chip ${i.revealed?"blue":"amber"}">${i.revealed?"Revealed":"Hidden"}</span>`:""}</span>`:""}</div>
    ${on?`<div class="row" style="gap:4px;flex-wrap:wrap"><select id="ni-target" aria-label="Target runner">${Object.values(rs).filter(r=>!r.out).map(r=>`<option value="${esc(r.id)}" ${ui.netITarget===r.id?"selected":""}>${esc(runnerName(r))}</option>`).join("")}</select>
      ${i.cls==="Anti-IC"&&!(i.fx||{}).kills?`<select id="ni-tprog" aria-label="Program to attack"><option value="" selected>Their best program</option>${Object.values(rs).filter(r=>!r.out).flatMap(r=>r.progs.filter(p=>!p.derez&&!p.in).map(p=>`<option value="${esc(p.id)}">${esc(runnerName(r))}: ${esc(p.name)}</option>`)).join("")}</select>`:""}
      <button class="btn sm primary" data-act="ni-act">${i.cls==="Detection/Alarm"?"Scan":"Attack"}</button><button class="btn sm ghost" data-act="ni-alert">${i.alerted?"Calm":"Alert"}</button>${i.hidden?`<button class="btn sm ghost" data-act="ni-reveal">${i.revealed?"Hide":"Reveal"}</button>`:""}<button class="btn sm ghost danger" data-act="ni-kill">De-rez</button></div>`:""}</div>`};
  return `<div class="nr-top panel"><div class="panel-b row" style="justify-content:space-between">
      <div class="row" style="gap:10px"><b>Round ${run.round}</b>${order}${run.sys.crash&&run.round<run.sys.crash?`<span class="chip amber">CPU down until round ${run.sys.crash}</span>`:""}${(run.sys.status||[]).filter(s=>run.round>=s.from).map(s=>`<span class="chip amber">${esc(s.t)}</span>`).join("")}</div>
      <div class="row" style="gap:6px"><button class="btn" data-act="nr-init">Roll Net initiative</button><button class="btn primary" data-act="nr-next">${run.order.length?"Next turn →":"Next round →"}</button><button class="btn sm ghost" data-act="nr-alert-all">Alert the system</button><button class="btn danger" data-act="nr-end">${ui.confirm==="nr-end"?"Confirm: end the run":"End the run"}</button></div></div></div>
    <div class="nr-layout">
      <div style="min-width:0;display:grid;gap:8px;align-content:start"><p class="faint" style="margin:0;font-size:12.5px" aria-live="polite">${esc(hint)}${selP||selI||ui.netRMode==="read"?` <button class="btn sm ghost" data-act="nr-cancel">Cancel</button>`:""}</p>
        <div class="ng-wrap">${netGridHTML({cell:k=>f.cells[k]||null,fog:k=>vis?(vis.has(k)?"":anySeen.has(k)?"dim":"gm"):anySeen.has(k)?"":"gm",marks,reach,act:"nr-cell",state:runState(run),gm:true,wallStr:sys.wallStr,cls:"run",label:run.fname})}</div>
        <p class="faint" style="margin:0;font-size:12px">You see everything. ${selR?`Dimmed: what ${esc(runnerName(selR))} has seen before but can't see now. Darker: what no runner has seen.`:"Darker: what no runner has seen yet."}</p>
        <section class="netlog nr-log"><h3>Log</h3>${run.log.slice().reverse().slice(0,40).map(l=>`<div><span class="faint mono">R${l.r}</span> ${esc(l.text)}</div>`).join("")}</section></div>
      <aside class="nr-side">
        <section><h3>Runners</h3>${Object.values(rs).map(runnerCard).join("")}</section>
        <section><h3>${esc(run.fname)} <span class="faint mono" style="font-size:12px">INT ${sys.INT} · Interface 10 · ${sys.actions} action${sys.actions===1?"":"s"} · walls ${sys.wallStr}</span></h3>${run.ice.length?run.ice.map(iceRow).join(""):`<p class="faint" style="margin:0;font-size:13px">No defences.</p>`}</section>
      </aside></div>`}
function netDo(e){if(e){showNotice(e);return}netChanged()}
Object.assign(A,{
  "nr-sel":el=>{ui.netRSel=ui.netRSel===el.dataset.id?null:el.dataset.id;ui.netISel=null;ui.netRProg=null;ui.netRMode="move";render()},
  "ni-sel":el=>{ui.netISel=ui.netISel===el.dataset.id?null:el.dataset.id;ui.netRSel=null;ui.netRProg=null;render()},
  "nr-cancel":()=>{ui.netRProg=null;ui.netISel=null;ui.netRMode="move";render()},
  "nr-prog":el=>{const run=netRun();const r=run&&run.runners[ui.netRSel];const p=r&&r.progs.find(q=>q.id===el.dataset.id);if(!p)return;
    if(NET_TARGETS.has(p.cls)){ui.netRProg=ui.netRProg===p.id?null:p.id;ui.netRMode="move";render();return}netDo(runnerAct(run,r,p.id,null,null,true))},
  "nr-read":()=>{ui.netRMode=ui.netRMode==="read"?"move":"read";ui.netRProg=null;render()},
  "nr-logoff":()=>{const run=netRun();const r=run&&run.runners[ui.netRSel];if(r)netDo(runnerMenu(run,r,{cmd:"logoff"},true))},
  "nr-out":()=>{const run=netRun();const r=run&&run.runners[ui.netRSel];if(!r)return;r.out=!r.out;if(!r.out){const [x,y]=netEntry(run.fort);if(cellBlocks(run.fort.cells[fkey(r.x,r.y)],runState(run),fkey(r.x,r.y))){r.x=x;r.y=y}}netLog(run,`${runnerName(r)} ${r.out?"is pulled out of":"jacks back into"} the Net.`);netChanged()},
  "nr-clear":()=>{const run=netRun();const r=run&&run.runners[ui.netRSel];if(!r)return;r.status=[];r.pending=[];r.intLoss=0;netChanged()},
  "nr-cell":el=>{const run=netRun();if(!run)return;const x=Number(el.dataset.x),y=Number(el.dataset.y);
    if(ui.netISel){const i=run.ice.find(q=>q.id===ui.netISel);if(i){if(cellBlocks(run.fort.cells[fkey(x,y)],runState(run),fkey(x,y))){showNotice("Programs can't move into walls or closed gates.");return}i.x=x;i.y=y;netChanged()}return}
    const r=ui.netRSel&&run.runners[ui.netRSel];
    if(r&&ui.netRProg){const e=runnerAct(run,r,ui.netRProg,x,y,true);if(!e)ui.netRProg=null;netDo(e);return}
    if(r&&ui.netRMode==="read"){const e=runnerMenu(run,r,{cmd:"read",x,y},true);if(!e)ui.netRMode="move";netDo(e);return}
    if(r&&!r.out){const hit=runnerAt(run,x,y,r.id);const ice=iceAt(run,x,y)[0];if(hit&&!(hit.x===r.x&&hit.y===r.y)){ui.netRSel=hit.id;render();return}if(ice&&fortDist(r.x,r.y,x,y)>0&&!(fortReach(run.fort,runState(run),r.x,r.y,5).has(fkey(x,y)))){ui.netISel=ice.id;ui.netRSel=null;render();return}
      netDo(runnerMove(run,r,x,y,true));return}
    const hit=runnerAt(run,x,y);if(hit){ui.netRSel=hit.id;render();return}const ice=iceAt(run,x,y)[0];if(ice){ui.netISel=ice.id;render()}},
  "ni-act":()=>{const run=netRun();const i=run&&run.ice.find(q=>q.id===ui.netISel);if(!i)return;const t=document.getElementById("ni-target");const tp=document.getElementById("ni-tprog");ui.netITarget=t&&t.value;netDo(iceAct(run,i,t&&t.value,tp&&tp.value))},
  "ni-alert":()=>{const run=netRun();const i=run&&run.ice.find(q=>q.id===ui.netISel);if(!i)return;i.alerted=!i.alerted;netChanged()},
  "ni-reveal":()=>{const run=netRun();const i=run&&run.ice.find(q=>q.id===ui.netISel);if(!i)return;i.revealed=!i.revealed;netChanged()},
  "ni-kill":()=>{const run=netRun();const i=run&&run.ice.find(q=>q.id===ui.netISel);if(!i)return;i.alive=false;i.str=0;netLog(run,`${i.name} is de-rezzed.`);ui.netISel=null;netChanged()},
  "nr-alert-all":()=>{const run=netRun();if(!run)return;const n=alertNear(run,0,0,null);netLog(run,n?`The system goes on alert: ${n} defence${n===1?"":"s"} wake up.`:"The system is already on alert.");netChanged()},
  "nr-init":()=>{const run=netRun();if(!run)return;netRollInit(run);netChanged()},
  "nr-next":()=>{const run=netRun();if(!run)return;if(run.order.length){run.turn++;if(run.turn>=run.order.length){run.turn=0;netNewRound(run);netLog(run,`Round ${run.round}.`)}}else{netNewRound(run);netLog(run,`Round ${run.round}.`)}netChanged()},
  "nr-end":()=>{if(ui.confirm!=="nr-end"){ui.confirm="nr-end";render();return}ui.confirm=null;const run=netRun();if(run)snapshot(`Ended the run on ${run.fname}`,true);netState().run=null;ui.netTab="forts";netChanged()},
});

/* ============================== REFERENCE ============================== */
function netRefTables(){const t=(title,head,rows)=>`<section class="panel"><div class="panel-h"><h3>${title}</h3></div><div class="panel-b tbl-wrap"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
  return t("Net combat",["Roll","Attacker","Defender"],[["Initiative","Runner: REF + deck Speed + 1D10","System: INT + 1D10"],["Intrusion, anti-system","Program STR + 1D10","Data wall STR + 1D10 (must beat it)"],["Decryption","Program STR + 1D10","Code gate or file lock STR + 1D10"],["Stealth & detection","Program STR + 1D10","Program STR + 1D10"],["Anti-personnel","STR + INT + Interface + 1D10","Protection STR + INT + Interface + 1D10 (ties: attacker)"],["Anti-IC","Interface + STR + 1D10","Target STR + Interface + 1D10"],["Controllers, utilities","1D10 ≤ program STR",""],["Log off","1D10 ≤ 8",""]])
    +t("A Net turn",["Rule","Detail"],[["Length","One second"],["Runner","Move 5 spaces and take one action"],["System","One action, plus one for every two CPUs after the first"],["Range","See and attack anything within 20 spaces that isn't blocked"],["Movement","Straight lines through the sides of squares, never the corners"],["Defences","Move 5 once they spot you; most stay inside the walls. Hellhound, Killers and Demons patrol 1 space outside; Dogs follow you anywhere"],["'Trodes / keyboard","−2 / −4 REF in the Net; keyboards stop anti-personnel attacks except Firestarter"]])
    +t("Building a system",["Part","Rule"],[["CPU","10,000eb each, at most 7. +3 INT each; INT 12+ is an AI. Each comes with 4 memories, a code gate and a terminal"],["Memory","10 MU each; files take 1 MU; place next to a CPU or memory"],["Data walls","Strength = CPUs; +1,000eb a level, to 10"],["Code gates","Strength 2; +1,000eb a level, to 10; extra gates 2,000eb"],["Skills","5 per 2 CPUs; level 4 for 200eb, +100eb a level"],["Terminals","Extra ones 5,000eb"],["Interface","A system's Interface is 10"]])
    +t("Fast fortress",["Step","Roll"],[["CPUs","1D6"],["Data walls","1D6/2 + CPUs"],["Each code gate","1D6/2 + CPUs"],["Skills","5, each at 1D6 + 4"],["Files","2 per memory"],["Virtual","1D6: 5–6"],["Defences","1D6 + CPUs"],["Remotes","1D6"]])}
{const _vr=viewReference;viewReference=function(){return _vr()+`<div class="roster-head" style="margin-top:22px"><h1><small>Quick reference</small>Netrunning</h1></div><div class="ref-grid">${netRefTables()}</div>`}}
/* a runner's deck and programs on the GM's runner page */
{const _vp=viewPc;viewPc=function(c){const h=_vp(c);if(!c.deck&&!(c.programs||[]).length)return h;const dk=c.deck;
  return h+`<section class="panel" style="margin-top:14px"><div class="panel-h"><h3>Netrunning</h3>${dk?`<span class="chip ink">${esc(dk.name)} · Speed ${sgn(Number(dk.speed)||0)} · walls ${esc(dk.wall)} · ${muUsed(c)}/${esc(dk.mu)} MU</span>`:`<span class="chip amber">No deck</span>`}</div>
    <div class="panel-b" style="font-size:14px;display:grid;gap:3px">${(c.programs||[]).map(p=>`<div>${esc(progLabel(c,p))} <span class="faint mono">${esc(p.cls)} · STR ${progEffStr(c,p)}${p.loaded||p.in?"":" · on chip"}</span></div>`).join("")||`<span class="faint">No programs.</span>`}</div></section>`}}
function progEffStr(c,p){if(p.in){const d0=(c.programs||[]).find(x=>x.id===p.in);if(d0)return Number(d0.str)||0}return Number(p.str)||0}
function progLabel(c,p){if(p.in){const d0=(c.programs||[]).find(x=>x.id===p.in);if(d0)return `${d0.name} › ${p.name}`}return p.name}
