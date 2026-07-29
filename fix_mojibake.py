import os

def restore_file(filepath):
    with open(filepath, 'rb') as f:
        raw_bytes = f.read()

    # If it starts with BOM, strip it
    if raw_bytes.startswith(b'\xef\xbb\xbf'):
        raw_bytes = raw_bytes[3:]
        
    text = raw_bytes.decode('utf-8')
    
    # The text contains 'â€”' which is the UTF-8 encoding of what happens when 
    # UTF-8 bytes are read as cp1252.
    # To reverse this: encode back to cp1252, then decode as utf-8.
    try:
        fixed_text = text.encode('cp1252').decode('utf-8')
    except Exception as e:
        # If encoding fails, it means there are characters that aren't in cp1252,
        # maybe we shouldn't do a blind global replace.
        print(f"Failed to reverse globally for {filepath}: {e}")
        # Let's just do targeted replacements instead.
        replacements = {
            'â€”': '—',
            'â†’': '→',
            'Ã·': '·',
            'Ã¢œ“': '✓',
            'âœ“': '✓',
            'Ã¢€”': '—',
            'Ã¢†’': '→',
            'Ã†’': '→',
            'â€˜': '‘',
            'â€™': '’',
            'â€œ': '“',
            'â€': '”',
            'Ã¢': 'â'
        }
        fixed_text = text
        for k, v in replacements.items():
            fixed_text = fixed_text.replace(k, v)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(fixed_text)
    print(f"Fixed {filepath}")

files = [f for f in os.listdir('.') if f.endswith('.html')]
for file in files:
    restore_file(file)

