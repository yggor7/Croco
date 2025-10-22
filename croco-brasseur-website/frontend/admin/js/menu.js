// Menu Management
let currentCategoryId = null;
let currentItemId = null;
let categories = [];

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadMenu();
});

function loadUserInfo() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('userName').textContent = user.nom_complet || user.username;
        document.getElementById('userRole').textContent =
            user.role === 'super_admin' ? 'Super Administrateur' : 'Administrateur';
    }
}

async function loadMenu() {
    try {
        // Load categories
        const catData = await apiRequest('/admin/menu/categories');
        categories = catData.data || [];

        // Load items
        const itemsData = await apiRequest('/admin/menu/items');
        const items = itemsData.data || [];

        displayMenu(categories, items);
        populateCategorySelect();

    } catch (error) {
        console.error('Error loading menu:', error);
        showNotification('Erreur lors du chargement du menu', 'error');
    }
}

function displayMenu(categories, items) {
    const container = document.getElementById('menuContainer');

    if (categories.length === 0) {
        container.innerHTML = '<div class="card"><div class="card-body text-center"><p>Aucune catégorie. Commencez par créer une catégorie.</p></div></div>';
        return;
    }

    container.innerHTML = categories.map(category => {
        const categoryItems = items.filter(item => item.category_id === category.id);

        return `
            <div class="card mb-3">
                <div class="card-header" style="background: var(--primary-color); color: white;">
                    <div class="d-flex justify-between align-center">
                        <h3 style="margin: 0; color: white;">
                            ${category.icon ? `<i class="fas ${category.icon}"></i>` : ''}
                            ${category.nom}
                            ${category.nom_en ? `<small style="opacity: 0.8;"> / ${category.nom_en}</small>` : ''}
                        </h3>
                        <div class="d-flex gap-1">
                            <button class="btn btn-sm" style="background: white; color: var(--primary-color);" onclick="editCategory(${category.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id}, '${category.nom}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    ${categoryItems.length === 0 ?
                        '<p class="text-center">Aucun plat dans cette catégorie</p>' :
                        '<div class="table-responsive"><table><thead><tr><th>Nom</th><th>Prix</th><th>Options</th><th>Statut</th><th>Actions</th></tr></thead><tbody>' +
                        categoryItems.map(item => `
                            <tr>
                                <td>
                                    <strong>${item.nom}</strong>
                                    ${item.nom_en ? `<br><small>${item.nom_en}</small>` : ''}
                                    ${item.description ? `<br><small style="color: #666;">${item.description.substring(0, 50)}...</small>` : ''}
                                </td>
                                <td>${item.prix ? `${item.prix} ${item.prix_devise}` : '-'}</td>
                                <td>
                                    ${item.vegetarien ? '<span class="badge badge-success">🌱 Végé</span> ' : ''}
                                    ${item.vegan ? '<span class="badge badge-success">🌿 Vegan</span> ' : ''}
                                    ${item.sans_gluten ? '<span class="badge badge-info">Sans gluten</span> ' : ''}
                                    ${item.populaire ? '<span class="badge badge-warning">⭐ Populaire</span> ' : ''}
                                    ${item.nouveau ? '<span class="badge badge-info">🆕 Nouveau</span> ' : ''}
                                </td>
                                <td>
                                    <span class="badge badge-${item.disponible ? 'success' : 'danger'}">
                                        ${item.disponible ? 'Disponible' : 'Indisponible'}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex gap-1">
                                        <button class="btn btn-sm btn-outline" onclick="editItem(${item.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteItem(${item.id}, '${item.nom}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('') +
                        '</tbody></table></div>'
                    }
                </div>
            </div>
        `;
    }).join('');
}

function populateCategorySelect() {
    const select = document.getElementById('itemCategory');
    select.innerHTML = '<option value="">Sélectionner...</option>' +
        categories.map(cat => `<option value="${cat.id}">${cat.nom}</option>`).join('');
}

// ========================================
// CATEGORY MANAGEMENT
// ========================================

function openCategoryModal() {
    currentCategoryId = null;
    document.getElementById('categoryModalTitle').textContent = 'Ajouter une Catégorie';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryActif').checked = true;
    document.getElementById('categoryModal').classList.add('active');
}

async function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    currentCategoryId = id;
    document.getElementById('categoryModalTitle').textContent = 'Modifier la Catégorie';
    document.getElementById('categoryNom').value = category.nom;
    document.getElementById('categoryNomEn').value = category.nom_en || '';
    document.getElementById('categoryDescription').value = category.description || '';
    document.getElementById('categoryIcon').value = category.icon || '';
    document.getElementById('categoryOrdre').value = category.ordre;
    document.getElementById('categoryActif').checked = category.actif;
    document.getElementById('categoryModal').classList.add('active');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active');
    currentCategoryId = null;
}

async function saveCategory() {
    try {
        const nom = document.getElementById('categoryNom').value;
        const nom_en = document.getElementById('categoryNomEn').value;
        const description = document.getElementById('categoryDescription').value;
        const icon = document.getElementById('categoryIcon').value;
        const ordre = document.getElementById('categoryOrdre').value;
        const actif = document.getElementById('categoryActif').checked;

        if (!nom) {
            showNotification('Nom requis', 'error');
            return;
        }

        if (currentCategoryId) {
            await apiRequest(`/admin/menu/categories/${currentCategoryId}`, {
                method: 'PUT',
                body: JSON.stringify({ nom, nom_en, description, icon, ordre, actif })
            });
            showNotification('Catégorie mise à jour', 'success');
        } else {
            await apiRequest('/admin/menu/categories', {
                method: 'POST',
                body: JSON.stringify({ nom, nom_en, description, icon, ordre, actif })
            });
            showNotification('Catégorie créée', 'success');
        }

        closeCategoryModal();
        loadMenu();

    } catch (error) {
        console.error('Error saving category:', error);
        showNotification(error.message || 'Erreur lors de l\'enregistrement', 'error');
    }
}

async function deleteCategory(id, nom) {
    if (!confirm(`Supprimer la catégorie "${nom}" ?\n\nATTENTION: Tous les plats de cette catégorie seront aussi supprimés!`)) {
        return;
    }

    try {
        await apiRequest(`/admin/menu/categories/${id}`, {
            method: 'DELETE'
        });
        showNotification('Catégorie supprimée', 'success');
        loadMenu();
    } catch (error) {
        console.error('Error deleting category:', error);
        showNotification(error.message || 'Erreur lors de la suppression', 'error');
    }
}

// ========================================
// ITEM MANAGEMENT
// ========================================

function openItemModal() {
    currentItemId = null;
    document.getElementById('itemModalTitle').textContent = 'Ajouter un Plat';
    document.getElementById('itemForm').reset();
    document.getElementById('itemDevise').value = 'BIF';
    document.getElementById('itemEpice').value = 'doux';
    document.getElementById('itemDisponible').checked = true;
    document.getElementById('itemModal').classList.add('active');
}

async function editItem(id) {
    try {
        const data = await apiRequest(`/admin/menu/items/${id}`);
        const item = data.data;

        currentItemId = id;
        document.getElementById('itemModalTitle').textContent = 'Modifier le Plat';
        document.getElementById('itemCategory').value = item.category_id;
        document.getElementById('itemNom').value = item.nom;
        document.getElementById('itemNomEn').value = item.nom_en || '';
        document.getElementById('itemDescription').value = item.description || '';
        document.getElementById('itemDescriptionEn').value = item.description_en || '';
        document.getElementById('itemPrix').value = item.prix || '';
        document.getElementById('itemDevise').value = item.prix_devise || 'BIF';
        document.getElementById('itemIngredients').value = item.ingredients || '';
        document.getElementById('itemAllergenes').value = item.allergenes || '';
        document.getElementById('itemEpice').value = item.epice_niveau || 'doux';
        document.getElementById('itemVegetarien').checked = item.vegetarien;
        document.getElementById('itemVegan').checked = item.vegan;
        document.getElementById('itemSansGluten').checked = item.sans_gluten;
        document.getElementById('itemPopulaire').checked = item.populaire;
        document.getElementById('itemNouveau').checked = item.nouveau;
        document.getElementById('itemOrdre').value = item.ordre;
        document.getElementById('itemDisponible').checked = item.disponible;

        document.getElementById('itemModal').classList.add('active');

    } catch (error) {
        console.error('Error loading item:', error);
        showNotification('Erreur lors du chargement', 'error');
    }
}

function closeItemModal() {
    document.getElementById('itemModal').classList.remove('active');
    currentItemId = null;
}

async function saveItem() {
    try {
        const data = {
            category_id: document.getElementById('itemCategory').value,
            nom: document.getElementById('itemNom').value,
            nom_en: document.getElementById('itemNomEn').value,
            description: document.getElementById('itemDescription').value,
            description_en: document.getElementById('itemDescriptionEn').value,
            prix: document.getElementById('itemPrix').value || null,
            prix_devise: document.getElementById('itemDevise').value,
            ingredients: document.getElementById('itemIngredients').value,
            allergenes: document.getElementById('itemAllergenes').value,
            epice_niveau: document.getElementById('itemEpice').value,
            vegetarien: document.getElementById('itemVegetarien').checked,
            vegan: document.getElementById('itemVegan').checked,
            sans_gluten: document.getElementById('itemSansGluten').checked,
            populaire: document.getElementById('itemPopulaire').checked,
            nouveau: document.getElementById('itemNouveau').checked,
            ordre: document.getElementById('itemOrdre').value,
            disponible: document.getElementById('itemDisponible').checked
        };

        if (!data.category_id || !data.nom) {
            showNotification('Catégorie et nom requis', 'error');
            return;
        }

        if (currentItemId) {
            await apiRequest(`/admin/menu/items/${currentItemId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            showNotification('Plat mis à jour', 'success');
        } else {
            await apiRequest('/admin/menu/items', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            showNotification('Plat créé', 'success');
        }

        closeItemModal();
        loadMenu();

    } catch (error) {
        console.error('Error saving item:', error);
        showNotification(error.message || 'Erreur lors de l\'enregistrement', 'error');
    }
}

async function deleteItem(id, nom) {
    if (!confirm(`Supprimer le plat "${nom}" ?`)) {
        return;
    }

    try {
        await apiRequest(`/admin/menu/items/${id}`, {
            method: 'DELETE'
        });
        showNotification('Plat supprimé', 'success');
        loadMenu();
    } catch (error) {
        console.error('Error deleting item:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}
