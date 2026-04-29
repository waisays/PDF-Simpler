// Main JavaScript functionality

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');

if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
    });
}

// Dark mode toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

// FAQ accordion
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current item
            item.classList.toggle('active');
        });
    }
});

// Tab navigation
const tabs = document.querySelectorAll('.tab');
const toolGrid = document.getElementById('tool-grid');

if (tabs.length > 0 && toolGrid) {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            // Filter tools
            const category = tab.dataset.category;
            filterTools(category);
        });
    });
}

function filterTools(category) {
    const toolCards = toolGrid.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('jwt_token');
    const loginBtn = document.getElementById('login-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');

    if (token) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (dashboardBtn) dashboardBtn.style.display = 'inline-flex';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (dashboardBtn) dashboardBtn.style.display = 'none';
    }
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
}

// Get tool icon helper
function getToolIcon(slug) {
    const icons = {
        'merge-pdf': '📄',
        'split-pdf': '✂️',
        'compress-pdf': '📉',
        'rotate-pdf': '🔄',
        'organize-pdf': '📋',
        'extract-pdf-pages': '📑',
        'delete-pdf-pages': '🗑️',
        'crop-pdf': '✂️',
        'password-protect-pdf': '🔒',
        'unlock-pdf': '🔓',
        'sign-pdf': '✍️',
        'fill-pdf': '✏️',
        'annotate-pdf': '📝',
        'watermark-pdf': '💧',
        'remove-watermark': '🧹',
        'ocr-pdf': '🔍',
        'image-to-text': '📝',
        'pdf-summarizer': '🤖',
        'pdf-to-word': '📝',
        'pdf-to-jpg': '🖼️',
        'pdf-to-png': '🖼️',
        'pdf-to-excel': '📊',
        'pdf-to-pptx': '📊',
        'pdf-to-html': '🌐',
        'pdf-to-text': '📝',
        'word-to-pdf': '📄',
        'jpg-to-pdf': '📄',
        'png-to-pdf': '📄',
        'excel-to-pdf': '📄',
        'pptx-to-pdf': '📄',
        'html-to-pdf': '📄',
        'image-to-pdf': '📄',
        'compress-images': '📉',
        'merge-images': '🖼️',
        'jpg-to-png': '🖼️',
        'png-to-jpg': '🖼️'
    };
    return icons[slug] || '📄';
}

// Export helpers for use in other files
window.PDFSimpler = {
    formatDate,
    getToolIcon,
    checkAuth
};