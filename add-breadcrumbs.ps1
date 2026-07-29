$files = @(
    @{ name = "retail.html"; title = "Retail" },
    @{ name = "restaurant.html"; title = "Restaurant" },
    @{ name = "laundry.html"; title = "Laundry" },
    @{ name = "salon.html"; title = "Salon" },
    @{ name = "pricing.html"; title = "Pricing" },
    @{ name = "contact.html"; title = "Contact" }
)

foreach ($fileInfo in $files) {
    $filePath = "C:\Users\DELL\Downloads\tilleaswebsite\" + $fileInfo.name
    $content = Get-Content $filePath -Raw
    
    $breadcrumbSchema = @"
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://tillease.co/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "$($fileInfo.title)",
        "item": "https://tillease.co/$($fileInfo.name.Replace('.html', ''))"
      }
    ]
  }
  </script>
</head>
"@

    if (-not $content.Contains("BreadcrumbList")) {
        $content = $content -replace '</head>', $breadcrumbSchema
        Set-Content -Path $filePath -Value $content
        Write-Host "Added BreadcrumbList to $($fileInfo.name)"
    }
}
