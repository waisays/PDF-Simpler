const TOOLS = [
  // ── Edit & Sign ──────────────────────────────────────────────────
  { slug: 'merge-pdf',          name: 'Merge PDF',            category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'split-pdf',          name: 'Split PDF',            category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'compress-pdf',       name: 'Compress PDF',         category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'rotate-pdf',         name: 'Rotate PDF',           category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'organize-pdf',       name: 'Organize PDF',         category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'extract-pdf-pages',  name: 'Extract PDF Pages',    category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'delete-pdf-pages',   name: 'Delete PDF Pages',     category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'crop-pdf',           name: 'Crop PDF',             category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'password-protect-pdf', name: 'Password Protect PDF', category: 'edit',       npmPkg: 'pdf-lib'  },
  { slug: 'unlock-pdf',         name: 'Unlock PDF',           category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'sign-pdf',           name: 'Sign PDF',             category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'fill-pdf',           name: 'Fill PDF',             category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'annotate-pdf',       name: 'Annotate PDF',         category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'watermark-pdf',      name: 'Add Watermark',        category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'remove-watermark',   name: 'Remove Watermark',     category: 'edit',         npmPkg: 'pdf-lib'  },
  { slug: 'ocr-pdf',            name: 'OCR PDF',              category: 'edit',         npmPkg: 'tesseract.js' },
  { slug: 'image-to-text',      name: 'Image to Text',        category: 'edit',         npmPkg: 'tesseract.js' },
  { slug: 'pdf-summarizer',     name: 'PDF Summarizer (AI)',  category: 'ai',           npmPkg: 'anthropic' },
  // ── Convert FROM PDF ─────────────────────────────────────────────
  { slug: 'pdf-to-word',        name: 'PDF to Word',          category: 'convert_from', npmPkg: 'libreoffice-convert' },
  { slug: 'pdf-to-jpg',         name: 'PDF to JPG',           category: 'convert_from', npmPkg: 'sharp'    },
  { slug: 'pdf-to-png',         name: 'PDF to PNG',           category: 'convert_from', npmPkg: 'sharp'    },
  { slug: 'pdf-to-excel',       name: 'PDF to Excel',         category: 'convert_from', npmPkg: 'libreoffice-convert' },
  { slug: 'pdf-to-pptx',        name: 'PDF to PPTX',          category: 'convert_from', npmPkg: 'libreoffice-convert' },
  { slug: 'pdf-to-html',        name: 'PDF to HTML',          category: 'convert_from', npmPkg: 'pdf2html' },
  { slug: 'pdf-to-text',        name: 'PDF to Text',          category: 'convert_from', npmPkg: 'pdf-parse' },
  // ── Convert TO PDF ───────────────────────────────────────────────
  { slug: 'word-to-pdf',        name: 'Word to PDF',          category: 'convert_to',   npmPkg: 'libreoffice-convert' },
  { slug: 'jpg-to-pdf',         name: 'JPG to PDF',           category: 'convert_to',   npmPkg: 'pdf-lib'  },
  { slug: 'png-to-pdf',         name: 'PNG to PDF',           category: 'convert_to',   npmPkg: 'pdf-lib'  },
  { slug: 'excel-to-pdf',       name: 'Excel to PDF',         category: 'convert_to',   npmPkg: 'libreoffice-convert' },
  { slug: 'pptx-to-pdf',        name: 'PPTX to PDF',          category: 'convert_to',   npmPkg: 'libreoffice-convert' },
  { slug: 'html-to-pdf',        name: 'HTML to PDF',          category: 'convert_to',   npmPkg: 'puppeteer' },
  { slug: 'image-to-pdf',       name: 'Image to PDF',         category: 'convert_to',   npmPkg: 'pdf-lib'  },
  // ── Image Tools ──────────────────────────────────────────────────
  { slug: 'compress-images',    name: 'Compress Images',      category: 'image',         npmPkg: 'sharp'    },
  { slug: 'merge-images',       name: 'Merge Images',         category: 'image',         npmPkg: 'sharp'    },
  { slug: 'jpg-to-png',         name: 'JPG to PNG',           category: 'image',         npmPkg: 'sharp'    },
  { slug: 'png-to-jpg',         name: 'PNG to JPG',           category: 'image',         npmPkg: 'sharp'    },
];

module.exports = TOOLS;
