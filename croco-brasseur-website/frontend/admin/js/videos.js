// Videos Management
let currentVideoId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadVideos();
});

function loadUserInfo() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('userName').textContent = user.nom_complet || user.username;
        document.getElementById('userRole').textContent =
            user.role === 'super_admin' ? 'Super Administrateur' : 'Administrateur';
    }
}

async function loadVideos() {
    const category = document.getElementById('filterCategory').value;
    const video_type = document.getElementById('filterType').value;
    const actif = document.getElementById('filterActif').value;

    try {
        let url = '/admin/videos';
        const params = [];
        if (category) params.push(`category=${category}`);
        if (video_type) params.push(`video_type=${video_type}`);
        if (actif) params.push(`actif=${actif}`);
        if (params.length > 0) url += '?' + params.join('&');

        const data = await apiRequest(url);

        if (data.success) {
            displayVideos(data.data);
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        showNotification('Erreur lors du chargement des vidéos', 'error');
    }
}

function displayVideos(videos) {
    const grid = document.getElementById('videosGrid');

    if (videos.length === 0) {
        grid.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">Aucune vidéo trouvée</p>';
        return;
    }

    grid.innerHTML = videos.map(video => {
        const videoPreview = getVideoPreview(video);
        return `
            <div class="gallery-item">
                ${videoPreview}
                <div class="gallery-item-actions">
                    <button class="btn btn-sm btn-primary" onclick="editVideo(${video.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteVideo(${video.id}, '${video.titre}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="gallery-item-info">
                    <h4>${video.titre}</h4>
                    <p>
                        <span class="badge badge-${video.video_type === 'upload' ? 'success' : 'info'}">${video.video_type}</span>
                        ${video.category} • ${video.actif ? 'Actif' : 'Inactif'}
                    </p>
                </div>
            </div>
        `;
    }).join('');
}

function getVideoPreview(video) {
    if (video.video_type === 'youtube') {
        const videoId = extractYouTubeId(video.video_url);
        return `<img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${video.titre}" style="width: 100%; height: 200px; object-fit: cover;">`;
    } else if (video.video_type === 'vimeo') {
        return `<div style="width: 100%; height: 200px; background: #1ab7ea; color: white; display: flex; align-items: center; justify-content: center;">
            <i class="fab fa-vimeo" style="font-size: 3rem;"></i>
        </div>`;
    } else {
        return `<video src="${video.filepath}" style="width: 100%; height: 200px; object-fit: cover;" muted></video>`;
    }
}

function extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
}

function toggleVideoInput() {
    const videoType = document.getElementById('videoType').value;
    const fileGroup = document.getElementById('fileInputGroup');
    const urlGroup = document.getElementById('urlInputGroup');

    if (videoType === 'upload') {
        fileGroup.style.display = 'block';
        urlGroup.style.display = 'none';
        document.getElementById('videoUrl').removeAttribute('required');
    } else if (videoType === 'youtube' || videoType === 'vimeo') {
        fileGroup.style.display = 'none';
        urlGroup.style.display = 'block';
        document.getElementById('videoUrl').setAttribute('required', 'required');
    } else {
        fileGroup.style.display = 'none';
        urlGroup.style.display = 'none';
    }
}

function openAddVideoModal() {
    currentVideoId = null;
    document.getElementById('modalTitle').textContent = 'Ajouter une Vidéo';
    document.getElementById('videoForm').reset();
    document.getElementById('actif').checked = true;
    document.getElementById('fileInputGroup').style.display = 'none';
    document.getElementById('urlInputGroup').style.display = 'none';
    document.getElementById('videoModal').classList.add('active');
}

async function editVideo(id) {
    try {
        const data = await apiRequest(`/admin/videos/${id}`);

        if (data.success) {
            const video = data.data;
            currentVideoId = id;
            document.getElementById('modalTitle').textContent = 'Modifier la Vidéo';
            document.getElementById('titre').value = video.titre;
            document.getElementById('description').value = video.description || '';
            document.getElementById('category').value = video.category;
            document.getElementById('videoType').value = video.video_type;
            document.getElementById('ordre').value = video.ordre;
            document.getElementById('actif').checked = video.actif;

            toggleVideoInput();

            if (video.video_type !== 'upload' && video.video_url) {
                document.getElementById('videoUrl').value = video.video_url;
            }

            document.getElementById('videoModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading video:', error);
        showNotification('Erreur lors du chargement de la vidéo', 'error');
    }
}

function closeVideoModal() {
    document.getElementById('videoModal').classList.remove('active');
    currentVideoId = null;
}

async function saveVideo() {
    try {
        const titre = document.getElementById('titre').value;
        const description = document.getElementById('description').value;
        const category = document.getElementById('category').value;
        const videoType = document.getElementById('videoType').value;
        const ordre = document.getElementById('ordre').value;
        const actif = document.getElementById('actif').checked;

        if (!titre || !category || !videoType) {
            showNotification('Titre, catégorie et type requis', 'error');
            return;
        }

        if (currentVideoId) {
            // Update existing video
            const videoUrl = document.getElementById('videoUrl').value;

            await apiRequest(`/admin/videos/${currentVideoId}`, {
                method: 'PUT',
                body: JSON.stringify({ titre, description, category, video_url: videoUrl, ordre, actif })
            });

            showNotification('Vidéo mise à jour avec succès', 'success');
        } else {
            // Add new video
            const formData = new FormData();
            formData.append('titre', titre);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('video_type', videoType);
            formData.append('ordre', ordre);
            formData.append('actif', actif);

            if (videoType === 'upload') {
                const videoFile = document.getElementById('videoFile').files[0];
                if (!videoFile) {
                    showNotification('Veuillez sélectionner un fichier vidéo', 'error');
                    return;
                }
                formData.append('video', videoFile);
            } else {
                const videoUrl = document.getElementById('videoUrl').value;
                if (!videoUrl) {
                    showNotification('Veuillez entrer l\'URL de la vidéo', 'error');
                    return;
                }
                formData.append('video_url', videoUrl);
            }

            const token = getAuthToken();
            const response = await fetch('http://localhost:3000/api/admin/videos', {
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

            showNotification('Vidéo ajoutée avec succès', 'success');
        }

        closeVideoModal();
        loadVideos();

    } catch (error) {
        console.error('Error saving video:', error);
        showNotification(error.message || 'Erreur lors de l\'enregistrement', 'error');
    }
}

async function deleteVideo(id, titre) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${titre}" ?`)) {
        return;
    }

    try {
        await apiRequest(`/admin/videos/${id}`, {
            method: 'DELETE'
        });

        showNotification('Vidéo supprimée avec succès', 'success');
        loadVideos();

    } catch (error) {
        console.error('Error deleting video:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}
