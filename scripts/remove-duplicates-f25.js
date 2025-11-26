const fs = require('fs');
const path = require('path');

const COMPANIES_PATH = path.join(__dirname, '..', 'public', 'data', 'companies-f25.json');

const data = JSON.parse(fs.readFileSync(COMPANIES_PATH, 'utf-8'));

console.log('Before deduplication:', data.companies.length, 'companies\n');

// Keep track of seen names
const seen = new Map();
const toRemove = [];

data.companies.forEach((company, index) => {
  if (seen.has(company.name)) {
    const firstIndex = seen.get(company.name);
    const firstCompany = data.companies[firstIndex];

    console.log(`Duplicate found: ${company.name}`);
    console.log(`  First occurrence (index ${firstIndex}):`, firstCompany.vcReport ? 'HAS report' : 'NO report');
    console.log(`  Duplicate (index ${index}):`, company.vcReport ? 'HAS report' : 'NO report');

    // Keep the one with the report
    if (company.vcReport && !firstCompany.vcReport) {
      console.log(`  → Keeping duplicate (has report), removing first\n`);
      toRemove.push(firstIndex);
      seen.set(company.name, index);
    } else {
      console.log(`  → Keeping first, removing duplicate\n`);
      toRemove.push(index);
    }
  } else {
    seen.set(company.name, index);
  }
});

// Remove duplicates (in reverse order to preserve indices)
toRemove.sort((a, b) => b - a);
toRemove.forEach(index => {
  data.companies.splice(index, 1);
});

console.log('After deduplication:', data.companies.length, 'companies');
console.log('Removed:', toRemove.length, 'duplicates\n');

// Renumber IDs
data.companies.forEach((company, index) => {
  company.id = `company-${index + 1}`;
});

// Save
fs.writeFileSync(COMPANIES_PATH, JSON.stringify(data, null, 2));
console.log('✅ Saved to:', COMPANIES_PATH);

// Count reports
const withReports = data.companies.filter(c => c.vcReport).length;
console.log(`\n📊 ${withReports}/${data.companies.length} companies have VC reports`);
