/* ============================== CYBERPUNK 2020: NETRUNNING (PLAYER) ==============================
   The Netrunning tab: your cyberdeck, its options and upgrades, your programs and Demons, Net rolls,
   writing your own programs, and the Net window you see when the GM jacks you into a run. */
Object.assign(ui,{netEdit:false,netProgEdit:null,nr:null,nw:null,netRun:null,netSel:null,netMode:"move",netFiles:{}});

function netTabShown(c){return !!c&&(c.role==="Netrunner"||!!c.deck||(c.programs||[]).length>0||skillLevel(c,"Interface")>0)}
const NET_TARGETED=new Set(["Intrusion","Decryption","Anti-System","Anti-IC","Anti-Personnel","Controller"]);
function progEffStr(c,p){if(p.in){const d0=(c.programs||[]).find(x=>x.id===p.in);if(d0)return Number(d0.str)||0}return Number(p.str)||0}
function progLabel(c,p){if(p.in){const d0=(c.programs||[]).find(x=>x.id===p.in);if(d0)return `${d0.name} › ${p.name}`}return p.name}
function demonFree(c,d0){return (Number((progFx(d0)||{}).carry)||0)-demonSubs(c,d0).length}

/* ============================== THE TAB ============================== */
function tabNet(c,k,ed){const dk=deckOf(c);const used=muUsed(c);const cap=dk?Number(dk.mu)||0:0;const ini=netInitParts(c,k);const iface=ifaceOf(c);
  const conn=dk?(["cyberlimb","cellimb"].includes(dk.type)?"plugs":dk.conn||"plugs"):"plugs";
  const deckP=dk?`<section class="panel"><div class="panel-h"><h3>${esc(dk.name)}</h3><div class="row"><span class="chip ink">${esc(DECK_TYPES[dk.type]||dk.type)}</span>${ed?`<button class="btn sm ghost" data-act="net-deck-edit">${ui.netEdit?"Close":"Edit"}</button><button class="btn sm ghost danger" data-act="net-deck-rm">${ui.confirm==="deck"?"Confirm remove":"Remove"}</button>`:""}</div></div>
    <div class="panel-b" style="display:grid;gap:12px">
      <div class="derived netstats"><div><span class="label">Speed</span><b class="num">${sgn(Number(dk.speed)||0)}</b></div><div><span class="label">Data walls</span><b class="num">${esc(dk.wall)}</b></div><div><span class="label">Memory</span><b class="num ${used>cap?"over":""}">${used}<small>/${cap} MU</small></b></div><div><span class="label">Net initiative</span><b class="num">${ini.base}<small>+D10</small></b></div></div>
      <div class="mubar ${used>cap?"over":""}" role="meter" aria-valuemin="0" aria-valuemax="${cap}" aria-valuenow="${used}" aria-label="Memory used"><i style="width:${cap?clamp(used/cap*100,0,100):0}%"></i></div>
      ${used>cap?`<div class="banner warnb" style="margin:0">Your loaded programs need ${used} MU but the deck holds ${cap}. Move some onto chips before you jack in.</div>`:""}
      ${["cyberlimb","cellimb"].includes(dk.type)?`<p class="faint" style="margin:0;font-size:13px">Hardwired into your cyberlimb: no plugs needed, and nobody can pull your cables.</p>`:`<div class="row" style="justify-content:space-between"><div class="seg" role="group" aria-label="How you connect">${Object.entries(CONN).map(([kk,v])=>`<button class="${conn===kk?"on":""}" data-act="net-conn" data-v="${kk}" ${ed?"":"disabled"}>${v.label}${v.ref?` (${v.ref} REF)`:""}</button>`).join("")}</div>
        ${conn==="plugs"&&!hasPlugs(c)?`<span class="chip amber" title="Add Interface plugs on the Cyberware tab, or connect with 'trodes">No interface plugs installed</span>`:conn==="keyboard"?`<span class="faint" style="font-size:12.5px">Immune to anti-personnel attacks, except Firestarter.</span>`:""}</div>`}
      <div><span class="label">Options</span><div class="row" style="gap:6px;margin-top:4px">${(dk.opts||[]).map((o,i)=>`<span class="chip blue">${esc(o)}${ed?` <button class="chipx" data-act="net-opt-rm" data-i="${i}" aria-label="Remove ${esc(o)}">×</button>`:""}</span>`).join("")||`<span class="faint" style="font-size:13px">None.</span>`}${dk.chips?`<span class="chip ink">${dk.chips} data chips</span>`:""}</div>
        ${ed?`<div class="row" style="margin-top:8px"><select id="net-opt" aria-label="Deck option">${DECK_OPTIONS.map((o,i)=>`<option value="${i}">${esc(o[0])} · ${fmtEb(o[1])}</option>`).join("")}</select><button class="btn sm" data-act="net-opt-add">Buy option</button></div>`:""}</div>
      ${ed?`<div><span class="label">Upgrades</span><div class="row" style="gap:6px;margin-top:4px">${Object.entries(DECK_UPGRADES).map(([kk,u])=>{const cur=kk==="speed"?Number(dk.speed)||0:kk==="wall"?Number(dk.wall)||0:Number(dk.mu)||0;const maxed=cur>=u.max;
          return `<button class="btn sm" data-act="net-up" data-k="${kk}" ${maxed||(Number(c.eb)||0)<u.cost?"disabled":""} title="${maxed?"Already at the rulebook's limit":(Number(c.eb)||0)<u.cost?"Not enough cash":""}">${u.label} · ${fmtEb(u.cost)}</button>`}).join("")}</div>
        <p class="faint" style="margin:6px 0 0;font-size:12.5px">Speed goes up to +5 and data walls up to 10. A second memory doubles the deck to 20 MU. Prices from the rulebook.</p></div>`:""}
      ${ui.netEdit&&ed?`<div class="edit-box">${[["name","Name","text"],["speed","Speed","number"],["wall","Data walls","number"],["mu","Memory (MU)","number"],["cost","Cost","number"],["chips","Data chips","number"],["notes","Notes","text"]].map(([f,l,t])=>`<div class="field"><label class="label" for="dk-${f}">${l}</label><input id="dk-${f}" type="${t}" data-f="deck.${f}" value="${esc(dk[f]??"")}"></div>`).join("")}
        <div class="field"><label class="label" for="dk-type">Kind</label><select id="dk-type" data-act-change="net-deck-type">${Object.entries(DECK_TYPES).map(([kk,l])=>`<option value="${kk}" ${dk.type===kk?"selected":""}>${l}</option>`).join("")}</select></div></div>`:""}
      ${dk.notes?`<p class="faint" style="margin:0;font-size:13px">${esc(dk.notes)}</p>`:""}
    </div></section>`
   :`<section class="panel"><div class="panel-h"><h3>Cyberdeck</h3></div><div class="panel-b" style="display:grid;gap:10px"><p class="muted" style="margin:0">No deck yet. A netrunner needs a cyberdeck to jack into the Net, plus interface plugs (or a set of 'trodes).</p>
      ${ed?`<div class="row"><button class="btn primary" data-act="open-modal" data-m="shop" data-tab="Decks">Buy a cyberdeck</button><button class="btn ghost" data-act="net-deck-custom">+ Custom deck</button></div>`:""}</div></section>`;
  const rolls=`<section class="panel"><div class="panel-b row" style="justify-content:space-between">
      <div class="row" style="gap:10px"><button class="btn primary" data-act="net-init" ${dk?"":"disabled title='You need a cyberdeck'"}>Net initiative ${ini.base}+D10</button><span class="faint" style="font-size:12.5px">${esc(partsText(ini.parts))}</span></div>
      <div class="row" style="gap:6px"><button class="btn sm" data-act="net-roll-open" ${(c.programs||[]).length?"":"disabled"}>Net roll…</button><button class="btn sm" data-act="net-logoff">Log off (D10 ≤ 8)</button>${ed?`<button class="btn sm" data-act="net-write-open">Write a program…</button>`:""}</div>
      <span class="faint" style="font-size:12.5px;flex-basis:100%">Interface ${iface} · INT ${k.eff.INT}. Most program rolls are the program's Strength + 1D10; anti-personnel attacks and defences add INT + Interface.</span></div></section>`;
  const progs=c.programs||[];const groups=PROG_CLASSES.filter(cl=>progs.some(p=>p.cls===cl&&!p.in));const custom=[...new Set(progs.filter(p=>!p.in&&!PROG_CLASSES.includes(p.cls)).map(p=>p.cls))];
  const demons=progs.filter(p=>p.cls==="Demon");
  const row=p=>{const i=progs.indexOf(p);const subs=p.cls==="Demon"?demonSubs(c,p):[];const fx=progFx(p);
    const inSel=ed&&p.cls!=="Demon"&&demons.length?`<select data-act-change="net-prog-in" data-id="${esc(p.id)}" aria-label="Carry ${esc(p.name)} in a Demon" class="sm"><option value="" ${p.in?"":"selected"}>Not in a Demon</option>${demons.map(d0=>`<option value="${esc(d0.id)}" ${p.in===d0.id?"selected":""} ${p.in!==d0.id&&demonFree(c,d0)<=0?"disabled":""}>In ${esc(d0.name)}${demonFree(c,d0)<=0&&p.in!==d0.id?" (full)":""}</option>`).join("")}</select>`:"";
    return `<div class="it" data-info="own:programs:${esc(p.id)}"><div style="min-width:0"><div class="t">${esc(p.name)} ${p.in?"":p.loaded?`<span class="chip green">In deck</span>`:`<span class="chip ink">On chip</span>`}</div>
      <div class="m">${esc(p.cls)} · STR ${esc(p.str)}${p.in?` (fights at ${progEffStr(c,p)})`:""} · ${esc(p.mu)} MU${p.in?` (packed: ${progMU(c,p)})`:""} · ${fmtEb(p.cost)}${fx.carry?` · carries ${subs.length}/${fx.carry}`:""}</div>
      ${subs.length?`<div class="m">Subroutines: ${subs.map(s=>esc(s.name)).join(", ")}</div>`:""}</div>
      <div class="a">${ed&&!p.in?`<button class="btn sm ghost" data-act="net-prog-load" data-id="${esc(p.id)}">${p.loaded?"Move to chip":"Load in deck"}</button>`:""}${inSel}
        ${p.cls!=="Demon"?`<button class="rollbtn" data-act="net-roll-open" data-id="${esc(p.id)}">Run <b>${progEffStr(c,p)}</b></button>`:""}${ed?`<button class="btn sm ghost" data-act="net-prog-edit" data-id="${esc(p.id)}">${ui.netProgEdit===p.id?"Close":"Edit"}</button>`:""}</div>
      ${ui.netProgEdit===p.id&&ed?`<div class="edit-box">${[["name","Name","text"],["str","Strength","number"],["mu","MU","number"],["cost","Cost","number"]].map(([f,l,t])=>`<div class="field"><label class="label" for="pg-${i}-${f}">${l}</label><input id="pg-${i}-${f}" type="${t}" data-f="programs.${i}.${f}" value="${esc(p[f]??"")}"></div>`).join("")}
        <div class="field"><label class="label" for="pg-${i}-cls">Class</label><select id="pg-${i}-cls" data-act-change="net-prog-cls" data-id="${esc(p.id)}">${PROG_CLASSES.map(cl=>`<option ${p.cls===cl?"selected":""}>${esc(cl)}</option>`).join("")}</select></div>
        <div class="field" style="align-self:end"><button class="btn sm danger" data-act="net-prog-rm" data-id="${esc(p.id)}">${ui.confirm==="prog-"+p.id?"Confirm remove":"Remove"}</button></div></div>`:""}</div>
      ${subs.map(s=>row(s)).join("")}`};
  const progP=`<section class="panel"><div class="panel-h"><h3>Programs</h3><div class="row">${dk?`<span class="chip ${used>cap?"red":"ink"}">${used}/${cap} MU loaded</span>`:""}${ed?`<button class="btn sm" data-act="open-modal" data-m="shop" data-tab="Programs">+ From catalog</button><button class="btn sm ghost" data-act="net-prog-custom">+ Custom</button>`:""}</div></div>
    <div class="panel-b items" style="padding-block:0">${progs.length?[...groups,...custom].map(cl=>`<div class="label" style="padding-top:12px">${esc(cl)}</div>${progs.filter(p=>p.cls===cl&&!p.in).map(row).join("")}`).join("")
      :`<p class="faint" style="padding:14px 0;margin:0">No programs. Buy them from the catalog, or write your own.</p>`}</div></section>`;
  return `<div style="display:grid;gap:14px">${deckP}${rolls}${progP}</div>`}

/* ============================== ACTIONS ============================== */
function progById(c,id){return (c.programs||[]).find(p=>p.id===id)||null}
Object.assign(A,{
  "net-conn":el=>mutate(c=>{if(c.deck)c.deck.conn=el.dataset.v}),
  "net-deck-edit":()=>{ui.netEdit=!ui.netEdit;render()},
  "net-deck-rm":()=>{if(ui.confirm!=="deck"){ui.confirm="deck";render();return}ui.confirm=null;ui.netEdit=false;mutate(c=>{c.deck=null})},
  "net-deck-custom":()=>mutate(c=>{c.deck=mkDeck(["Custom deck","standard",0,2,10,0,[],""]);ui.netEdit=true}),
  "net-opt-add":()=>{const i=Number(document.getElementById("net-opt").value);const o=DECK_OPTIONS[i];if(!o)return;const c=curChar();if(!c||!c.deck)return;
    if((Number(c.eb)||0)<o[1]){showNotice("Not enough cash.");return}
    mutate(c=>{c.eb=(Number(c.eb)||0)-o[1];if(/chips/i.test(o[0]))c.deck.chips=(Number(c.deck.chips)||0)+10;else c.deck.opts=[...(c.deck.opts||[]),o[0]];
      if(o[0]==="'Trode set"&&!hasPlugs(c))c.deck.conn="trodes";if(o[0]==="Keyboard"&&!hasPlugs(c)&&c.deck.conn!=="trodes")c.deck.conn="keyboard"});showNotice(`Bought ${o[0]}.`)},
  "net-opt-rm":el=>mutate(c=>{c.deck.opts.splice(Number(el.dataset.i),1)}),
  "net-up":el=>{const k=el.dataset.k;const u=DECK_UPGRADES[k];const c=curChar();if(!c||!c.deck||!u)return;
    const cur=k==="speed"?Number(c.deck.speed)||0:k==="wall"?Number(c.deck.wall)||0:Number(c.deck.mu)||0;
    if(cur>=u.max){showNotice("That's already at the rulebook's limit.");return}if((Number(c.eb)||0)<u.cost){showNotice("Not enough cash.");return}
    mutate(c=>{c.eb=(Number(c.eb)||0)-u.cost;if(k==="speed")c.deck.speed=cur+1;else if(k==="wall")c.deck.wall=cur+1;else c.deck.mu=Math.min(u.max,cur+u.step)});showNotice(`${u.label}: done.`)},
  "net-prog-load":el=>mutate(c=>{const p=progById(c,el.dataset.id);if(p)p.loaded=!p.loaded}),
  "net-prog-edit":el=>{ui.netProgEdit=ui.netProgEdit===el.dataset.id?null:el.dataset.id;ui.confirm=null;render()},
  "net-prog-rm":el=>{const id=el.dataset.id;if(ui.confirm!=="prog-"+id){ui.confirm="prog-"+id;render();return}ui.confirm=null;ui.netProgEdit=null;
    mutate(c=>{c.programs=c.programs.filter(p=>p.id!==id);c.programs.forEach(p=>{if(p.in===id){p.in=null;p.loaded=false}})})},
  "net-prog-custom":()=>mutate(c=>{const p={id:uid(),name:"New program",cls:"Utility",str:3,mu:1,cost:0,fx:{},desc:"",loaded:true};c.programs.push(p);ui.netProgEdit=p.id}),
  "net-init":()=>{const c=curChar();const k=calc(c);const ini=netInitParts(c,k);const r=nd10();Dice.raw("Net initiative",`${partsText(ini.parts)} + D10 (${r})`,ini.base+r,whoName())},
  "net-logoff":()=>{const r=nd10();Dice.raw("Log off (need ≤ 8)",`D10 = ${r}`,r,whoName(),[r<=8?{t:"Logged off",c:"green"}:{t:"Still jacked in",c:"red"}])},
  "net-roll-open":el=>{const c=curChar();if(!c)return;const progs=c.programs||[];const id=el.dataset.id||(progs.find(p=>p.loaded&&p.cls!=="Demon")||progs.find(p=>p.cls!=="Demon")||{}).id;if(!id){showNotice("Add a program first.");return}
    ui.nr={pid:id,t:2,def:"",gate:"gate",last:null};ui.modal="netroll";renderModal()},
  "net-write-open":()=>{ui.nw={funcs:[],opts:[],str:3,name:"",carry:0,subDiff:0,help:0,last:null};ui.modal="netwrite";renderModal()},
});
Object.assign(CHANGE,{
  "net-deck-type":el=>mutate(c=>{if(c.deck)c.deck.type=el.value}),
  "net-prog-cls":el=>mutate(c=>{const p=progById(c,el.dataset.id);if(p){p.cls=el.value;const r=progRow(p.name);p.fx=r&&r[1]===p.cls?clone(r[5]):{}}}),
  "net-prog-in":el=>mutate(c=>{const p=progById(c,el.dataset.id);if(!p)return;const d0=el.value?progById(c,el.value):null;if(d0&&demonFree(c,d0)<=0&&p.in!==d0.id){showNotice(`${d0.name} is full.`);return}p.in=d0?d0.id:null;if(d0)p.loaded=false}),
});

/* ---------- buying decks and programs ---------- */
{const _buy=A.buy;A.buy=function(el){const k=el.dataset.k;if(k!=="p"&&k!=="d")return _buy(el);
  const c=curChar();if(!c||!canEditChar(c)){showNotice(c&&c.id==="sample"?"This is the example character. Copy it to your runners to edit.":"You can't change this character.");return}
  if(shopLocked(c)){showNotice("The shop is closed. Your GM opens it when you reach a vendor.");return}
  const row=SHOP_LISTS[k]()[Number(el.dataset.i)];const shop=charShop(c);if(!row||shopHidden(shop,k,row[0]))return;
  const price=shopPrice(shop,k,row);if(!ui.shopFree&&(Number(c.eb)||0)<price){showNotice("Not enough cash.");return}
  if(k==="p"){const p=mkProgram(row);p.cost=price;const dk=c.deck;if(dk&&muUsed(c)+p.mu>(Number(dk.mu)||0))p.loaded=false;c.programs=[...(c.programs||[]),p];
    showNotice(`${ui.shopFree?"Added":"Bought"} ${p.name}${p.loaded?"":" (on a chip: your deck's memory is full)"}.`)}
  else{const old=c.deck;const dk=mkDeck(row);dk.cost=price;if(!hasPlugs(c)&&!["cyberlimb","cellimb"].includes(dk.type))dk.conn=(dk.opts||[]).includes("Keyboard")?"keyboard":"plugs";c.deck=dk;
    if(["cyberlimb","cellimb"].includes(dk.type)&&!(c.cyber||[]).some(x=>/cybermodem \(in cyberlimb\)/i.test(x.name)))c.cyber.push({id:uid(),name:"Cybermodem (in cyberlimb)",cat:"Cyberlimbs",cost:0,hc:"1",hcLoss:1,notes:"Comes with the cyberlimb deck"});
    showNotice(`${ui.shopFree?"Added":"Bought"} ${dk.name}${old?`, replacing ${old.name}`:""}.`)}
  if(!ui.shopFree)c.eb=(Number(c.eb)||0)-price;
  saveChar(c);renderModal();if(ui.view!=="roster")render()}}

/* ============================== ITEM INFO ============================== */
function netFormulaFor(c,p,cls){const s=c?progEffStr(c,p):Number(p.str)||0;const I=c?ifaceOf(c):0;const N=c?calc(c).eff.INT:0;
  switch(cls){case "Intrusion":case "Anti-System":return `${s} + 1D10 against the data wall's Strength + 1D10. Beat it to get through.`;
    case "Decryption":return `${progFx(p).vsGate||s} + 1D10 against the code gate's Strength + 1D10${progFx(p).vsGate?` (${s} against file locks)`:""}.`;
    case "Detection/Alarm":return `${s} + 1D10 against the hider's Evasion Strength + 1D10.`;
    case "Evasion/Stealth":return `Anything looking for you must beat ${s} + 1D10${progFx(p).vsDog?` (${progFx(p).vsDog} against Dogs)`:""}.`;
    case "Protection":return `${s} + INT ${N} + Interface ${I} + 1D10 = ${s+N+I} + 1D10 against the attack.`;
    case "Anti-IC":return `Interface ${I} + ${s} + 1D10 = ${I+s} + 1D10 against the target's Strength + its Interface + 1D10.`;
    case "Anti-Personnel":return `${s} + INT ${N} + Interface ${I} + 1D10 = ${s+N+I} + 1D10 against their Protection + INT + Interface + 1D10. Ties go to you.`;
    case "Controller":case "Utility":return `Roll 1D10: ${s} or less and it works.`;
    case "Demon":return "Run one of its subroutines; it fights at the Demon's Strength.";}
  return `${s} + 1D10.`}
function progEffectText(p){const fx=progFx(p);const out=[];
  if(fx.wall)out.push(`${fx.wall} off a data wall's Strength per attack`);if(fx.open)out.push(`opens the wall or gate in ${fx.open} turns`);
  if(fx.alert)out.push(fx.alert==="always"?"always alerts the system":`alerts the system on a D10 roll of ${fx.alert}+`);
  if(fx.prog)out.push(`${fx.prog} to the target program's Strength`);if(fx.kills)out.push(`de-rezzes ${fx.kills}s instantly`);
  if(fx.wound)out.push(`${fx.wound} wound damage`);if(fx.int)out.push(`${fx.int} off INT${fx.lasting?", for good":""}`);
  if(fx.status)out.push(`${fx.status.toLowerCase()} for ${fx.dur||fx.durText||"a while"}${fx.dur?" turns":""}`);if(fx.crash)out.push(`down for ${fx.crash} turns`);
  if(fx.reduce)out.push(`cuts damage by ${fx.reduce} when it fails`);if(fx.ctrl&&fx.ctrl.length)out.push("controls: "+fx.ctrl.join(", ").toLowerCase());
  if(fx.carry)out.push(`carries ${fx.carry} programs`);return out.join("; ")}
function progInfo(p,c){const fx=progFx(p);let body=iiRow("How it rolls",esc(netFormulaFor(c,p,p.cls)));const eff=progEffectText(p);if(eff)body+=iiRow("Effect",esc(eff));
  if(p.cls==="Anti-IC")body+=iiRow("Note",esc(ANTI_IC_NOTE));if(c&&p.in)body+=iiRow("Demon",esc(`Carried by ${progLabel(c,p).split(" › ")[0]}: half the memory, the Demon's Strength, and destroyed with it.`));
  if(c&&c.deck&&!p.in&&p.mu)body+=iiRow("Memory",esc(`${p.mu} MU of your deck's ${c.deck.mu}${p.loaded?"":" (on a chip right now)"}`));
  if(["Anti-IC","Anti-Personnel"].includes(p.cls))body+=iiRow("Copying",esc("Can't be copied with Backup: it erases the chip."));
  return iiCard(p.name,`${p.cls} · Strength ${p.str} · ${p.mu} MU · ${fmtEb(p.cost)}${iiHb("p",p.name)}`,body,p.desc||CLASS_INFO[p.cls]||"",iiFoot())}
function deckInfo(dk,c){let body=iiRow("Speed",esc(`${sgn(Number(dk.speed)||0)} to Net initiative (REF + Speed + 1D10)`))+iiRow("Data walls",esc(`Strength ${dk.wall}: the deck's armour against anti-system attacks`))+iiRow("Memory",esc(`${dk.mu} MU: about ${dk.mu} programs`));
  if((dk.opts||[]).length)body+=iiRow("Comes with",esc(dk.opts.join(", ")));
  body+=iiRow("Upgrades",esc("+1 Speed 2,000eb (to +5) · +1 data walls 1,000eb (to 10) · second memory 5,000eb (20 MU)"));
  if(c&&c.deck&&c.deck!==dk)body+=iiRow("Your deck",esc(`Buying this replaces your ${c.deck.name}.`));
  return iiCard(dk.name,`${DECK_TYPES[dk.type]||dk.type} cyberdeck${iiHb("d",dk.name)}`,body,dk.desc||"",iiFoot())}
{const _ii=itemInfoHTML;itemInfoHTML=function(key){const [k,a,b]=String(key).split(":");const c=typeof ckChar==="function"?ckChar():curChar();
  if(k==="p"){const r=SHOP_LISTS.p()[a];return r?progInfo(mkProgram(r),c):""}
  if(k==="d"){const r=DECKS[a];return r?deckInfo(mkDeck(r),c):""}
  if(k==="own"&&a==="programs"&&c){const p=progById(c,b);return p?progInfo(p,c):""}
  return _ii(key)}}

/* ============================== NET ROLL WINDOW ============================== */
function nrSpec(c,p,nr){const s=progEffStr(c,p);const I=ifaceOf(c);const N=calc(c).eff.INT;const fx=progFx(p);const t=Number(nr.t)||0;const def=Number(nr.def)||0;
  switch(p.cls){
    case "Intrusion":return {att:{base:s,parts:[[p.name,s]]},def:{base:t,parts:[["Wall",t]]},tie:"def",fields:[["t","Data wall Strength",fx.worm?"Worm also works on code gates.":""]]};
    case "Anti-System":return {att:{base:s,parts:[[p.name,s]]},def:{base:t,parts:[["Data wall",t]]},tie:"def",fields:[["t","Target's data wall Strength","A deck's data walls, or the system's."]]};
    case "Decryption":{const ss=nr.gate==="gate"&&fx.vsGate?fx.vsGate:s;return {att:{base:ss,parts:[[p.name,ss]]},def:{base:t,parts:[[nr.gate==="gate"?"Code gate":"File lock",t]]},tie:"def",fields:[["t",nr.gate==="gate"?"Code gate Strength":"File lock Strength",""]],gate:true}}
    case "Detection/Alarm":return {att:{base:s,parts:[[p.name,s]]},def:{base:t,parts:[["Evasion",t]]},tie:"att",fields:[["t","Their Evasion program's Strength","0 if they aren't running one: you see them automatically."]]};
    case "Evasion/Stealth":return {att:{base:t,parts:[["Seeker",t]]},def:{base:s,parts:[[p.name,s]]},tie:"att",defender:true,fields:[["t","The searching program's Strength",fx.vsDog?`${p.name} is Strength ${fx.vsDog} against Pit Bulls, Bloodhounds and Hellhounds.`:""]]};
    case "Anti-IC":return {att:{base:I+s,parts:[["Interface",I],[p.name,s]]},def:{base:t+(nr.def===""?10:def),parts:[["Target",t],["Its Interface",nr.def===""?10:def]]},tie:"att",fields:[["t","Target program's Strength",""],["def","Its Interface","10 for a system; another runner's Interface skill."]],note:ANTI_IC_NOTE};
    case "Anti-Personnel":return {att:{base:s+N+I,parts:[[p.name,s],["INT",N],["Interface",I]]},def:{base:t,parts:[["Defence",t]]},tie:"att",fields:[["t","Their Protection Strength + INT + Interface","A system's INT is 3 per CPU; its Interface is 10."]]};
    case "Protection":return {att:{base:t,parts:[["Attack",t]]},def:{base:s+N+I,parts:[[p.name,s],["INT",N],["Interface",I]]},tie:"att",defender:true,fields:[["t","The attack: program Strength + INT + Interface","A system's INT is 3 per CPU; its Interface is 10."]]};
    case "Controller":case "Utility":return {under:s,fields:[]};}
  return {under:s,fields:[]}}
function nrBody(){const c=curChar();const nr=ui.nr;if(!c||!nr)return "";const progs=(c.programs||[]).filter(p=>p.cls!=="Demon");const p=progById(c,nr.pid)||progs[0];if(!p)return `<p class="faint">No programs.</p>`;nr.pid=p.id;
  const sp=nrSpec(c,p,nr);const last=nr.last;
  const fields=sp.fields.map(([f,l,h])=>`<div class="field"><label class="label" for="nr-${f}">${esc(l)}</label><input id="nr-${f}" type="number" min="0" max="60" data-nr="${f}" value="${esc(nr[f])}" placeholder="${f==="def"?"10":""}">${h?`<span class="faint" style="font-size:12px">${esc(h)}</span>`:""}</div>`).join("");
  const formula=sp.under!=null?`Roll 1D10, need ${sp.under} or less`:`${sp.defender?"Them":"You"}: ${partsText(sp.att.parts)} = ${sp.att.base} + 1D10 · ${sp.defender?"You":"Them"}: ${partsText(sp.def.parts)} = ${sp.def.base} + 1D10`;
  return `<div style="display:grid;gap:12px">
    <div class="field"><label class="label" for="nr-p">Program</label><select id="nr-p" data-act-change="nr-pick">${progs.map(x=>`<option value="${esc(x.id)}" ${x.id===p.id?"selected":""}>${esc(progLabel(c,x))} · ${esc(x.cls)} · STR ${progEffStr(c,x)}${!x.loaded&&!x.in?" (on chip)":""}</option>`).join("")}</select></div>
    <p class="muted" style="margin:0;font-size:14px">${esc(CLASS_INFO[p.cls]||"")}</p>
    ${sp.gate?`<div class="seg" role="group" aria-label="Target"><button class="${nr.gate==="gate"?"on":""}" data-act="nr-gate" data-v="gate">Code gate</button><button class="${nr.gate==="lock"?"on":""}" data-act="nr-gate" data-v="lock">File lock</button></div>`:""}
    ${fields?`<div class="grid2">${fields}</div>`:""}
    ${sp.note?`<p class="faint" style="margin:0;font-size:12.5px">${esc(sp.note)}</p>`:""}
    <div class="ck-roll"><span class="mono">${esc(formula)}</span><button class="btn primary ck-go" data-act="nr-roll">Run ${esc(p.name)}</button></div>
    ${last?`<div class="calc-out ck-res"><div class="row">${(last.tags||[]).map(t=>`<span class="chip ${t.c}">${esc(t.t)}</span>`).join("")}</div><div>${esc(last.text)}</div></div>`:""}
  </div>`}
MODALS.netroll=()=>({title:"Net roll",body:nrBody()});
function nrFollow(p,win){const fx=progFx(p);const out=[];if(!win)return out;const roll=e=>{const r=rollDice(e);return r?r.total:0};
  if(fx.wall){const n=roll(fx.wall);out.push(`the wall loses ${n} Strength (${fx.wall})`)}
  if(fx.open)out.push(`it opens in ${fx.open} turns`);
  if(fx.kills)out.push(`a ${fx.kills} is de-rezzed instantly`);else if(fx.prog){const n=roll(fx.prog);out.push(`the target loses ${n} Strength (${fx.prog})`)}
  if(fx.wound){const n=roll(fx.wound);out.push(`${n} wound damage (${fx.wound})`)}if(fx.int){const n=roll(fx.int);out.push(`${n} off INT (${fx.int})`)}
  if(fx.status){const n=fx.dur?roll(fx.dur):null;out.push(`${fx.status.toLowerCase()}${n?` for ${n} turns`:fx.durText?` for ${fx.durText}`:""}`)}
  if(fx.crash){const n=roll(fx.crash);out.push(`down for ${n} turns`)}if(fx.deckFx||fx.deck)out.push((fx.deckFx||fx.deck).toLowerCase());
  return out}
function nrAlert(p){const fx=progFx(p);if(!fx.alert)return "";if(fx.alert==="always")return " The system is alerted.";const r=nd10();return r>=fx.alert?` Alert check D10 ${r}: the system is alerted.`:` Alert check D10 ${r}: no alarm.`}
Object.assign(A,{
  "nr-gate":el=>{ui.nr.gate=el.dataset.v;renderModal()},
  "nr-roll":()=>{const c=curChar();const nr=ui.nr;const p=progById(c,nr.pid);if(!p)return;const sp=nrSpec(c,p,nr);const who=whoName();const lab=`${progLabel(c,p)} (${p.cls})`;
    if(sp.under!=null){const r=netCheckUnder(sp.under);const tags=[r.ok?{t:"Works",c:"green"}:{t:"Fails",c:"red"}];Dice.raw(lab,`D10 = ${r.roll}, needs ${sp.under} or less`,r.roll,who,tags);
      nr.last={tags,text:r.ok?`Rolled ${r.roll}: it works.`:`Rolled ${r.roll}: it fails.`};renderModal();return}
    const res=netOpposed(sp.att,sp.def,sp.tie);const youWin=sp.defender?!res.win:res.win;
    const fol=sp.defender?[]:nrFollow(p,res.win);const tags=[youWin?{t:sp.defender?"Holds":"Succeeds",c:"green"}:{t:sp.defender?"Broken":"Fails",c:"red"}];
    const det=`${sp.att.base} + D10 (${res.aRoll}) = ${res.aTot} vs ${sp.def.base} + D10 (${res.bRoll}) = ${res.bTot}`;
    const alert=["Intrusion"].includes(p.cls)?nrAlert(p):"";
    Dice.raw(lab,det+(fol.length?" · "+fol.join(", "):""),sp.defender?res.bTot:res.aTot,who,tags);
    nr.last={tags,text:`${det}. ${youWin?(sp.defender?"You hold it off.":"It works"+(fol.length?": "+fol.join(", "):"")+"."):(sp.defender?"It gets through.":"It fails.")}${alert}`};renderModal()},
});
CHANGE["nr-pick"]=el=>{ui.nr.pid=el.value;ui.nr.last=null;renderModal()};
document.addEventListener("input",ev=>{const el=ev.target;if(el.dataset&&el.dataset.nr&&ui.nr){ui.nr[el.dataset.nr]=el.value;const m=document.querySelector(".ck-roll .mono");const c=curChar();const p=c&&progById(c,ui.nr.pid);
  if(m&&p){const sp=nrSpec(c,p,ui.nr);m.textContent=sp.under!=null?`Roll 1D10, need ${sp.under} or less`:`${sp.defender?"Them":"You"}: ${partsText(sp.att.parts)} = ${sp.att.base} + 1D10 · ${sp.defender?"You":"Them"}: ${partsText(sp.def.parts)} = ${sp.def.base} + 1D10`}}});

/* ============================== WRITING PROGRAMS (pg. 167–169) ============================== */
function nwCalc(nw){const funcs=DESIGN_FUNCS.filter(f=>nw.funcs.includes(f[0]));const opts=DESIGN_OPTS.filter(o=>nw.opts.includes(o[0]));const demon=nw.funcs.includes("Compiler (Demon)");
  const str=clamp(Number(nw.str)||1,1,10);const carry=demon?clamp(Number(nw.carry)||0,0,10):0;const sub=demon?Math.floor((Number(nw.subDiff)||0)/2):0;
  const diff=funcs.reduce((a,f)=>a+f[1],0)+opts.reduce((a,o)=>a+o[1],0)+str+sub;
  const mu=(DESIGN_MU.find(m=>diff<=m[0])||[0,7])[1];
  let cls=funcs.length?funcs[0][2]:"Utility",mod=0;for(const f of funcs){const m=DESIGN_COSTX[f[2]]||1;if(m>mod){mod=m;cls=f[2]}}if(demon)cls="Demon";
  return {funcs,opts,str,final:Math.max(0,str-carry),carry,sub,diff,mu,cls,mod:mod||1,cost:diff*10*(mod||1),hours:diff*6}}
function nwBody(){const c=curChar();const nw=ui.nw;if(!c||!nw)return "";const r=nwCalc(nw);const base=calc(c).eff.INT+skillLevel(c,"Programming")+(Number(nw.help)||0);
  const ck=(list,sel,kind)=>`<div class="nwgrid">${list.map(x=>`<label class="row" style="gap:6px"><input type="checkbox" data-act-change="nw-tog" data-k="${kind}" value="${esc(x[0])}" ${sel.includes(x[0])?"checked":""}> <span>${esc(x[0])}</span> <span class="faint mono" style="font-size:12px">+${x[1]}</span></label>`).join("")}</div>`;
  return `<div style="display:grid;gap:12px">
    <p class="muted" style="margin:0">Pick what the program does, add options and set its Strength. The total is the Difficulty: roll INT + Programming + 1D10 to beat it. The Referee decides how a new function works in play.</p>
    <div class="field"><label class="label" for="nw-name">Name</label><input id="nw-name" data-nw="name" value="${esc(nw.name)}" placeholder="Soulsucker" maxlength="40"></div>
    <div class="field"><span class="label">Functions</span>${ck(DESIGN_FUNCS,nw.funcs,"funcs")}</div>
    <div class="field"><span class="label">Options</span>${ck(DESIGN_OPTS,nw.opts,"opts")}</div>
    <div class="grid3"><div class="field"><label class="label" for="nw-str">Strength (adds to Difficulty)</label><input id="nw-str" type="number" min="1" max="10" data-nw="str" value="${esc(nw.str)}"></div>
      ${nw.funcs.includes("Compiler (Demon)")?`<div class="field"><label class="label" for="nw-carry">Programs it carries</label><input id="nw-carry" type="number" min="0" max="10" data-nw="carry" value="${esc(nw.carry)}"><span class="faint" style="font-size:12px">−1 Strength each</span></div>
      <div class="field"><label class="label" for="nw-sub">Their total Difficulty</label><input id="nw-sub" type="number" min="0" max="400" data-nw="subDiff" value="${esc(nw.subDiff)}"><span class="faint" style="font-size:12px">Half of it is added</span></div>`:""}</div>
    <div class="derived nwout"><div><span class="label">Difficulty</span><b class="num">${r.diff}</b></div><div><span class="label">Size</span><b class="num">${r.mu} MU</b></div><div><span class="label">Work</span><b class="num">${r.hours}h</b></div><div><span class="label">Street value</span><b class="num">${fmtEb(r.cost)}</b></div><div><span class="label">Class</span><b>${esc(r.cls)}</b></div>${r.carry?`<div><span class="label">Fights at</span><b class="num">${r.final}</b></div>`:""}</div>
    <div class="grid2"><div class="field"><label class="label" for="nw-help">Help from other runners (their INT + Programming)</label><input id="nw-help" type="number" min="0" max="60" data-nw="help" value="${esc(nw.help)}"></div></div>
    <div class="ck-roll"><span class="mono">INT ${calc(c).eff.INT} + Programming ${skillLevel(c,"Programming")}${Number(nw.help)?` + help ${Number(nw.help)}`:""} = ${base} + 1D10 vs ${r.diff}</span><button class="btn primary" data-act="nw-roll" ${r.funcs.length?"":"disabled title='Pick at least one function'"}>Write it</button></div>
    ${nw.last?`<div class="calc-out ck-res"><div>${esc(nw.last.text)}</div><div class="row"><button class="btn sm ${nw.last.ok?"primary":"ghost"}" data-act="nw-add">${nw.last.ok?"Add to my programs":"Add anyway (Referee's call)"}</button></div></div>`:""}
  </div>`}
MODALS.netwrite=()=>({title:"Write a program",body:nwBody()});
Object.assign(A,{
  "nw-roll":()=>{const c=curChar();const nw=ui.nw;const r=nwCalc(nw);const base=calc(c).eff.INT+skillLevel(c,"Programming")+(Number(nw.help)||0);
    const e=Dice.check(`Write ${nw.name||"a program"} (Programming)`,base,{dv:r.diff,who:whoName()});const ok=!e.fumble&&e.total>=r.diff;
    nw.last={ok,text:ok?`Written: ${e.total} beats ${r.diff}. It takes ${r.hours} hours of work (split it between helpers).`:`Not this time: ${e.total} against ${r.diff}.`};renderModal()},
  "nw-add":()=>{const nw=ui.nw;const r=nwCalc(nw);const fx={};if(nw.funcs.includes("Stealth")||nw.funcs.includes("Evasion"))fx.evade=1;if(nw.funcs.includes("Protection"))fx.protect=1;if(nw.funcs.includes("Detection"))fx.detect=1;if(nw.funcs.includes("Trace")||nw.opts.includes("Trace"))fx.trace=1;if(nw.opts.includes("Movement ability"))fx.mobile=1;if(r.carry)fx.carry=r.carry;
    mutate(c=>{c.programs.push({id:uid(),name:nw.name||"Homemade program",cls:r.cls,str:r.final,mu:r.mu,cost:0,fx,desc:`Written by ${c.handle||"you"}: ${[...nw.funcs,...nw.opts].join(", ")}. Difficulty ${r.diff}.`,loaded:false})});ui.modal=null;renderModal();ui.tab="net";render();showNotice(`Added ${nw.name||"your program"}, on a chip.`)},
});
CHANGE["nw-tog"]=el=>{const l=ui.nw[el.dataset.k];const i=l.indexOf(el.value);if(el.checked&&i<0)l.push(el.value);if(!el.checked&&i>=0)l.splice(i,1);ui.nw.last=null;renderModal()};
document.addEventListener("input",ev=>{const el=ev.target;if(el.dataset&&el.dataset.nw&&ui.nw){ui.nw[el.dataset.nw]=el.value;if(el.dataset.nw!=="name"){ui.nw.last=null;const out=document.querySelector(".nwout");if(out){renderModal()}}}});

/* ============================== THE NET WINDOW (during a run) ============================== */
function pnView(){return ui.netRun}
function pnMyProg(id){const v=pnView();return v&&v.me&&(v.me.progs||[]).find(p=>p.id===id)}
function pnBody(){const v=pnView();if(!v)return `<p class="muted" style="margin:0">You're not jacked in. Your GM starts a run from their Netrunning tab.</p>`;
  const cells={};(v.cells||[]).forEach(c0=>{cells[c0.k]=c0});const vis=new Set(v.vis||[]);const me=v.me||{};const sel=ui.netSel&&pnMyProg(ui.netSel);
  const st={breach:{},open:{},opening:{},ctrl:{}};(v.cells||[]).forEach(c0=>{if(c0.breach)st.breach[c0.k]=1;if(c0.open)st.open[c0.k]=1;if(c0.opening)st.opening[c0.k]=1;if(c0.ctrl)st.ctrl[c0.k]=1;if(c0.dmg)(st.wallDmg||(st.wallDmg={}))[c0.k]=1});
  const marks=[...(v.ice||[]).map(i=>({kind:"ice",x:i.x,y:i.y,label:i.name,title:`${i.name} (${i.cls})${i.alerted?", alerted":""}`,cls:i.alerted?"alert":""})),
    ...(v.runners||[]).filter(r=>!r.out).map(r=>({kind:"runner",x:r.x,y:r.y,label:r.handle,color:r.color,title:r.id===me.id?`${r.handle} (you)`:r.handle,cls:r.id===me.id?"me":""}))];
  let reach=null;if(!me.out&&!sel&&ui.netMode==="move"){const f={cells:{}};for(const [k,c0] of Object.entries(cells))f.cells[k]={t:c0.t};reach=new Set([...fortReach(f,st,me.x,me.y,5).keys()].filter(k=>cells[k]||vis.has(k)))}
  const hint=me.out?"You're out of the Net.":sel?`Pick a target for ${sel.name}.`:ui.netMode==="read"?"Pick a memory to read.":"Click a lit space up to 5 away to move there.";
  const progs=(me.progs||[]);const can=!me.out;
  const files=Object.entries(v.read||{});
  return `<div class="netwin">
    <div class="netmap">${netGridHTML({cell:k=>cells[k]||null,fog:k=>vis.has(k)?"":cells[k]?"dim":"dark",marks,reach,act:"pn-cell",state:st,label:v.fname})}</div>
    <aside class="netside">
      <div class="row" style="justify-content:space-between"><b>${esc(v.fname)}</b><span class="chip ink">Round ${v.round}${v.turn?` · ${esc(v.turn)}`:""}</span></div>
      <div class="row" style="gap:6px">${me.out?`<span class="chip red">Out of the Net</span>`:`<span class="chip blue">You're at ${esc(fcoord(me.x,me.y))}</span>`}${(me.status||[]).map(s=>`<span class="chip amber" title="${esc(s.note||"")}">${esc(s.t)}${s.left?` · ${s.left}`:""}</span>`).join("")}${me.detected?`<span class="chip red">Detected</span>`:""}</div>
      <p class="faint netsint" style="margin:0;font-size:13px" aria-live="polite">${esc(hint)}${sel?` <button class="btn sm ghost" data-act="pn-cancel">Cancel</button>`:""}</p>
      <div class="netprogs"><span class="label">Your programs</span>${progs.length?progs.map(p=>`<button class="netprog ${ui.netSel===p.id?"on":""} ${p.derez?"derez":""} ${p.active?"active":""}" data-act="pn-prog" data-id="${esc(p.id)}" ${!can||p.derez?"disabled":""}><b>${esc(p.label||p.name)}</b><span>${esc(p.cls)} · STR ${p.str}${p.max!==p.str?`/${p.max}`:""}${p.derez?" · de-rezzed":p.active?" · running":""}</span></button>`).join(""):`<p class="faint" style="margin:0;font-size:13px">No programs loaded.</p>`}</div>
      <div class="row" style="gap:6px"><button class="btn sm ${ui.netMode==="read"?"blue":""}" data-act="pn-read" ${can?"":"disabled"}>Read a memory</button><button class="btn sm" data-act="pn-logoff" ${can?"":"disabled"}>Log off (D10 ≤ 8)</button></div>
      ${files.length?`<div class="netfiles"><span class="label">Files you've read</span>${files.map(([k,list])=>`<div><b>Memory ${esc(list.n)}</b>${(list.files||[]).map((fl,i)=>`<div class="netfile"><span>${esc(fl.name)} <span class="faint">· ${esc(fl.type)}${fl.lock?` · locked`:""}</span>${fl.docs&&!fl.lock?`<div class="faint" style="font-size:12px;white-space:pre-wrap">${esc(fl.docs)}</div>`:""}</span>${fl.lock?"":`<button class="btn sm ghost" data-act="pn-copy" data-k="${esc(k)}" data-i="${i}" ${can?"":"disabled"}>${fl.copied?"Copied":"Copy"}</button>`}</div>`).join("")||`<div class="faint" style="font-size:12.5px">Empty.</div>`}</div>`).join("")}</div>`:""}
      <div class="netlog"><span class="label">What happened</span>${(v.log||[]).slice().reverse().map(l=>`<div>${esc(l)}</div>`).join("")||`<div class="faint">Nothing yet.</div>`}</div>
    </aside></div>`}
MODALS.net=()=>{const v=pnView();return {title:v?`The Net · ${v.fname}`:"The Net",body:pnBody(),wide:true}};
Object.assign(A,{
  "pn-open":()=>{ui.modal="net";renderModal()},
  "pn-prog":el=>{const p=pnMyProg(el.dataset.id);if(!p)return;
    if(NET_TARGETED.has(p.cls)){ui.netSel=ui.netSel===p.id?null:p.id;ui.netMode="move";renderModal();return}
    gameSend("net-act",{pid:p.id});ui.netSel=null},
  "pn-cancel":()=>{ui.netSel=null;ui.netMode="move";renderModal()},
  "pn-read":()=>{ui.netMode=ui.netMode==="read"?"move":"read";ui.netSel=null;renderModal()},
  "pn-logoff":()=>gameSend("net-menu",{cmd:"logoff"}),
  "pn-copy":el=>gameSend("net-menu",{cmd:"copy",k:el.dataset.k,i:Number(el.dataset.i)}),
  "pn-cell":el=>{const x=Number(el.dataset.x),y=Number(el.dataset.y);
    if(ui.netSel){gameSend("net-act",{pid:ui.netSel,x,y});ui.netSel=null;renderModal();return}
    if(ui.netMode==="read"){gameSend("net-menu",{cmd:"read",x,y});ui.netMode="move";renderModal();return}
    gameSend("net-move",{x,y})},
});
/* messages from the GM's run */
function cpNetMessage(type,m){
  if(type==="net"){const was=ui.netRun;ui.netRun=m.run&&typeof m.run==="object"?m.run:null;
    if(ui.netRun&&!was){showNotice(`The GM jacked you into ${ui.netRun.fname}.`);if(!ui.modal){ui.modal="net"}}
    if(!ui.netRun&&was){ui.netSel=null;if(ui.modal==="net")ui.modal=null;showNotice("The run is over.")}
    if(ui.netSel&&!pnMyProg(ui.netSel))ui.netSel=null;requestRender();if(ui.modal==="net"||!was)renderModal();return true}
  if(type==="net-err"){showNotice(cleanText(m.msg,200)||"You can't do that.");return true}
  return false}
{const _pm=cpPlayerMessage;cpPlayerMessage=function(type,m){if(cpNetMessage(type,m))return;return _pm(type,m)}}
/* the panel beside the map */
{const _tp=cpTablePanel;cpTablePanel=function(c){let h=_tp(c);const v=pnView();
  if(v)h+=`<div class="netpill"><span><span class="chip ${v.me&&v.me.out?"red":"blue"}">${v.me&&v.me.out?"Out":"Jacked in"}</span> ${esc(v.fname)}</span><button class="btn sm primary" data-act="pn-open">Open the Net</button></div>`;
  else if(c.deck)h+=`<div class="row" style="gap:6px"><button class="rollbtn" data-act="pt-netinit">Net initiative <b>${netInitParts(c).base}</b></button><button class="btn sm ghost" data-act="open-char" data-id="${esc(c.id)}">Programs</button></div>`;
  return h}}
A["pt-netinit"]=()=>{const c=typeof myChar==="function"&&myChar()||curChar();if(!c)return;const ini=netInitParts(c);const r=nd10();Dice.raw("Net initiative",`${partsText(ini.parts)} + D10 (${r})`,ini.base+r,whoName())};
