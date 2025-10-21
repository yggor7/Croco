// CROCO BRASSEUR - Booking & Contact Forms

// ========================================
// RESERVATION FORM
// ========================================

const reservationForm = document.getElementById('reservation-form');

if (reservationForm) {
    reservationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            prenom: document.getElementById('prenom').value.trim(),
            nom: document.getElementById('nom').value.trim(),
            email: document.getElementById('email').value.trim(),
            telephone: document.getElementById('telephone').value.trim(),
            date_reservation: document.getElementById('date').value,
            heure_reservation: document.getElementById('heure').value,
            nombre_personnes: document.getElementById('personnes').value,
            occasion: document.getElementById('occasion').value,
            message_special: document.getElementById('message').value.trim()
        };
        
        // Validation
        if (!validateEmail(formData.email)) {
            showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }
        
        if (!validatePhone(formData.telephone)) {
            showNotification('Veuillez entrer un numéro de téléphone valide', 'error');
            return;
        }
        
        if (!formData.date_reservation || !formData.heure_reservation) {
            showNotification('Veuillez sélectionner une date et une heure', 'error');
            return;
        }
        
        // Disable submit button
        const submitBtn = reservationForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        
        try {
            // Send to backend
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showNotification('Réservation envoyée avec succès! Vous recevrez une confirmation.', 'success');
                reservationForm.reset();
                
                // Open WhatsApp with pre-filled message
                const whatsappMessage = `Bonjour Le Croco Brasseur,\n\nJe viens de faire une réservation:\n\nNom: ${formData.prenom} ${formData.nom}\nDate: ${formData.date_reservation}\nHeure: ${formData.heure_reservation}\nPersonnes: ${formData.nombre_personnes}\n\nMerci!`;
                const whatsappUrl = `https://wa.me/25776313132?text=${encodeURIComponent(whatsappMessage)}`;
                
                setTimeout(() => {
                    window.open(whatsappUrl, '_blank');
                }, 1500);
            } else {
                showNotification(result.message || 'Erreur lors de la réservation', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            
            // Fallback: Open WhatsApp directly if server is not available
            showNotification('Redirection vers WhatsApp pour confirmer votre réservation...', 'success');
            
            const whatsappMessage = `Bonjour Le Croco Brasseur,\n\nJe souhaite faire une réservation:\n\nNom: ${formData.prenom} ${formData.nom}\nEmail: ${formData.email}\nTéléphone: ${formData.telephone}\nDate: ${formData.date_reservation}\nHeure: ${formData.heure_reservation}\nNombre de personnes: ${formData.nombre_personnes}\nOccasion: ${formData.occasion}\n\nMessage: ${formData.message_special || 'Aucun'}\n\nMerci!`;
            
            const whatsappUrl = `https://wa.me/25776313132?text=${encodeURIComponent(whatsappMessage)}`;
            
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
                reservationForm.reset();
            }, 1000);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

// ========================================
// CONTACT FORM
// ========================================

const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            nom_complet: document.getElementById('contact-nom').value.trim(),
            email: document.getElementById('contact-email').value.trim(),
            telephone: document.getElementById('contact-tel').value.trim(),
            sujet: document.getElementById('contact-sujet').value.trim(),
            message: document.getElementById('contact-message').value.trim()
        };
        
        // Validation
        if (!validateEmail(formData.email)) {
            showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }
        
        if (formData.telephone && !validatePhone(formData.telephone)) {
            showNotification('Veuillez entrer un numéro de téléphone valide', 'error');
            return;
        }
        
        if (formData.message.length < 10) {
            showNotification('Votre message doit contenir au moins 10 caractères', 'error');
            return;
        }
        
        // Disable submit button
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        
        try {
            // Send to backend
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showNotification('Message envoyé avec succès! Nous vous répondrons bientôt.', 'success');
                contactForm.reset();
            } else {
                showNotification(result.message || 'Erreur lors de l\'envoi du message', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            
            // Fallback: Open email client
            showNotification('Ouverture de votre client email...', 'success');
            
            const mailtoLink = `mailto:info@croco-brasseur.com?subject=${encodeURIComponent(formData.sujet)}&body=${encodeURIComponent(`De: ${formData.nom_complet}\nEmail: ${formData.email}\nTéléphone: ${formData.telephone}\n\nMessage:\n${formData.message}`)}`;
            
            setTimeout(() => {
                window.location.href = mailtoLink;
                contactForm.reset();
            }, 1000);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\+\-\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 8;
}

function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 20px 30px;
        background: ${type === 'success' ? '#2E5339' : '#e74c3c'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 15px;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Add animation styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
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
    
    .notification i {
        font-size: 24px;
    }
    
    @media (max-width: 768px) {
        .notification {
            right: 10px !important;
            left: 10px !important;
            max-width: calc(100% - 20px) !important;
        }
    }
`;
document.head.appendChild(notificationStyles);

// ========================================
// REAL-TIME FORM VALIDATION
// ========================================

// Email validation on input
const emailInputs = document.querySelectorAll('input[type="email"]');
emailInputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '';
        }
    });
    
    input.addEventListener('input', function() {
        if (this.style.borderColor === 'rgb(231, 76, 60)') {
            this.style.borderColor = '';
        }
    });
});

// Phone validation on input
const phoneInputs = document.querySelectorAll('input[type="tel"]');
phoneInputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value && !validatePhone(this.value)) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '';
        }
    });
    
    input.addEventListener('input', function() {
        if (this.style.borderColor === 'rgb(231, 76, 60)') {
            this.style.borderColor = '';
        }
    });
});

// ========================================
// NEWSLETTER SUBSCRIPTION (Optional)
// ========================================

const newsletterForm = document.getElementById('newsletter-form');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!validateEmail(email)) {
            showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            if (response.ok) {
                showNotification('Merci! Vous êtes inscrit à notre newsletter.', 'success');
                emailInput.value = '';
            } else {
                showNotification('Erreur lors de l\'inscription', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur lors de l\'inscription', 'error');
        }
    });
}

// ========================================
// AUTO-FORMAT PHONE NUMBER
// ========================================

phoneInputs.forEach(input => {
    input.addEventListener('input', function(e) {
        let value = this.value.replace(/\D/g, '');
        
        // Format for Burundi numbers starting with +257
        if (value.startsWith('257')) {
            value = '+' + value;
        } else if (value.startsWith('0')) {
            value = '+257' + value.substring(1);
        } else if (value.length > 0 && !value.startsWith('+')) {
            value = '+257' + value;
        }
        
        this.value = value;
    });
});

// ========================================
// FORM FIELD COUNTER (for textarea)
// ========================================

const textareas = document.querySelectorAll('textarea');
textareas.forEach(textarea => {
    const maxLength = textarea.getAttribute('maxlength');
    
    if (maxLength) {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.style.cssText = `
            font-size: 12px;
            color: #888;
            text-align: right;
            margin-top: 5px;
        `;
        
        textarea.parentNode.appendChild(counter);
        
        const updateCounter = () => {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${textarea.value.length} / ${maxLength} caractères`;
            
            if (remaining < 20) {
                counter.style.color = '#e74c3c';
            } else {
                counter.style.color = '#888';
            }
        };
        
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    }
});

console.log('🐊 Croco Brasseur - Booking system loaded');