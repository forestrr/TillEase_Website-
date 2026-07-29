import json, re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', content, re.DOTALL)
for i, m in enumerate(matches):
    try:
        json.loads(m.strip())
        print(f'Schema {i} is valid JSON.')
    except Exception as e:
        print(f'Schema {i} ERROR: {e}')
