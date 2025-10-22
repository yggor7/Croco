// Reservations Management
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadReservations();
});

function loadUserInfo() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('userName').textContent = user.nom_complet || user.username;
        document.getElementById('userRole').textContent =
            user.role === 'super_admin' ? 'Super Administrateur' : 'Administrateur';
    }
}

async function loadReservations() {
    try {
        const data = await apiRequest('/admin/reservations');

        if (data.success) {
            displayReservations(data.data);
        }
    } catch (error) {
        console.error('Error loading reservations:', error);
        showNotification('Erreur lors du chargement des réservations', 'error');
    }
}

function displayReservations(reservations) {
    const tbody = document.getElementById('reservationsBody');

    if (reservations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">Aucune réservation trouvée</td></tr>';
        return;
    }

    tbody.innerHTML = reservations.map(res => `
        <tr>
            <td><strong>#${res.id}</strong></td>
            <td>${res.prenom} ${res.nom}</td>
            <td>
                ${res.email}<br>
                <small>${res.telephone}</small>
            </td>
            <td>${formatDate(res.date_reservation)}</td>
            <td>${res.heure_reservation}</td>
            <td>${res.nombre_personnes}</td>
            <td>${res.occasion || '-'}</td>
            <td>${getStatusBadge(res.statut)}</td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline" onclick="viewReservation(${res.id})" title="Voir">
                        <i class="fas fa-eye"></i>
                    </button>
                    <select onchange="updateStatus(${res.id}, this.value)" class="btn btn-sm" style="padding: 5px;">
                        <option value="">Changer statut</option>
                        <option value="confirmee">Confirmer</option>
                        <option value="annulee">Annuler</option>
                        <option value="terminee">Terminer</option>
                    </select>
                    <button class="btn btn-sm btn-danger" onclick="deleteReservation(${res.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function viewReservation(id) {
    try {
        const data = await apiRequest(`/admin/reservations/${id}`);

        if (data.success) {
            const res = data.data;
            document.getElementById('reservationDetail').innerHTML = `
                <div style="padding: 20px;">
                    <h4>Informations Client</h4>
                    <p><strong>Nom:</strong> ${res.prenom} ${res.nom}</p>
                    <p><strong>Email:</strong> ${res.email}</p>
                    <p><strong>Téléphone:</strong> ${res.telephone}</p>

                    <h4 style="margin-top: 20px;">Détails Réservation</h4>
                    <p><strong>Date:</strong> ${formatDate(res.date_reservation)}</p>
                    <p><strong>Heure:</strong> ${res.heure_reservation}</p>
                    <p><strong>Nombre de personnes:</strong> ${res.nombre_personnes}</p>
                    <p><strong>Occasion:</strong> ${res.occasion || '-'}</p>
                    <p><strong>Statut:</strong> ${getStatusBadge(res.statut)}</p>

                    ${res.message_special ? `
                        <h4 style="margin-top: 20px;">Message Spécial</h4>
                        <p>${res.message_special}</p>
                    ` : ''}

                    <p style="margin-top: 20px;"><small>Créée le: ${formatDateTime(res.created_at)}</small></p>
                </div>
            `;
            document.getElementById('reservationModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading reservation:', error);
        showNotification('Erreur lors du chargement', 'error');
    }
}

function closeReservationModal() {
    document.getElementById('reservationModal').classList.remove('active');
}

async function updateStatus(id, newStatus) {
    if (!newStatus) return;

    try {
        await apiRequest(`/admin/reservations/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ statut: newStatus })
        });

        showNotification('Statut mis à jour avec succès', 'success');
        loadReservations();

    } catch (error) {
        console.error('Error updating status:', error);
        showNotification('Erreur lors de la mise à jour', 'error');
    }
}

async function deleteReservation(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
        return;
    }

    try {
        await apiRequest(`/admin/reservations/${id}`, {
            method: 'DELETE'
        });

        showNotification('Réservation supprimée avec succès', 'success');
        loadReservations();

    } catch (error) {
        console.error('Error deleting reservation:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}

function getStatusBadge(status) {
    const statusMap = {
        'en_attente': { text: 'En attente', class: 'warning' },
        'confirmee': { text: 'Confirmée', class: 'success' },
        'annulee': { text: 'Annulée', class: 'danger' },
        'terminee': { text: 'Terminée', class: 'info' }
    };

    const statusInfo = statusMap[status] || { text: status, class: 'info' };
    return `<span class="badge badge-${statusInfo.class}">${statusInfo.text}</span>`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
