const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');

// Extract dev ROWS
const devMatch = content.match(/let currentSection = null;\s+const sectionWeeks = \{\};\s+ROWS\.forEach\(row => \{[\s\S]*?const ROWS = (\[[\s\S]*?\]);/);
// Wait, ROWS is defined BEFORE buildTable!
