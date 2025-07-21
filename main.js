// Main JS for the eyeglasses showcase

// DOM Elements
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const glassesContainer = document.getElementById('glassesContainer');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLoginModal = document.getElementById('adminLoginModal');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const glassTitle = document.getElementById('glassTitle');
const glassSerialNumber = document.getElementById('glassSerialNumber');
const glassDescription = document.getElementById('glassDescription');
const orderBtn = document.getElementById('orderBtn');
const closeButtons = document.querySelectorAll('.close, .close-modal');

// Global variables
let glasses = [];
let currentGlassIndex = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Load glasses from localStorage
    loadGlasses();
    
    // Event listeners
    setupEventListeners();
    
    // Check if admin is logged in
    checkAdminLogin();
});

// Load glasses from localStorage
function loadGlasses() {
    try {
        const storedGlasses = localStorage.getItem('glasses');
        glasses = storedGlasses ? JSON.parse(storedGlasses) : [];
        displayGlasses(glasses);
    } catch (error) {
        console.error('Error loading glasses:', error);
        glassesContainer.innerHTML = '<p class="error">Gözlükler yüklenirken bir hata oluştu.</p>';
    }
}

// Display glasses in the container
function displayGlasses(glassesToShow) {
    if (glassesToShow.length === 0) {
        glassesContainer.innerHTML = '<p class="no-results">Gösterilecek gözlük bulunamadı.</p>';
        return;
    }
    
    glassesContainer.innerHTML = '';
    
    glassesToShow.forEach(glass => {
        const glassCard = document.createElement('div');
        glassCard.className = 'glass-card';
        glassCard.dataset.id = glass.id;
        
        glassCard.innerHTML = `
            <div class="glass-img-container">
                <img src="${glass.image}" alt="${glass.name}" loading="lazy">
            </div>
            <div class="glass-info">
                <h3 class="glass-title">${glass.name}</h3>
                <p class="glass-serial">${glass.serialNumber}</p>
                ${glass.price ? `<p class="glass-price">${glass.price.toLocaleString('tr-TR')} TL</p>` : ''}
            </div>
        `;
        
        glassCard.addEventListener('click', () => openLightbox(glass.id));
        glassesContainer.appendChild(glassCard);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', filterGlasses);
    
    // Sorting functionality
    sortSelect.addEventListener('change', filterGlasses);
    
    // Admin login button
    adminLoginBtn.addEventListener('click', () => {
        adminLoginModal.classList.add('active');
    });
    
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Close modal/lightbox buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.modal, .lightbox').forEach(el => {
                el.classList.remove('active');
            });
        });
    });
    
    // Lightbox navigation
    document.querySelector('.prev').addEventListener('click', () => navigateLightbox(-1));
    document.querySelector('.next').addEventListener('click', () => navigateLightbox(1));
    
    // Close lightbox/modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
        if (e.target === adminLoginModal) {
            adminLoginModal.classList.remove('active');
        }
    });
    
    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox(-1);
        } else if (e.key === 'ArrowRight') {
            navigateLightbox(1);
        }
    });
}

// Filter glasses based on search and sort
function filterGlasses() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortValue = sortSelect.value;
    
    let filtered = glasses.filter(glass => {
        const nameMatch = glass.name.toLowerCase().includes(searchTerm);
        const serialMatch = glass.serialNumber.toLowerCase().includes(searchTerm);
        const descMatch = glass.description && glass.description.toLowerCase().includes(searchTerm);
        
        return nameMatch || serialMatch || descMatch;
    });
    
    // Apply sorting
    switch (sortValue) {
        case 'priceAsc':
            filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
        case 'priceDesc':
            filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
        case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        default:
            // Default sorting, no additional action needed
            break;
    }
    
    displayGlasses(filtered);
}

// Open lightbox with glass details
function openLightbox(glassId) {
    const glass = glasses.find(g => g.id === glassId);
    if (!glass) return;
    
    // Find index of current glass
    currentGlassIndex = glasses.findIndex(g => g.id === glassId);
    
    // Populate lightbox with glass details
    lightboxImg.src = glass.image;
    glassTitle.textContent = glass.name;
    glassSerialNumber.textContent = `Seri No: ${glass.serialNumber}`;
    glassDescription.textContent = glass.description || '';
    
    // Get WhatsApp settings
    const settings = getSettings();
    const whatsappNumber = settings.whatsappNumber || '+90 542 596 95 58';
    const whatsappMessage = settings.whatsappMessage || 'Merhaba, gözlük hakkında bilgi almak istiyorum.';
    
    // Set order button href
    const message = encodeURIComponent(`${whatsappMessage} (${glass.name} - ${glass.serialNumber})`);
    orderBtn.href = `https://wa.me/${whatsappNumber.replace(/\s+/g, '')}?text=${message}`;
    
    // Show lightbox
    lightbox.classList.add('active');
}

// Navigate through glasses in lightbox
function navigateLightbox(direction) {
    currentGlassIndex += direction;
    
    // Wrap around if reached the end
    if (currentGlassIndex < 0) currentGlassIndex = glasses.length - 1;
    if (currentGlassIndex >= glasses.length) currentGlassIndex = 0;
    
    openLightbox(glasses[currentGlassIndex].id);
}

// Handle admin login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Get admin credentials from settings or use default
    const settings = getSettings();
    const adminUsername = settings.username || 'kerem';
    const adminPassword = settings.password || '090909';
    
    if (username === adminUsername && password === adminPassword) {
        // Set admin session
        sessionStorage.setItem('adminLoggedIn', 'true');
        
        // Redirect to admin panel
        window.location.href = 'admin.html';
    } else {
        // Show error message
        loginError.textContent = 'Geçersiz kullanıcı adı veya şifre!';
        loginError.style.display = 'block';
    }
}

// Check if admin is logged in and redirect if necessary
function checkAdminLogin() {
    const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    const isAdminPage = window.location.pathname.includes('admin.html');
    
    if (isAdminPage && !isAdminLoggedIn) {
        // Redirect to home page if not logged in
        window.location.href = 'index.html';
    }
}

// Get settings from localStorage
function getSettings() {
    try {
        const storedSettings = localStorage.getItem('settings');
        return storedSettings ? JSON.parse(storedSettings) : {};
    } catch (error) {
        console.error('Error loading settings:', error);
        return {};
    }
}