// Authentication JavaScript

const API_BASE = '/api/auth';

// Register form handler
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous errors
        clearErrors();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validation
        let hasError = false;

        if (!name) {
            showError('name-error', 'Name is required');
            hasError = true;
        }

        if (!email || !isValidEmail(email)) {
            showError('email-error', 'Valid email is required');
            hasError = true;
        }

        if (!password || password.length < 6) {
            showError('password-error', 'Password must be at least 6 characters');
            hasError = true;
        }

        if (password !== confirmPassword) {
            showError('confirm-password-error', 'Passwords do not match');
            hasError = true;
        }

        if (hasError) return;

        // Submit registration
        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Store token
            localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));

            // Show success message
            showSuccess('Registration successful! Redirecting...');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);

        } catch (error) {
            showError('form-error', error.message);
        }
    });
}

// Login form handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous errors
        clearErrors();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validation
        let hasError = false;

        if (!email || !isValidEmail(email)) {
            showError('email-error', 'Valid email is required');
            hasError = true;
        }

        if (!password) {
            showError('password-error', 'Password is required');
            hasError = true;
        }

        if (hasError) return;

        // Submit login
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token
            localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));

            // Show success message
            showSuccess('Login successful! Redirecting...');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);

        } catch (error) {
            showError('form-error', error.message);
        }
    });
}

// Logout handler
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // Clear token and user data
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');

        // Redirect to home
        window.location.href = '/';
    });
}

// Helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function showSuccess(message) {
    const formError = document.getElementById('form-error');
    if (formError) {
        formError.textContent = message;
        formError.style.color = '#10b981';
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.color = '#ef4444';
    });
}

// Check if user is authenticated
function isAuthenticated() {
    return !!localStorage.getItem('jwt_token');
}

// Get current user data
function getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Export functions for use in other files
window.PDFSimplerAuth = {
    isAuthenticated,
    getCurrentUser,
    requireAuth
};