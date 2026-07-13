const fs = require('fs');
const path = require('path');

// Generate SVG for "CLASSROOM OF THE ELIE" in official COTE block mosaic style
const row1 = [
  { char: 'C', bg: '#de266c', fg: '#ffffff' },
  { char: 'L', bg: '#ffffff', fg: '#0a0a0a' },
  { char: 'A', bg: '#ffffff', fg: '#0a0a0a' },
  { char: 'S', bg: '#ffffff', fg: '#0a0a0a' },
  { char: 'S', bg: '#ffffff', fg: '#0a0a0a' },
  { char: 'R', bg: '#a4003e', fg: '#ffffff' },
  { char: 'O', bg: '#ffffff', fg: '#0a0a0a' },
  { char: 'O', bg: '#ffffff', fg: '#0a0a0a' },
  { char: 'M', bg: '#ffffff', fg: '#0a0a0a' },
  { char: 'O', bg: '#a4003e', fg: '#ffffff' },
  { char: 'F', bg: '#ffffff', fg: '#0a0a0a' }
];

const row2 = [
  { char: 'T', bg: '#e5007f', fg: '#ffffff', col: 3 },
  { char: 'H', bg: '#ffffff', fg: '#0a0a0a', col: 4 },
  { char: 'E', bg: '#ffffff', fg: '#0a0a0a', col: 5 },
  { char: 'E', bg: '#a4003e', fg: '#ffffff', col: 6 },
  { char: 'L', bg: '#ffffff', fg: '#0a0a0a', col: 7 },
  { char: 'I', bg: '#ffffff', fg: '#0a0a0a', col: 8 },
  { char: 'E', bg: '#de266c', fg: '#ffffff', col: 9 }
];

const blockSize = 50;
const gap = 0.5;
const totalWidth = 11 * blockSize;
const totalHeight = 2 * blockSize;

let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="100%">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&amp;display=swap');
    .letter {
      font-family: 'Oswald', 'Impact', sans-serif;
      font-weight: 700;
      font-size: 38px;
      text-anchor: middle;
      dominant-baseline: central;
    }
  </style>
`;

// Draw Row 1
row1.forEach((cell, idx) => {
  const x = idx * blockSize;
  const y = 0;
  svgContent += `  <rect x="${x}" y="${y}" width="${blockSize - gap}" height="${blockSize - gap}" fill="${cell.bg}" />\n`;
  svgContent += `  <text x="${x + blockSize / 2}" y="${y + blockSize / 2 + 2}" fill="${cell.fg}" class="letter">${cell.char}</text>\n`;
});

// Draw Row 2
row2.forEach((cell) => {
  const x = cell.col * blockSize;
  const y = blockSize;
  svgContent += `  <rect x="${x}" y="${y}" width="${blockSize - gap}" height="${blockSize - gap}" fill="${cell.bg}" />\n`;
  svgContent += `  <text x="${x + blockSize / 2}" y="${y + blockSize / 2 + 2}" fill="${cell.fg}" class="letter">${cell.char}</text>\n`;
});

svgContent += `</svg>\n`;

const outputPath = path.join(__dirname, '../public/cote-logo.svg');
fs.writeFileSync(outputPath, svgContent, 'utf8');
console.log('Successfully generated cote-logo.svg spelling CLASSROOM OF THE ELIE');
