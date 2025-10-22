// Video Controller
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for video uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../frontend/assets/videos');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|mpeg|avi|mov|wmv|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = /video/.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Seules les vidéos sont autorisées (mp4, mpeg, avi, mov, wmv, webm)'));
        }
    }
}).single('video');

// Get all videos
exports.getAllVideos = async (req, res) => {
    try {
        const { category, video_type, actif } = req.query;

        let query = 'SELECT v.*, a.username as uploaded_by_username FROM videos v LEFT JOIN admin_users a ON v.uploaded_by = a.id';
        const conditions = [];
        const params = [];

        if (category) {
            conditions.push('v.category = ?');
            params.push(category);
        }

        if (video_type) {
            conditions.push('v.video_type = ?');
            params.push(video_type);
        }

        if (actif !== undefined) {
            conditions.push('v.actif = ?');
            params.push(actif === 'true' ? 1 : 0);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY v.ordre ASC, v.created_at DESC';

        const [videos] = await pool.execute(query, params);

        res.json({
            success: true,
            count: videos.length,
            data: videos
        });

    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des vidéos'
        });
    }
};

// Get single video
exports.getVideoById = async (req, res) => {
    try {
        const { id } = req.params;

        const [videos] = await pool.execute(
            'SELECT * FROM videos WHERE id = ?',
            [id]
        );

        if (videos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vidéo non trouvée'
            });
        }

        res.json({
            success: true,
            data: videos[0]
        });

    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la vidéo'
        });
    }
};

// Upload new video
exports.uploadVideo = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        try {
            const { titre, description, category, video_type, video_url, ordre, actif } = req.body;

            if (!titre || !category || !video_type) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Titre, catégorie et type de vidéo requis'
                });
            }

            let filename = null;
            let filepath = null;

            // If uploading a file
            if (video_type === 'upload' && req.file) {
                filename = req.file.filename;
                filepath = `/assets/videos/${filename}`;
            } else if ((video_type === 'youtube' || video_type === 'vimeo') && video_url) {
                // External video URL
                filepath = video_url;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Fichier vidéo ou URL requis selon le type'
                });
            }

            const [result] = await pool.execute(
                `INSERT INTO videos (titre, description, filename, filepath, video_url, video_type, category, ordre, actif, uploaded_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [titre, description || null, filename, filepath, video_url || null, video_type, category, ordre || 0, actif !== 'false', req.admin.id]
            );

            // Log activity
            await pool.execute(
                'INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
                [req.admin.id, 'CREATE', 'videos', result.insertId, `Vidéo ajoutée: ${titre}`]
            );

            res.status(201).json({
                success: true,
                message: 'Vidéo ajoutée avec succès',
                data: {
                    id: result.insertId,
                    titre,
                    filepath
                }
            });

        } catch (error) {
            console.error('Error uploading video:', error);
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error deleting file:', unlinkError);
                }
            }
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'ajout de la vidéo'
            });
        }
    });
};

// Update video
exports.updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, description, category, video_url, ordre, actif } = req.body;

        // Check if video exists
        const [videos] = await pool.execute(
            'SELECT * FROM videos WHERE id = ?',
            [id]
        );

        if (videos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vidéo non trouvée'
            });
        }

        await pool.execute(
            `UPDATE videos
            SET titre = ?, description = ?, category = ?, video_url = ?, ordre = ?, actif = ?
            WHERE id = ?`,
            [titre, description, category, video_url, ordre, actif !== 'false', id]
        );

        // Log activity
        await pool.execute(
            'INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
            [req.admin.id, 'UPDATE', 'videos', id, `Vidéo modifiée: ${titre}`]
        );

        res.json({
            success: true,
            message: 'Vidéo mise à jour avec succès'
        });

    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la vidéo'
        });
    }
};

// Delete video
exports.deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;

        // Get video info
        const [videos] = await pool.execute(
            'SELECT * FROM videos WHERE id = ?',
            [id]
        );

        if (videos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vidéo non trouvée'
            });
        }

        const video = videos[0];

        // Delete from database
        await pool.execute('DELETE FROM videos WHERE id = ?', [id]);

        // Delete file if it's an uploaded video
        if (video.video_type === 'upload' && video.filename) {
            try {
                const filePath = path.join(__dirname, '../../frontend', video.filepath);
                await fs.unlink(filePath);
            } catch (fileError) {
                console.error('Error deleting file:', fileError);
            }
        }

        // Log activity
        await pool.execute(
            'INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
            [req.admin.id, 'DELETE', 'videos', id, `Vidéo supprimée: ${video.titre}`]
        );

        res.json({
            success: true,
            message: 'Vidéo supprimée avec succès'
        });

    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la vidéo'
        });
    }
};

module.exports = exports;
