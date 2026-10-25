"""Runs every Cyberpunk test against a Monolith checkout (MONOLITH_DIR, default ../monolith)."""
import subprocess, sys, os, time
HERE=os.path.dirname(os.path.abspath(__file__))
SUITES=["contract_test.py","net_test.py","camp_test.py","mp_test.py","rm_test.py","pk_test.py","atk_test.py","table_test.py","iteminfo_test.py","guide_test.py","combat_test.py"]
failed=[]
for s in SUITES:
    t=time.time();print(f"\n===== {s}",flush=True)
    try: r=subprocess.run([sys.executable,os.path.join(HERE,s)],cwd=HERE,timeout=600)
    except subprocess.TimeoutExpired: print("TIMED OUT");failed.append(s);continue
    if r.returncode: failed.append(s)
    print(f"({time.time()-t:.0f}s)")
print("\nALL PASSED" if not failed else "\nFAILED: "+", ".join(failed))
sys.exit(1 if failed else 0)
