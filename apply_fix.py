import os

def fix_mojibake(filepath):
    with open(filepath, 'rb') as f:
        raw_bytes = f.read()

    # If it starts with BOM, strip it
    if raw_bytes.startswith(b'\xef\xbb\xbf'):
        raw_bytes = raw_bytes[3:]
        
    text = raw_bytes.decode('utf-8')
    
    replacements = {
        'Ã¢€”': '—',
        'Ã¢†’': '→',
        'Ã†’': '→',
        'Ã·': '·',
        'Ã¢œ“': '✓',
        'âœ“': '✓',
        'â€”': '—',
        'â†’': '→',
        'â€˜': '‘',
        'â€™': '’',
        'â€œ': '“',
        'â€\u009d': '”',
        'â€': '”',
        'Ã¢â‚¬â„¢': '’',
        'Ã¢â‚¬Â¦': '…'
    }
    
    fixed_text = text
    for k, v in replacements.items():
        fixed_text = fixed_text.replace(k, v)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(fixed_text)
    print(f"Fixed {filepath}")

files = [f for f in os.listdir('.') if f.endswith('.html')]
for file in files:
    fix_mojibake(file)

