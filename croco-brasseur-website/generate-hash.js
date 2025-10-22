const bcrypt = require('bcrypt');

async function generateHash() {
    const password = 'admin123';
    const saltRounds = 10;
    
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Nouveau hash généré:');
        console.log(hash);
        console.log('\Longueur du hash:', hash.length);
        console.log('\nRequête de mise à jour:');
        console.log(`UPDATE admin_users SET password_hash = '${hash}' WHERE username = 'admin';`);
        
        // Test de vérification
        const isValid = await bcrypt.compare(password, hash);
        console.log('\nTest de vérification:', isValid ? 'SUCCÈS' : 'ÉCHEC');
    } catch (error) {
        console.error('Erreur:', error);
    }
}

generateHash();