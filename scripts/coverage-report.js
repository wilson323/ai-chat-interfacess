#!/usr/bin/env node

/**
 * Coverage Report Generator
 * Generates comprehensive test coverage reports and validates coverage thresholds
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CoverageReporter {
  constructor() {
    this.coverageDir = path.join(process.cwd(), 'coverage');
    this.thresholds = {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90
    };
  }

  async generateReport() {
    console.log('📊 Generating Coverage Report...\n');

    try {
      // Run tests with coverage
      console.log('🔍 Running tests with coverage...');
      execSync('npm run test:coverage', { stdio: 'inherit' });

      // Check if coverage file exists
      const summaryPath = path.join(this.coverageDir, 'coverage-summary.json');
      if (!fs.existsSync(summaryPath)) {
        throw new Error('Coverage summary file not found');
      }

      // Parse coverage data
      const coverageData = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

      // Generate report
      this.printCoverageSummary(coverageData);
      this.validateThresholds(coverageData);
      this.generateDetailedReport(coverageData);

      console.log('\n✅ Coverage report generated successfully!');
      console.log(`📁 Detailed HTML report available at: ${this.coverageDir}/lcov-report/index.html`);

    } catch (error) {
      console.error('❌ Error generating coverage report:', error.message);
      process.exit(1);
    }
  }

  printCoverageSummary(data) {
    console.log('\n📈 Coverage Summary:');
    console.log('─'.repeat(50));

    const formatPercentage = (value) => {
      return `${value.pct.toFixed(1)}% (${value.covered}/${value.total})`;
    };

    console.log(`📝 Statements: ${formatPercentage(data.total.statements)}`);
    console.log(`🌿 Branches:   ${formatPercentage(data.total.branches)}`);
    console.log(`⚡ Functions:  ${formatPercentage(data.total.functions)}`);
    console.log(`📏 Lines:      ${formatPercentage(data.total.lines)}`);

    console.log('\n🎯 Target Thresholds:');
    console.log(`📝 Statements: ${this.thresholds.statements}%`);
    console.log(`🌿 Branches:   ${this.thresholds.branches}%`);
    console.log(`⚡ Functions:  ${this.thresholds.functions}%`);
    console.log(`📏 Lines:      ${this.thresholds.lines}%`);
  }

  validateThresholds(data) {
    console.log('\n✅ Threshold Validation:');
    console.log('─'.repeat(50));

    const metrics = ['statements', 'branches', 'functions', 'lines'];
    let allPassed = true;

    metrics.forEach(metric => {
      const actual = data.total[metric].pct;
      const threshold = this.thresholds[metric];
      const passed = actual >= threshold;
      const status = passed ? '✅' : '❌';

      console.log(`${status} ${metric.charAt(0).toUpperCase() + metric.slice(1)}: ${actual.toFixed(1)}% (≥ ${threshold}%)`);

      if (!passed) allPassed = false;
    });

    if (allPassed) {
      console.log('\n🎉 All coverage thresholds met!');
    } else {
      console.log('\n⚠️  Some coverage thresholds not met. Additional tests needed.');
    }
  }

  generateDetailedReport(data) {
    // Generate file-level coverage report
    console.log('\n📁 File Coverage Details:');
    console.log('─'.repeat(80));

    Object.entries(data).forEach(([file, fileData]) => {
      if (file === 'total') return;

      const fileName = file.replace(process.cwd(), '');
      const lines = fileData.lines.pct.toFixed(1);
      const functions = fileData.functions.pct.toFixed(1);
      const branches = fileData.branches.pct.toFixed(1);
      const statements = fileData.statements.pct.toFixed(1);

      if (lines < 90 || functions < 90 || branches < 90 || statements < 90) {
        console.log(`⚠️  ${fileName}: Lines:${lines}% Functions:${functions}% Branches:${branches}% Statements:${statements}%`);
      }
    });
  }

  generateBadgeData() {
    const summaryPath = path.join(this.coverageDir, 'coverage-summary.json');
    const data = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

    const badgeData = {
      schemaVersion: 1,
      label: 'coverage',
      message: `${Math.round(data.total.lines.pct)}%`,
      color: data.total.lines.pct >= 90 ? 'green' : data.total.lines.pct >= 80 ? 'yellow' : 'red'
    };

    fs.writeFileSync(
      path.join(this.coverageDir, 'coverage-badge.json'),
      JSON.stringify(badgeData, null, 2)
    );

    console.log('🏷️  Coverage badge generated');
  }
}

// CLI execution
if (require.main === module) {
  const reporter = new CoverageReporter();
  reporter.generateReport()
    .then(() => {
      console.log('\n🎯 Coverage analysis complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Coverage analysis failed:', error);
      process.exit(1);
    });
}

module.exports = CoverageReporter;