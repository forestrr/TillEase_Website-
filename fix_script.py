with open('generate_blogs.py', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('{{', '{').replace('}}', '}')

for key in ['title', 'slug', 'description', 'category', 'deck', 'read_time', 'date', 'date_display', 'content', 'toc', 'related_links']:
    code = code.replace('{' + key + '}', '[[' + key + ']]')

code = code.replace('f"{{{k}}}"', 'f"[[{k}]]"')

with open('generate_blogs.py', 'w', encoding='utf-8') as f:
    f.write(code)
