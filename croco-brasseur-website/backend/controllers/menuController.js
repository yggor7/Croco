// Menu Controller
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for menu item images
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../frontend/assets/images/menu');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, webp)'));
        }
    }
}).single('image');

// ========================================
// MENU CATEGORIES
// ========================================

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await pool.execute(
            'SELECT * FROM menu_categories ORDER BY ordre ASC, nom ASC'
        );

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des catégories'
        });
    }
};

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { nom, nom_en, description, icon, ordre, actif } = req.body;

        if (!nom) {
            return res.status(400).json({
                success: false,
                message: 'Nom requis'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO menu_categories (nom, nom_en, description, icon, ordre, actif)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [nom, nom_en, description, icon, ordre || 0, actif !== 'false']
        );

        // Log activity
        await pool.execute(
            'INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
            [req.admin.id, 'CREATE', 'menu_categories', result.insertId, `Catégorie créée: ${nom}`]
        );

        res.status(201).json({
            success: true,
            message: 'Catégorie créée avec succès',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la catégorie'
        });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, nom_en, description, icon, ordre, actif } = req.body;

        await pool.execute(
            `UPDATE menu_categories
            SET nom = ?, nom_en = ?, description = ?, icon = ?, ordre = ?, actif = ?
            WHERE id = ?`,
            [nom, nom_en, description, icon, ordre, actif !== 'false', id]
        );

        // Log activity
        await pool.execute(
            'INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
            [req.admin.id, 'UPDATE', 'menu_categories', id, `Catégorie modifiée: ${nom}`]
        );

        res.json({
            success: true,
            message: 'Catégorie mise à jour avec succès'
        });

    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la catégorie'
        });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category has items
        const [items] = await pool.execute(
            'SELECT COUNT(*) as count FROM menu_items WHERE category_id = ?',
            [id]
        );

        if (items[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Impossible de supprimer une catégorie contenant des items'
            });
        }

        await pool.execute('DELETE FROM menu_categories WHERE id = ?', [id]);

        // Log activity
        await pool.execute(
            'INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
            [req.admin.id, 'DELETE', 'menu_categories', id, 'Catégorie supprimée']
        );

        res.json({
            success: true,
            message: 'Catégorie supprimée avec succès'
        });

    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la catégorie'
        });
    }
};

// ========================================
// MENU ITEMS
// ========================================

// Get all menu items
exports.getAllMenuItems = async (req, res) => {
    try {
        const { category_id, disponible } = req.query;

        let query = `
            SELECT m.*, c.nom as category_nom
            FROM menu_items m
            LEFT JOIN menu_categories c ON m.category_id = c.id
        `;
        const conditions = [];
        const params = [];

        if (category_id) {
            conditions.push('m.category_id = ?');
            params.push(category_id);
        }

        if (disponible !== undefined) {
            conditions.push('m.disponible = ?');
            params.push(disponible === 'true' ? 1 : 0);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY m.category_id ASC, m.ordre ASC, m.nom ASC';

        const [items] = await pool.execute(query, params);

        res.json({
            success: true,
            count: items.length,
            data: items
        });

    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des items'
        });
    }
};

// Get menu items by category (for public site)
exports.getMenuByCategory = async (req, res) => {
    try {
        const [categories] = await pool.execute(
            'SELECT * FROM menu_categories WHERE actif = TRUE ORDER BY ordre ASC'
        );

        const menuData = [];

        for (const category of categories) {
            const [items] = await pool.execute(
                'SELECT * FROM menu_items WHERE category_id = ? AND disponible = TRUE ORDER BY ordre ASC',
                [category.id]
            );

            menuData.push({
                category: category,
                items: items
            });
        }

        res.json({
            success: true,
            data: menuData
        });

    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du menu'
        });
    }
};

// Get single menu item
exports.getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const [items] = await pool.execute(
            'SELECT * FROM menu_items WHERE id = ?',
            [id]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item non trouvé'
            });
        }

        res.json({
            success: true,
            data: items[0]
        });

    } catch (error) {
        console.error('Error fetching menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'item'
        });
    }
};

// Create menu item
exports.createMenuItem = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        try {
            const {
                category_id, nom, nom_en, description, description_en,
                prix, prix_devise, ingredients, allergenes,
                vegetarien, vegan, sans_gluten, epice_niveau,
                populaire, nouveau, disponible, ordre
            } = req.body;

            if (!category_id || !nom) {
                if (req.file) await fs.unlink(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: 'Catégorie et nom requis'
                });
            }

            let image_path = null;
            if (req.file) {
                image_path = `/assets/images/menu/${req.file.filename}`;
            }

            const [result] = await pool.execute(
                `INSERT INTO menu_items (
                    category_id, nom, nom_en, description, description_en,
                    prix, prix_devise, image_path, ingredients, allergenes,
                    vegetarien, vegan, sans_gluten, epice_niveau,
                    populaire, nouveau, disponible, ordre
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    category_id, nom, nom_en, description, description_en,
                    prix || null, prix_devise || 'BIF', image_path, ingredients, allergenes,
                    vegetarien === 'true', vegan === 'true', sans_gluten === 'true', epice_niveau || 'doux',
                    populaire === 'true', nouveau === 'true', disponible !== 'false', ordre || 0
                ]
            );

            // Log activity
            await pool.execute(
                'INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
                [req.admin.id, 'CREATE', 'menu_items', result.insertId, `Item créé: ${nom}`]
            );

            res.status(201).json({
                success: true,
                message: 'Item créé avec succès',
                data: { id: result.insertId }
            });

        } catch (error) {
            console.error('Error creating menu item:', error);
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error deleting file:', unlinkError);
                }
            }
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de l\'item'
            });
        }
    });
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            category_id, nom, nom_en, description, description_en,
            prix, prix_devise, ingredients, allergenes,
            vegetarien, vegan, sans_gluten, epice_niveau,
            populaire, nouveau, disponible, ordre
        } = req.body;

        // Check if item exists
        const [items] = await pool.execute(
            'SELECT * FROM menu_items WHERE id = ?',
            [id]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item non trouvé'
            });
        }

        await pool.execute(
            `UPDATE menu_items SET
                category_id = ?, nom = ?, nom_en = ?, description = ?, description_en = ?,
                prix = ?, prix_devise = ?, ingredients = ?, allergenes = ?,
                vegetarien = ?, vegan = ?, sans_gluten = ?, epice_niveau = ?,
                populaire = ?, nouveau = ?, disponible = ?, ordre = ?
            WHERE id = ?`,
            [
                category_id, nom, nom_en, description, description_en,
                prix, prix_devise, ingredients, allergenes,
                vegetarien === 'true', vegan === 'true', sans_gluten === 'true', epice_niveau,
                populaire === 'true', nouveau === 'true', disponible !== 'false', ordre, id
            ]
        );

        // Log activity
        await pool.execute(
            'INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
            [req.admin.id, 'UPDATE', 'menu_items', id, `Item modifié: ${nom}`]
        );

        res.json({
            success: true,
            message: 'Item mis à jour avec succès'
        });

    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'item'
        });
    }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Get item info
        const [items] = await pool.execute(
            'SELECT * FROM menu_items WHERE id = ?',
            [id]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item non trouvé'
            });
        }

        const item = items[0];

        // Delete from database
        await pool.execute('DELETE FROM menu_items WHERE id = ?', [id]);

        // Delete image if exists
        if (item.image_path) {
            try {
                const filePath = path.join(__dirname, '../../frontend', item.image_path);
                await fs.unlink(filePath);
            } catch (fileError) {
                console.error('Error deleting file:', fileError);
            }
        }

        // Log activity
        await pool.execute(
            'INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
            [req.admin.id, 'DELETE', 'menu_items', id, `Item supprimé: ${item.nom}`]
        );

        res.json({
            success: true,
            message: 'Item supprimé avec succès'
        });

    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'item'
        });
    }
};

module.exports = exports;
