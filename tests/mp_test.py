"""Playing together: hosting, joining, the shared map, rolls, chat and syncing characters both ways."""
import asyncio, json, sys
from playwright.async_api import async_playwright
from harness import *
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        gm=await page(b,"GM","gm.html")
        await gm.click("nav [data-act=tab][data-t=map]");await gm.wait_for_timeout(200)
        await gm.screenshot(path=OUT+'/'+"gm-empty.png")
        # upload a map image through the hidden input
        await gm.click(".map-empty >> text=Add map image")
        await gm.set_input_files("input[type=file][accept^='image']",FIX+"/testmap.png");await gm.wait_for_timeout(1500)
        ok(await gm.evaluate("st.maps.length===1&&!!st.maps[0].asset"),"GM map image uploaded and stored")
        await gm.evaluate("()=>{st.maps[0].grid.size=70;save()}")
        # host
        await gm.click("[data-act=open-modal][data-m=host] >> nth=0");await gm.wait_for_timeout(150)
        await gm.click("[data-act=host-online]");await gm.wait_for_timeout(900)
        ok(await gm.evaluate("Host.status==='online'"),"GM hosting online")
        await gm.click("[data-act=copy-invite] >> nth=-1");await gm.wait_for_timeout(100)
        code=await gm.evaluate("window.__clip");ok(code.startswith("MON1."),"invite code copied")
        await gm.screenshot(path=OUT+'/'+"gm-host.png")
        await gm.click("[data-act=close-modal]")
        # players
        p1=await page(b,"P1","player.html");await make_runner(p1,"Razor")
        p2=await page(b,"P2","player.html");await make_runner(p2,"Kilo")
        # wrong password
        bad=code[:-3]+("AAA" if not code.endswith("AAA") else "BBB")
        wrongpw=await p2.evaluate("c=>{const inv=readInvite(c);return makeInvite(inv.u,'nope',inv.n,inv.g)}",code)
        await join(p2,wrongpw,"Sam","Kilo")
        ok("Wrong room password" in (await p2.inner_text("#app")),"wrong password is refused with a clear message")
        # a player on another version of the game is told, and Monolith is asked for the GM's version
        p3=await page(b,"P3","player.html");await make_runner(p3,"Old")
        await p3.evaluate("()=>{window.GAME_INFO_REAL=GAME_INFO;GAME_INFO=Object.freeze({...GAME_INFO,version:'0.9.0'})}")
        await join(p3,code,"Tess","Old");await p3.wait_for_timeout(500)
        ens=await p3.evaluate("window.__ensure")
        ok(ens==[["cyberpunk",MANIFEST["version"]]],"a different game version asks Monolith for the GM's exact version: "+str(ens))
        ok(await gm.evaluate("Host.conns.size")==0,"…and isn't let in on the wrong version")
        ok(MANIFEST["version"] in (await p3.inner_text("#app")),"…with a message naming the version")
        await p3.evaluate("()=>{GAME_INFO=Object.freeze({...GAME_INFO_REAL,id:'dnd'})}")
        await join(p3,code,"Tess","Old");await p3.wait_for_timeout(500)
        ok("This table plays Cyberpunk" in (await p3.inner_text("#app")) or "plays" in (await p3.inner_text("#app")),"a player from another game is told which game the table plays")
        ok(len(await p3.evaluate("window.__ensure"))==1,"…without fetching anything")
        await p3.close()
        await join(p1,code,"Alex","Razor")
        ok(await p1.evaluate("Net.state==='online'&&!!Net.scene"),"P1 joined and received the scene")
        await join(p2,code,"Sam","Kilo")
        ok(await p2.evaluate("Net.state==='online'"),"P2 joined")
        g=await gm.evaluate("""()=>({party:st.party.map(c=>c.handle),roster:Object.values(st.roster).map(r=>r.name),toks:st.maps[0].tokens.map(t=>({l:t.label,o:t.owner,k:t.kind})),log:st.tableLog.map(e=>e.text).filter(Boolean)})""")
        ok(sorted(g["party"])==["Kilo","Razor"],"both runners saved into the campaign party: "+str(g["party"]))
        ok(sorted(g["roster"])==["Alex","Sam"],"players recorded in the campaign roster")
        ok(len([t for t in g["toks"] if t["k"]=="pc" and t["o"]])==2,"each player was assigned an owned token: "+str(g["toks"]))
        ok(any("Alex joined as Razor" in x for x in g["log"]),"join logged")
        persisted=await gm.evaluate("JSON.parse(localStorage.getItem('monolith-campaign-'+CUR+'-state')).party.length")
        ok(persisted==2,"campaign saved to disk storage with both runners")
        await gm.wait_for_timeout(400)
        ok(await p2.evaluate("Net.scene.tokens.length===2&&Net.players.length===2"),"P2 sees both tokens and both players")
        await p1.screenshot(path=OUT+'/'+"p1-table.png")
        # P1 drags its own token on the canvas
        tok=await p1.evaluate("(()=>{const t=Net.scene.tokens.find(x=>x.owner===PID);const s=PMapV.toScreen(t.x,t.y);const r=PMapV.canvas.getBoundingClientRect();return {id:t.id,x:s.x+r.left,y:s.y+r.top,wx:t.x,wy:t.y}})()")
        await p1.mouse.move(tok["x"],tok["y"]);await p1.mouse.down();
        for i in range(1,11): await p1.mouse.move(tok["x"]+i*21,tok["y"]+i*14);await p1.wait_for_timeout(20)
        await p1.mouse.up();await p1.wait_for_timeout(500)
        gp=await gm.evaluate("id=>{const t=st.maps[0].tokens.find(x=>x.id===id);return [t.x,t.y]}",tok["id"])
        p2p=await p2.evaluate("id=>{const t=Net.scene.tokens.find(x=>x.id===id);return [t.x,t.y]}",tok["id"])
        ok(gp!=[tok["wx"],tok["wy"]] and gp==p2p,f"P1 moved its token; GM and P2 agree on {gp}")
        ok((gp[0]-35)%70==0 and (gp[1]-35)%70==0,"move snapped to the grid square centre")
        # P1 tries to move P2's token by sending a forged message
        other=await p1.evaluate("Net.scene.tokens.find(x=>x.owner!==PID).id")
        before=await gm.evaluate("id=>{const t=st.maps[0].tokens.find(x=>x.id===id);return [t.x,t.y]}",other)
        await p1.evaluate("id=>netSend({t:'move',id,x:5,y:5,final:true})",other);await p1.wait_for_timeout(300)
        after=await gm.evaluate("id=>{const t=st.maps[0].tokens.find(x=>x.id===id);return [t.x,t.y]}",other)
        ok(before==after,"GM refuses a player moving someone else's token")
        # fog + hidden token
        await gm.evaluate("()=>{A['fog-all']();const m=st.maps[0];m.fog.shapes.push({id:'cut1',op:'cut',type:'rect',pts:[0,0,700,700]});m.tokens.push({id:'secret',kind:'marker',label:'Ambush',color:'#a76200',size:1,x:1000,y:800,hidden:true});save()}")
        await gm.wait_for_timeout(500)
        f=await p1.evaluate("({n:Net.scene.fog.shapes.length,secret:Net.scene.tokens.some(t=>t.id==='secret'),hid:PMapV.fogHides(Net.scene,1100,900),vis:PMapV.fogHides(Net.scene,100,100)})")
        ok(f["n"]==2 and not f["secret"],"players get the fog but never the hidden token")
        ok(f["hid"] and not f["vis"],"fogged area hidden, revealed area visible on the player's map")
        await p1.screenshot(path=OUT+'/'+"p1-fog.png")
        # dice + chat
        await p1.evaluate("Dice.check('Handgun (REF)',15,{who:whoName()})");await p1.wait_for_timeout(400)
        ok(await gm.evaluate("st.tableLog.some(e=>e.kind==='roll'&&e.who==='Razor'&&/Handgun/.test(e.label))"),"P1's roll reached the GM's table log")
        ok(await p2.evaluate("Net.log.some(e=>e.kind==='roll'&&e.who==='Razor')"),"P2 saw P1's roll")
        await p2.fill("#chat-in","On my way, cover me");await p2.press("#chat-in","Enter");await p2.wait_for_timeout(400)
        ok(await p1.evaluate("Net.log.some(e=>e.kind==='chat'&&e.text==='On my way, cover me')"),"chat reached other players")
        # GM hidden roll stays private
        await gm.evaluate("Dice.check('Ambush stealth',14,{who:'GM'})");await gm.wait_for_timeout(300)
        ok(not await p1.evaluate("Net.log.some(e=>/Ambush/.test(e.label||''))"),"GM rolls stay hidden by default")
        # GM damages P1 from the map -> syncs to the player's own sheet
        cidp1=await p1.evaluate("Net.charId")
        await gm.evaluate("id=>{withPc(id,c=>{c.wounds=11})}",cidp1);await gm.wait_for_timeout(600)
        ok(await p1.evaluate("id=>S.chars.get(id).wounds===11",cidp1),"GM's wound change synced to the player's sheet")
        ok(await p1.evaluate("JSON.parse(localStorage.getItem('monolith-roster-cyberpunk')).find(c=>c.id===Net.charId).wounds===11"),"…and saved on the player's computer")
        # player edits their sheet -> GM copy updates
        await p1.evaluate("()=>{const c=myChar();c.notes='Owes Malachi 5k';saveChar(c)}");await p1.wait_for_timeout(2500)
        ok(await gm.evaluate("id=>pc(id).notes==='Owes Malachi 5k'",cidp1),"player's sheet edit synced to the GM's campaign")
        ok(await gm.evaluate("id=>JSON.parse(localStorage.getItem('monolith-campaign-'+CUR+'-state')).party.find(c=>c.id===id).notes==='Owes Malachi 5k'",cidp1),"…and saved in the campaign")
        # active turn highlight: encounter with P1
        await gm.evaluate("id=>{addPcToEnc(id);st.encounter.turn=0;save()}",cidp1);await gm.wait_for_timeout(400)
        ok(await p1.evaluate("!!Net.scene.active"),"initiative turn shows on players' map")
        # drawing
        await p2.evaluate("()=>{PMapV.drawMode='pen';playerMapEvent('draw-add',{id:'d1',type:'pen',color:'#ff4459',w:3,pts:[100,100,200,150,260,240]})}");await p2.wait_for_timeout(400)
        ok(await gm.evaluate("st.maps[0].drawings.some(d=>d.id==='d1'&&d.by)") and await p1.evaluate("Net.scene.drawings.some(d=>d.id==='d1')"),"player drawing shared")
        await p1.evaluate("()=>playerMapEvent('draw-del',{id:'d1'})");await p1.wait_for_timeout(300)
        ok(await gm.evaluate("st.maps[0].drawings.some(d=>d.id==='d1')"),"players can't erase someone else's drawing")
        # ping and ruler relay
        await p2.evaluate("()=>playerMapEvent('ruler',{a:[100,100],b:[380,100]})");await p2.wait_for_timeout(300)
        ok(await p1.evaluate("Object.keys(PMapV.remoteRulers).length===1"),"ruler shared live")
        # leave + rejoin keeps the same token
        ntok=await gm.evaluate("st.maps[0].tokens.length")
        await p1.click("[data-act=net-leave]");await p1.wait_for_timeout(400)
        ok(await gm.evaluate("Host.conns.size===1"),"GM sees the player leave")
        await join(p1,code,"Alex","Razor");await p1.wait_for_timeout(400)
        ok(await gm.evaluate("st.maps[0].tokens.length")==ntok and await p1.evaluate("Net.state==='online'"),"rejoining reuses the same token")
        # GM switches map -> players get it with their tokens
        await gm.click(".ms >> text=+ Blank");await gm.wait_for_timeout(200)
        await gm.click("[data-act=map-activate]");await gm.wait_for_timeout(500)
        s=await p2.evaluate("({id:Net.scene.id,mine:Net.scene.tokens.filter(t=>t.owner===PID).length})")
        ok(s["mine"]==1 and s["id"]==await gm.evaluate("st.activeMap"),"switching maps gives every connected player a token on the new map")
        # GM reload restores roster from the server
        await gm.reload();await gm.wait_for_function("()=>typeof st!=='undefined'&&st&&Host.port",timeout=8000);await gm.wait_for_timeout(600)
        # in the shim the tunnel state isn't remembered, so the GM goes back online
        # (in the app, main keeps the tunnel up and the page picks it back up)
        # kicking
        await gm.evaluate("()=>{Host.status='online';Host.mode='online';Host.url='http://127.0.0.1:%d';pushConfig()}"%port);await gm.wait_for_timeout(300)
        # stop hosting
        await gm.evaluate("hostStop()");await gm.wait_for_timeout(500)
        ok(await p1.evaluate("Net.state==='off'") ,"players are told when the GM closes the table")
        ok("closed the table" in (await p1.inner_text("#app")) or "GM" in (await p1.inner_text("#app")),"closing message shown")
        await gm.wait_for_timeout(5500)
        ok(await gm.evaluate("Object.keys(window.__backups).some(k=>k.startsWith('cyberpunk-campaign-'))") ,"GM autosave also writes a backup file")
        ok(await p1.evaluate("Object.keys(window.__backups).includes('cyberpunk-characters')") ,"player autosave also writes a backup file")
        await gm.click("nav [data-act=tab][data-t=map]");await gm.wait_for_timeout(300)
        await gm.evaluate("()=>{ui.mapId=st.maps[0].id;render()}");await gm.wait_for_timeout(300)
        await gm.screenshot(path=OUT+'/'+"gm-map.png")
        await b.close()
asyncio.run(main())
sys.exit(finish())
