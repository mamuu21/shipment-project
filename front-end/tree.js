const fs = require('fs');
const path = require('path');

function printTree(dirPath, prefix = '') {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  const lastIndex = items.length - 1;

  items.forEach((item, index) => {
    const isLast = index === lastIndex;
    const pointer = isLast ? '└── ' : '├── ';
    const nextPrefix = prefix + (isLast ? '    ' : '│   ');

    console.log(prefix + pointer + item.name);

    if (item.isDirectory()) {
      printTree(path.join(dirPath, item.name), nextPrefix);
    }
  });
}

// Start from the current folder (or replace with another path)
printTree(process.cwd());
