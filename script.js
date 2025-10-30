// Device detection
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && window.innerHeight <= 1024);
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
            { text: 'Setting up video players...', duration: 700 },
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
                
                // Animate progress bar
                const targetProgress = (currentStep + 1) * stepProgress;
                this.animateProgressBar(this.progress, targetProgress, step.duration, () => {
                    currentStep++;
                    executeStep();
                });
            } else {
                // Complete loading
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
        
        // Show main content
        document.querySelector('.main-content').style.opacity = '1';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    // Check if mobile device
    if (isMobileDevice()) {
        const mobileWarning = document.getElementById('mobileWarning');
        mobileWarning.style.display = 'flex';
        
        // Proceed anyway button
        document.getElementById('proceedAnyway').addEventListener('click', function() {
            mobileWarning.style.display = 'none';
            initializeApp();
        });
    } else {
        // Start loading screen
        const loadingScreen = new LoadingScreen();
        await loadingScreen.start();
        initializeApp();
    }
});

function initializeApp() {
    // Initialize navigation
    initNavigation();
    
    // Initialize documentation system
    initDocumentation();
    
    // Initialize network background
    setTimeout(() => {
        if (typeof initNetworkBackground === 'function') {
            initNetworkBackground();
        }
    }, 100);
}

// Multi-Player Selector with Lazy Loading
class MultiPlayerSelector {
    constructor() {
        this.playerOptions = document.querySelectorAll('.player-option');
        this.playerStatus = document.querySelector('.player-status');
        this.mixdropWarning = document.getElementById('mixdropWarning');
        this.currentPlayer = 'doodstream';
        this.loadedPlayers = new Set(['doodstream']);
        
        this.init();
    }
    
    init() {
        // Set initial active player
        this.setActivePlayer('doodstream');
        
        // Add event listeners to player options
        this.playerOptions.forEach(option => {
            option.addEventListener('click', () => {
                const player = option.dataset.player;
                this.setActivePlayer(player);
            });
        });
    }
    
    setActivePlayer(playerId) {
        console.log('Switching to player:', playerId);
        
        // Stop current player first
        this.stopCurrentPlayer();
        
        // Update current player
        this.currentPlayer = playerId;
        
        // Update player options
        this.playerOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.player === playerId);
        });
        
        // Hide all video containers first
        document.querySelectorAll('.video-container').forEach(container => {
            container.classList.remove('active');
            container.style.display = 'none';
        });
        
        // Show active video container
        const activeContainer = document.getElementById(playerId + 'Container');
        if (activeContainer) {
            activeContainer.classList.add('active');
            activeContainer.style.display = 'block';
            
            // Lazy load the player if not already loaded
            if (!this.loadedPlayers.has(playerId)) {
                this.lazyLoadPlayer(playerId);
                this.loadedPlayers.add(playerId);
            } else {
                // If already loaded, just ensure the iframe is visible
                this.ensurePlayerVisible(playerId);
            }
        }
        
        // Show/hide MixDrop warning
        if (playerId === 'mixdrop') {
            this.mixdropWarning.style.display = 'flex';
        } else {
            this.mixdropWarning.style.display = 'none';
        }
        
        // Update status message
        this.updatePlayerStatus(playerId);
    }
    
    lazyLoadPlayer(playerId) {
        const container = document.getElementById(playerId + 'Container');
        if (!container) return;
        
        const videoWrapper = container.querySelector('.video-wrapper');
        
        // Clear existing content
        videoWrapper.innerHTML = '';
        
        // Create and append the iframe only when needed
        const iframe = document.createElement('iframe');
        iframe.className = 'video-frame';
        iframe.allow = 'autoplay; encrypted-media; fullscreen';
        iframe.allowFullscreen = true;
        iframe.frameBorder = '0';
        iframe.scrolling = 'no';
        iframe.sandbox = "allow-scripts allow-same-origin allow-presentation allow-popups allow-forms";
        
        let playerUrl = '';
        let playerTitle = '';
        
        switch(playerId) {
            case 'doodstream':
                playerUrl = 'https://doodstream.com/e/t2gc0n61c3iv';
                playerTitle = 'Dead Poets Society - DoodStream';
                break;
            case 'filemoon':
                playerUrl = 'https://filemoon.sx/e/ra1uugjc5f0v';
                playerTitle = 'Dead Poets Society - FileMoon';
                break;
            case 'mixdrop':
                playerUrl = 'https://mxdrop.to/e/vkqqjd1qs0433p';
                playerTitle = 'Dead Poets Society - MixDrop';
                break;
        }
        
        iframe.src = playerUrl;
        iframe.title = playerTitle;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.style.border = 'none';
        iframe.style.display = 'block';
        
        videoWrapper.appendChild(iframe);
        
        console.log('Loading player:', playerId, playerUrl);
        
        // Add loading indicator
        this.addLoadingIndicator(videoWrapper, playerId);
    }
    
    ensurePlayerVisible(playerId) {
        const container = document.getElementById(playerId + 'Container');
        if (!container) return;
        
        const iframe = container.querySelector('iframe');
        if (iframe) {
            iframe.style.display = 'block';
        }
    }
    
    addLoadingIndicator(wrapper, playerId) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'video-loading';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading ${playerId} player...</p>
            <small>If the player doesn't load, try the direct links below</small>
        `;
        wrapper.appendChild(loadingDiv);
        
        // Remove loading indicator when iframe loads
        const iframe = wrapper.querySelector('iframe');
        iframe.addEventListener('load', () => {
            console.log('Player loaded:', playerId);
            loadingDiv.remove();
        });
        
        iframe.addEventListener('error', (e) => {
            console.error('Error loading player:', playerId, e);
            loadingDiv.innerHTML = `
                <div class="video-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Player Failed to Load</h3>
                    <p>The ${playerId} player could not be loaded. Please try another player or use the direct links below.</p>
                    <button class="retry-btn" onclick="window.multiPlayer.retryPlayer('${playerId}')">Retry</button>
                </div>
            `;
        });
        
        // Remove loading indicator after timeout (fallback)
        setTimeout(() => {
            if (loadingDiv.parentNode) {
                loadingDiv.remove();
            }
        }, 10000);
    }
    
    retryPlayer(playerId) {
        console.log('Retrying player:', playerId);
        this.loadedPlayers.delete(playerId);
        this.setActivePlayer(playerId);
    }
    
    stopCurrentPlayer() {
        const currentFrame = document.querySelector(`#${this.currentPlayer}Container iframe`);
        if (currentFrame) {
            // For iframes, we can't actually stop video playback due to cross-origin restrictions
            // But we can hide it and show a message
            currentFrame.style.display = 'none';
        }
    }
    
    updatePlayerStatus(playerId) {
        const statusMessages = {
            'doodstream': 'DoodStream - Fast streaming with Turkish subtitles',
            'filemoon': 'FileMoon - Modern player with Turkish subtitles',
            'mixdrop': 'MixDrop - Clean interface (manual subtitle upload required)'
        };
        
        if (this.playerStatus) {
            this.playerStatus.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <span>Current: ${statusMessages[playerId]}</span>
            `;
        }
    }
}

// Global reference for retry functionality
window.multiPlayer = null;

// Navigation system with page management
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    let currentPage = 'home';
    
    // Function to stop all videos when leaving backup page
    function stopAllVideos() {
        if (window.multiPlayer) {
            window.multiPlayer.stopCurrentPlayer();
        }
        
        // Also stop the main video on video page
        const mainVideo = document.querySelector('#videoPage .video-frame');
        if (mainVideo) {
            mainVideo.style.display = 'none';
        }
    }
    
    // Function to manage page resources
    function managePageResources(targetPage) {
        // Stop videos and animations when leaving pages
        if (currentPage === 'backup' || currentPage === 'video') {
            stopAllVideos();
        }
        
        // Pause network animation on content pages to save resources
        const background = document.getElementById('networkBackground');
        if (background) {
            if (targetPage !== 'home') {
                background.style.opacity = '0.2';
            } else {
                background.style.opacity = '0.4';
            }
        }
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Manage resources before page change
            managePageResources(targetPage);
            
            // Update current page
            currentPage = targetPage;
            
            // Update active nav link
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page, hide others
            pageContents.forEach(page => {
                page.classList.remove('active');
                page.style.display = 'none';
            });
            
            const targetPageElement = document.getElementById(targetPage + 'Page');
            if (targetPageElement) {
                targetPageElement.classList.add('active');
                targetPageElement.style.display = 'block';
            }
            
            // Initialize multi-player when backup page is loaded
            if (targetPage === 'backup' && !window.multiPlayer) {
                setTimeout(() => {
                    window.multiPlayer = new MultiPlayerSelector();
                }, 100);
            }
            
            // Lazy load main video only when video page is accessed
            if (targetPage === 'video') {
                lazyLoadMainVideo();
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// Lazy load main video
function lazyLoadMainVideo() {
    const videoWrapper = document.querySelector('#videoPage .video-wrapper');
    if (!videoWrapper) return;
    
    const existingFrame = videoWrapper.querySelector('.video-frame');
    
    // Only load if not already loaded
    if (!existingFrame || !existingFrame.src) {
        // Clear existing content
        videoWrapper.innerHTML = '';
        
        const iframe = document.createElement('iframe');
        iframe.className = 'video-frame';
        iframe.src = 'https://drive.google.com/file/d/1LuxmLPRva19uLm4RaKsr2GDnpO6GW2Pv/preview';
        iframe.allow = 'autoplay; encrypted-media; fullscreen';
        iframe.allowFullscreen = true;
        iframe.frameBorder = '0';
        iframe.scrolling = 'no';
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.title = 'Dead Poets Society - Google Drive';
        iframe.sandbox = "allow-scripts allow-same-origin allow-presentation allow-popups allow-forms";
        
        videoWrapper.appendChild(iframe);
        
        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'video-loading';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading Google Drive player...</p>
        `;
        videoWrapper.appendChild(loadingDiv);
        
        // Remove loading indicator when iframe loads
        iframe.addEventListener('load', () => {
            loadingDiv.remove();
        });
        
        iframe.addEventListener('error', () => {
            loadingDiv.innerHTML = `
                <div class="video-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Google Drive Player Failed to Load</h3>
                    <p>Please try the direct links below.</p>
                </div>
            `;
        });
        
        // Remove loading indicator after timeout (fallback)
        setTimeout(() => {
            if (loadingDiv.parentNode) {
                loadingDiv.remove();
            }
        }, 8000);
    } else {
        // If already exists, make sure it's visible
        existingFrame.style.display = 'block';
    }
}

// Documentation system
function initDocumentation() {
    const docsLinks = document.querySelectorAll('.docs-link');
    
    docsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const subpage = this.getAttribute('data-subpage');
            
            docsLinks.forEach(doc => doc.classList.remove('active'));
            this.classList.add('active');
            
            loadDocsContent(subpage);
        });
    });

    // Load initial content
    loadDocsContent('about');
}

function loadDocsContent(subpage) {
    const docsContent = document.getElementById('docsContent');
    if (!docsContent) return;
    
    const content = {
        'about': `
            <h2>About CyberStream</h2>
            <p>CyberStream is a next-generation video streaming platform designed for the modern digital era. Our mission is to deliver high-quality video content with an immersive, cyberpunk-inspired user experience.</p>
            
            <h3>Our Vision</h3>
            <p>We believe that streaming technology should be both powerful and beautiful. CyberStream combines cutting-edge video delivery with a visually striking interface that enhances your viewing experience.</p>
            
            <h3>What We Offer</h3>
            <ul>
                <li><strong>High-Quality Streaming:</strong> Adaptive bitrate streaming for the best possible quality based on your connection</li>
                <li><strong>Advanced Player:</strong> Custom video player with precision controls and intuitive interface</li>
                <li><strong>Privacy Focused:</strong> We respect your privacy and don't track your viewing habits</li>
                <li><strong>Future-Ready:</strong> Built with the latest web technologies for optimal performance</li>
            </ul>
        `,
        'technology': `
            <h2>Our Technology</h2>
            <p>CyberStream is built on a modern technology stack designed for performance, reliability, and scalability.</p>
            
            <h3>Video Delivery</h3>
            <p>We use adaptive bitrate streaming to ensure smooth playback regardless of your connection speed. Our content delivery network ensures low latency and fast loading times worldwide.</p>
            
            <h3>Player Technology</h3>
            <p>Our custom video player is built with HTML5 and enhanced with JavaScript for advanced functionality while maintaining compatibility across all modern browsers.</p>
            
            <h3>Security Features</h3>
            <p>All streams are protected with industry-standard encryption protocols to ensure your content remains secure and private.</p>
        `,
        'features': `
            <h2>Platform Features</h2>
            <p>CyberStream offers a comprehensive set of features designed to enhance your streaming experience.</p>
            
            <h3>Multi-Player Support</h3>
            <p>Choose from multiple video players to find the one that works best for your connection and device.</p>
            
            <h3>Subtitle Management</h3>
            <p>Download and use subtitle files with your favorite media players for an enhanced viewing experience.</p>
            
            <h3>Responsive Design</h3>
            <p>Our platform works seamlessly across all devices, from desktop computers to mobile phones.</p>
            
            <h3>User-Friendly Interface</h3>
            <p>Clean, intuitive design that makes finding and watching content simple and enjoyable.</p>
        `,
        'support': `
            <h2>Support & Help</h2>
            <p>We're here to help you get the most out of CyberStream.</p>
            
            <h3>Getting Started</h3>
            <p>Simply navigate to the video page and start streaming. No account creation or login required.</p>
            
            <h3>Player Issues</h3>
            <p>If you encounter issues with one player, try switching to another option from the backup video page.</p>
            
            <h3>Subtitle Support</h3>
            <p>Most players support automatic subtitle loading. For players that don't, download the subtitle file and load it manually in your preferred media player.</p>
            
            <div class="note">
                <p><strong>Note:</strong> CyberStream is a demonstration platform. Some features may be limited in functionality.</p>
            </div>
        `
    };

    docsContent.innerHTML = content[subpage] || content['about'];
}

// Performance monitoring
function monitorPerformance() {
    // Reduce network animation when page is not visible
    document.addEventListener('visibilitychange', function() {
        const background = document.getElementById('networkBackground');
        if (background) {
            if (document.hidden) {
                background.style.opacity = '0.1';
            } else {
                background.style.opacity = '0.4';
            }
        }
    });
}

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', monitorPerformance);
