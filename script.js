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
        
        // Show main content immediately
        document.querySelector('.main-content').style.opacity = '1';
        document.querySelector('.main-content').style.display = 'block';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded - initializing app');
    
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
    console.log('Initializing application');
    
    // Show main content
    document.querySelector('.main-content').style.opacity = '1';
    document.querySelector('.main-content').style.display = 'block';
    
    // Initialize navigation FIRST
    initNavigation();
    
    // Initialize documentation system
    initDocumentation();
    
    // Initialize network background
    setTimeout(() => {
        if (typeof initNetworkBackground === 'function') {
            initNetworkBackground();
        }
    }, 100);
    
    console.log('Application initialized successfully');
}

// Navigation system with page management - FIXED
function initNavigation() {
    console.log('Initializing navigation');
    
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    
    // Make sure home page is visible initially
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('homePage').classList.add('active');
    
    // Function to switch pages
    function switchPage(targetPage) {
        console.log('Switching to page:', targetPage);
        
        // Hide all pages
        pageContents.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPageElement = document.getElementById(targetPage + 'Page');
        if (targetPageElement) {
            targetPageElement.style.display = 'block';
            targetPageElement.classList.add('active');
            
            // Initialize specific page content
            if (targetPage === 'video') {
                lazyLoadMainVideo();
            }
        }
        
        // Update active nav link
        navLinks.forEach(nav => nav.classList.remove('active'));
        const activeLink = document.querySelector(`[data-page="${targetPage}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Add event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Switch page
            switchPage(targetPage);
        });
    });
    
    // Add event listeners to buttons with data-page attribute
    document.querySelectorAll('.btn[data-page]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            switchPage(targetPage);
        });
    });
    
    console.log('Navigation initialized');
}

// Lazy load main video
function lazyLoadMainVideo() {
    console.log('Loading main video');
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
        iframe.sandbox = "allow-scripts allow-same-origin allow-popups allow-forms";
        iframe.referrerPolicy = 'no-referrer';
        
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
            console.log('Google Drive player loaded successfully');
            loadingDiv.remove();
        });
        
        iframe.addEventListener('error', () => {
            console.error('Google Drive player failed to load');
            loadingDiv.innerHTML = `
                <div class="video-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Google Drive Player Failed to Load</h3>
                    <p>Please try refreshing the page or check your internet connection.</p>
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
    console.log('Initializing documentation');
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
            
            <h3>Single Player Experience</h3>
            <p>We provide a unified, high-quality streaming experience through Google Drive integration for reliable playback.</p>
            
            <h3>Cyberpunk Design</h3>
            <p>Immersive interface with futuristic aesthetics and smooth animations that enhance your viewing experience.</p>
            
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
            <p>If you encounter issues with the video player, try refreshing the page or check your internet connection.</p>
            
            <h3>Browser Compatibility</h3>
            <p>CyberStream works best with modern browsers like Chrome, Firefox, Safari, and Edge.</p>
            
            <div class="note">
                <p><strong>Note:</strong> CyberStream is a demonstration platform showcasing modern web technologies and cyberpunk design aesthetics.</p>
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
