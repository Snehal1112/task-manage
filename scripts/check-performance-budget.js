#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceBudgetChecker {
  constructor() {
    this.budget = JSON.parse(fs.readFileSync('./performance-budget.json', 'utf8'));
    this.buildStats = this.getBuildStats();
  }

  getBuildStats() {
    const distPath = path.join(__dirname, '..', 'dist');
    const assets = fs.readdirSync(path.join(distPath, 'assets'));

    const buildStats = {
      bundles: {},
      totalSize: 0
    };

    assets.forEach(asset => {
      const filePath = path.join(distPath, 'assets', asset);
      const fileStats = fs.statSync(filePath);
      const sizeKB = fileStats.size / 1024;

      // Categorize bundles
      if (asset.includes('index-') && asset.endsWith('.js')) {
        buildStats.bundles['main-bundle'] = sizeKB;
      } else if (asset.includes('vendor') || asset.includes('chunk') || asset.includes('react') || asset.includes('redux')) {
        buildStats.bundles['vendor-bundle'] = (buildStats.bundles['vendor-bundle'] || 0) + sizeKB;
      } else if (asset.endsWith('.css')) {
        buildStats.bundles['css-bundle'] = sizeKB;
      }

      buildStats.totalSize += sizeKB;
    });

    return buildStats;
  }

  checkBudgets() {
    console.log('🔍 Checking Performance Budgets...\n');

    let hasErrors = false;
    let hasWarnings = false;

    this.budget.budgets.forEach(budget => {
      const actualSize = this.buildStats.bundles[budget.name];

      if (!actualSize) {
        console.log(`⚠️  Warning: ${budget.name} not found in build output`);
        return;
      }

      const sizeDiff = actualSize - budget.size;
      const percentOver = (sizeDiff / budget.size) * 100;

      if (actualSize > budget.size * budget.errorThreshold) {
        console.log(`❌ Error: ${budget.name} exceeded budget by ${percentOver.toFixed(1)}%`);
        console.log(`   Budget: ${budget.size}${budget.unit}, Actual: ${actualSize.toFixed(1)}${budget.unit}`);
        hasErrors = true;
      } else if (actualSize > budget.size * budget.warningThreshold) {
        console.log(`⚠️  Warning: ${budget.name} approaching budget limit (+${percentOver.toFixed(1)}%)`);
        console.log(`   Budget: ${budget.size}${budget.unit}, Actual: ${actualSize.toFixed(1)}${budget.unit}`);
        hasWarnings = true;
      } else {
        console.log(`✅ ${budget.name}: ${actualSize.toFixed(1)}${budget.unit} (within budget)`);
      }
    });

    console.log(`\n📊 Total bundle size: ${this.buildStats.totalSize.toFixed(1)}kB`);

    if (hasErrors) {
      console.log('\n💥 Performance budget check FAILED - build exceeds error threshold');
      process.exit(1);
    } else if (hasWarnings) {
      console.log('\n⚠️  Performance budget check PASSED with warnings');
      if (process.env.CI) {
        console.log('Consider optimizing bundle size to stay within safe limits');
      }
    } else {
      console.log('\n✅ Performance budget check PASSED');
    }
  }
}

// Run the checker
const checker = new PerformanceBudgetChecker();
checker.checkBudgets();
