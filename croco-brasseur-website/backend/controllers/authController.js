// Authentication Controller
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');

// Login admin
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username et mot de passe requis'
            });
        }

        // Find user
        const [users] = await pool.execute(
            'SELECT * FROM admin_users WHERE username = ? AND actif = TRUE',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        // Update last login
        await pool.execute(
            'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        // Log activity
        await pool.execute(
            'INSERT INTO admin_activity_log (admin_id, action, description, ip_address) VALUES (?, ?, ?, ?)',
            [user.id, 'LOGIN', 'Connexion réussie', req.ip]
        );

        // Generate token
        const token = generateToken(user);

        // Return user info (without password)
        res.json({
            success: true,
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                nom_complet: user.nom_complet,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion'
        });
    }
};

// Get current admin profile
exports.getProfile = async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, username, email, nom_complet, role, created_at, last_login FROM admin_users WHERE id = ?',
            [req.admin.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil'
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mot de passe actuel et nouveau requis'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
            });
        }

        // Get current user
        const [users] = await pool.execute(
            'SELECT * FROM admin_users WHERE id = ?',
            [req.admin.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        const user = users[0];

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Mot de passe actuel incorrect'
            });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.execute(
            'UPDATE admin_users SET password_hash = ? WHERE id = ?',
            [newPasswordHash, req.admin.id]
        );

        // Log activity
        await pool.execute(
            'INSERT INTO admin_activity_log (admin_id, action, description) VALUES (?, ?, ?)',
            [req.admin.id, 'CHANGE_PASSWORD', 'Mot de passe modifié']
        );

        res.json({
            success: true,
            message: 'Mot de passe modifié avec succès'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du changement de mot de passe'
        });
    }
};

// Logout (client-side token removal, optional server-side logging)
exports.logout = async (req, res) => {
    try {
        // Log activity
        await pool.execute(
            'INSERT INTO admin_activity_log (admin_id, action, description) VALUES (?, ?, ?)',
            [req.admin.id, 'LOGOUT', 'Déconnexion']
        );

        res.json({
            success: true,
            message: 'Déconnexion réussie'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la déconnexion'
        });
    }
};

module.exports = exports;
