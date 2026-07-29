import re

with open('blog/best-pos-supermarket-uae.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the section tag
text = text.replace('<section class="blog-hero">', '<section class="page-hero blog-hero">')

# Update the inline CSS
old_css = """    .blog-hero {
      position: relative; 
      overflow: hidden; 
      background: var(--navy); 
      color: var(--off-white);
      padding: 100px 0;
      text-align: center;
    }"""

new_css = """    .blog-hero {
      min-height: auto;
      padding: 100px 0;
      text-align: center;
    }"""

text = text.replace(old_css, new_css)

with open('blog/best-pos-supermarket-uae.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated blog header!')
