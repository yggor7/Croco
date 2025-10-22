// Admin Routes
const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const galleryController = require('../controllers/galleryController');
const videoController = require('../controllers/videoController');
const menuController = require('../controllers/menuController');
const bookingController = require('../controllers/bookingController');

// ========================================
// AUTHENTICATION ROUTES (Public)
// ========================================
router.post('/auth/login', authController.login);

// ========================================
// PROTECTED ROUTES (Require Authentication)
// ========================================

// Auth routes
router.get('/auth/profile', verifyToken, authController.getProfile);
router.post('/auth/change-password', verifyToken, authController.changePassword);
router.post('/auth/logout', verifyToken, authController.logout);

// ========================================
// GALLERY ROUTES
// ========================================
router.get('/gallery', verifyToken, galleryController.getAllImages);
router.get('/gallery/:id', verifyToken, galleryController.getImageById);
router.post('/gallery', verifyToken, requireAdmin, galleryController.uploadImage);
router.put('/gallery/:id', verifyToken, requireAdmin, galleryController.updateImage);
router.delete('/gallery/:id', verifyToken, requireAdmin, galleryController.deleteImage);
router.post('/gallery/reorder', verifyToken, requireAdmin, galleryController.reorderImages);

// ========================================
// VIDEO ROUTES
// ========================================
router.get('/videos', verifyToken, videoController.getAllVideos);
router.get('/videos/:id', verifyToken, videoController.getVideoById);
router.post('/videos', verifyToken, requireAdmin, videoController.uploadVideo);
router.put('/videos/:id', verifyToken, requireAdmin, videoController.updateVideo);
router.delete('/videos/:id', verifyToken, requireAdmin, videoController.deleteVideo);

// ========================================
// MENU CATEGORY ROUTES
// ========================================
router.get('/menu/categories', verifyToken, menuController.getAllCategories);
router.post('/menu/categories', verifyToken, requireAdmin, menuController.createCategory);
router.put('/menu/categories/:id', verifyToken, requireAdmin, menuController.updateCategory);
router.delete('/menu/categories/:id', verifyToken, requireAdmin, menuController.deleteCategory);

// ========================================
// MENU ITEM ROUTES
// ========================================
router.get('/menu/items', verifyToken, menuController.getAllMenuItems);
router.get('/menu/items/:id', verifyToken, menuController.getMenuItemById);
router.post('/menu/items', verifyToken, requireAdmin, menuController.createMenuItem);
router.put('/menu/items/:id', verifyToken, requireAdmin, menuController.updateMenuItem);
router.delete('/menu/items/:id', verifyToken, requireAdmin, menuController.deleteMenuItem);

// ========================================
// RESERVATION ROUTES (Admin)
// ========================================
router.get('/reservations', verifyToken, bookingController.getAllReservations);
router.get('/reservations/:id', verifyToken, bookingController.getReservationById);
router.put('/reservations/:id/status', verifyToken, requireAdmin, bookingController.updateReservationStatus);
router.delete('/reservations/:id', verifyToken, requireAdmin, bookingController.deleteReservation);

// ========================================
// DASHBOARD STATS ROUTE
// ========================================
router.get('/dashboard/stats', verifyToken, async (req, res) => {
    try {
        const { pool } = require('../config/database');

        // Get counts
        const [reservations] = await pool.execute('SELECT COUNT(*) as count FROM reservations WHERE statut = "en_attente"');
        const [totalReservations] = await pool.execute('SELECT COUNT(*) as count FROM reservations');
        const [galleryImages] = await pool.execute('SELECT COUNT(*) as count FROM gallery_images WHERE actif = TRUE');
        const [menuItems] = await pool.execute('SELECT COUNT(*) as count FROM menu_items WHERE disponible = TRUE');
        const [videos] = await pool.execute('SELECT COUNT(*) as count FROM videos WHERE actif = TRUE');

        // Get recent reservations
        const [recentReservations] = await pool.execute(
            'SELECT * FROM reservations ORDER BY created_at DESC LIMIT 5'
        );

        // Get recent activity
        const [recentActivity] = await pool.execute(
            'SELECT a.*, u.username FROM admin_activity_log a LEFT JOIN admin_users u ON a.admin_id = u.id ORDER BY a.created_at DESC LIMIT 10'
        );

        res.json({
            success: true,
            data: {
                stats: {
                    pendingReservations: reservations[0].count,
                    totalReservations: totalReservations[0].count,
                    galleryImages: galleryImages[0].count,
                    menuItems: menuItems[0].count,
                    videos: videos[0].count
                },
                recentReservations: recentReservations,
                recentActivity: recentActivity
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

module.exports = router;
