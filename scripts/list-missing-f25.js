const fs = require('fs');
const path = require('path');

const data = require('../public/data/companies-f25.json');

console.log('Companies without VC reports:\n');

data.companies.forEach((company, index) => {
  if (!company.vcReport) {
    console.log(`${index + 1}. ${company.name}`);
    console.log(`   ID: ${company.id}`);
    console.log(`   Website: ${company.website}`);
    console.log('');
  }
});
