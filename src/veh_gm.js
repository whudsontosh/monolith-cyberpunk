/* Cyberpunk 2020 · the GM's side of vehicles (1.2.0): vehicles in the combat tracker with a driver, hits, crashes
   and control rolls, each runner's garage on their page, and reference tables. */
function vehCb(id){return st.encounter.list.find(x=>x.cid===id&&x.kind==="veh")}
{const _ci=cbInfo;cbInfo=function(cb){return cb&&cb.kind==="veh"?null:_ci(cb)}}
function vehDrvOf(cb){const dcb=cb.driver&&st.encounter.list.find(x=>x.cid===cb.driver);const i=dcb&&cbInfo(dcb);
  return i?{name:i.name,ref:i.eff.REF,skill:i.skill,cables:false}:{name:"No driver",ref:0,skill:()=>0,cables:false}}
function vehChar(id){const p=pc(id);if(p)return p;const cb=vehCb(id);return cb?{id:cb.cid,vehicles:[cb.veh],drv:vehDrvOf(cb)}:null}
function vehEdit(id,fn){if(pc(id))return withPc(id,fn);const cb=vehCb(id);if(!cb)return;withCb(id,x=>{const ps={vehicles:[x.veh]};fn(ps);if(ps.vehicles[0])x.veh=ps.vehicles[0]});if(ui.modal)renderModal()}
// the combat tracker
{const _ev=viewEncounter;viewEncounter=function(){return _ev().replace(`<div class="row"><input id="q-name"`,`<div class="row"><select id="enc-veh" aria-label="Vehicle to add">${VEHICLES.map((v,i)=>`<option value="${i}">${esc(v.name)}</option>`).join("")}</select><button class="btn sm" data-act="enc-add-veh">Add vehicle</button></div><div class="row"><input id="q-name"`)}}
{const _er=encRow;encRow=function(cb,i){if(cb.kind!=="veh")return _er(cb,i);const v=cb.veh;const dr=vehDrvOf(cb);const turn=i===st.encounter.turn;
  const opts=st.encounter.list.filter(x=>x.kind!=="veh").map(x=>{const n=cbInfo(x);return n?`<option value="${esc(x.cid)}" ${cb.driver===x.cid?"selected":""}>${esc(n.name)}</option>`:""}).join("");
  return `<div class="cb ${turn?"turn":""} ${vehState(v)==="wrecked"?"out":""}" id="cb-${cb.cid}"><div class="cb-main">
    <span class="cb-init num faint" title="Vehicles act on their driver's turn">—</span>
    <div style="min-width:0;flex:1"><div class="row" style="gap:6px"><b class="cb-name">${esc(v.name)}</b><span class="chip ink">Vehicle</span></div>
      <div class="m mono">Driver: <select data-act-change="veh-driver" data-cid="${cb.cid}" class="sm" aria-label="Driver"><option value="">No one</option>${opts}</select> · REF ${dr.ref} · ${esc(v.skill)} ${dr.skill(v.skill)}</div></div>
    <button class="btn sm ghost" data-act="enc-remove" data-cid="${cb.cid}" aria-label="Remove">×</button></div>
    <div class="cb-body" style="display:block">${vehCardHTML({id:cb.cid},v,{ed:true,noRm:true})}</div></div>`}}
Object.assign(A,{"enc-add-veh":()=>{const v=VEHICLES[Number((document.getElementById("enc-veh")||{}).value)||0];const same=st.encounter.list.filter(x=>x.kind==="veh"&&x.veh.base===v.name).length;
  const veh={...mkVehicle(v,false),base:v.name};if(same)veh.name=`${v.name} ${same+1}`;st.encounter.list.push({cid:uid(),kind:"veh",veh,init:-99,out:false,note:"",last:"",driver:""});save();render()}});
Object.assign(CHANGE,{"veh-driver":el=>withCb(el.dataset.cid,x=>{x.driver=el.value})});
// a runner's garage on their page
{const _vp=viewPc;viewPc=function(c){const h=_vp(c);if(!(c.vehicles||[]).length)return h;
  return h.replace(`<section class="panel"><div class="panel-h"><h3>Background</h3>`,`<section class="panel"><div class="panel-h"><h3>Garage</h3></div><div class="panel-b" style="display:grid;gap:10px">${c.vehicles.map(v=>vehCardHTML(c,v,{ed:true})).join("")}</div></section><section class="panel"><div class="panel-h"><h3>Background</h3>`)}}
// reference
{const _vr=viewReference;viewReference=function(){const t=(title,head,rows)=>`<section class="panel"><div class="panel-h"><h3>${title}</h3></div><div class="panel-b tbl-wrap"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
  return _vr()+`<div class="roster-head" style="margin-top:22px"><h1><small>Quick reference</small>Vehicles</h1></div><div class="ref-grid">${vehRefTables(t)}</div><p class="faint" style="font-size:12.5px">* The core book gives no structure for these; the number is an estimate.</p>`}}
