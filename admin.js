// Admin JS for the eyeglasses showcase

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const addGlassForm = document.getElementById('addGlassForm');
const editGlassForm = document.getElementById('editGlassForm');
const settingsForm = document.getElementById('settingsForm');
const glassesTableBody = document.getElementById('glassesTableBody');
const adminSearchInput = document.getElementById('adminSearchInput');
const glassImage = document.getElementById('glassImage');
const imagePreview = document.getElementById('imagePreview');
const editGlassImage = document.getElementById('editGlassImage');
const editImagePreview = document.getElementById('editImagePreview');
const editGlassModal = document.getElementById('editGlassModal');
const confirmDeleteModal = document.getElementById('confirmDeleteModal');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const closeModalButtons = document.querySelectorAll('.close-modal');

// Global variables
let glasses = [];
let glassToDelete = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    // Check if admin is logged in
    checkAdminLogin();
    
    // Load glasses from localStorage
    loadGlasses();
    
    // Load settings
    loadSettings();
    
    // Setup event listeners
    setupEventListeners();
});

// Check if admin is logged in
function checkAdminLogin() {
    const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    
    if (!isAdminLoggedIn) {
        // Redirect to home page if not logged in
        window.location.href = 'index.html';
    }
}

// Load glasses from localStorage
function loadGlasses() {
    try {
        const storedGlasses = localStorage.getItem('glasses');
        glasses = storedGlasses ? JSON.parse(storedGlasses) : [];
        displayGlassesTable();
    } catch (error) {
        console.error('Error loading glasses:', error);
    }
}

// Load settings from localStorage
function loadSettings() {
    try {
        const storedSettings = localStorage.getItem('settings') || '{}';
        const settings = JSON.parse(storedSettings);
        
        document.getElementById('whatsappNumber').value = settings.whatsappNumber || '+90 542 596 95 58';
        document.getElementById('whatsappMessage').value = settings.whatsappMessage || 'Merhaba, gözlük hakkında bilgi almak istiyorum.';
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });
    
    // Add glass form submission
    addGlassForm.addEventListener('submit', handleAddGlass);
    
    // Edit glass form submission
    editGlassForm.addEventListener('submit', handleEditGlass);
    
    // Settings form submission
    settingsForm.addEventListener('submit', handleSaveSettings);
    
    // Search functionality
    adminSearchInput.addEventListener('input', filterGlassesTable);
    
    // Image preview for add form
    glassImage.addEventListener('change', (e) => {
        previewImage(e.target, imagePreview);
    });
    
    // Image preview for edit form
    editGlassImage.addEventListener('change', (e) => {
        previewImage(e.target, editImagePreview);
    });
    
    // Close modal buttons
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // Delete confirmation
    confirmDeleteBtn.addEventListener('click', () => {
        if (glassToDelete) {
            deleteGlass(glassToDelete);
            confirmDeleteModal.classList.remove('active');
            glassToDelete = null;
        }
    });
    
    // Cancel delete
    cancelDeleteBtn.addEventListener('click', () => {
        confirmDeleteModal.classList.remove('active');
        glassToDelete = null;
    });
}

// Handle logout
function handleLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
}

// Display glasses in table
function displayGlassesTable() {
    glassesTableBody.innerHTML = '';
    
    glasses.forEach(glass => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><img src="${glass.image}" alt="${glass.name}"></td>
            <td>${glass.name}</td>
            <td>${glass.serialNumber}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" data-id="${glass.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-id="${glass.id}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        glassesTableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => openEditModal(button.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => showDeleteConfirmation(button.dataset.id));
    });
}

// Filter glasses table based on search
function filterGlassesTable() {
    const searchTerm = adminSearchInput.value.toLowerCase();
    
    const rows = glassesTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const serial = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || serial.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Handle adding a new glass
async function handleAddGlass(e) {
    e.preventDefault();
    
    const name = document.getElementById('glassName').value;
    const serialNumber = document.getElementById('glassSerial').value;
    const description = document.getElementById('glassDesc').value;
    const price = parseFloat(document.getElementById('glassPrice').value) || null;
    const imageFile = document.getElementById('glassImage').files[0];
    
    if (!imageFile) {
        alert('Lütfen bir görsel seçin!');
        return;
    }
    
    try {
        // Convert image to data URL
        const imageDataUrl = await readFileAsDataURL(imageFile);
        
        // Create new glass object
        const newGlass = {
            id: generateUniqueId(),
            name,
            serialNumber,
            description,
            price,
            image: imageDataUrl,
            createdAt: new Date().toISOString()
        };
        
        // Add to glasses array
        glasses.push(newGlass);
        
        // Save to localStorage
        localStorage.setItem('glasses', JSON.stringify(glasses));
        
        // Update table
        displayGlassesTable();
        
        // Reset form
        addGlassForm.reset();
        imagePreview.style.display = 'none';
        
        alert('Gözlük başarıyla eklendi!');
        
    } catch (error) {
        console.error('Error adding glass:', error);
        alert('Gözlük eklenirken bir hata oluştu!');
    }
}

// Open edit modal for a glass
function openEditModal(glassId) {
    const glass = glasses.find(g => g.id === glassId);
    if (!glass) return;
    
    // Populate form
    document.getElementById('editGlassId').value = glass.id;
    document.getElementById('editGlassName').value = glass.name;
    document.getElementById('editGlassSerial').value = glass.serialNumber;
    document.getElementById('editGlassDesc').value = glass.description || '';
    document.getElementById('editGlassPrice').value = glass.price || '';
    
    // Show current image
    editImagePreview.src = glass.image;
    editImagePreview.style.display = 'block';
    
    // Show modal
    editGlassModal.classList.add('active');
}

// Handle editing a glass
async function handleEditGlass(e) {
    e.preventDefault();
    
    const id = document.getElementById('editGlassId').value;
    const name = document.getElementById('editGlassName').value;
    const serialNumber = document.getElementById('editGlassSerial').value;
    const description = document.getElementById('editGlassDesc').value;
    const price = parseFloat(document.getElementById('editGlassPrice').value) || null;
    const imageFile = document.getElementById('editGlassImage').files[0];
    
    try {
        // Find glass in array
        const glassIndex = glasses.findIndex(g => g.id === id);
        if (glassIndex === -1) {
            alert('Gözlük bulunamadı!');
            return;
        }
        
        // Get current glass
        const currentGlass = glasses[glassIndex];
        
        // Handle image
        let imageDataUrl = currentGlass.image;
        if (imageFile) {
            imageDataUrl = await readFileAsDataURL(imageFile);
        }
        
        // Update glass object
        glasses[glassIndex] = {
            ...currentGlass,
            name,
            serialNumber,
            description,
            price,
            image: imageDataUrl,
            updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('glasses', JSON.stringify(glasses));
        
        // Update table
        displayGlassesTable();
        
        // Close modal
        editGlassModal.classList.remove('active');
        
        alert('Gözlük başarıyla güncellendi!');
        
    } catch (error) {
        console.error('Error updating glass:', error);
        alert('Gözlük güncellenirken bir hata oluştu!');
    }
}

// Show delete confirmation modal
function showDeleteConfirmation(glassId) {
    glassToDelete = glassId;
    confirmDeleteModal.classList.add('active');
}

// Delete a glass
function deleteGlass(glassId) {
    try {
        // Remove glass from array
        glasses = glasses.filter(g => g.id !== glassId);
        
        // Save to localStorage
        localStorage.setItem('glasses', JSON.stringify(glasses));
        
        // Update table
        displayGlassesTable();
        
        alert('Gözlük başarıyla silindi!');
        
    } catch (error) {
        console.error('Error deleting glass:', error);
        alert('Gözlük silinirken bir hata oluştu!');
    }
}

// Handle saving settings
function handleSaveSettings(e) {
    e.preventDefault();
    
    const whatsappNumber = document.getElementById('whatsappNumber').value;
    const whatsappMessage = document.getElementById('whatsappMessage').value;
    const newUsername = document.getElementById('changeUsername').value;
    const newPassword = document.getElementById('changePassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    try {
        // Get current settings
        const storedSettings = localStorage.getItem('settings') || '{}';
        const settings = JSON.parse(storedSettings);
        
        // Update WhatsApp settings
        settings.whatsappNumber = whatsappNumber;
        settings.whatsappMessage = whatsappMessage;
        
        // Update admin credentials if provided
        if (newUsername) {
            settings.username = newUsername;
        }
        
        if (newPassword) {
            // Validate password confirmation
            if (newPassword !== confirmPassword) {
                alert('Şifreler eşleşmiyor!');
                return;
            }
            
            settings.password = newPassword;
        }
        
        // Save to localStorage
        localStorage.setItem('settings', JSON.stringify(settings));
        
        // Reset password fields
        document.getElementById('changeUsername').value = '';
        document.getElementById('changePassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        alert('Ayarlar başarıyla kaydedildi!');
        
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Ayarlar kaydedilirken bir hata oluştu!');
    }
}

// Preview image before upload
function previewImage(input, previewElement) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function (e) {
            previewElement.src = e.target.result;
            previewElement.style.display = 'block';
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Read file as data URL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        
        reader.readAsDataURL(file);
    });
}

// Generate unique ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}