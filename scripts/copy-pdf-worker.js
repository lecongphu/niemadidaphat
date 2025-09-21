/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyIfExists(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✔ Copied ${src} -> ${dest}`);
    return true;
  }
  console.warn(`✖ Not found: ${src}`);
  return false;
}

try {
  const projectRoot = process.cwd();
  const publicDir = path.join(projectRoot, 'public');
  ensureDirSync(publicDir);

  // Possible worker paths (mjs preferred)
  const candidates = [
    path.join(projectRoot, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs'),
    path.join(projectRoot, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js'),
    path.join(projectRoot, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.min.js'),
  ];

  let copied = false;
  for (const src of candidates) {
    const fileName = src.endsWith('.mjs') ? 'pdf.worker.min.mjs' : 'pdf.worker.min.js';
    const dest = path.join(publicDir, fileName);
    if (copyIfExists(src, dest)) {
      copied = true;
    }
  }

  if (!copied) {
    console.warn('⚠ Could not find pdf.js worker files to copy.');
  } else {
    console.log('✅ PDF.js worker files are ready in /public');
  }
} catch (err) {
  console.error('Failed to copy PDF.js worker files:', err);
  process.exit(0); // do not fail install
}


