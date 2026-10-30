"""Builds the Cyberpunk game for Monolith.
   dist/game/      the game as Monolith loads it (also what a developer copy of Monolith can load from a folder)
   dist/release/   cyberpunk-<version>.zip and release.json, ready to sign and publish"""
import os, json, hashlib, shutil, zipfile, time
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(HERE)
def rd(p): return open(os.path.join(HERE,p),encoding="utf-8").read()
M=json.load(open(os.path.join(ROOT,"game.json")))
SHARED=["rules.js","net.js","med.js","cyber.js","paper.js","packs.js"]
BUNDLES={"player.js":SHARED+["guide.js","player.js","player_packs.js","skillcheck.js","iteminfo.js","attack.js","player_table.js","net_player.js","med_player.js","cyber_player.js","veh.js","veh_player.js","game.js"],
         "gm.js":SHARED+["gm.js","gm_packs.js","net_gm.js","med_gm.js","cyber_gm.js","veh.js","veh_gm.js","game.js"]}
OUT=os.path.join(ROOT,"dist","game");REL=os.path.join(ROOT,"dist","release")
shutil.rmtree(os.path.join(ROOT,"dist"),ignore_errors=True);os.makedirs(os.path.join(OUT,"fonts"));os.makedirs(REL)
head=f"/* Cyberpunk {M['version']} for Monolith */\n\"use strict\";\n"
for name,files in BUNDLES.items():
    open(os.path.join(OUT,name),"w",encoding="utf-8").write(head+"\n".join(f"/* ---- {f} ---- */\n"+rd(f) for f in files))
shutil.copy(os.path.join(HERE,"skin.css"),os.path.join(OUT,"skin.css"))
for f in sorted(os.listdir(os.path.join(HERE,"fonts"))):shutil.copy(os.path.join(HERE,"fonts",f),os.path.join(OUT,"fonts",f))
json.dump(M,open(os.path.join(OUT,"game.json"),"w"),indent=2)
files={}
for dp,dn,fn in os.walk(OUT):
    for f in sorted(fn):
        p=os.path.join(dp,f);rel=os.path.relpath(p,OUT).replace(os.sep,"/")
        files[rel]=hashlib.sha256(open(p,"rb").read()).hexdigest()
zname=f"{M['id']}-{M['version']}.zip";zpath=os.path.join(REL,zname)
with zipfile.ZipFile(zpath,"w",zipfile.ZIP_DEFLATED) as z:
    for rel in sorted(files):
        zi=zipfile.ZipInfo(rel,date_time=(2026,1,1,0,0,0));zi.compress_type=zipfile.ZIP_DEFLATED
        z.writestr(zi,open(os.path.join(OUT,rel),"rb").read())
data=open(zpath,"rb").read()
release={"format":"monolith-game-release","id":M["id"],"name":M["name"],"version":M["version"],"api":M["api"],"minMonolith":M["minMonolith"],
  "file":zname,"size":len(data),"sha256":hashlib.sha256(data).hexdigest(),"files":files,"built":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())}
open(os.path.join(REL,"release.json"),"w").write(json.dumps(release,indent=1))
print("built",zname,len(data),"bytes,",len(files),"files")
