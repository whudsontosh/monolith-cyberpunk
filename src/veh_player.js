/* Cyberpunk 2020 · the runner's side of vehicles (1.2.0): bought vehicles go to a Garage on the Gear & cash tab,
   with cyber controls as a shop option, control rolls, hits and crashes. */
function vehChar(id){const c=curChar();return c&&(!id||c.id===id)?c:null}
function vehEdit(id,fn){mutate(fn)}
function vehGarageHTML(c,ed){const L=c.vehicles||[];
  return `<section class="panel garage"><div class="panel-h"><h3>Garage</h3>${ed?`<button class="btn sm" data-act="open-modal" data-m="shop" data-tab="Gear" title="Vehicles are in the gear shop">+ Buy a vehicle</button>`:""}</div>
    <div class="panel-b" style="display:grid;gap:10px">${L.length?L.map(v=>vehCardHTML(c,v,{ed})).join(""):`<p class="faint" style="margin:0">No wheels. Vehicles are at the bottom of the gear shop.</p>`}</div></section>`}
{const _tg=tabGear;tabGear=function(c,k,ed){return _tg(c,k,ed).replace(`<section class="panel"><div class="panel-h"><h3>Lifestyle</h3>`,vehGarageHTML(c,ed)+`<section class="panel"><div class="panel-h"><h3>Lifestyle</h3>`)}}
// the shop: an option for cyber controls, and stats on each vehicle row
{const _sb=shopBody;shopBody=function(c){let h=_sb(c);if(ui.shopTab!=="Gear")return h;
  h=h.replace(`<div class="shop-split">`,`<div class="row"><label class="row" style="gap:6px" title="Vehicles with cybernetic controls cost twice the price (pg. 70); you need a vehicle link to use them"><input type="checkbox" data-act-change="shop-vcyber" ${ui.vehCyber?"checked":""}> Vehicles with cyber controls (2× price)</label></div><div class="shop-split">`);
  GEAR.forEach((g,i)=>{const v=g[2]==="Vehicles"&&VEH_BY_NAME[g[0]];if(!v)return;const cost=g[1]*(ui.vehCyber?2:1);
    h=h.replace(`<div class="shop-row" data-info="g:${i}"><div style="min-width:0"><div class="t" tabindex="0" role="button" aria-label="${esc(g[0])}: what it does">${esc(g[0])} <span class="ii-i" aria-hidden="true">i</span></div></div><span class="pr">${fmtEb(g[1])}</span>`,
      `<div class="shop-row" data-info="g:${i}"><div style="min-width:0"><div class="t" tabindex="0" role="button" aria-label="${esc(g[0])}: what it does">${esc(g[0])} <span class="ii-i" aria-hidden="true">i</span></div><div class="m">${v.speed} mph · SDP ${v.sdp}${v.est?" (est.)":""} · ${v.seats} seat${v.seats===1?"":"s"} · ${esc(v.skill)}</div></div><span class="pr">${fmtEb(cost)}</span>`)
    if(ui.vehCyber&&!ui.shopFree&&c.eb<cost)h=h.replace(new RegExp(`(data-act="buy" data-k="g" data-i="${i}")(?! disabled)`),`$1 disabled title="Not enough cash"`)});
  return h}}
Object.assign(CHANGE,{"shop-vcyber":el=>{ui.vehCyber=el.checked;renderModal()}});
{const _buy=A.buy;A.buy=el=>{const i=Number(el.dataset.i);const g=el.dataset.k==="g"&&GEAR[i];const v=g&&g[2]==="Vehicles"&&VEH_BY_NAME[g[0]];if(!v)return _buy(el);
  const c=curChar();if(!c||!canEditChar(c))return _buy(el);const cy=!!ui.vehCyber;const it=mkVehicle({...v,cost:g[1]},cy);
  if(!ui.shopFree&&(Number(c.eb)||0)<it.cost){showNotice("Not enough cash.");return}
  (c.vehicles||(c.vehicles=[])).push(it);if(!ui.shopFree)c.eb=(Number(c.eb)||0)-it.cost;saveChar(c);renderModal();showNotice(`${ui.shopFree?"Added":"Bought"} ${it.name}${cy?" with cyber controls":""}. It's in your Garage.`);if(ui.view!=="roster")render()}}
// item cards: the vehicle's numbers
{const _gi=gearInfo;gearInfo=function(g){const name=g.name||g[0];const v=VEH_BY_NAME[name];const h=_gi(g);if(!v||(g[2]&&g[2]!=="Vehicles"))return h;
  return h.replace(`<div class="ii-b"></div>`,`<div class="ii-b">${iiRow("Top speed",v.speed+" mph")}${iiRow("Structure",v.sdp+" SDP"+(v.est?" (estimate: the book gives none)":""))}${iiRow("Armor",v.sp?"SP "+v.sp:"None")}${iiRow("Seats",v.seats)}${iiRow("Control",`${esc(v.skill)}, ${sgn(VEH_CONTROL[v.kind]||0)}`)}${iiRow("Cyber controls","Twice the price; needs a vehicle link")}</div>`)}}
