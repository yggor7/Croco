// Gallery Management
let currentImageId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadGallery();
});

function loadUserInfo() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('userName').textContent = user.nom_complet || user.username;
        document.getElementById('userRole').textContent =
            user.role === 'super_admin' ? 'Super Administrateur' : 'Administrateur';
    }
}

async function loadGallery() {
    const category = document.getElementById('filterCategory').value;
    const actif = document.getElementById('filterActif').value;

    try {
        let url = '/admin/gallery';
        const params = [];
        if (category) params.push(`category=${category}`);
        if (actif) params.push(`actif=${actif}`);
        if (params.length > 0) url += '?' + params.join('&');

        const data = await apiRequest(url);

        if (data.success) {
            displayGallery(data.data);
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        showNotification('Erreur lors du chargement de la galerie', 'error');
    }
}

function displayGallery(images) {
    const grid = document.getElementById('galleryGrid');

    if (images.length === 0) {
        grid.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">Aucune image trouvée</p>';
        return;
    }

    grid.innerHTML = images.map(img => `
        <div class="gallery-item">
            <img src="${img.filepath}" alt="${img.titre}">
            <div class="gallery-item-actions">
                <button class="btn btn-sm btn-primary" onclick="editImage(${img.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteImage(${img.id}, '${img.titre}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="gallery-item-info">
                <h4>${img.titre}</h4>
                <p>${img.category} • ${img.actif ? 'Actif' : 'Inactif'}</p>
            </div>
        </div>
    `).join('');
}

function openAddImageModal() {
    currentImageId = null;
    document.getElementById('modalTitle').textContent = 'Ajouter une Image';
    document.getElementById('imageForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('actif').checked = true;
    document.getElementById('imageModal').classList.add('active');
}

async function editImage(id) {
    try {
        const data = await apiRequest(`/admin/gallery/${id}`);

        if (data.success) {
            const img = data.data;
            currentImageId = id;
            document.getElementById('modalTitle').textContent = 'Modifier l\'Image';
            document.getElementById('titre').value = img.titre;
            document.getElementById('description').value = img.description || '';
            document.getElementById('category').value = img.category;
            document.getElementById('ordre').value = img.ordre;
            document.getElementById('actif').checked = img.actif;

            if (img.filepath) {
                document.getElementById('imagePreview').src = img.filepath;
                document.getElementById('imagePreview').style.display = 'block';
            }

            document.getElementById('imageModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading image:', error);
        showNotification('Erreur lors du chargement de l\'image', 'error');
    }
}

function closeImageModal() {
    document.getElementById('imageModal').classList.remove('active');
    currentImageId = null;
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

async function saveImage() {
    try {
        const titre = document.getElementById('titre').value;
        const description = document.getElementById('description').value;
        const category = document.getElementById('category').value;
        const ordre = document.getElementById('ordre').value;
        const actif = document.getElementById('actif').checked;

        if (!titre || !category) {
            showNotification('Titre et catégorie requis', 'error');
            return;
        }

        if (currentImageId) {
            // Update existing image
            await apiRequest(`/admin/gallery/${currentImageId}`, {
                method: 'PUT',
                body: JSON.stringify({ titre, description, category, ordre, actif })
            });

            showNotification('Image mise à jour avec succès', 'success');
        } else {
            // Upload new image
            const imageFile = document.getElementById('imageFile').files[0];
            if (!imageFile) {
                showNotification('Veuillez sélectionner une image', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('titre', titre);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('ordre', ordre);
            formData.append('actif', actif);

            const token = getAuthToken();
            const response = await fetch('http://localhost:3000/api/admin/gallery', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            showNotification('Image ajoutée avec succès', 'success');
        }

        closeImageModal();
        loadGallery();

    } catch (error) {
        console.error('Error saving image:', error);
        showNotification(error.message || 'Erreur lors de l\'enregistrement', 'error');
    }
}

async function deleteImage(id, titre) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${titre}" ?`)) {
        return;
    }

    try {
        await apiRequest(`/admin/gallery/${id}`, {
            method: 'DELETE'
        });

        showNotification('Image supprimée avec succès', 'success');
        loadGallery();

    } catch (error) {
        console.error('Error deleting image:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}

// ========================================
// BULK UPLOAD FUNCTIONS
// ========================================

let bulkFilesArray = [];

function openBulkUploadModal() {
    document.getElementById('bulkUploadModal').classList.add('active');
    bulkFilesArray = [];
    document.getElementById('bulkFiles').value = '';
    document.getElementById('bulkCategory').value = '';
    document.getElementById('bulkActif').checked = true;
    document.getElementById('bulkPreviewContainer').style.display = 'none';
    document.getElementById('uploadProgress').style.display = 'none';
}

function closeBulkUploadModal() {
    document.getElementById('bulkUploadModal').classList.remove('active');
    bulkFilesArray = [];
}

function previewBulkImages(event) {
    const files = Array.from(event.target.files);
    bulkFilesArray = files;

    if (files.length === 0) {
        document.getElementById('bulkPreviewContainer').style.display = 'none';
        return;
    }

    document.getElementById('bulkPreviewContainer').style.display = 'block';
    document.getElementById('fileCount').textContent = files.length;
    document.getElementById('uploadCount').textContent = `(${files.length})`;

    const previewGrid = document.getElementById('bulkPreviewGrid');
    previewGrid.innerHTML = '';

    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'bulk-preview-item';
            div.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button class="remove-btn" onclick="removeBulkFile(${index})" type="button">
                    <i class="fas fa-times"></i>
                </button>
            `;
            previewGrid.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

function removeBulkFile(index) {
    bulkFilesArray.splice(index, 1);

    // Update file input
    const dataTransfer = new DataTransfer();
    bulkFilesArray.forEach(file => dataTransfer.items.add(file));
    document.getElementById('bulkFiles').files = dataTransfer.files;

    // Refresh preview
    previewBulkImages({ target: { files: bulkFilesArray } });
}

async function bulkUploadImages() {
    try {
        const category = document.getElementById('bulkCategory').value;
        const actif = document.getElementById('bulkActif').checked;

        if (!category) {
            showNotification('Veuillez sélectionner une catégorie', 'error');
            return;
        }

        if (bulkFilesArray.length === 0) {
            showNotification('Veuillez sélectionner au moins une image', 'error');
            return;
        }

        // Show progress
        document.getElementById('uploadProgress').style.display = 'block';
        document.getElementById('bulkUploadBtn').disabled = true;

        const total = bulkFilesArray.length;
        let uploaded = 0;
        let failed = 0;

        for (let i = 0; i < bulkFilesArray.length; i++) {
            const file = bulkFilesArray[i];

            try {
                // Generate auto title from filename if not provided
                const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
                const autoTitle = `${category}-${Date.now()}-${i}`;

                const formData = new FormData();
                formData.append('image', file);
                formData.append('titre', autoTitle); // Auto-generated title
                formData.append('description', ''); // No description
                formData.append('category', category);
                formData.append('ordre', i); // Auto order
                formData.append('actif', actif);

                const token = getAuthToken();
                const response = await fetch('http://localhost:3000/api/admin/gallery', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    uploaded++;
                } else {
                    failed++;
                    console.error(`Failed to upload ${file.name}:`, data.message);
                }

            } catch (error) {
                failed++;
                console.error(`Error uploading ${file.name}:`, error);
            }

            // Update progress
            const progress = Math.round(((i + 1) / total) * 100);
            document.getElementById('progressBar').style.width = progress + '%';
            document.getElementById('progressBar').textContent = progress + '%';
            document.getElementById('progressText').textContent =
                `Upload en cours: ${i + 1}/${total} (${uploaded} réussis, ${failed} échoués)`;
        }

        // Show final result
        if (failed === 0) {
            showNotification(`${uploaded} images uploadées avec succès!`, 'success');
        } else {
            showNotification(`${uploaded} images uploadées, ${failed} ont échoué`, 'warning');
        }

        // Reload gallery and close modal
        await loadGallery();
        setTimeout(() => {
            closeBulkUploadModal();
        }, 1500);

    } catch (error) {
        console.error('Error in bulk upload:', error);
        showNotification('Erreur lors de l\'upload multiple', 'error');
    } finally {
        document.getElementById('bulkUploadBtn').disabled = false;
    }
}
