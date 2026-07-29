import os
import re

files = [f for f in os.listdir('.') if f.endswith('.html')]
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        # print non-ascii characters context
        matches = re.finditer(r'.{0,10}[^\x00-\x7F]+.{0,10}', content)
        for m in matches:
            print(f"{file}: {m.group(0)}")
            break # just first match per file
