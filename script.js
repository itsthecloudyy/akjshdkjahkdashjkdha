// Device detection and mobile blocking
class DeviceManager {
    constructor() {
        this.isMobile = this.checkMobileDevice();
        this.mobileBlock = document.getElementById('mobileBlock');
    }

    checkMobileDevice() {
        // Check screen width
        const isSmallScreen = window.innerWidth <= 768;
        
        // Check user agent
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
        
        // Check touch support
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Check device orientation
        const isPortrait = window.innerHeight > window.innerWidth;
        
        return isSmallScreen || isMobileUserAgent || isTouchDevice;
    }

    blockMobileAccess() {
        if (this.isMobile && this.mobileBlock) {
            console.log('Mobile device detected. Blocking access.');
            this.mobileBlock.classList.add('active');
            
            // Hide all main content
            const mainContent = document.getElementById('mainContent');
            const header = document.getElementById('mainHeader');
            const footer = document.getElementById('mainFooter');
            
            if (mainContent) mainContent.style.display = 'none';
            if (header) header.style.display = 'none';
            if (footer) footer.style.display = 'none';
            
            // Prevent any further initialization
            return true;
        }
        return false;
    }

    getDeviceInfo() {
        return {
            isMobile: this.isMobile,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            userAgent: navigator.userAgent,
            touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
        };
    }
}

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
        if (intro) {
            intro.classList.add('hidden');
        }
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.opacity = '1';
            mainContent.style.display = 'block';
            mainContent.style.visibility = 'visible';
        }
    }
}

// Global variables
let videoPlayer = null;
let isVideoPlayerLoaded = false;
let currentPage = 'home';
let deviceManager = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded - initializing app');
    
    // Initialize device manager first
    deviceManager = new DeviceManager();
    
    // Check if mobile and block access
    if (deviceManager.blockMobileAccess()) {
        console.log('Access blocked for mobile device');
        console.log('Device info:', deviceManager.getDeviceInfo());
        return; // Stop initialization for mobile devices
    }
    
    try {
        const loadingScreen = new LoadingScreen();
        await loadingScreen.start();
        initializeApp();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        // Fallback: hide loading screen and show main content
        const intro = document.getElementById('introScreen');
        if (intro) intro.classList.add('hidden');
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.opacity = '1';
            mainContent.style.display = 'block';
            mainContent.style.visibility = 'visible';
        }
    }
});

function initializeApp() {
    console.log('Initializing application for desktop device');
    console.log('Device info:', deviceManager ? deviceManager.getDeviceInfo() : 'No device info');
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.opacity = '1';
        mainContent.style.display = 'block';
        mainContent.style.visibility = 'visible';
    }
    
    initNavigation();
    initMobileMenu();
    
    // Initialize network background with delay for better performance
    setTimeout(() => {
        if (typeof initNetworkBackground === 'function') {
            try {
                initNetworkBackground();
            } catch (error) {
                console.error('Failed to initialize network background:', error);
            }
        }
    }, 300);
    
    console.log('Application initialized successfully');
}

// Mobile menu functionality (for desktop with small windows)
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (toggle && navMenu) {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
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
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !toggle.contains(e.target)) {
                navMenu.classList.remove('active');
                toggle.classList.remove('active');
            }
        });
    }
}

// Navigation system
function initNavigation() {
    console.log('Initializing navigation');
    
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    
    const homePage = document.getElementById('homePage');
    if (homePage) {
        homePage.style.display = 'block';
        homePage.classList.add('active');
        homePage.style.visibility = 'visible';
    }
    
    function switchPage(targetPage) {
        console.log('Switching to page:', targetPage);
        
        // Don't switch if already on the same page
        if (currentPage === targetPage) {
            return;
        }
        
        currentPage = targetPage;
        
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
            
            if (targetPage === 'video' && !isVideoPlayerLoaded) {
                setTimeout(() => {
                    loadGoogleDrivePlayer();
                }, 300);
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

// GOOGLE DRIVE PLAYER with their interface - FIXED VERSION
function loadGoogleDrivePlayer() {
    console.log('Loading Google Drive player with their interface');
    
    // Prevent multiple loading
    if (isVideoPlayerLoaded) {
        console.log('Video player already loaded, skipping...');
        return;
    }
    
    const videoWrapper = document.getElementById('videoWrapper');
    if (!videoWrapper) {
        console.error('Video wrapper not found');
        return;
    }
    
    // Clear existing content but only if not already loaded
    if (!videoWrapper.querySelector('.drive-iframe')) {
        videoWrapper.innerHTML = '';
    } else {
        console.log('Video player iframe already exists');
        return;
    }
    
    videoWrapper.style.position = 'relative';
    videoWrapper.style.width = '100%';
    videoWrapper.style.height = '100%';
    videoWrapper.style.minHeight = '500px';
    videoWrapper.style.background = '#000';
    
    // Create container
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
        <p style="margin: 1rem 0;">Loading Google Drive player...</p>
        <small style="color: #aaa;">Using Google Drive's native interface</small>
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
        isVideoPlayerLoaded = true;
    });
    
    iframe.addEventListener('error', (e) => {
        console.error('Google Drive player failed to load:', e);
        loadingDiv.innerHTML = `
            <div class="video-error" style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3 style="color: #ff4444; margin-bottom: 1rem;">Google Drive Player Failed to Load</h3>
                <p style="color: #ccc; margin-bottom: 1.5rem;">Please try refreshing the page or check your internet connection.</p>
                <button onclick="retryVideoLoad()" class="retry-btn" style="background: #ff4444; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Retry</button>
            </div>
        `;
        isVideoPlayerLoaded = false;
    });
    
    // Remove loading after timeout as fallback
    setTimeout(() => {
        if (loadingDiv.parentNode && loadingDiv.style.display !== 'none') {
            loadingDiv.style.display = 'none';
        }
    }, 8000);
}

// Retry function for video loading
function retryVideoLoad() {
    console.log('Retrying video load...');
    isVideoPlayerLoaded = false;
    loadGoogleDrivePlayer();
}

// Cleanup function to reset video player when needed
function cleanupVideoPlayer() {
    if (videoPlayer) {
        const iframe = document.getElementById('drivePlayer');
        if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }
        videoPlayer = null;
        isVideoPlayerLoaded = false;
    }
}

// Handle window resize for device type changes
function handleResize() {
    if (deviceManager) {
        const wasMobile = deviceManager.isMobile;
        deviceManager.isMobile = deviceManager.checkMobileDevice();
        
        if (!wasMobile && deviceManager.isMobile) {
            // Became mobile - block access
            deviceManager.blockMobileAccess();
        } else if (wasMobile && !deviceManager.isMobile) {
            // Became desktop - allow access
            location.reload();
        }
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

window.addEventListener('resize', handleResize);

// Export functions for global access
window.loadGoogleDrivePlayer = loadGoogleDrivePlayer;
window.retryVideoLoad = retryVideoLoad;
window.cleanupVideoPlayer = cleanupVideoPlayer;
window.initMobileMenu = initMobileMenu;
