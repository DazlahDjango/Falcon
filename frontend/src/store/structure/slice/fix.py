import glob
import os

for filepath in glob.glob("d:/Falcon/frontend/src/store/structure/slice/*.js"):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "return response.data;" in content:
        content = content.replace("return response.data;", "return response;")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {os.path.basename(filepath)}")
