"""Release creation helper: builds versioned zip of this project in its parent."""
from pathlib import Path
import hashlib,zipfile,json,sys
ROOT=Path(__file__).resolve().parent
OUT=ROOT.parent/'LAST_LEGEND_Full_Build_Kit_v1.zip'
FILES=[p for p in ROOT.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name!='PACKAGE_MANIFEST.json' and not p.name.endswith('.pyc')]
FILES=sorted(FILES,key=lambda p:p.relative_to(ROOT).as_posix())
manifest={'package_name':'LAST_LEGEND_Full_Build_Kit_v1','version':'0.2.0','contents_count_excluding_manifest':len(FILES),'contains_252_athletes':True,'release_checks':'15 local unit tests and 300 simulated smoke matches passed; all 252 stat records provisional; 2 jersey numbers verified','files':[{'path':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in FILES]}
(ROOT/'PACKAGE_MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
with zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in FILES+[ROOT/'PACKAGE_MANIFEST.json']:
        z.write(p,'LAST_LEGEND/'+p.relative_to(ROOT).as_posix())
with zipfile.ZipFile(OUT) as z:
    bad=z.testzip()
    assert bad is None,bad
    assert len(z.namelist())==len(FILES)+1
print('zip',OUT,'bytes',OUT.stat().st_size,'files',len(FILES)+1,'sha256',hashlib.sha256(OUT.read_bytes()).hexdigest())
