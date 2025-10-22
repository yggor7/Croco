// Authentication Middleware
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'croco-brasseur-secret-key-change-in-production';

// Verify JWT token
exports.verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Accès non autorisé - Token manquant'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database to ensure they still exist and are active
        const [users] = await pool.execute(
            'SELECT id, username, email, role, actif FROM admin_users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0 || !users[0].actif) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé ou inactif'
            });
        }

        // Add user info to request
        req.admin = decoded;
        req.user = users[0]; // Full user object from database
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré - Veuillez vous reconnecter'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur d\'authentification'
        });
    }
};

// Check if user is super admin
exports.requireSuperAdmin = (req, res, next) => {
    if (req.admin.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé - Droits super admin requis'
        });
    }
    next();
};

// Check if user is admin or super admin
exports.requireAdmin = (req, res, next) => {
    if (!['admin', 'super_admin'].includes(req.admin.role)) {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé - Droits admin requis'
        });
    }
    next();
};

// Generate JWT token
exports.generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

module.exports = exports;