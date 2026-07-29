import os
import re
import glob

html_files = glob.glob("*.html") + glob.glob("blog/*.html")

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Add to header navigation
    header_pattern = r'(<li><a href="[^"]*pricing[^"]*">Pricing</a></li>)'
    # We want to add Blog before Pricing or after Salon
    # Using \1 to keep the pricing link, and adding blog before it.
    if '<a href="/blog/">Blog</a>' not in content and 'href="blog"' not in content:
        content = re.sub(header_pattern, r'<li><a href="/blog/">Blog</a></li>\n        \1', content)
        
    # 2. Add to footer navigation
    # Depending on root vs subfolder, href might be "pricing" or "/pricing"
    footer_pattern = r'(<li><a href="[^"]*pricing[^"]*">Pricing</a></li>)'
    # We'll just replace it again, but wait, the first replace might hit both if they are identical!
    # Actually, re.sub replaces ALL occurrences by default. So it will do both header and footer!
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated links in {filepath}")
