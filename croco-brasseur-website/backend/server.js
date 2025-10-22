// CROCO BRASSEUR - Backend Server
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('frontend'));

// ========================================
// DATABASE CONNECTION
// ========================================

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'croco_brasseur_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

// ========================================
// EMAIL CONFIGURATION (Optional)
// ========================================

let transporter = null;
try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        console.log('✅ Email notifications enabled');
    } else {
        console.log('⚠️ Email not configured (EMAIL_USER/EMAIL_PASS missing in .env)');
    }
} catch (error) {
    console.warn('⚠️ Email configuration error:', error.message);
}

// ========================================
// ROUTES
// ========================================

// Import admin routes
const adminRoutes = require('./routes/admin');
const menuController = require('./controllers/menuController');

// Admin routes (protected)
app.use('/api/admin', adminRoutes);

// Public routes
// Menu public route
app.get('/api/menu', menuController.getMenuByCategory);

// Home route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../frontend/index.html');
});

// ========================================
// RESERVATIONS API
// ========================================

app.post('/api/reservations', async (req, res) => {
    try {
        const {
            prenom,
            nom,
            email,
            telephone,
            date_reservation,
            heure_reservation,
            nombre_personnes,
            occasion,
            message_special
        } = req.body;

        // Validation
        if (!prenom || !nom || !email || !telephone || !date_reservation || !heure_reservation || !nombre_personnes) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs obligatoires doivent être remplis'
            });
        }

        // Insert into database
        const [result] = await pool.execute(
            `INSERT INTO reservations 
            (prenom, nom, email, telephone, date_reservation, heure_reservation, nombre_personnes, occasion, message_special) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [prenom, nom, email, telephone, date_reservation, heure_reservation, nombre_personnes, occasion || null, message_special || null]
        );

        // Send confirmation email to customer
        const customerMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Confirmation de Réservation - Le Croco Brasseur',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #2E5339; padding: 30px; text-align: center;">
                        <h1 style="color: #D4A94E; margin: 0;">Le Croco Brasseur</h1>
                        <p style="color: white; margin: 10px 0 0;">Where Bujumbura Meets the World</p>
                    </div>
                    
                    <div style="padding: 40px 30px; background: #F2E6D8;">
                        <h2 style="color: #2E5339;">Merci pour votre réservation!</h2>
                        <p>Bonjour ${prenom} ${nom},</p>
                        <p>Nous avons bien reçu votre réservation. Voici les détails:</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Date:</strong> ${date_reservation}</p>
                            <p><strong>Heure:</strong> ${heure_reservation}</p>
                            <p><strong>Nombre de personnes:</strong> ${nombre_personnes}</p>
                            ${occasion ? `<p><strong>Occasion:</strong> ${occasion}</p>` : ''}
                        </div>
                        
                        <p>Nous vous confirmerons votre réservation sous peu via WhatsApp ou email.</p>
                        <p>À très bientôt!</p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #D4A94E;">
                            <p><strong>Le Croco Brasseur</strong></p>
                            <p>📍 20, Boulevard de l'Uprona, Rohero, Bujumbura</p>
                            <p>📞 +257 76 31 31 32</p>
                            <p>📧 info@croco-brasseur.com</p>
                        </div>
                    </div>
                </div>
            `
        };

        // Send notification email to restaurant
        const restaurantMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Nouvelle Réservation - ${prenom} ${nom}`,
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Nouvelle Réservation</h2>
                    <p><strong>Nom:</strong> ${prenom} ${nom}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Téléphone:</strong> ${telephone}</p>
                    <p><strong>Date:</strong> ${date_reservation}</p>
                    <p><strong>Heure:</strong> ${heure_reservation}</p>
                    <p><strong>Personnes:</strong> ${nombre_personnes}</p>
                    <p><strong>Occasion:</strong> ${occasion || 'Non spécifiée'}</p>
                    ${message_special ? `<p><strong>Message:</strong> ${message_special}</p>` : ''}
                    <p><strong>ID Réservation:</strong> #${result.insertId}</p>
                </div>
            `
        };

        // Send emails (if configured)
        if (transporter) {
            try {
                await transporter.sendMail(customerMailOptions);
                await transporter.sendMail(restaurantMailOptions);
            } catch (emailError) {
                console.error('Email error:', emailError);
                // Continue even if email fails
            }
        }

        res.status(201).json({
            success: true,
            message: 'Réservation créée avec succès',
            reservationId: result.insertId
        });

    } catch (error) {
        console.error('Reservation error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la réservation'
        });
    }
});

// Get all reservations (for admin)
app.get('/api/reservations', async (req, res) => {
    try {
        const [reservations] = await pool.execute(
            'SELECT * FROM reservations ORDER BY date_reservation DESC, heure_reservation DESC'
        );

        res.json({
            success: true,
            data: reservations
        });
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des réservations'
        });
    }
});

// ========================================
// CONTACT API
// ========================================

app.post('/api/contact', async (req, res) => {
    try {
        const { nom_complet, email, telephone, sujet, message } = req.body;

        // Validation
        if (!nom_complet || !email || !sujet || !message) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs obligatoires doivent être remplis'
            });
        }

        // Insert into database
        const [result] = await pool.execute(
            'INSERT INTO contacts (nom_complet, email, telephone, sujet, message) VALUES (?, ?, ?, ?, ?)',
            [nom_complet, email, telephone || null, sujet, message]
        );

        // Send notification email to restaurant
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Nouveau Message: ${sujet}`,
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Nouveau Message de Contact</h2>
                    <p><strong>De:</strong> ${nom_complet}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Téléphone:</strong> ${telephone || 'Non fourni'}</p>
                    <p><strong>Sujet:</strong> ${sujet}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message}</p>
                </div>
            `
        };

        if (transporter) {
            try {
                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error('Email error:', emailError);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Message envoyé avec succès'
        });

    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi du message'
        });
    }
});

// ========================================
// NEWSLETTER API
// ========================================

app.post('/api/newsletter', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email requis'
            });
        }

        // Check if email already exists
        const [existing] = await pool.execute(
            'SELECT * FROM newsletter WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà inscrit'
            });
        }

        // Insert into database
        await pool.execute(
            'INSERT INTO newsletter (email) VALUES (?)',
            [email]
        );

        res.status(201).json({
            success: true,
            message: 'Inscription réussie à la newsletter'
        });

    } catch (error) {
        console.error('Newsletter error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'inscription'
        });
    }
});

// ========================================
// EVENTS API
// ========================================

app.get('/api/events', async (req, res) => {
    try {
        const [events] = await pool.execute(
            'SELECT * FROM evenements WHERE actif = 1 ORDER BY date_event DESC'
        );

        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des événements'
        });
    }
});

// ========================================
// CATERING REQUEST API
// ========================================

app.post('/api/catering', async (req, res) => {
    try {
        const {
            nom_entreprise,
            nom_contact,
            email,
            telephone,
            type_evenement,
            date_evenement,
            nombre_invites,
            lieu,
            budget_estime,
            details
        } = req.body;

        // Validation
        if (!nom_contact || !email || !telephone || !type_evenement || !date_evenement || !nombre_invites) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs obligatoires doivent être remplis'
            });
        }

        // Insert into database
        const [result] = await pool.execute(
            `INSERT INTO catering_requests 
            (nom_entreprise, nom_contact, email, telephone, type_evenement, date_evenement, nombre_invites, lieu, budget_estime, details) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nom_entreprise || null, nom_contact, email, telephone, type_evenement, date_evenement, nombre_invites, lieu || null, budget_estime || null, details || null]
        );

        // Send notification email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Nouvelle Demande Catering - ${type_evenement}`,
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Nouvelle Demande de Catering</h2>
                    ${nom_entreprise ? `<p><strong>Entreprise:</strong> ${nom_entreprise}</p>` : ''}
                    <p><strong>Contact:</strong> ${nom_contact}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Téléphone:</strong> ${telephone}</p>
                    <p><strong>Type d'événement:</strong> ${type_evenement}</p>
                    <p><strong>Date:</strong> ${date_evenement}</p>
                    <p><strong>Nombre d'invités:</strong> ${nombre_invites}</p>
                    ${lieu ? `<p><strong>Lieu:</strong> ${lieu}</p>` : ''}
                    ${budget_estime ? `<p><strong>Budget estimé:</strong> ${budget_estime}</p>` : ''}
                    ${details ? `<p><strong>Détails:</strong> ${details}</p>` : ''}
                </div>
            `
        };

        if (transporter) {
            try {
                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error('Email error:', emailError);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Demande de catering envoyée avec succès'
        });

    } catch (error) {
        console.error('Catering error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi de la demande'
        });
    }
});

// ========================================
// HEALTH CHECK
// ========================================

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// ========================================
// ERROR HANDLING
// ========================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log(`
    🐊 ====================================
    🐊 Le Croco Brasseur - Server Running
    🐊 ====================================
    🐊 Port: ${PORT}
    🐊 Environment: ${process.env.NODE_ENV || 'development'}
    🐊 Database: ${process.env.DB_NAME}
    🐊 URL: http://localhost:${PORT}
    🐊 ====================================
    `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});