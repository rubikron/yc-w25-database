const data = require('../public/data/companies-f25.json');
console.log('Total companies:', data.companies.length);
console.log('With VC reports:', data.companies.filter(c => c.vcReport).length);
console.log('Without VC reports:', data.companies.filter(c => !c.vcReport).length);
