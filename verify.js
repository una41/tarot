const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/pro_birth.json', 'utf8'));
const card11 = data.list.find(c => c.id === 11);
console.log('ID 11 love fields:', Object.keys(card11.love));
console.log('ID 11 has study field:', card11.study !== undefined);
if (card11.study) {
  console.log('ID 11 study sub_title:', card11.study.sub_title);
}
