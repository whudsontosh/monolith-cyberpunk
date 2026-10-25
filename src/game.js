/* ============================== CYBERPUNK: REGISTERING WITH MONOLITH ==============================
   Everything Monolith needs to know about this game, in one place. Monolith calls only what's
   listed here; see the game contract in Monolith's README. */
function ringColor(level,dead){if(dead)return "#000";return level<=0?"":level===1?"#ffe14d":level===2?"#f2a93b":level===3?"#ff4459":"#d1148f"}
function cpHealthRing(w,level){return w?{color:ringColor(level,w>=40),dead:w>=40,lvl:level}:null}
function cpCard(c){const k=calc(c);const draft=!c.created;
  return {name:c.handle||"Unnamed",sub:`${c.role}${c.name?" · "+c.name:""}`,color:c.color||"#3d4352",initial:(c.handle||c.name||"?").trim().charAt(0).toUpperCase()||"?",
    chips:draft?[{t:`Draft · step ${(c.wizStep||0)+1}/7`,c:"blue"}]:[{t:woundLabel(k.level),c:woundChipClass(k.level)}],
    stats:[["REF",k.eff.REF],["BODY",k.eff.BODY],["Hum",k.humanity],["IP",(c.ip?.total||0)-(c.ip?.spent||0)]],
    meter:{frac:k.humMax?k.humanity/k.humMax:0,title:`Humanity ${k.humanity}/${k.humMax}`},draft,openLabel:draft?"Continue build":"Open sheet",
    actions:c.id==="sample"?"":`<button class="btn sm ghost" data-act="print-char" data-id="${esc(c.id)}">Paper sheet</button>`,corner:fmtEb(c.eb)}}
function cpSummary(d0){try{const k=calc(d0);return `${woundLabel(k.level)} · ${fmtEb(d0.eb)} · IP ${(d0.ip?.total||0)-(d0.ip?.spent||0)} free · ${(d0.weapons||[]).length} weapons · ${(d0.cyber||[]).length} implants`}catch(e){return ""}}
function cpCopy(src){const c=clone(src);c.handle=src.handle+" (copy)";["weapons","armor","cyber","gear","contacts"].forEach(l=>(c[l]||[]).forEach(x=>x.id=uid()));return c}

/* ---------- GM: map tokens and the encounter ---------- */
function cpTokenRing(t){
  if(t.kind==="pc"){const c=pc(t.ref);if(!c)return null;const k=calc(c);return cpHealthRing(k.w,k.level)}
  if(t.kind==="npc"){const cb=st.encounter.list.find(x=>x.cid===t.ref);if(!cb)return null;const i=cbInfo(cb);return i?cpHealthRing(i.w,i.level):null}
  return null}
function cpActiveTurn(){const e=st.encounter;const cb=e.list[e.turn];if(!cb||!e.list.length)return null;return cb.kind==="pc"?{kind:"pc",ref:cb.ref}:{kind:"npc",ref:cb.cid}}
function cpTokenInfo(t){const wb=`<span class="row" style="gap:4px"><button class="icon-btn" data-act="tk-wound" data-d="-1" aria-label="Heal 1">−</button><button class="icon-btn" data-act="tk-wound" data-d="1" aria-label="Damage 1">+</button>`;
  if(t.kind==="pc"){const c=pc(t.ref);if(!c)return "";const k=calc(c);return `<div class="row" style="justify-content:space-between"><span><span class="chip ${woundChipClass(k.level)}">${woundLabel(k.level)} · ${k.w}</span> <span class="faint" style="font-size:12.5px">${esc(st.players[c.id]||"")}</span></span>${wb}</span></div>`}
  if(t.kind==="npc"){const cb=st.encounter.list.find(x=>x.cid===t.ref);const i=cb&&cbInfo(cb);if(i)return `<div class="row" style="justify-content:space-between"><span class="chip ${woundChipClass(i.level)}">${i.w>=40?"Dead":woundLabel(i.level)} · ${i.w}</span>${wb}<button class="btn sm ghost" data-act="tab" data-t="encounter">Encounter</button></span></div>`;return `<p class="faint" style="margin:0;font-size:12.5px">Not in the current encounter.</p>`}
  return ""}
function cpTokenButtons(m){const inEnc=st.encounter.list.filter(x=>x.kind==="npc").length;return `<button class="btn sm" data-act="map-place-enc" ${inEnc?"":"disabled"} title="${inEnc?"":"Add NPCs on the Encounter tab first"}">Place encounter NPCs</button>`}
A["tk-wound"]=el=>{const t=selTok();if(!t)return;const dd=Number(el.dataset.d);
  if(t.kind==="pc")withPc(t.ref,c=>{c.wounds=clamp((Number(c.wounds)||0)+dd,0,40)});
  else if(t.kind==="npc"){const cb=st.encounter.list.find(x=>x.cid===t.ref);if(cb){const i=cbInfo(cb);setWounds(cb,i.w+dd);save();render()}}
  MapV.invalidate()};
function cpRemoveCharacter(id){const e=st.encounter;const cur=e.list[e.turn];e.list=e.list.filter(x=>!(x.kind==="pc"&&x.ref===id));const ni=cur?e.list.indexOf(cur):-1;e.turn=ni>=0?ni:Math.min(e.turn,Math.max(0,e.list.length-1));delete st.gmNotes[id]}
function cpRemoveNotes(c){const out=["Your private GM notes about them go too."];if(st.encounter.list.some(x=>x.kind==="pc"&&x.ref===c.id))out.push("They're taken out of the current encounter.");return out}
function cpNewCampaignOptions(){return st&&st.npcs.length?`<label class="row" style="gap:8px"><input type="checkbox" id="camp-new-npcs" ${ui.campNewNpcs?"checked":""} data-act-change="camp-new-npcs"><span>Copy my ${st.npcs.length} custom NPC${st.npcs.length===1?"":"s"} from ${esc(st.campaign.name||"this campaign")}</span></label>`:""}
CHANGE["camp-new-npcs"]=el=>{ui.campNewNpcs=el.checked};

/* ---------- the look ---------- */
Object.assign(Monolith.theme.map,{void:"#020305",corner:"rgba(255,94,79,.85)",activeGlow:"rgba(255,68,89,.28)",font:'"Rajdhani","Arial Narrow",sans-serif',mono:'"Share Tech Mono",monospace',
  select:"#3ef2ff",accent:"#ff5e4f",label:"#eef0f6",labelBg:"rgba(3,4,6,.82)",previewBg:"rgba(255,68,89,.9)",previewInk:"#ffffff"});
Monolith.theme.gmColor="#ff4459";

Monolith.registerGame({
  id:"cyberpunk", api:1, diceLabel:"D10",
  brand:role=>`<b>Night City <i>Dossier</i></b><span>CP2020 · ${role==="gm"?"GM console":"player characters"}</span>`,
  rulesets:{cp2020:{
    name:"Cyberpunk 2020",
    character:{
      blank:()=>blankChar(), normalize:x=>normalizeChar(x),
      isCharacter:x=>!!(x&&typeof x==="object"&&x.stats&&typeof x.stats==="object"),
      isFinished:c=>!!(c&&c.created), joined:c=>{c.created=true},
      label:c=>c.handle||c.name||"Unnamed", card:cpCard, summary:cpSummary,
      sample:SAMPLE, copy:cpCopy, beforeSave:c=>cpBeforeSave(c),
    },
    campaign:{
      defaults:()=>cpCampaignDefaults(), normalize:(out,d0)=>{cpCampaignNormalize(out,d0);out.shop=sanitizeShop(out.shop)},
      summary:s=>gmSummaryCp(s), firstName:"Night City Campaign",
      newOptions:cpNewCampaignOptions, applyNewOptions:s=>{if(ui.campNewNpcs&&st.npcs.length)s.npcs=clone(st.npcs);ui.campNewNpcs=false},
    },
    player:{
      charNoun:["runner","runners"], rosterTitle:"Your runners",
      newCard:()=>({label:"10-minute build",title:"+ New runner",text:"Pick a role, roll stats, spend skill points, roll a lifepath, buy chrome."}),
      views:{wizard:c=>viewWizard(c),sheet:c=>viewSheet(c)},
      openView:c=>c.created?"sheet":"wizard",
      onOpen:()=>{ui.tab="skills";ui.editItem=null;ui.dmg.result=null;ui.skSearch=""},
      navExtra:()=>cpNavExtra(), backupExtra:()=>`<button class="btn sm ghost" data-act="print-blank">Print a blank sheet</button>`,
      tablePanel:c=>cpTablePanel(c), onMessage:(type,m)=>cpPlayerMessage(type,m), onPeek:info=>cpOnPeek(info),
    },
    gm:{
      charNoun:["runner","runners"], partyName:"Party", partyTitle:"The party",
      summaryHint:"The crew owes Malachi 5,000eb and Arasaka wants the datachip back.",
      tabs:[
        {id:"encounter",order:20,label:()=>`Encounter${st.encounter.list.length?" · "+st.encounter.list.length:""}`,view:()=>viewEncounter()},
        {id:"npcs",order:40,label:()=>"NPCs",view:()=>viewNpcs()},
        {id:"homebrew",order:50,label:()=>"Homebrew",view:()=>viewHomebrew()},
        {id:"reference",order:70,label:()=>"Rules ref",view:()=>viewReference()},
      ],
      partyActions:()=>cpPartyActions(), partyTable:list=>cpPartyTable(list), characterView:c=>viewPc(c),
      campaignExtra:()=>packagesPanel(), backupExtra:()=>`<button class="btn sm ghost" data-act="print-blank">Print a blank sheet</button>`,
      campaignsActions:()=>cpCampaignsActions(), mapSideExtra:()=>cpMapSideShop(),
      tokenRing:cpTokenRing, activeTurn:cpActiveTurn, tokenInfo:cpTokenInfo, tokenButtons:cpTokenButtons,
      onRemoveCharacter:cpRemoveCharacter, removeNotes:cpRemoveNotes,
      onPeek:conn=>sendRules(conn,true), onJoined:conn=>sendRules(conn,false),
      boot:()=>{gmPacksInit();cpSkillNames()},
    },
  }},
});
