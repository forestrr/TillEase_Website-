$files = @("retail.html", "restaurant.html", "laundry.html", "salon.html", "pricing.html", "contact.html")
foreach ($file in $files) {
    $filePath = "C:\Users\DELL\Downloads\tilleaswebsite\" + $file
    $content = Get-Content $filePath -Raw
    
    # Check if there are faq-items
    if ($content -match '<div class="faq-item">') {
        # Check if FAQPage is already there
        if ($content -notmatch '"@type": "FAQPage"') {
            $regex = [regex]'(?s)<div class="faq-item">\s*<h3>(.*?)</h3>\s*<p>(.*?)</p>\s*</div>'
            $matches = $regex.Matches($content)
            
            if ($matches.Count -gt 0) {
                $entities = @()
                foreach ($m in $matches) {
                    $q = $m.Groups[1].Value.Replace('"', '\"').Trim()
                    $a = $m.Groups[2].Value.Replace('"', '\"').Trim()
                    $entities += "{`n        `"@type`": `"Question`",`n        `"name`": `"$q`",`n        `"acceptedAnswer`": {`n          `"@type`": `"Answer`",`n          `"text`": `"$a`"`n        }`n      }"
                }
                
                $entitiesStr = $entities -join ",`n"
                
                $schema = @"
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      $entitiesStr
    ]
  }
  </script>
</head>
"@
                $content = $content -replace '</head>', $schema
                Set-Content -Path $filePath -Value $content
                Write-Host "Added FAQPage to $file"
            }
        } else {
            Write-Host "FAQPage already in $file"
        }
    }
}
