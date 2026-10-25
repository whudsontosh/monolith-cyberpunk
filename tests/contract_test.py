"""The game contract: what Monolith requires of a game is present, characters survive normalize,
and bad input is cleaned."""
import asyncio, json, sys
from playwright.async_api import async_playwright
from harness import *
REQ={"character":["blank","normalize","isCharacter","isFinished","label","card"]}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for role in ["player","gm"]:
            pg=await page(b,role,role+".html")
            info=await pg.evaluate("""()=>{const rs=Monolith.rules;return {id:Monolith.gameDef.id,api:Monolith.gameDef.api,parts:Object.fromEntries(Object.entries(rs).filter(([k,v])=>v&&typeof v==='object').map(([k,v])=>[k,Object.keys(v)])),name:rs.name}}""")
            ok(info["id"]==MANIFEST["id"] and info["api"]==MANIFEST["api"],f"{role}: registered id and API match game.json")
            ok(all(k in info["parts"]["character"] for k in REQ["character"]),f"{role}: the required character parts are there")
            ok(set(r["id"] for r in MANIFEST["rulesets"])>= {"cp2020"} and info["name"]=="Cyberpunk 2020",f"{role}: the ruleset matches the manifest")
        rt=await pg.evaluate("""()=>{const C=Monolith.rules.character;const c=C.blank();c.handle='Test';const n=C.normalize(JSON.parse(JSON.stringify(c)));return JSON.stringify(C.normalize(JSON.parse(JSON.stringify(n))))===JSON.stringify(n)&&n.handle==='Test'}""")
        ok(rt,"a character round-trips through normalize unchanged")
        junk=await pg.evaluate("""()=>{const C=Monolith.rules.character;return [C.isCharacter(null),C.isCharacter('x'),C.isCharacter({}),C.isCharacter({stats:{}})]}""")
        ok(junk==[False,False,False,True],"only things shaped like characters are accepted")
        bad=await pg.evaluate("""()=>{const c=Monolith.rules.character.normalize({stats:{REF:'9',BODY:'oops'},weapons:'nope',skills:5});return [typeof c.stats.REF,c.stats.BODY,Array.isArray(c.weapons),typeof c.skills]}""")
        ok(bad==["number",2,True,"object"],"normalize repairs damaged character data: "+str(bad))
        cm=await pg.evaluate("""()=>{const d=Monolith.rules.campaign.defaults();return ['npcs','encounter','gmNotes','packs'].every(k=>k in d)}""")
        ok(cm,"campaign defaults hold the game's own campaign data")
        await b.close()
    sys.exit(finish())
asyncio.run(main())
