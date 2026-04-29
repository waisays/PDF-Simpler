const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const libre = require('libreoffice-convert');
const pdfParse = require('pdf-parse');
const htmlPdf = require('html-pdf');

const processedDir = path.join(__dirname, '../tmp/processed');

// Ensure processed directory exists
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true });
}

// Helper function to generate output filename
function getOutputFilename(originalName, newExt) {
  const base = path.basename(originalName, path.extname(originalName));
  return `${base}.${newExt}`;
}

// PDF to Office (Word, Excel, PowerPoint)
async function pdfToOffice(inputPath, format = 'docx') {
  try {
    const fileBuffer = fs.readFileSync(inputPath);

    // Define output format based on requested format
    const outputFormat = format;

    // Convert using LibreOffice
    const officeBuffer = await libre.convert(fileBuffer, outputFormat, undefined);

    // Generate output filename
    const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), format));

    // Write the Office file
    fs.writeFileSync(outputPath, officeBuffer);

    return outputPath;
  } catch (error) {
    console.error('PDF to Office conversion error:', error);
    throw new Error(`PDF to ${format.toUpperCase()} conversion failed: ${error.message}`);
  }
}

// PDF to Image (JPG/PNG) using pdf-poppler approach
async function pdfToImage(inputPath, format = 'jpg') {
  try {
    // For now, we'll use a simple approach with pdf-parse to extract content
    // In production, you'd want to use pdf-poppler or similar for actual image rendering
    const pdfData = await pdfToText(inputPath);

    // Create a simple text-based image representation
    // This is a placeholder - real implementation would use pdf-poppler
    throw new Error('PDF to image conversion requires pdf-poppler or similar library for actual rendering. Current implementation extracts text only.');
  } catch (error) {
    console.error('PDF to image conversion error:', error);
    throw error;
  }
}

// Office to PDF (Word, Excel, PowerPoint)
async function officeToPdf(inputPath) {
  try {
    const fileBuffer = fs.readFileSync(inputPath);
    const ext = path.extname(inputPath).toLowerCase();

    // Define output format
    const outputFormat = ext === '.pdf' ? 'pdf' : 'pdf';

    // Convert using LibreOffice
    const pdfBuffer = await libre.convert(fileBuffer, outputFormat, undefined);

    // Generate output filename
    const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'pdf'));

    // Write the PDF file
    fs.writeFileSync(outputPath, pdfBuffer);

    return outputPath;
  } catch (error) {
    console.error('Office to PDF conversion error:', error);
    throw new Error(`Office to PDF conversion failed: ${error.message}`);
  }
}

// Image compression
async function compressImage(inputPath, quality = 80) {
  const ext = path.extname(inputPath).toLowerCase();
  const outputFormat = ext === '.png' ? 'png' : 'jpeg';

  let sharpInstance = sharp(inputPath);

  if (outputFormat === 'jpeg') {
    sharpInstance = sharpInstance.jpeg({ quality });
  } else {
    sharpInstance = sharpInstance.png({ compressionLevel: 9 });
  }

  const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), outputFormat));
  await sharpInstance.toFile(outputPath);

  return outputPath;
}

// JPG to PNG conversion
async function jpgToPng(inputPath) {
  const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'png'));
  await sharp(inputPath).png().toFile(outputPath);
  return outputPath;
}

// PNG to JPG conversion
async function pngToJpg(inputPath) {
  const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'jpg'));
  await sharp(inputPath).jpeg({ quality: 90 }).toFile(outputPath);
  return outputPath;
}

// Merge images
async function mergeImages(inputPaths, format = 'pdf') {
  if (!inputPaths || inputPaths.length < 2) {
    throw new Error('At least 2 images required for merge');
  }

  if (format === 'pdf') {
    // Use pdf-lib for PDF output
    const { PDFDocument } = require('pdf-lib');
    const pdf = await PDFDocument.create();

    for (const imagePath of inputPaths) {
      const imageBuffer = fs.readFileSync(imagePath);
      let image;
      const ext = path.extname(imagePath).toLowerCase();

      if (['.jpg', '.jpeg'].includes(ext)) {
        image = await pdf.embedJpg(imageBuffer);
      } else if (ext === '.png') {
        image = await pdf.embedPng(imageBuffer);
      }

      if (image) {
        const page = pdf.addPage();
        const { width, height } = image.scale(1);
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        const scale = Math.min(pageWidth / width, pageHeight / height) * 0.9;

        page.drawImage(image, {
          x: (pageWidth - width * scale) / 2,
          y: (pageHeight - height * scale) / 2,
          width: width * scale,
          height: height * scale,
        });
      }
    }

    const pdfBytes = await pdf.save();
    const outputPath = path.join(processedDir, `merged-${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);
    return outputPath;
  } else {
    // Use sharp for image output
    throw new Error('Image merge to image format not yet implemented');
  }
}

// PDF to Text
async function pdfToText(inputPath) {
  const pdfParse = require('pdf-parse');
  const fileBuffer = fs.readFileSync(inputPath);
  const data = await pdfParse(fileBuffer);

  const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'txt'));
  fs.writeFileSync(outputPath, data.text);

  return outputPath;
}

// HTML to PDF using html-pdf library
async function htmlToPdf(inputPath) {
  try {
    // Read HTML content
    let htmlContent = fs.readFileSync(inputPath, 'utf8');

    // If it's a URL, fetch the content (basic implementation)
    if (htmlContent.trim().startsWith('http')) {
      // For URL-based HTML, we'd need to implement fetching
      // For now, we'll assume it's a file path
      throw new Error('URL-based HTML conversion requires additional implementation. Please provide HTML file content.');
    }

    // Configure PDF options
    const options = {
      format: 'A4',
      orientation: 'portrait',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      header: {
        height: '0.5in',
        contents: '<div style="text-align: center;">PDF Simpler</div>'
      },
      footer: {
        height: '0.5in',
        contents: '<div style="text-align: center;">{{pageNumber}}</div>'
      },
      timeout: 30000 // 30 seconds timeout
    };

    // Generate PDF
    const pdfBuffer = await new Promise((resolve, reject) => {
      htmlPdf.create(htmlContent, options).toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });

    // Generate output filename
    const outputPath = path.join(processedDir, getOutputFilename(path.basename(inputPath), 'pdf'));

    // Write the PDF file
    fs.writeFileSync(outputPath, pdfBuffer);

    return outputPath;
  } catch (error) {
    console.error('HTML to PDF conversion error:', error);
    throw new Error(`HTML to PDF conversion failed: ${error.message}`);
  }
}

module.exports = {
  pdfToImage,
  pdfToOffice,
  officeToPdf,
  compressImage,
  jpgToPng,
  pngToJpg,
  mergeImages,
  pdfToText,
  htmlToPdf,
};
