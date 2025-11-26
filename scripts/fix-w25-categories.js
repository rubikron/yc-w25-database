#!/usr/bin/env node

/**
 * Fix W25 company categories by deriving them from tags and VC report data
 */

const fs = require('fs');
const path = require('path');

const COMPANIES_PATH = path.join(__dirname, '..', 'public', 'data', 'companies.json');

function inferCategoryFromTags(tags, tagline, vcReport) {
  // Priority order for category assignment
  if (tags.includes('AI') || tags.includes('Developer Tools')) {
    return 'B2B';
  }
  if (tags.includes('Fintech')) {
    return 'Fintech';
  }
  if (tags.includes('Healthcare')) {
    return 'Healthcare';
  }
  if (tags.includes('Climate')) {
    return 'Climate Tech';
  }
  if (tags.includes('Education')) {
    return 'Education';
  }
  if (tags.includes('Robotics')) {
    return 'Hardware';
  }
  if (tags.includes('Consumer')) {
    return 'Consumer';
  }
  if (tags.includes('SaaS') || tags.includes('B2B')) {
    return 'B2B';
  }

  // Fallback: analyze tagline and VC report
  const text = `${tagline} ${vcReport?.executiveSummary || ''}`.toLowerCase();

  if (text.includes('consumer') || text.includes('user') || text.includes('app')) {
    return 'Consumer';
  }
  if (text.includes('enterprise') || text.includes('business') || text.includes('b2b')) {
    return 'B2B';
  }
  if (text.includes('healthcare') || text.includes('medical') || text.includes('health')) {
    return 'Healthcare';
  }
  if (text.includes('fintech') || text.includes('financial') || text.includes('payment')) {
    return 'Fintech';
  }
  if (text.includes('climate') || text.includes('energy') || text.includes('carbon')) {
    return 'Climate Tech';
  }
  if (text.includes('hardware') || text.includes('robot') || text.includes('device')) {
    return 'Hardware';
  }
  if (text.includes('education') || text.includes('learning') || text.includes('school')) {
    return 'Education';
  }
  if (text.includes('developer') || text.includes('devops') || text.includes('infrastructure')) {
    return 'Developer Tools';
  }
  if (text.includes('government') || text.includes('public sector')) {
    return 'Government';
  }

  // Default
  return 'B2B';
}

function main() {
  console.log('🔧 Fixing W25 company categories...\n');

  // Load companies
  const data = JSON.parse(fs.readFileSync(COMPANIES_PATH, 'utf-8'));
  const companies = data.companies;

  console.log(`Found ${companies.length} companies\n`);

  let fixed = 0;
  const categoryStats = {};

  // Valid categories
  const validCategories = new Set([
    'B2B',
    'Consumer',
    'Fintech',
    'Healthcare',
    'Education',
    'Climate Tech',
    'Hardware',
    'Government',
    'Developer Tools'
  ]);

  companies.forEach((company) => {
    // Check if category is invalid (contains founder info, links, or other garbage)
    const isInvalid = !validCategories.has(company.category) ||
                      company.category.includes('linkedin.com') ||
                      company.category.includes('(') ||
                      company.category.includes('[') ||
                      company.category.includes('sources:') ||
                      company.category.includes('-') ||
                      company.category.includes('.') ||
                      company.category.length < 3 ||
                      company.category === '–';

    if (isInvalid) {
      const oldCategory = company.category.substring(0, 50); // Truncate for display
      const newCategory = inferCategoryFromTags(
        company.tags || [],
        company.tagline || '',
        company.vcReport
      );

      company.category = newCategory;

      console.log(`✓ ${company.name}: "${oldCategory}..." → "${newCategory}"`);
      fixed++;
    }

    // Update category stats
    categoryStats[company.category] = (categoryStats[company.category] || 0) + 1;
  });

  // Save updated data
  fs.writeFileSync(COMPANIES_PATH, JSON.stringify({ companies }, null, 2));

  console.log(`\n✅ Fixed ${fixed} categories`);
  console.log(`\n📊 Category breakdown:`);
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      const percentage = ((count / companies.length) * 100).toFixed(1);
      console.log(`   ${category}: ${count} (${percentage}%)`);
    });

  console.log(`\n💾 Saved to: ${COMPANIES_PATH}`);
}

main();
