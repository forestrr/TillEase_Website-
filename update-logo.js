const fs = require('fs');
const files = ['contact.html', 'index.html', 'laundry.html', 'pricing.html', 'restaurant.html', 'retail.html', 'salon.html'];
const searchRegex = /<svg class="mark".*?<\/svg>\s*<span class="word">TillEase<\/span>/gs;
const replaceStr = `<img src="logo.png" alt="TillEase Logo" class="brand-logo">`;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(searchRegex, replaceStr);
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}
