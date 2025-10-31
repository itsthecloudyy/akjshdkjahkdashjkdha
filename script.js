// Loading screen management
class LoadingScreen {
    constructor() {
        this.loadingBar = document.getElementById('loadingBar');
        this.loadingText = document.getElementById('loadingText');
        this.loadingStatus = document.getElementById('loadingStatus');
        this.progress = 0;
        this.steps = [
            { text: 'Initializing platform...', duration: 800 },
            { text: 'Loading core modules...', duration: 600 },
            { text: 'Setting up video player...', duration: 700 },
            { text: 'Preparing user interface...', duration: 500 },
            { text: 'Almost ready...', duration: 400 }
        ];
    }

    start() {
        return new Promise((resolve) => {
            this.animateLoading(resolve);
        });
    }

    animateLoading(resolve) {
        let currentStep = 0;
        const totalSteps = this.steps.length;
        const stepProgress = 100 / totalSteps;

        const executeStep = () => {
            if (currentStep < totalSteps) {
                const step = this.steps[currentStep];
                this.loadingText.textContent = step.text;
                
                const targetProgress = (currentStep + 1) * stepProgress;
                this.animateProgressBar(this.progress, targetProgress, step.duration, () => {
                    currentStep++;
                    executeStep();
                });
            } else {
                this.animateProgressBar(this.progress, 100, 500, () => {
                    setTimeout(() => {
                        this.hide();
                        resolve();
                    }, 500);
                });
            }
        };

        executeStep();
    }

    animateProgressBar(from, to, duration, callback) {
        const startTime = performance.now();
        
        const updateProgress = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            this.progress = from + (to - from) * progress;
            this.loadingBar.style.width = this.progress + '%';
            
            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            } else {
                callback();
            }
        };
        
        requestAnimationFrame(updateProgress);
    }

    hide() {
        const intro = document.getElementById('introScreen');
        intro.classList.add('hidden');
        
        const mainContent = document.querySelector('.main-content');
        mainContent.style.opacity = '1';
        mainContent.style.display = 'block';
        mainContent.style.visibility = 'visible';
    }
}

// Global variables
let videoPlayer = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded - initializing app');
    
    const loadingScreen = new LoadingScreen();
    await loadingScreen.start();
    initializeApp();
});

function initializeApp() {
    console.log('Initializing application');
    
    const mainContent = document.querySelector('.main-content');
    mainContent.style.opacity = '1';
    mainContent.style.display = 'block';
    mainContent.style.visibility = 'visible';
    
    initNavigation();
    initMobileMenu();
    
    setTimeout(() => {
        if (typeof initNetworkBackground === 'function') {
            initNetworkBackground();
        }
    }, 100);
    
    console.log('Application initialized successfully');
}

// Mobile menu functionality
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (toggle && navMenu) {
        toggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            toggle.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                toggle.classList.remove('active');
            });
        });
    }
}

// Navigation system
function initNavigation() {
    console.log('Initializing navigation');
    
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    
    const homePage = document.getElementById('homePage');
    homePage.style.display = 'block';
    homePage.classList.add('active');
    homePage.style.visibility = 'visible';
    
    function switchPage(targetPage) {
        console.log('Switching to page:', targetPage);
        
        pageContents.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
            page.style.visibility = 'hidden';
        });
        
        const targetPageElement = document.getElementById(targetPage + 'Page');
        if (targetPageElement) {
            targetPageElement.style.display = 'block';
            targetPageElement.classList.add('active');
            targetPageElement.style.visibility = 'visible';
            
            if (targetPage === 'video') {
                setTimeout(() => {
                    loadGoogleDrivePlayer();
                }, 100);
            }
        }
        
        navLinks.forEach(nav => nav.classList.remove('active'));
        const activeLink = document.querySelector(`[data-page="${targetPage}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            switchPage(targetPage);
        });
    });
    
    document.querySelectorAll('.btn[data-page]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            switchPage(targetPage);
        });
    });
    
    console.log('Navigation initialized');
}

// GOOGLE DRIVE PLAYER with their interface
function loadGoogleDrivePlayer() {
    console.log('Loading Google Drive player with their interface');
    const videoWrapper = document.querySelector('#videoPage .video-wrapper');
    if (!videoWrapper) {
        console.error('Video wrapper not found');
        return;
    }
    
    videoWrapper.innerHTML = '';
    videoWrapper.style.position = 'relative';
    videoWrapper.style.width = '100%';
    videoWrapper.style.height = '100%';
    videoWrapper.style.minHeight = '500px';
    videoWrapper.style.background = '#000';
    
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container-drive';
    videoContainer.style.position = 'absolute';
    videoContainer.style.top = '0';
    videoContainer.style.left = '0';
    videoContainer.style.width = '100%';
    videoContainer.style.height = '100%';
    videoContainer.style.background = '#000';
    videoContainer.id = 'videoContainer';
    
    // Loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'video-loading';
    loadingDiv.style.position = 'absolute';
    loadingDiv.style.top = '0';
    loadingDiv.style.left = '0';
    loadingDiv.style.width = '100%';
    loadingDiv.style.height = '100%';
    loadingDiv.style.display = 'flex';
    loadingDiv.style.flexDirection = 'column';
    loadingDiv.style.alignItems = 'center';
    loadingDiv.style.justifyContent = 'center';
    loadingDiv.style.background = '#000';
    loadingDiv.style.color = '#00ff88';
    loadingDiv.style.zIndex = '10';
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading Google Drive player...</p>
        <small>Using Google Drive's native interface</small>
    `;
    
    videoContainer.appendChild(loadingDiv);
    
    // Google Drive iframe with THEIR interface
    const iframe = document.createElement('iframe');
    iframe.className = 'drive-iframe';
    iframe.id = 'drivePlayer';
    iframe.src = 'https://drive.google.com/file/d/1yrROYsYQ4kWG4HFCVwXjwHtnQwAmmK5l/preview';
    iframe.allow = 'autoplay; encrypted-media; fullscreen';
    iframe.allowFullscreen = true;
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.title = 'Dead Poets Society - Google Drive';
    iframe.sandbox = "allow-scripts allow-same-origin allow-popups allow-forms";
    iframe.referrerPolicy = 'no-referrer';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = '#000';
    iframe.style.zIndex = '1';
    iframe.style.display = 'block';
    iframe.style.visibility = 'visible';
    
    // Append iframe
    videoContainer.appendChild(iframe);
    videoWrapper.appendChild(videoContainer);
    
    // Store video player reference
    videoPlayer = iframe;
    
    console.log('Google Drive player created with native interface');
    
    // Remove loading when iframe loads
    iframe.addEventListener('load', () => {
        console.log('Google Drive player loaded successfully');
        loadingDiv.style.display = 'none';
    });
    
    iframe.addEventListener('error', (e) => {
        console.error('Google Drive player failed to load:', e);
        loadingDiv.innerHTML = `
            <div class="video-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Google Drive Player Failed to Load</h3>
                <p>Please try refreshing the page or check your internet connection.</p>
                <button onclick="loadGoogleDrivePlayer()" class="retry-btn">Retry</button>
            </div>
        `;
    });
    
    // Remove loading after timeout
    setTimeout(() => {
        if (loadingDiv.parentNode && loadingDiv.style.display !== 'none') {
            loadingDiv.style.display = 'none';
        }
    }, 5000);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// Export functions for global access
window.loadGoogleDrivePlayer = loadGoogleDrivePlayer;
