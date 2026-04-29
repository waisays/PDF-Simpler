const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const processedDir = path.join(__dirname, '../tmp/processed');

// Ensure processed directory exists
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true });
}

// Helper function to generate output filename
function getOutputFilename(originalName, suffix) {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);
  return `${base}-${suffix}${ext}`;
}

// Merge PDFs
async function merge(files) {
  if (!files || files.length < 2) {
    throw new Error('At least 2 PDF files required for merge');
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const fileBuffer = fs.readFileSync(file.path);
    const pdf = await PDFDocument.load(fileBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  const outputPath = path.join(processedDir, getOutputFilename(files[0].originalname, 'merged'));
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
}

// Split PDF
async function split(inputPath, options = {}) {
  const { pages = '1' } = options;
  const fileBuffer = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.load(fileBuffer);

  // Parse page ranges (e.g., "1-3,5,7-9")
  const pageRanges = pages.split(',').map(range => {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(num => parseInt(num) - 1);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    return [parseInt(range) - 1];
  }).flat();

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdf, pageRanges);
  copiedPages.forEach(page => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'split'));
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
}

// Compress PDF
async function compress(inputPath) {
  const fileBuffer = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });

  // Save with compression options
  const pdfBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'compressed'));
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
}

// Rotate PDF
async function rotate(inputPath, degreesToRotate = 90) {
  const fileBuffer = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.load(fileBuffer);

  const pages = pdf.getPages();
  pages.forEach(page => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + degreesToRotate));
  });

  const pdfBytes = await pdf.save();
  const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'rotated'));
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
}

// Extract pages
async function extractPages(inputPath, pageNumbers) {
  const fileBuffer = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.load(fileBuffer);

  const newPdf = await PDFDocument.create();
  const pagesToExtract = pageNumbers.map(num => parseInt(num) - 1);
  const copiedPages = await newPdf.copyPages(pdf, pagesToExtract);
  copiedPages.forEach(page => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'extracted'));
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
}

// Delete pages
async function deletePages(inputPath, pageNumbers) {
  const fileBuffer = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.load(fileBuffer);

  const pagesToDelete = pageNumbers.map(num => parseInt(num) - 1).sort((a, b) => b - a);
  pagesToDelete.forEach(pageNum => {
    pdf.removePage(pageNum);
  });

  const pdfBytes = await pdf.save();
  const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'pages-removed'));
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
}

// Image to PDF
async function imageToPdf(inputPath) {
  const fileBuffer = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.create();

  let image;
  const ext = path.extname(inputPath).toLowerCase();

  if (['.jpg', '.jpeg'].includes(ext)) {
    image = await pdf.embedJpg(fileBuffer);
  } else if (ext === '.png') {
    image = await pdf.embedPng(fileBuffer);
  } else {
    throw new Error('Unsupported image format. Use JPG or PNG.');
  }

  const page = pdf.addPage();
  const { width, height } = image.scale(1);

  // Fit image to page while maintaining aspect ratio
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const scale = Math.min(pageWidth / width, pageHeight / height) * 0.9;

  page.drawImage(image, {
    x: (pageWidth - width * scale) / 2,
    y: (pageHeight - height * scale) / 2,
    width: width * scale,
    height: height * scale,
  });

  const pdfBytes = await pdf.save();
  const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'pdf'));
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
}

// Organize PDF (reorder pages)
async function organize(inputPath, pageOrder) {
  const fileBuffer = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.load(fileBuffer);

  const newPdf = await PDFDocument.create();
  const newOrder = pageOrder.map(num => parseInt(num) - 1);
  const copiedPages = await newPdf.copyPages(pdf, newOrder);
  copiedPages.forEach(page => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'organized'));
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
}

// Password protect PDF
async function passwordProtect(inputPath, password) {
  const fileBuffer = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.load(fileBuffer);

  const pdfBytes = await pdf.save({
    userPassword: password,
    ownerPassword: password,
  });

  const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'protected'));
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
}

// Unlock PDF (remove password)
async function unlock(inputPath, password) {
  const fileBuffer = fs.readFileSync(inputPath);
  const pdf = await PDFDocument.load(fileBuffer, { password });

  const pdfBytes = await pdf.save();
  const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'unlocked'));
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
}

module.exports = {
  merge,
  split,
  compress,
  rotate,
  extractPages,
  deletePages,
  imageToPdf,
  organize,
  passwordProtect,
  unlock,
};
