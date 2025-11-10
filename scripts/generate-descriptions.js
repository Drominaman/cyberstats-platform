#!/usr/bin/env node

/**
 * Generate AI-powered descriptions for vendors and categories
 *
 * This script:
 * 1. Fetches all vendors/categories from the Cyberstats API
 * 2. Identifies which ones are missing descriptions
 * 3. Uses OpenAI GPT-4o-mini to generate professional, SEO-optimized descriptions
 * 4. Updates the override JSON files
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai').default;

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = 'https://uskpjocrgzwskvsttzxc.supabase.co/functions/v1/rss-cyberstats';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Paths to override files
const VENDOR_OVERRIDES_PATH = path.join(__dirname, '..', 'src', 'data', 'vendor-overrides.json');
const CATEGORY_OVERRIDES_PATH = path.join(__dirname, '..', 'src', 'data', 'category-overrides.json');

/**
 * Fetch all stats from the API
 */
async function fetchStats() {
  console.log('📡 Fetching stats from API...');
  const response = await fetch(`${SUPABASE_URL}?key=${API_KEY}&format=json&limit=2000&days=365`);
  const data = await response.json();

  if (!data || !data.items || !Array.isArray(data.items)) {
    throw new Error('Invalid API response');
  }

  console.log(`✅ Fetched ${data.items.length} stats`);
  return data.items;
}

/**
 * Extract unique vendors from stats
 */
function extractVendors(stats) {
  const vendorCounts = {};

  stats.forEach(stat => {
    if (stat.publisher) {
      const slug = stat.publisher.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (!vendorCounts[slug]) {
        vendorCounts[slug] = {
          name: stat.publisher,
          slug,
          count: 0
        };
      }
      vendorCounts[slug].count++;
    }
  });

  return Object.values(vendorCounts);
}

/**
 * Extract unique categories from stats
 */
function extractCategories(stats) {
  const categoryCounts = {};

  stats.forEach(stat => {
    if (stat.tags && Array.isArray(stat.tags)) {
      stat.tags.forEach(tag => {
        const slug = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (!categoryCounts[slug]) {
          categoryCounts[slug] = {
            name: tag,
            slug,
            count: 0
          };
        }
        categoryCounts[slug].count++;
      });
    }
  });

  return Object.values(categoryCounts).filter(cat => cat.count >= 3);
}

/**
 * Generate vendor description using OpenAI
 */
async function generateVendorDescription(vendorName, statsCount) {
  const prompt = `Write a professional, SEO-optimized description (30-40 words) for the cybersecurity vendor "${vendorName}".

The description should:
- Be factual and professional
- Highlight their key security products/services (if known)
- Use industry-standard terminology (EDR, XDR, SIEM, etc.)
- Be engaging for security professionals
- Include specific product names if well-known
- Focus on what makes them notable in the cybersecurity market

Context: This vendor has ${statsCount} statistics/reports in our database.

Return ONLY the description text, no quotes, no preamble.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a cybersecurity industry analyst writing vendor descriptions for a professional security intelligence platform. Be accurate, concise, and SEO-optimized.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 100
  });

  return completion.choices[0].message.content.trim();
}

/**
 * Generate category description using OpenAI
 */
async function generateCategoryDescription(categoryName, statsCount) {
  const prompt = `Write a professional, SEO-optimized description (30-40 words) for the cybersecurity topic/category "${categoryName}".

The description should:
- Be factual and professional
- Explain what this category covers in cybersecurity
- Use industry-standard terminology
- Be valuable for security professionals researching this topic
- Focus on market intelligence, statistics, and trends
- Mention what type of data/insights users can expect

Context: This category has ${statsCount} statistics in our database.

Return ONLY the description text, no quotes, no preamble.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a cybersecurity industry analyst writing category descriptions for a professional security intelligence platform. Be accurate, concise, and SEO-optimized.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 100
  });

  return completion.choices[0].message.content.trim();
}

/**
 * Generate descriptions for vendors missing them
 */
async function generateVendorDescriptions(vendors, existingOverrides) {
  console.log('\n🏢 Generating vendor descriptions...');

  const existingSlugs = new Set(existingOverrides.map(v => v.slug));
  const missingVendors = vendors.filter(v => !existingSlugs.has(v.slug));

  console.log(`📊 Found ${vendors.length} total vendors`);
  console.log(`✅ ${existingSlugs.size} already have descriptions`);
  console.log(`🔄 Generating descriptions for ${missingVendors.length} vendors...`);

  if (missingVendors.length === 0) {
    console.log('✅ All vendors already have descriptions!');
    return existingOverrides;
  }

  const newOverrides = [...existingOverrides];
  let generated = 0;

  for (const vendor of missingVendors) {
    try {
      console.log(`  Generating: ${vendor.name}...`);
      const description = await generateVendorDescription(vendor.name, vendor.count);

      newOverrides.push({
        slug: vendor.slug,
        custom_description: description,
        website: '', // Can be filled in manually later
        founded: '',
        headquarters: ''
      });

      generated++;

      // Rate limiting: wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`  ❌ Error generating description for ${vendor.name}:`, error.message);
    }
  }

  console.log(`✅ Generated ${generated} new vendor descriptions`);
  return newOverrides;
}

/**
 * Generate descriptions for categories missing them
 */
async function generateCategoryDescriptions(categories, existingOverrides) {
  console.log('\n📂 Generating category descriptions...');

  const existingSlugs = new Set(existingOverrides.map(c => c.slug));
  const missingCategories = categories.filter(c => !existingSlugs.has(c.slug));

  console.log(`📊 Found ${categories.length} total categories`);
  console.log(`✅ ${existingSlugs.size} already have descriptions`);
  console.log(`🔄 Generating descriptions for ${missingCategories.length} categories...`);

  if (missingCategories.length === 0) {
    console.log('✅ All categories already have descriptions!');
    return existingOverrides;
  }

  const newOverrides = [...existingOverrides];
  let generated = 0;

  for (const category of missingCategories) {
    try {
      console.log(`  Generating: ${category.name}...`);
      const description = await generateCategoryDescription(category.name, category.count);

      newOverrides.push({
        slug: category.slug,
        customDescription: description
      });

      generated++;

      // Rate limiting: wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`  ❌ Error generating description for ${category.name}:`, error.message);
    }
  }

  console.log(`✅ Generated ${generated} new category descriptions`);
  return newOverrides;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting description generation...\n');

  // Validate environment variables
  if (!API_KEY) {
    throw new Error('NEXT_PUBLIC_API_KEY not found in .env.local');
  }
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not found in .env.local');
  }

  try {
    // Fetch stats
    const stats = await fetchStats();

    // Extract vendors and categories
    const vendors = extractVendors(stats);
    const categories = extractCategories(stats);

    // Load existing overrides
    const existingVendorOverrides = JSON.parse(fs.readFileSync(VENDOR_OVERRIDES_PATH, 'utf8'));
    const existingCategoryOverrides = JSON.parse(fs.readFileSync(CATEGORY_OVERRIDES_PATH, 'utf8'));

    // Generate new descriptions
    const updatedVendorOverrides = await generateVendorDescriptions(vendors, existingVendorOverrides);
    const updatedCategoryOverrides = await generateCategoryDescriptions(categories, existingCategoryOverrides);

    // Sort alphabetically by slug
    updatedVendorOverrides.sort((a, b) => a.slug.localeCompare(b.slug));
    updatedCategoryOverrides.sort((a, b) => a.slug.localeCompare(b.slug));

    // Write updated files
    fs.writeFileSync(
      VENDOR_OVERRIDES_PATH,
      JSON.stringify(updatedVendorOverrides, null, 2) + '\n',
      'utf8'
    );
    fs.writeFileSync(
      CATEGORY_OVERRIDES_PATH,
      JSON.stringify(updatedCategoryOverrides, null, 2) + '\n',
      'utf8'
    );

    console.log('\n✨ Description generation complete!');
    console.log(`📝 Vendor overrides: ${updatedVendorOverrides.length} total`);
    console.log(`📝 Category overrides: ${updatedCategoryOverrides.length} total`);
    console.log('\n💡 Review the generated descriptions in:');
    console.log(`   - ${VENDOR_OVERRIDES_PATH}`);
    console.log(`   - ${CATEGORY_OVERRIDES_PATH}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
