#!/usr/bin/env node

/**
 * Reset override files to keep only manually-written descriptions
 * This prepares for regeneration with improved AI prompts
 */

const fs = require('fs');
const path = require('path');

const VENDOR_OVERRIDES_PATH = path.join(__dirname, '..', 'src', 'data', 'vendor-overrides.json');
const CATEGORY_OVERRIDES_PATH = path.join(__dirname, '..', 'src', 'data', 'category-overrides.json');

// Load existing overrides
const vendorOverrides = JSON.parse(fs.readFileSync(VENDOR_OVERRIDES_PATH, 'utf8'));
const categoryOverrides = JSON.parse(fs.readFileSync(CATEGORY_OVERRIDES_PATH, 'utf8'));

// Keep only manually-written vendor descriptions
// (ones that have website, founded, or headquarters filled in)
const manualVendors = vendorOverrides.filter(vendor => {
  return vendor.website || vendor.founded || vendor.headquarters;
});

// Keep only manually-written category descriptions
// (shorter, specific ones that don't follow the AI pattern)
const manualCategories = categoryOverrides.filter(category => {
  const desc = category.customDescription || '';

  // Manual ones are typically shorter and don't use generic AI phrases
  const isManual = (
    desc.length < 150 && // Manual ones are concise
    !desc.includes('Users can access') &&
    !desc.includes('market intelligence, statistics, and trends') &&
    !desc.includes('security professionals can') &&
    !desc.includes('Users can expect') &&
    !desc.includes('This category')
  );

  return isManual;
});

// Write the filtered files
fs.writeFileSync(
  VENDOR_OVERRIDES_PATH,
  JSON.stringify(manualVendors, null, 2) + '\n',
  'utf8'
);

fs.writeFileSync(
  CATEGORY_OVERRIDES_PATH,
  JSON.stringify(manualCategories, null, 2) + '\n',
  'utf8'
);

console.log(`✅ Kept ${manualVendors.length} manual vendor descriptions`);
console.log(`✅ Kept ${manualCategories.length} manual category descriptions`);
console.log(`🗑️  Removed ${vendorOverrides.length - manualVendors.length} AI vendor descriptions`);
console.log(`🗑️  Removed ${categoryOverrides.length - manualCategories.length} AI category descriptions`);
console.log('\n📝 Ready to regenerate with improved prompts!');
