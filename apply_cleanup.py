import os
import re

def process_file(filepath):
    with open(filepath, 'rb') as f:
        raw_bytes = f.read()

    if raw_bytes.startswith(b'\xef\xbb\xbf'):
        raw_bytes = raw_bytes[3:]
        
    text = raw_bytes.decode('utf-8')
    original_text = text
    
    # 1. Apply mojibake fix (same logic as fix_mojibake.py but for all files)
    try:
        fixed_text = text.encode('cp1252').decode('utf-8')
    except Exception as e:
        replacements = {
            'â€”': '—',
            'â€“': '–',
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
            'Ã¢': 'â',
            'Â©': '©',
            'Â·': '·'
        }
        fixed_text = text
        for k, v in replacements.items():
            fixed_text = fixed_text.replace(k, v)
    
    # Also explicitly fix these if they slip through the encoding try-block:
    fixed_text = fixed_text.replace('Â©', '©')
    fixed_text = fixed_text.replace('Â·', '·')
            
    # 2. Remove mobile-cta block
    # Looks like:
    # <div class="mobile-cta">
    #   <a href="/contact" class="btn btn-lime">Book a free demo</a>
    # </div>
    # We will use regex to remove it entirely
    fixed_text = re.sub(r'<div class="mobile-cta">\s*<a[^>]*>.*?</a>\s*</div>\n*', '', fixed_text, flags=re.DOTALL|re.IGNORECASE)

    if fixed_text != original_text:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed_text)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('.'):
    # skip .git or .agents if any
    if '.git' in root or '.agents' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            process_file(filepath)
