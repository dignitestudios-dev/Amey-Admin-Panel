const fs = require('fs');

const html = fs.readFileSync('temp_rides.html', 'utf8');
const tableStart = html.indexOf('<table');
const sliceBeforeTable = html.slice(tableStart - 2000, tableStart);
console.log('--- SEARCH/TABS/FILTERS RIGHT BEFORE TABLE ---');
console.log(sliceBeforeTable);
