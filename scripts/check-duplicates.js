const data = require('../public/data/companies-f25.json');

const names = data.companies.map(c => c.name);
const duplicates = names.filter((name, i) => names.indexOf(name) !== i);

console.log('Duplicate companies:', [...new Set(duplicates)]);
console.log('Total:', names.length, 'Unique:', new Set(names).size);

// Find specific duplicates
const nameCount = {};
data.companies.forEach((c, i) => {
  if (!nameCount[c.name]) nameCount[c.name] = [];
  nameCount[c.name].push({ index: i, id: c.id, hasReport: !!c.vcReport });
});

Object.entries(nameCount).forEach(([name, entries]) => {
  if (entries.length > 1) {
    console.log(`\n${name}:`);
    entries.forEach(e => {
      console.log(`  - Index ${e.index}, ID: ${e.id}, Has report: ${e.hasReport}`);
    });
  }
});
