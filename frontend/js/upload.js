// Upload and file processing JavaScript

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusArea = document.getElementById('status-area');
const downloadBtn = document.getElementById('download-btn');

// Get current tool slug from URL or body data
function getToolSlug() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSlug = urlParams.get('tool');
    const bodySlug = document.body?.dataset?.toolSlug;

    // If on tool page, extract from URL path
    if (window.location.pathname.startsWith('/tool/')) {
        return window.location.pathname.split('/tool/')[1];
    }

    return urlSlug || bodySlug || '';
}

// Drag & drop handlers
if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    dropZone.addEventListener('click', () => {
        fileInput?.click();
    });
}

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

// Handle file upload
async function handleFiles(files) {
    if (!files || files.length === 0) return;

    const tool = getToolSlug();
    const token = localStorage.getItem('jwt_token');

    if (!tool) {
        setStatus('error', null, null, 'No tool specified. Please select a tool first.');
        return;
    }

    // For merge operations, we need multiple files
    const isMergeOperation = tool === 'merge-pdf' || tool === 'merge-images';

    if (isMergeOperation && files.length < 2) {
        setStatus('error', null, null, 'Please select at least 2 files for merge operation.');
        return;
    }

    const formData = new FormData();

    if (isMergeOperation) {
        // Append multiple files for merge
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
    } else {
        // Single file for other operations
        formData.append('file', files[0]);
    }

    setStatus('processing');

    try {
        const response = await fetch(`/api/tools/${tool}`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Processing failed');
        }

        setStatus('done', data.downloadUrl, data.filename);

    } catch (error) {
        setStatus('error', null, null, error.message);
    }
}

// Set status display
function setStatus(state, url, filename, errorMessage) {
    if (!statusArea) return;

    statusArea.innerHTML = '';

    if (state === 'processing') {
        statusArea.innerHTML = `
            <div class="spinner"></div>
            <p>Processing your file${getToolSlug() === 'merge-pdf' ? 's' : ''}…</p>
        `;
    } else if (state === 'done') {
        if (downloadBtn) {
            downloadBtn.style.display = 'inline-flex';
            downloadBtn.onclick = async () => {
                await downloadFile(url, filename);
            };
        }
        statusArea.innerHTML = `<p class="success">✓ Done! Your file is ready.</p>`;
    } else if (state === 'error') {
        statusArea.innerHTML = `<p class="error">⚠ ${errorMessage}</p>`;
        if (downloadBtn) {
            downloadBtn.style.display = 'none';
        }
    }
}

// Download file
async function downloadFile(url, filename) {
    const token = localStorage.getItem('jwt_token');

    try {
        const response = await fetch(url, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (response.status === 401) {
            // Guest user - show login prompt
            showLoginPrompt();
            return;
        }

        if (!response.ok) {
            throw new Error('Download failed');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);

        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = filename || 'processed-file';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        window.URL.revokeObjectURL(downloadUrl);

        // Clear status after successful download
        if (statusArea) {
            statusArea.innerHTML = '<p class="success">✓ Download started!</p>';
        }

    } catch (error) {
        if (statusArea) {
            statusArea.innerHTML = `<p class="error">⚠ Download failed: ${error.message}</p>`;
        }
    }
}

// Show login prompt for guest users
function showLoginPrompt() {
    const loginPrompt = document.createElement('div');
    loginPrompt.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    loginPrompt.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 400px; text-align: center;">
            <h2 style="margin-bottom: 1rem;">Login Required</h2>
            <p style="margin-bottom: 1.5rem; color: #64748B;">Please login to download your processed file.</p>
            <a href="/login.html" class="btn btn-primary" style="display: inline-block; text-decoration: none;">Login</a>
            <button onclick="this.closest('div').parentElement.remove()" style="margin-left: 1rem; padding: 0.75rem 1.5rem; border: none; background: #e2e8f0; border-radius: 12px; cursor: pointer;">Cancel</button>
        </div>
    `;

    document.body.appendChild(loginPrompt);
}

// Load tools for home page
async function loadTools() {
    const toolGrid = document.getElementById('tool-grid');
    if (!toolGrid) return;

    try {
        const response = await fetch('/api/tools/list');
        const data = await response.json();

        if (data.tools) {
            renderTools(data.tools);
        }
    } catch (error) {
        console.error('Failed to load tools:', error);
    }
}

// Render tool cards
function renderTools(tools) {
    const toolGrid = document.getElementById('tool-grid');
    if (!toolGrid) return;

    toolGrid.innerHTML = tools.map(tool => `
        <a href="/tool/${tool.slug}" class="tool-card" data-category="${tool.category}">
            <div class="tool-icon">${window.PDFSimpler?.getToolIcon?.(tool.slug) || '📄'}</div>
            <div class="tool-name">${tool.name}</div>
        </a>
    `).join('');
}

// Initialize tool page
function initToolPage() {
    const toolSlug = getToolSlug();
    if (!toolSlug) return;

    // Set tool slug on body
    if (document.body) {
        document.body.dataset.toolSlug = toolSlug;
    }

    // Update page title and heading
    const toolTitle = document.getElementById('tool-title');
    const toolHeading = document.getElementById('tool-heading');
    const toolDescription = document.getElementById('tool-description');

    // Fetch tool info
    fetch('/api/tools/list')
        .then(response => response.json())
        .then(data => {
            const tool = data.tools?.find(t => t.slug === toolSlug);
            if (tool) {
                if (toolTitle) toolTitle.textContent = `${tool.name} - PDF Simpler`;
                if (toolHeading) toolHeading.textContent = tool.name;
                if (toolDescription) toolDescription.textContent = getToolDescription(tool.slug);

                // Update upload subtext based on tool
                const uploadSubtext = document.getElementById('upload-subtext');
                if (uploadSubtext) {
                    uploadSubtext.textContent = getUploadSubtext(tool.slug);
                }

                // Show tool-specific options if needed
                showToolOptions(tool.slug);
            }
        })
        .catch(error => {
            console.error('Failed to load tool info:', error);
        });
}

// Get tool description
function getToolDescription(slug) {
    const descriptions = {
        'merge-pdf': 'Combine multiple PDF files into one',
        'split-pdf': 'Split PDF into separate pages',
        'compress-pdf': 'Reduce PDF file size while maintaining quality',
        'rotate-pdf': 'Rotate PDF pages',
        'organize-pdf': 'Reorder PDF pages',
        'extract-pdf-pages': 'Extract specific pages from PDF',
        'delete-pdf-pages': 'Remove unwanted pages from PDF',
        'crop-pdf': 'Crop PDF pages to desired size',
        'password-protect-pdf': 'Add password protection to PDF',
        'unlock-pdf': 'Remove password from PDF',
        'sign-pdf': 'Add signature to PDF',
        'fill-pdf': 'Fill out PDF forms',
        'annotate-pdf': 'Add annotations to PDF',
        'watermark-pdf': 'Add watermark to PDF',
        'remove-watermark': 'Remove watermark from PDF',
        'ocr-pdf': 'Extract text from scanned PDFs',
        'image-to-text': 'Extract text from images',
        'pdf-summarizer': 'Get AI-powered summary of PDF content',
        'pdf-to-word': 'Convert PDF to Word document',
        'pdf-to-jpg': 'Convert PDF to JPG images',
        'pdf-to-png': 'Convert PDF to PNG images',
        'pdf-to-excel': 'Convert PDF to Excel spreadsheet',
        'pdf-to-pptx': 'Convert PDF to PowerPoint presentation',
        'pdf-to-html': 'Convert PDF to HTML',
        'pdf-to-text': 'Extract text from PDF',
        'word-to-pdf': 'Convert Word document to PDF',
        'jpg-to-pdf': 'Convert JPG image to PDF',
        'png-to-pdf': 'Convert PNG image to PDF',
        'excel-to-pdf': 'Convert Excel spreadsheet to PDF',
        'pptx-to-pdf': 'Convert PowerPoint presentation to PDF',
        'html-to-pdf': 'Convert HTML to PDF',
        'image-to-pdf': 'Convert image to PDF',
        'compress-images': 'Compress image files',
        'merge-images': 'Combine multiple images',
        'jpg-to-png': 'Convert JPG to PNG',
        'png-to-jpg': 'Convert PNG to JPG'
    };
    return descriptions[slug] || 'Process your file with this tool';
}

// Get upload subtext based on tool
function getUploadSubtext(slug) {
    if (slug === 'merge-pdf' || slug === 'merge-images') {
        return 'Up to 100MB · Multiple files supported';
    }
    if (slug.startsWith('pdf-to-')) {
        return 'Up to 100MB · PDF files only';
    }
    if (slug.endsWith('-to-pdf')) {
        return 'Up to 100MB · Various formats supported';
    }
    return 'Up to 100MB';
}

// Show tool-specific options
function showToolOptions(slug) {
    const toolOptions = document.getElementById('tool-options');
    if (!toolOptions) return;

    let optionsHTML = '';

    switch (slug) {
        case 'rotate-pdf':
            optionsHTML = `
                <div class="form-group">
                    <label>Rotation Degrees</label>
                    <select id="rotation-degrees" style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 12px;">
                        <option value="90">90° Clockwise</option>
                        <option value="180">180°</option>
                        <option value="270">90° Counter-clockwise</option>
                    </select>
                </div>
            `;
            break;
        case 'split-pdf':
        case 'extract-pdf-pages':
        case 'delete-pdf-pages':
            optionsHTML = `
                <div class="form-group">
                    <label>Page Numbers (comma-separated, e.g., 1,3,5-7)</label>
                    <input type="text" id="page-numbers" placeholder="1,3,5-7" style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 12px;">
                </div>
            `;
            break;
        case 'password-protect-pdf':
        case 'unlock-pdf':
            optionsHTML = `
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="pdf-password" placeholder="Enter password" style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 12px;">
                </div>
            `;
            break;
        case 'compress-images':
            optionsHTML = `
                <div class="form-group">
                    <label>Quality (1-100)</label>
                    <input type="range" id="image-quality" min="1" max="100" value="80" style="width: 100%;">
                    <span id="quality-value">80%</span>
                </div>
            `;
            break;
    }

    if (optionsHTML) {
        toolOptions.innerHTML = optionsHTML;
        toolOptions.style.display = 'block';

        // Add event listeners for dynamic options
        if (slug === 'compress-images') {
            const qualityInput = document.getElementById('image-quality');
            const qualityValue = document.getElementById('quality-value');
            if (qualityInput && qualityValue) {
                qualityInput.addEventListener('input', () => {
                    qualityValue.textContent = qualityInput.value + '%';
                });
            }
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load tools on home page
    if (document.getElementById('tool-grid')) {
        loadTools();
    }

    // Initialize tool page
    if (window.location.pathname.startsWith('/tool/')) {
        initToolPage();
    }
});