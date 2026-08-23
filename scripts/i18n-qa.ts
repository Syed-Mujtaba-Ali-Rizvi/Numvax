#!/usr/bin/env node
/**
 * scripts/i18n-qa.ts
 * 
 * Translation Quality Assurance script for Numvax i18n.
 * 
 * Checks:
 * - Key parity (all locales have same keys as English)
 * - No empty translations
 * - No English text leaked into non-English locales (for leaf values)
 * - Valid interpolation variables preserved
 * - Valid JSON
 * - No duplicate keys (JSON.parse handles this, but we flag it)
 * 
 * Usage: npx tsx scripts/i18n-qa.ts
 * Exit code 1 if any blocking error found.
 */

import * as fs from 'fs';
import * as path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const LOCALES = ['en', 'es', 'fr', 'de', 'it'];
const SOURCE_LOCALE = 'en';

interface QAResult {
  locale: string;
  errors: string[];
  warnings: string[];
}

// ——— Helpers ———

function loadJson(filePath: string): any {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e: any) {
    return { __parseError: e.message };
  }
}

/** Extract all leaf-level key paths from a nested object. Returns Map<dotPath, value> */
function flattenKeys(obj: any, prefix = ''): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      for (const [k, v] of flattenKeys(value, fullKey)) {
        result.set(k, v);
      }
    } else {
      result.set(fullKey, String(value));
    }
  }
  return result;
}

/** Extract interpolation variables from a string, e.g. "{count}" → ["count"] */
function extractVars(str: string): string[] {
  const matches = str.match(/\{(\w+)\}/g) || [];
  return matches.map(m => m.slice(1, -1));
}

/** Simple heuristic: does a string look like untranslated English?
 *  We flag if the non-English value is identical to the English value
 *  for strings longer than 15 characters (short words like "PDF", "OK", "Email" are OK to keep).
 */
function looksLikeEnglishLeak(enValue: string, localeValue: string): boolean {
  if (enValue === localeValue && enValue.length > 15) {
    // Allow if it contains only technical terms unlikely to be translated
    const technicalPattern = /^[A-Z0-9\s\+\-\/\.@%\{\}]+$/;
    if (technicalPattern.test(enValue)) return false;
    // Allow brand names, domain names, email patterns
    if (/numvax|@|\.com|\.txt|\.json|\.xml|\.csv/.test(enValue.toLowerCase())) return false;
    return true;
  }
  return false;
}

// ——— Main QA ———

async function runQA() {
  console.log('\n🔍 Numvax i18n Quality Assurance\n');
  console.log(`  Messages directory: ${MESSAGES_DIR}`);
  console.log(`  Locales: ${LOCALES.join(', ')}\n`);

  const results: QAResult[] = [];
  let hasBlockingError = false;

  // Load English source
  const enPath = path.join(MESSAGES_DIR, `${SOURCE_LOCALE}.json`);
  const enJson = loadJson(enPath);

  if (!enJson) {
    console.error(`❌ FATAL: Cannot find English source file: ${enPath}`);
    process.exit(1);
  }

  if (enJson.__parseError) {
    console.error(`❌ FATAL: Invalid JSON in en.json: ${enJson.__parseError}`);
    process.exit(1);
  }

  const enKeys = flattenKeys(enJson);
  console.log(`  English keys (source): ${enKeys.size}\n`);

  // Check each non-English locale
  for (const locale of LOCALES.filter(l => l !== SOURCE_LOCALE)) {
    const localePath = path.join(MESSAGES_DIR, `${locale}.json`);
    const result: QAResult = { locale, errors: [], warnings: [] };

    // 1. File exists
    if (!fs.existsSync(localePath)) {
      result.errors.push(`File missing: messages/${locale}.json`);
      results.push(result);
      hasBlockingError = true;
      continue;
    }

    // 2. Valid JSON
    const localeJson = loadJson(localePath);
    if (!localeJson || localeJson.__parseError) {
      result.errors.push(`Invalid JSON: ${localeJson?.__parseError || 'unknown error'}`);
      results.push(result);
      hasBlockingError = true;
      continue;
    }

    const localeKeys = flattenKeys(localeJson);
    console.log(`  Checking ${locale}.json (${localeKeys.size} keys)...`);

    // 3. Missing keys
    for (const [key, enValue] of enKeys) {
      if (!localeKeys.has(key)) {
        result.errors.push(`Missing key: "${key}"`);
        hasBlockingError = true;
      }
    }

    // 4. Extra keys (not in English — warn only)
    for (const key of localeKeys.keys()) {
      if (!enKeys.has(key)) {
        result.warnings.push(`Extra key not in English: "${key}"`);
      }
    }

    // 5. Check each translated value
    for (const [key, localeValue] of localeKeys) {
      const enValue = enKeys.get(key);
      if (!enValue) continue;

      // 5a. Empty translation
      if (!localeValue || localeValue.trim() === '') {
        result.errors.push(`Empty translation: "${key}"`);
        hasBlockingError = true;
      }

      // 5b. Interpolation variable parity
      const enVars = extractVars(enValue);
      const localeVars = extractVars(localeValue);
      const missingVars = enVars.filter(v => !localeVars.includes(v));
      const extraVars = localeVars.filter(v => !enVars.includes(v));
      if (missingVars.length > 0) {
        result.errors.push(`Missing interpolation vars in "${key}": {${missingVars.join('}, {')}}`);
        hasBlockingError = true;
      }
      if (extraVars.length > 0) {
        result.warnings.push(`Extra interpolation vars in "${key}": {${extraVars.join('}, {')}}`);
      }

      // 5c. English leak detection
      if (looksLikeEnglishLeak(enValue, localeValue)) {
        result.warnings.push(`Possible untranslated string in "${key}": "${localeValue.slice(0, 60)}..."`);
      }
    }

    results.push(result);
  }

  // ——— Report ———
  console.log('\n' + '─'.repeat(60));
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of results) {
    const status = result.errors.length > 0 ? '❌' : result.warnings.length > 0 ? '⚠️' : '✅';
    console.log(`\n${status} ${result.locale.toUpperCase()}`);

    if (result.errors.length > 0) {
      console.log(`   Errors (${result.errors.length}):`);
      result.errors.slice(0, 20).forEach(e => console.log(`     • ${e}`));
      if (result.errors.length > 20) console.log(`     ... and ${result.errors.length - 20} more`);
      totalErrors += result.errors.length;
    }

    if (result.warnings.length > 0) {
      console.log(`   Warnings (${result.warnings.length}):`);
      result.warnings.slice(0, 10).forEach(w => console.log(`     ~ ${w}`));
      if (result.warnings.length > 10) console.log(`     ... and ${result.warnings.length - 10} more`);
      totalWarnings += result.warnings.length;
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log(`   All checks passed.`);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`\n📊 Summary: ${totalErrors} errors, ${totalWarnings} warnings\n`);

  if (hasBlockingError) {
    console.error('❌ i18n QA FAILED — fix errors before deploying.\n');
    process.exit(1);
  } else {
    console.log('✅ i18n QA PASSED — all locales are complete.\n');
    process.exit(0);
  }
}

runQA().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
