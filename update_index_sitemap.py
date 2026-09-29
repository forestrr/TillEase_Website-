import re

# Update Sitemap
sitemap_urls = """  <url>
    <loc>https://tillease.co/blog/uae-e-invoicing-retail-pos-vat-2026</loc>
    <lastmod>2026-09-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://tillease.co/blog/best-pos-system-cafes-uae</loc>
    <lastmod>2026-09-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://tillease.co/blog/butchery-pos-software-weighing-scale</loc>
    <lastmod>2026-09-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
"""

with open("sitemap.xml", "r", encoding="utf-8") as f:
    sitemap = f.read()

sitemap = sitemap.replace("</urlset>", sitemap_urls + "</urlset>")

with open("sitemap.xml", "w", encoding="utf-8") as f:
    f.write(sitemap)


# Update blog index
blog_cards = """
      <!-- New E-invoicing -->
      <article class="blog-card">
        <span class="blog-card-category">Accounting</span>
        <h3>UAE E-Invoicing 2026: Is Your Retail POS Ready?</h3>
        <p>The UAE Ministry of Finance is rolling out mandatory e-invoicing for B2B and retail businesses by 2026. Discover how shop owners can prepare for VAT compliance.</p>
        <a href="/blog/uae-e-invoicing-retail-pos-vat-2026" class="blog-card-link">Read Article &rarr;</a>
      </article>

      <!-- New Cafe -->
      <article class="blog-card">
        <span class="blog-card-category">Restaurant Guide</span>
        <h3>The Best POS System for Cafes and Coffee Shops in the UAE</h3>
        <p>Running a busy cafe in Dubai or Ajman? Discover the essential features your coffee shop POS actually needs, from modifiers to delivery caller ID.</p>
        <a href="/blog/best-pos-system-cafes-uae" class="blog-card-link">Read Article &rarr;</a>
      </article>

      <!-- New Butchery -->
      <article class="blog-card">
        <span class="blog-card-category">Retail Guide</span>
        <h3>Butchery POS Software: Managing Weights, Yields, and Prices</h3>
        <p>Meat shops have unique billing challenges. Learn why your butchery needs a specialized POS that integrates directly with electronic weighing scales.</p>
        <a href="/blog/butchery-pos-software-weighing-scale" class="blog-card-link">Read Article &rarr;</a>
      </article>
"""

with open("blog/index.html", "r", encoding="utf-8") as f:
    blog_index = f.read()

blog_index = blog_index.replace('<div class="blog-grid">', '<div class="blog-grid">' + blog_cards)

with open("blog/index.html", "w", encoding="utf-8") as f:
    f.write(blog_index)

print("Updated sitemap and blog index")
