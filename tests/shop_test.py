"""The full shop (1.1.3): the book's weapons, cyberware and gear, grouped gear, cyberweapons in the
Attack window, and the book's living costs."""
import asyncio, os
from playwright.async_api import async_playwright
from harness import *

SHOTS=os.path.join(OUT,"shop");os.makedirs(SHOTS,exist_ok=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pl=await page(b,"P","player.html");pl.set_default_timeout(8000)
        await make_runner(pl,"Razor")
        await pl.click(".card:has-text('Razor') >> text=Open sheet");await pl.wait_for_timeout(300)
        J=lambda s:pl.evaluate(s)
        n=await J("[WEAPONS.length,CYBER.length,GEAR.length]");print(n)
        ok(n[0]>=75 and n[1]>=130 and n[2]>=130,"the catalogs hold the book's lists %s"%n)
        names=await J("[...WEAPONS,...CYBER,...GEAR].map(r=>r[0])")
        ok(len(names)==len(set(names)),"no duplicate names across the catalogs")
        for x in ["Techtronica 15 Microwaver","EagleTech \"Tomcat\" compound bow","SPM-1 Battleglove","Colt .38 Detective","CAWS",
                  "Gills","Adrenal booster","Thermograph sensor","Hammer hand","Buzz hand","Micro-missile launcher","Linear frame Σ (Sigma)","Torso plate (SP 25)",
                  "Techscanner","Medscanner","Apartment cube","Jacket (Urban Flash)","Assault rifle ammo (box of 100)"]:
            ok(x in names,"in the shop: "+x)
        ok(await J("WEAPONS.find(r=>r[0]==='Kenshiri Adachi F-253 Flamethrower')[10]")==1500,"the flamethrower at the book's 1,500eb")
        ok(await J("GEAR.find(r=>r[0]==='Jacket (Businesswear)')[1]")==105,"Businesswear costs 3× (jacket 105eb)")
        await J("(()=>{const c=curChar();c.eb=90000;saveChar(c,true);render()})()")
        # gear shop groups
        await pl.click("[data-act=tab][data-t=gear]");await pl.wait_for_timeout(100)
        await pl.click("[data-act=open-modal][data-m=shop][data-tab=Gear]");await pl.wait_for_timeout(200)
        t=await pl.text_content(".shop-list")
        ok(all(x in t for x in ["Fashion: Generic Chic","Tools","Personal electronics","Data systems","Security","Medical","Furnishings","Ammunition","Vehicles"]),"the gear counter is grouped like the book")
        await pl.locator(".shop-row:has-text('Medscanner')").hover();await pl.wait_for_timeout(300)
        ok("+2 to diagnose" in (await pl.inner_text("#shop-detail")).lower(),"gear cards explain what it does")
        await pl.screenshot(path=os.path.join(SHOTS,"gear.png"))
        # cyberweapons in the Attack window
        await pl.click("[data-act=shop-tab][data-t=Cyberware]");await pl.wait_for_timeout(150)
        i=await J("CYBER.findIndex(r=>r[0]==='Hammer hand')");await pl.click(f"[data-act=buy][data-k=c][data-i='{i}']");await pl.wait_for_timeout(100)
        i2=await J("CYBER.findIndex(r=>r[0]==='Micro-missile launcher')");await pl.click(f"[data-act=buy][data-k=c][data-i='{i2}']");await pl.wait_for_timeout(100)
        w=await J("curChar().weapons.find(w=>w.name==='Hammer hand')")
        ok(w and w["dmg"]=="1D10" and w["type"]=="MEL" and w["cyber"],"a Hammer hand puts a 1D10 melee weapon on the sheet")
        m=await J("curChar().weapons.find(w=>w.name==='Micro-missile launcher')");ok(m and m["wa"]==2 and m["ammo"]==4 and m["range"]=="200m","the micro-missile launcher: WA +2, 4 missiles, 200m")
        await pl.click("[data-act=close-modal]");await pl.click("[data-act=tab][data-t=combat]");await pl.wait_for_timeout(150)
        await pl.click("[data-act=atk-open] >> nth=0");await pl.wait_for_timeout(150)
        await pl.click(f"[data-act=atk-pick][data-id='{w['id']}']");await pl.wait_for_timeout(100)
        ok("opposed" in (await pl.inner_text(".ck-roll")).lower(),"and it attacks like any melee weapon")
        await pl.click("[data-act=close-modal]");await pl.wait_for_timeout(100)
        await pl.click("[data-act=tab][data-t=cyber]");await pl.wait_for_timeout(100)
        idx=await J("curChar().cyber.findIndex(x=>x.name==='Hammer hand')")
        await pl.click(f"[data-act=edit-item][data-id='{await J('curChar().cyber.find(x=>x.name===\"Hammer hand\").id')}']");await pl.wait_for_timeout(100)
        await pl.click(f"[data-act=del-item][data-list=cyber][data-i='{idx}']");await pl.click(f"[data-act=del-item][data-list=cyber][data-i='{idx}']");await pl.wait_for_timeout(100)
        ok(not await J("curChar().weapons.some(w=>w.name==='Hammer hand')"),"removing the implant removes its weapon")
        # bows use Archery, plating adds armor
        bw=await J("mkWeapon(WEAPONS.find(r=>r[0].includes('Tomcat')))");ok(bw["skill"]=="Archery","bows use Archery")
        sh=await J("mkWeapon(WEAPONS.find(r=>r[0]==='Shuriken'))");ok(sh["skill"]=="Athletics","shuriken are thrown with Athletics")
        sp0=await J("spAt(curChar(),'torso')");i=await J("CYBER.findIndex(r=>r[0]==='Torso plate (SP 25)')")
        await J(f"(()=>{{const c=curChar();c.cyber.push(mkCyber(CYBER[{i}],0));saveChar(c,true)}})()")
        ok(await J("spAt(curChar(),'torso')")>=25 and await J("spAt(curChar(),'torso')")>=sp0,"torso plating counts as armor")
        # living costs
        await pl.click("[data-act=tab][data-t=gear]");await pl.wait_for_timeout(100);await pl.click(".ls-book summary");await pl.wait_for_timeout(100)
        t=await pl.text_content(".ls-book");ok("Coffin" in t and "Executive Zone" in t and "Kibble" in t,"the Lifestyle panel shows the book's living costs")
        await pl.screenshot(path=os.path.join(SHOTS,"lifestyle.png"),full_page=True)
        bad=await J("[...WEAPONS.map((_,i)=>'w:'+i),...CYBER.map((_,i)=>'c:'+i),...GEAR.map((_,i)=>'g:'+i)].filter(k=>{const h=itemInfoHTML(k);return !h||/undefined|NaN/.test(h)})")
        ok(not bad,"every item's card renders %s"%bad[:5])
        print("errors:",errs);ok(not errs,"no page errors")
        await b.close()
    finish()
asyncio.run(main())
