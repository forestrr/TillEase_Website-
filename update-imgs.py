import os
import re

files = [f for f in os.listdir('.') if f.endswith('.html')]
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # The header has: <img src="assets/logo.png" alt="TillEase Logo" class="brand-logo">
    # The footer has the exact same tag.
    # To differentiate, we can just replace ALL occurrences with the <picture> tag, but for the footer we want loading="lazy".
    # Wait, the prompt says "loading="lazy" to below-the-fold images". So the footer one should definitely be lazy.
    # The header one shouldn't.
    # Let's split by </header>
    parts = content.split('</header>')
    if len(parts) == 2:
        header_part = parts[0]
        rest = parts[1]
        
        header_replace = """<picture>
        <source srcset="assets/logo.webp" type="image/webp">
        <img src="assets/logo.png" alt="TillEase Hybrid POS Software UAE Logo" width="180" height="50" class="brand-logo">
      </picture>"""
        
        footer_replace = """<picture>
          <source srcset="assets/logo.webp" type="image/webp">
          <img src="assets/logo.png" alt="TillEase Hybrid POS Software UAE Logo" width="180" height="50" class="brand-logo" loading="lazy">
        </picture>"""
        
        header_part = header_part.replace('<img src="assets/logo.png" alt="TillEase Logo" class="brand-logo">', header_replace)
        rest = rest.replace('<img src="assets/logo.png" alt="TillEase Logo" class="brand-logo">', footer_replace)
        
        # Defer three-bg.js in the rest part
        rest = rest.replace('<script src="three-bg.js"></script>', '<script src="three-bg.js" defer></script>')
        
        content = header_part + '</header>' + rest
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated images and scripts in {file}")
