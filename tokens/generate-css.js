const fs = require('fs');
const path = require('path');

// Usage: node generate-css.js [file1.json] [file2.json]
// If no arguments provided, it defaults to 'design-tokens.tokens.json'
const args = process.argv.slice(2);
const filesToProcess = args.length > 0 ? args : ['design-tokens.tokens.json'];

let mergedData = {};

filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Reading tokens from ${file}...`);
    const fileData = JSON.parse(fs.readFileSync(file, 'utf8'));
    mergedData = { ...mergedData, ...fileData };
  } else {
    console.warn(`Warning: File ${file} does not exist.`);
  }
});

// Function to resolve an alias path like primitive color collection.key color group.primary
function getByPath(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// Function to resolve aliased values (e.g. "{path.to.value}") recursively
function resolveValue(val, data) {
  if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
    const aliasPath = val.slice(1, -1);
    const resolvedObj = getByPath(data, aliasPath);
    if (resolvedObj && resolvedObj.value !== undefined) {
      return resolveValue(resolvedObj.value, data);
    }
  }
  return val;
}

const cssVariables = [];

// Helper to convert token objects into flat CSS variables
function processTokens(prefix, obj, data) {
  for (const key in obj) {
    if (obj[key] && obj[key].value !== undefined) {
      let val = resolveValue(obj[key].value, data);
      const safeKey = key.replace(/\s+/g, '-').toLowerCase();
      const varName = prefix ? `${prefix}-${safeKey}` : safeKey;
      
      // If the token value is a complex object (like font styles)
      if (typeof val === 'object' && val !== null) {
        for (const prop in val) {
           let cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
           let cssVal = val[prop];
           
           // Auto-append 'px' for dimensional properties that are numbers
           if (typeof cssVal === 'number' && prop !== 'fontWeight') {
              if (prop === 'lineHeight' && cssVal <= 3) {
                // assume unitless for small line heights
              } else {
                cssVal = cssVal + 'px';
              }
           }
           cssVariables.push(`  --${varName}-${cssProp}: ${cssVal};`);
        }
      } else {
        cssVariables.push(`  --${varName}: ${val};`);
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively process nested groups
      const safeKey = key.replace(/\s+/g, '-').toLowerCase();
      processTokens(prefix ? `${prefix}-${safeKey}` : safeKey, obj[key], data);
    }
  }
}

console.log('Processing color roles (light mode)...');
if (mergedData['color roles']) {
  processTokens('color', mergedData['color roles'], mergedData);
} else {
  console.log('No "color roles" found in the provided files.');
}

console.log('Processing typography...');
if (mergedData['typography']) {
  processTokens('typography', mergedData['typography'], mergedData);
} else if (mergedData['font']) {
  processTokens('font', mergedData['font'], mergedData);
} else {
  console.log('No "typography" or "font" found in the provided files.');
}

const cssContent = `/* Auto-generated Design Tokens */\n:root {\n${cssVariables.join('\n')}\n}\n`;
const outputPath = 'tokens.css';

fs.writeFileSync(outputPath, cssContent);
console.log(`\nSuccess! All CSS variables have been saved to ${outputPath}`);
