// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', async () => {
    // Load user info
    loadUserInfo();

    // Load dashboard stats
    await loadDashboardStats();
});

function loadUserInfo() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('userName').textContent = user.nom_complet || user.username;
        document.getElementById('userRole').textContent =
            user.role === 'super_admin' ? 'Super Administrateur' : 'Administrateur';
    }
}

async function loadDashboardStats() {
    try {
        const data = await apiRequest('/admin/dashboard/stats');

        if (data.success) {
            // Update stats
            document.getElementById('pendingReservations').textContent = data.data.stats.pendingReservations;
            document.getElementById('totalReservations').textContent = data.data.stats.totalReservations;
            document.getElementById('galleryImages').textContent = data.data.stats.galleryImages;
            document.getElementById('menuItems').textContent = data.data.stats.menuItems;

            // Load recent reservations
            loadRecentReservations(data.data.recentReservations);

            // Load recent activity
            loadRecentActivity(data.data.recentActivity);
        }

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showNotification('Erreur lors du chargement des statistiques', 'error');
    }
}

function loadRecentReservations(reservations) {
    const tbody = document.getElementById('recentReservationsBody');

    if (reservations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucune réservation récente</td></tr>';
        return;
    }

    tbody.innerHTML = reservations.map(res => `
        <tr>
            <td><strong>${res.prenom} ${res.nom}</strong></td>
            <td>${formatDate(res.date_reservation)}</td>
            <td>${res.heure_reservation}</td>
            <td>${res.nombre_personnes}</td>
            <td>${getStatusBadge(res.statut)}</td>
            <td>
                <a href="reservations.html?id=${res.id}" class="btn btn-sm btn-outline">
                    <i class="fas fa-eye"></i>
                </a>
            </td>
        </tr>
    `).join('');
}

function loadRecentActivity(activities) {
    const activityList = document.getElementById('recentActivityList');

    if (activities.length === 0) {
        activityList.innerHTML = '<p class="text-center">Aucune activité récente</p>';
        return;
    }

    activityList.innerHTML = activities.map(activity => `
        <div style="padding: 15px; border-bottom: 1px solid #DDD; display: flex; align-items: center; gap: 15px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                ${activity.username ? activity.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600;">${activity.description || activity.action}</p>
                <p style="margin: 0; font-size: 0.85rem; color: #666;">
                    ${activity.username || 'Admin'} • ${formatDateTime(activity.created_at)}
                </p>
            </div>
        </div>
    `).join('');
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
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
        return 'À l\'instant';
    } else if (diffMins < 60) {
        return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
        return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
        return `Il y a ${diffDays}j`;
    } else {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}
