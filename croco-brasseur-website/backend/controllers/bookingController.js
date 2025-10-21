// Booking Controller
const { pool } = require('../config/database');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Create reservation
exports.createReservation = async (req, res) => {
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

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email invalide'
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
            html: generateCustomerEmailTemplate(prenom, nom, date_reservation, heure_reservation, nombre_personnes, occasion)
        };

        // Send notification email to restaurant
        const restaurantMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Nouvelle Réservation - ${prenom} ${nom}`,
            html: generateRestaurantEmailTemplate(prenom, nom, email, telephone, date_reservation, heure_reservation, nombre_personnes, occasion, message_special, result.insertId)
        };

        // Send emails
        try {
            await transporter.sendMail(customerMailOptions);
            await transporter.sendMail(restaurantMailOptions);
        } catch (emailError) {
            console.error('Email sending error:', emailError);
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
};

// Get all reservations
exports.getAllReservations = async (req, res) => {
    try {
        const [reservations] = await pool.execute(
            'SELECT * FROM reservations ORDER BY date_reservation DESC, heure_reservation DESC LIMIT 100'
        );

        res.json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des réservations'
        });
    }
};

// Get reservation by ID
exports.getReservationById = async (req, res) => {
    try {
        const { id } = req.params;

        const [reservations] = await pool.execute(
            'SELECT * FROM reservations WHERE id = ?',
            [id]
        );

        if (reservations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Réservation non trouvée'
            });
        }

        res.json({
            success: true,
            data: reservations[0]
        });
    } catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la réservation'
        });
    }
};

// Update reservation status
exports.updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;

        if (!['en_attente', 'confirmee', 'annulee'].includes(statut)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        await pool.execute(
            'UPDATE reservations SET statut = ? WHERE id = ?',
            [statut, id]
        );

        res.json({
            success: true,
            message: 'Statut mis à jour avec succès'
        });
    } catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la réservation'
        });
    }
};

// Delete reservation
exports.deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.execute('DELETE FROM reservations WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Réservation supprimée avec succès'
        });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la réservation'
        });
    }
};

// Email templates
function generateCustomerEmailTemplate(prenom, nom, date, heure, personnes, occasion) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; }
                .header { background: #2E5339; padding: 30px; text-align: center; }
                .header h1 { color: #D4A94E; margin: 0; font-size: 32px; }
                .header p { color: white; margin: 10px 0 0; }
                .content { padding: 40px 30px; background: #F2E6D8; }
                .content h2 { color: #2E5339; }
                .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .details p { margin: 10px 0; color: #4B3A2D; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #D4A94E; }
                .footer p { color: #4B3A2D; margin: 5px 0; }
                strong { color: #2E5339; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🐊 Le Croco Brasseur</h1>
                    <p>Where Bujumbura Meets the World</p>
                </div>
                
                <div class="content">
                    <h2>Merci pour votre réservation!</h2>
                    <p>Bonjour ${prenom} ${nom},</p>
                    <p>Nous avons bien reçu votre réservation. Voici les détails:</p>
                    
                    <div class="details">
                        <p><strong>📅 Date:</strong> ${date}</p>
                        <p><strong>🕐 Heure:</strong> ${heure}</p>
                        <p><strong>👥 Nombre de personnes:</strong> ${personnes}</p>
                        ${occasion ? `<p><strong>🎉 Occasion:</strong> ${occasion}</p>` : ''}
                    </div>
                    
                    <p>Nous vous confirmerons votre réservation sous peu via WhatsApp ou email.</p>
                    <p>Nous avons hâte de vous accueillir chez nous!</p>
                    
                    <div class="footer">
                        <p><strong>Le Croco Brasseur</strong></p>
                        <p>📍 20, Boulevard de l'Uprona, Rohero, Bujumbura</p>
                        <p>📞 +257 76 31 31 32</p>
                        <p>📧 info@croco-brasseur.com</p>
                        <p>🌐 www.lecrocobrasseur.com</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

function generateRestaurantEmailTemplate(prenom, nom, email, telephone, date, heure, personnes, occasion, message, id) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #f5f5f5; }
                h2 { color: #2E5339; }
                .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #D4A94E; }
                .info-box p { margin: 8px 0; color: #333; }
                strong { color: #2E5339; }
                .id-badge { display: inline-block; background: #2E5339; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>🔔 Nouvelle Réservation</h2>
                <p class="id-badge">Réservation #${id}</p>
                
                <div class="info-box">
                    <p><strong>👤 Client:</strong> ${prenom} ${nom}</p>
                    <p><strong>📧 Email:</strong> ${email}</p>
                    <p><strong>📞 Téléphone:</strong> ${telephone}</p>
                </div>
                
                <div class="info-box">
                    <p><strong>📅 Date:</strong> ${date}</p>
                    <p><strong>🕐 Heure:</strong> ${heure}</p>
                    <p><strong>👥 Nombre de personnes:</strong> ${personnes}</p>
                    ${occasion ? `<p><strong>🎉 Occasion:</strong> ${occasion}</p>` : ''}
                    ${message ? `<p><strong>💬 Message spécial:</strong> ${message}</p>` : ''}
                </div>
                
                <p><strong>Action requise:</strong> Confirmer la réservation par WhatsApp ou email.</p>
            </div>
        </body>
        </html>
    `;
}

module.exports = exports;