// Admin Authentication
const API_BASE_URL = 'http://localhost:3000/api';

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('admin_token');
    if (token && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
    } else if (!token && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorAlert = document.getElementById('errorAlert');
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            // Disable button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';

            // Hide previous errors
            errorAlert.style.display = 'none';

            try {
                const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    // Store token and user info
                    localStorage.setItem('admin_token', data.token);
                    localStorage.setItem('admin_user', JSON.stringify(data.user));

                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    throw new Error(data.message || 'Échec de la connexion');
                }

            } catch (error) {
                console.error('Login error:', error);
                errorAlert.textContent = error.message || 'Erreur de connexion. Veuillez réessayer.';
                errorAlert.style.display = 'flex';

                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
            }
        });
    }
});

// Logout function
async function logout() {
    const token = localStorage.getItem('admin_token');

    if (token) {
        try {
            await fetch(`${API_BASE_URL}/admin/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Clear local storage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');

    // Redirect to login
    window.location.href = 'login.html';
}

// Get current user
function getCurrentUser() {
    const userJson = localStorage.getItem('admin_user');
    return userJson ? JSON.parse(userJson) : null;
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('admin_token');
}

// Make authenticated API request
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();

    if (!token) {
        window.location.href = 'login.html';
        throw new Error('Non authentifié');
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);

        // Check if unauthorized
        if (response.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.location.href = 'login.html';
            throw new Error('Session expirée');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erreur API');
        }

        return data;

    } catch (error) {
        console.error('API Request error:', error);
        throw error;
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#27AE60' : '#E74C3C'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Check auth on page load
checkAuth();
