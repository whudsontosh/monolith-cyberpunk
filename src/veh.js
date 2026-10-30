/* Cyberpunk 2020 · vehicles (1.2.0), from "Vehicles in FNFF" (book pg. 113) and the vehicles in the gear list
   (pg. 68, 71) and in All Things Dark & Cyberpunk (pg. 181–182). Control rolls with the book's maneuvers and
   modifiers, the Control Loss table, armor and structural damage, and crashing and ramming. Shared by both apps. */

/* name, kind (control modifier row), skill, top speed (mph), SDP, SP, price, seats, notes.
   The core book gives no SDP for bikes and scooters: those are marked est and the GM can change them. */
const VEHICLES=[
 {name:"Scooter",kind:"Motorcycle",skill:"Motorcycle",speed:50,sdp:20,est:true,sp:0,cost:500,seats:1,note:"Electric, about 6 hours a charge."},
 {name:"Motorcycle",kind:"Motorcycle",skill:"Motorcycle",speed:140,sdp:30,est:true,sp:0,cost:1500,seats:2,note:"Recumbent with fairings. Electric ones do 65 mph; CHOOH2 ones 140."},
 {name:"CityCar",kind:"Standard car",skill:"Driving",speed:40,sdp:50,sp:0,cost:2000,seats:1,note:"A three-wheeler; two in a pinch. 4 hours a charge."},
 {name:"Small subcompact",kind:"Standard car",skill:"Driving",speed:90,sdp:50,sp:0,cost:6000,seats:4,note:"Methanol or CHOOH2. A ten-gallon tank."},
 {name:"Medium sedan",kind:"Standard car",skill:"Driving",speed:90,sdp:50,sp:0,cost:10000,seats:4,note:"Like the Toyo-Chrysler Omega. A fifteen-gallon tank."},
 {name:"Sportscar",kind:"Sportscar",skill:"Driving",speed:210,sdp:50,sp:0,cost:20000,seats:2,note:"Almost always CHOOH2. A ten-gallon tank."},
 {name:"Luxury sedan",kind:"Standard car",skill:"Driving",speed:90,sdp:50,sp:0,cost:40000,seats:6,note:"A twenty-gallon tank."},
 {name:"Limousine",kind:"Limousine",skill:"Driving",speed:90,sdp:50,sp:0,cost:0,seats:8,note:"No price in the core book."},
 {name:"Truck",kind:"Truck",skill:"Driving",speed:80,sdp:50,est:true,sp:0,cost:0,seats:2,note:"No price or structure in the core book."},
 {name:"Bell F-152 Aerogyro",kind:"Rotorcraft",skill:"Pilot (Gyro)",speed:300,sdp:40,sp:0,cost:0,seats:1,air:true,note:"A one-man helicopter for police, corps and gangs. 50-mile radius."},
 {name:"Bell Boeing V-22B Osprey",kind:"Osprey",skill:"Pilot (Gyro)",speed:316,sdp:200,sp:0,cost:0,seats:12,air:true,note:"Tilt-rotor. 275 knots, 600-mile range. Not armored."},
 {name:"AV-4 Tactical Urban Assault Vehicle",kind:"AV-4",skill:"Pilot (Vect. Thrust)",speed:350,sdp:100,sp:40,cost:0,seats:6,air:true,note:"Trauma Team's ride. Usually armored to SP 40, often with 2 belly miniguns. 400-mile radius."},
 {name:"AV-6 Combat Assault Aerodyne",kind:"AV-6",skill:"Pilot (Vect. Thrust)",speed:480,sdp:100,sp:40,cost:0,seats:6,air:true,note:"Military. Chin turret 20mm cannon, rockets and missiles. 600-mile radius."},
 {name:"AV-7 Personal Aerodyne",kind:"AV-7",skill:"Pilot (Vect. Thrust)",speed:250,sdp:50,sp:0,cost:0,seats:4,air:true,note:"The light-helicopter role, with body shells by BMW, Mercedes, Toyota and Maserati."},
 {name:"Boat",kind:"Boat",skill:"Driving",speed:40,sdp:50,est:true,sp:0,cost:0,seats:6,note:"No stats in the core book."}];
const VEH_BY_NAME=Object.fromEntries(VEHICLES.map(v=>[v.name,v]));
const VEH_CONTROL={"Standard car":0,"Limousine":-3,"Sportscar":2,"AV-4":-2,"AV-6":2,"AV-7":1,"Motorcycle":1,"Truck":-4,"Rotorcraft":0,"Osprey":0,"Boat":-1};
const VEH_MANEUVERS=[[15,"Simple","Swerve, take off or land, hover, rotate"],[20,"Difficult","Tight turn, control a skid, recover from a stall, emergency stop, pull out of a dive, reverse or pull away"],[25,"Very Difficult","Bootlegger turn, regain control from a spin"]];
const VEH_SPEEDS=[[0,"Safe speed"],[-2,"Double safe speed"],[-4,"Triple safe speed"],[-6,"Four times safe speed"]];
const VEH_WEIGHTS=[[0.5,"Very light (small box, feathers)"],[1,"Light (man, large box)"],[2,"Medium (motorcycle)"],[3,"Heavy (car)"],[4,"Very heavy (truck, the ground)"]];
const VEH_LOSS=[[1,2,"Skid or slew; no other result."],[3,4,"Major skid: slide {ft} feet sideways in the direction of travel.","Stall: lose {alt} feet of altitude."],[5,6,"Rolls after sliding {ft} feet sideways in the direction of travel: the vehicle takes 5D6.","Spin: lose {alt} feet of altitude."]];

function mkVehicle(v,cyber){return {id:uid(),name:v.name,kind:v.kind,skill:v.skill,speed:v.speed,sdp:v.sdp,sdpDmg:0,sp:v.sp,cost:(v.cost||0)*(cyber?2:1),seats:v.seats,air:!!v.air,cyber:!!cyber,notes:""}}
function vehState(v){const s=Number(v.sdp)||0,d=Number(v.sdpDmg)||0;return d>=s&&s>0?"wrecked":d>0?"damaged":"ok"}
// hits on a vehicle: no locations; its SP comes off (halved by AP), the rest comes off its SDP
function vehHit(v,amt,ap){const sp=ap?Math.floor((Number(v.sp)||0)/2):Number(v.sp)||0;const pen=Math.max(0,amt-sp);const left=Math.max(0,(Number(v.sdp)||0)-(Number(v.sdpDmg)||0)-pen);
  return {pen,text:pen?`${amt} − SP ${sp}${ap?" (AP halves)":""} = ${pen} structural damage. ${left?`${left} SDP left.`:`Down to 0 SDP: destroyed or out of action.`}`:`${amt} damage vs SP ${sp}: stopped by the armor.`}}
/* a control roll: REF + Driving/Piloting + 1D10 + modifiers against the maneuver (pg. 113). On a failure, 1D6 on the
   Control Loss table. Cyber controls with low impedance cables add +1 (pg. 70). */
function vehDriver(c){if(c.drv)return c.drv;const k=calc(c);return {name:c.handle||c.name||"Driver",ref:k.eff.REF,skill:n=>skillLevel(c,n),
  cables:(c.gear||[]).some(g=>/^Low impedance cables/i.test(g.name))||(c.cyber||[]).some(x=>!x.off&&/^Low impedance cables/i.test(x.name||""))}}
function vehControlParts(c,v,o){const dr=vehDriver(c);const parts=[["REF",dr.ref],[v.skill,dr.skill(v.skill)]];const vm=VEH_CONTROL[v.kind]||0;if(vm)parts.push([v.kind,vm]);
  const sp=Number(o.speed)||0;if(sp)parts.push([(VEH_SPEEDS.find(x=>x[0]===sp)||[0,"Speed"])[1],sp]);
  if(v.cyber&&dr.cables)parts.push(["Low impedance cables",1]);
  if(Number(o.mod))parts.push(["Modifier",Number(o.mod)]);return parts}
function vehLoss(v,who){const r=d(6);const row=VEH_LOSS.find(x=>r>=x[0]&&r<=x[1]);let t=(v.air&&row[3]?row[3]:row[2]);
  t=t.replace("{ft}",String(d(10)*10)).replace("{alt}",String(d(10)*(r<=4?50:100)));let dmg=0;
  if(r>=5&&!v.air){const rr=rollDice("5D6");dmg=rr?rr.total:0;t+=` (${rr?rr.text:""} = ${dmg})`}
  Dice.raw(`${v.name}: loss of control`,`1D6 = ${r}: ${t}`,r,who,[{t:r<=2?"Skid":r<=4?(v.air?"Stall":"Major skid"):(v.air?"Spin":"Rollover"),c:r<=2?"amber":"red"}]);return {r,dmg,text:t}}
function vehControlRoll(c,v,o){const parts=vehControlParts(c,v,o);const base=parts.reduce((a,p)=>a+p[1],0);const dv=Number(o.dv)||15;const who=vehDriver(c).name;
  const e=Dice.check(`${(VEH_MANEUVERS.find(x=>x[0]===dv)||[0,"Control"])[1]} maneuver · ${v.name} (${v.skill})`,base,{dv,who,area:"none"});
  const ok=e.total>=dv&&!e.fumble;const out={ok,e,parts,base,dv,loss:null};if(!ok)out.loss=vehLoss(v,who);return out}
/* crashing and ramming: speed ÷ 20 (round down) D6, × the weight of what you hit. The vehicle takes that many dice
   to its SDP; everyone inside takes half the dice. */
function vehCrash(v,mph,mult,who){const base=Math.floor(Math.max(0,Number(mph)||0)/20);const n=Math.floor(base*(Number(mult)||1));const half=Math.floor(n/2);
  const rv=n?rollDice(n+"D6"):null,ro=half?rollDice(half+"D6"):null;const vd=rv?rv.total:0,od=ro?ro.total:0;
  Dice.raw(`${v.name} crashes at ${mph} mph`,`${mph} ÷ 20 = ${base}D6 × ${mult} = ${n}D6 to the vehicle${rv?` (${rv.text} = ${vd})`:""}. Everyone inside takes ${half}D6${ro?` (${ro.text} = ${od})`:""}.`,vd,who,[{t:`Vehicle ${vd}`,c:"red"},{t:`Occupants ${od}`,c:"amber"}]);
  return {n,half,vd,od}}

/* ---------- the shared garage panel (player sheet and GM page) ---------- */
function vehCardHTML(c,v,ctx){const st=vehState(v);const left=Math.max(0,(Number(v.sdp)||0)-(Number(v.sdpDmg)||0));const id=esc(v.id),cid=esc(c.id);
  return `<div class="veh">
    <div class="row" style="justify-content:space-between;gap:8px"><div style="min-width:0"><b>${esc(v.name)}</b>${v.cyber?` <span class="chip blue">Cyber controls</span>`:""} <span class="chip ${st==="ok"?"green":st==="damaged"?"amber":"red"}">${st==="ok"?"Running":st==="damaged"?"Damaged":"Wrecked"}</span></div>
      ${ctx.ed?`<div class="row" style="gap:4px"><button class="btn sm" data-act="veh-control" data-id="${cid}" data-v="${id}" ${st==="wrecked"?"disabled":""}>Control roll…</button>${ctx.noRm?"":`<button class="btn sm ghost" data-act="veh-rm" data-id="${cid}" data-v="${id}">${ui.confirm===v.id?"Confirm":"Remove"}</button>`}</div>`:""}</div>
    <div class="veh-stats mono"><span>${esc(v.skill)}</span><span>${VEH_CONTROL[v.kind]?`Control ${sgn(VEH_CONTROL[v.kind])}`:"Control +0"}</span><span>${v.speed} mph</span><span>SP ${v.sp||0}</span><span>${v.seats} seat${v.seats===1?"":"s"}</span></div>
    <div class="cy-sdp"><span class="label">Structure</span><div class="sdp-bar"><i style="width:${v.sdp?Math.min(100,(Number(v.sdpDmg)||0)/v.sdp*100):0}%"></i></div><span class="mono">${left}/${v.sdp} SDP</span>
      ${ctx.ed?`<span class="row" style="gap:2px;flex-wrap:nowrap"><button class="icon-btn" data-act="veh-sdp" data-id="${cid}" data-v="${id}" data-d="-1" aria-label="Repair 1">−</button><button class="icon-btn" data-act="veh-sdp" data-id="${cid}" data-v="${id}" data-d="1" aria-label="Damage 1">+</button>${v.sdpDmg?`<button class="btn sm ghost" data-act="veh-sdp" data-id="${cid}" data-v="${id}" data-d="reset">Repaired</button>`:""}</span>`:""}</div>
    ${ctx.ed?`<div class="row" style="gap:6px;flex-wrap:wrap"><input type="number" min="0" max="999" id="vh-${id}" placeholder="Damage" style="width:90px" aria-label="Damage to the vehicle"><label class="row" style="gap:3px;font-size:13px"><input type="checkbox" id="vap-${id}">AP</label><button class="btn sm" data-act="veh-hit" data-id="${cid}" data-v="${id}">Hit the vehicle</button>
      <span class="faint" style="font-size:12px">or a crash at</span><input type="number" min="0" max="999" id="vs-${id}" placeholder="mph" style="width:70px" aria-label="Speed in mph"><select id="vw-${id}" class="sm" aria-label="What you hit">${VEH_WEIGHTS.map(([m,l])=>`<option value="${m}" ${m===3?"selected":""}>${esc(l)} ×${m}</option>`).join("")}</select><button class="btn sm ghost" data-act="veh-crash" data-id="${cid}" data-v="${id}">Crash</button></div>`:""}
    ${v.last?`<div class="calc-out" style="font-size:13px">${esc(v.last)}</div>`:""}
    ${v.notes?`<div class="faint" style="font-size:12.5px">${esc(v.notes)}</div>`:""}</div>`}
function vehOf(c,id){return (c.vehicles||[]).find(x=>x.id===id)}
Object.assign(A,{
  "veh-sdp":el=>vehEdit(el.dataset.id,c=>{const v=vehOf(c,el.dataset.v);if(!v)return;v.sdpDmg=el.dataset.d==="reset"?0:clamp((Number(v.sdpDmg)||0)+Number(el.dataset.d),0,Number(v.sdp)||0);if(el.dataset.d==="reset")v.last=""}),
  "veh-hit":el=>{const amt=Number((document.getElementById("vh-"+el.dataset.v)||{}).value)||0;if(!amt){showNotice("Enter the damage first.");return}const ap=!!(document.getElementById("vap-"+el.dataset.v)||{}).checked;
    vehEdit(el.dataset.id,c=>{const v=vehOf(c,el.dataset.v);if(!v)return;const r=vehHit(v,amt,ap);v.sdpDmg=clamp((Number(v.sdpDmg)||0)+r.pen,0,Number(v.sdp)||0);v.last=r.text})},
  "veh-crash":el=>{const mph=Number((document.getElementById("vs-"+el.dataset.v)||{}).value)||0;if(!mph){showNotice("Enter the speed in mph.");return}const mult=Number((document.getElementById("vw-"+el.dataset.v)||{}).value)||1;
    vehEdit(el.dataset.id,c=>{const v=vehOf(c,el.dataset.v);if(!v)return;const r=vehCrash(v,mph,mult,vehDriver(c).name);v.sdpDmg=clamp((Number(v.sdpDmg)||0)+r.vd,0,Number(v.sdp)||0);
      v.last=`Crash: ${r.vd} to the vehicle (${r.n}D6). Everyone inside takes ${r.od} (${r.half}D6), applied to each passenger's location as the GM rules.`})},
  "veh-rm":el=>{if(ui.confirm!==el.dataset.v){ui.confirm=el.dataset.v;render();return}vehEdit(el.dataset.id,c=>{c.vehicles=(c.vehicles||[]).filter(x=>x.id!==el.dataset.v);ui.confirm=null})},
  "veh-control":el=>{ui.vc={cid:el.dataset.id,vid:el.dataset.v,dv:(ui.vc&&ui.vc.dv)||15,speed:0,mod:0,last:null};ui.modal="vehcontrol";renderModal()},
  "vc-set":el=>{const u=ui.vc;if(!u)return;u[el.dataset.k]=Number(el.dataset.v);u.last=null;renderModal()},
  "vc-roll":()=>{const u=ui.vc;if(!u)return;const c=vehChar(u.cid);const v=c&&vehOf(c,u.vid);if(!v)return;const r=vehControlRoll(c,v,u);u.last=r;
    if(r.loss&&r.loss.dmg)vehEdit(u.cid,cc=>{const vv=vehOf(cc,u.vid);if(vv){vv.sdpDmg=clamp((Number(vv.sdpDmg)||0)+r.loss.dmg,0,Number(vv.sdp)||0);vv.last=`Rolled over: ${r.loss.dmg} to the vehicle.`}});renderModal()},
});
MODALS.vehcontrol=()=>{const u=ui.vc;const c=u&&vehChar(u.cid);const v=c&&vehOf(c,u.vid);if(!v)return null;const parts=vehControlParts(c,v,u);const base=parts.reduce((a,p)=>a+p[1],0);const r=u.last;
  return {title:"Control roll",body:`<div style="display:grid;gap:12px">
    <div><span class="label">${esc(vehDriver(c).name)} at the controls of</span><div class="ck-name">${esc(v.name)}</div><div class="faint mono" style="font-size:12.5px">${parts.map(p=>`${esc(p[0])} ${p[1]}`).join(" + ")} = ${base} + 1D10</div></div>
    <div><span class="label">The maneuver</span><div class="ck-dv">${VEH_MANEUVERS.map(([dv,l,ex])=>`<button class="${Number(u.dv)===dv?"on":""}" data-act="vc-set" data-k="dv" data-v="${dv}" title="${esc(ex)}"><b>${dv}</b><span>${l}</span></button>`).join("")}</div><span class="faint" style="font-size:12px">${esc((VEH_MANEUVERS.find(x=>x[0]===Number(u.dv))||VEH_MANEUVERS[0])[2])}.</span></div>
    <div><span class="label">Speed</span><span class="seg">${VEH_SPEEDS.map(([m,l])=>`<button class="${Number(u.speed)===m?"on":""}" data-act="vc-set" data-k="speed" data-v="${m}">${l}${m?` ${m}`:""}</button>`).join("")}</span></div>
    <div class="row" style="gap:6px"><span class="label">Modifier</span><button class="icon-btn" data-act="vc-set" data-k="mod" data-v="${(Number(u.mod)||0)-1}" aria-label="Lower">−</button><b class="num">${sgn(Number(u.mod)||0)}</b><button class="icon-btn" data-act="vc-set" data-k="mod" data-v="${(Number(u.mod)||0)+1}" aria-label="Raise">+</button><span class="faint" style="font-size:12px">Weather, damage, GM calls</span></div>
    <button class="btn primary ck-go" data-act="vc-roll">Roll ${base} + D10 vs ${u.dv}</button>
    ${r?`<div class="ck-res ${r.ok?"good":"bad"}"><div class="tot num">${r.e.total}</div><div style="min-width:0"><div class="verdict">${r.ok?"In control":"Lost control"}</div><div class="det mono">${esc(r.e.detail)}</div>${r.loss?`<div class="det"><span class="chip red">Control loss ${r.loss.r}</span> ${esc(r.loss.text)}</div>`:""}</div></div>`:""}
    <p class="faint" style="margin:0;font-size:12px">REF + Driving or Piloting + 1D10 + modifiers, against the maneuver. Fail, and 1D6 on the Control Loss table.</p></div>`}};
function vehRefTables(t){return `
  ${t("Vehicle control",["Maneuver","Control number"],VEH_MANEUVERS.map(([dv,l,ex])=>[`${l}: ${esc(ex)}`,dv]))}
  ${t("Control modifiers",["Vehicle or speed","Modifier"],[...Object.entries(VEH_CONTROL).map(([k,v])=>[esc(k),sgn(v)]),...VEH_SPEEDS.slice(1).map(([m,l])=>[l,sgn(m)])])}
  ${t("Control loss (1D6)",["Roll","Ground","Air"],[["1–2","Skid or slew","Skid or slew"],["3–4","Major skid: slide 1D10×10 ft","Stall: lose 1D10×50 ft"],["5–6","Roll over after sliding 1D10×10 ft; 5D6 damage","Spin: lose 1D10×100 ft"]])}
  ${t("Vehicle damage",["Rule","Detail"],[["Hits","No locations. SP comes off, the rest off its SDP"],["0 SDP","Destroyed or out of action"],["Crash or ram","Speed ÷ 20 D6, × weight; occupants take half the dice"],["Weight","Very light ×½ · light ×1 · medium ×2 · heavy ×3 · very heavy ×4"]])}
  ${t("Vehicles",["Vehicle","Speed","SDP","SP","Price"],VEHICLES.map(v=>[esc(v.name),v.speed+" mph",v.sdp+(v.est?"*":""),v.sp||0,v.cost?fmtEb(v.cost):"—"]))}`}
