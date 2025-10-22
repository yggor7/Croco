// Gallery Controller
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../frontend/assets/images/gallery');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
        }
    }
}).single('image');

// Get all gallery images
exports.getAllImages = async (req, res) => {
    try {
        const { category, actif } = req.query;

        let query = 'SELECT g.*, a.username as uploaded_by_username FROM gallery_images g LEFT JOIN admin_users a ON g.uploaded_by = a.id';
        const conditions = [];
        const params = [];

        if (category) {
            conditions.push('g.category = ?');
            params.push(category);
        }

        if (actif !== undefined) {
            conditions.push('g.actif = ?');
            params.push(actif === 'true' ? 1 : 0);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY g.ordre ASC, g.created_at DESC';

        const [images] = await pool.execute(query, params);

        res.json({
            success: true,
            count: images.length,
            data: images
        });

    } catch (error) {
        console.error('Error fetching gallery images:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des images'
        });
    }
};

// Get single image
exports.getImageById = async (req, res) => {
    try {
        const { id } = req.params;

        const [images] = await pool.execute(
            'SELECT * FROM gallery_images WHERE id = ?',
            [id]
        );

        if (images.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Image non trouvée'
            });
        }

        res.json({
            success: true,
            data: images[0]
        });

    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'image'
        });
    }
};

// Upload new image
exports.uploadImage = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucune image fournie'
            });
        }

        try {
            const { titre, description, category, ordre, actif } = req.body;

            if (!titre || !category) {
                // Delete uploaded file if validation fails
                await fs.unlink(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: 'Titre et catégorie requis'
                });
            }

            const filename = req.file.filename;
            const filepath = `/assets/images/gallery/${filename}`;

            const [result] = await pool.execute(
                `INSERT INTO gallery_images (titre, description, filename, filepath, category, ordre, actif, uploaded_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [titre, description || null, filename, filepath, category, ordre || 0, actif !== 'false', req.admin.id]
            );

            // Log activity
            await pool.execute(
                'INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
                [req.admin.id, 'CREATE', 'gallery_images', result.insertId, `Image ajoutée: ${titre}`]
            );

            res.status(201).json({
                success: true,
                message: 'Image uploadée avec succès',
                data: {
                    id: result.insertId,
                    titre,
                    filename,
                    filepath
                }
            });

        } catch (error) {
            console.error('Error uploading image:', error);
            // Try to delete file if database insert fails
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'upload de l\'image'
            });
        }
    });
};

// Update image
exports.updateImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, description, category, ordre, actif } = req.body;

        // Check if image exists
        const [images] = await pool.execute(
            'SELECT * FROM gallery_images WHERE id = ?',
            [id]
        );

        if (images.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Image non trouvée'
            });
        }

        await pool.execute(
            `UPDATE gallery_images
            SET titre = ?, description = ?, category = ?, ordre = ?, actif = ?
            WHERE id = ?`,
            [titre, description, category, ordre, actif !== 'false', id]
        );

        // Log activity
        await pool.execute(
            'INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
            [req.admin.id, 'UPDATE', 'gallery_images', id, `Image modifiée: ${titre}`]
        );

        res.json({
            success: true,
            message: 'Image mise à jour avec succès'
        });

    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'image'
        });
    }
};

// Delete image
exports.deleteImage = async (req, res) => {
    try {
        const { id } = req.params;

        // Get image info
        const [images] = await pool.execute(
            'SELECT * FROM gallery_images WHERE id = ?',
            [id]
        );

        if (images.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Image non trouvée'
            });
        }

        const image = images[0];

        // Delete from database
        await pool.execute('DELETE FROM gallery_images WHERE id = ?', [id]);

        // Delete file
        try {
            const filePath = path.join(__dirname, '../../frontend', image.filepath);
            await fs.unlink(filePath);
        } catch (fileError) {
            console.error('Error deleting file:', fileError);
            // Continue even if file deletion fails
        }

        // Log activity
        await pool.execute(
            'INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
            [req.admin.id, 'DELETE', 'gallery_images', id, `Image supprimée: ${image.titre}`]
        );

        res.json({
            success: true,
            message: 'Image supprimée avec succès'
        });

    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'image'
        });
    }
};

// Reorder images
exports.reorderImages = async (req, res) => {
    try {
        const { images } = req.body; // Array of {id, ordre}

        if (!Array.isArray(images)) {
            return res.status(400).json({
                success: false,
                message: 'Format invalide'
            });
        }

        // Update ordre for each image
        for (const img of images) {
            await pool.execute(
                'UPDATE gallery_images SET ordre = ? WHERE id = ?',
                [img.ordre, img.id]
            );
        }

        res.json({
            success: true,
            message: 'Ordre mis à jour avec succès'
        });

    } catch (error) {
        console.error('Error reordering images:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du réordonnancement'
        });
    }
};

module.exports = exports;
