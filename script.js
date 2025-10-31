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
    initDocumentation();
    
    setTimeout(() => {
        if (typeof initNetworkBackground === 'function') {
            initNetworkBackground();
        }
    }, 100);
    
    console.log('Application initialized successfully');
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

// Documentation system
function initDocumentation() {
    console.log('Initializing documentation system');
    
    const docLinks = document.querySelectorAll('.docs-link');
    const docContent = document.getElementById('docsContent');
    
    const docs = {
        about: `
            <h2>About CyberStream</h2>
            <p>CyberStream is a next-generation video streaming platform designed with a cyberpunk-inspired aesthetic and cutting-edge technology. Our mission is to provide a seamless, high-performance streaming experience while maintaining user privacy and data security.</p>
            
            <h3>Our Vision</h3>
            <p>We believe that video streaming should be fast, reliable, and beautiful. CyberStream combines futuristic design with modern web technologies to create an immersive viewing experience that works across all devices.</p>
            
            <div class="note">
                <p><strong>Note:</strong> CyberStream is built with modern web standards and requires a compatible browser for optimal performance.</p>
            </div>
            
            <h3>Platform Features</h3>
            <ul>
                <li><strong>High Performance Streaming:</strong> Optimized video delivery with adaptive bitrate technology</li>
                <li><strong>Privacy First:</strong> No tracking, no ads, no data collection</li>
                <li><strong>Cross-Platform:</strong> Works on desktop, tablet, and mobile devices</li>
                <li><strong>Modern Design:</strong> Cyberpunk-inspired interface with smooth animations</li>
                <li><strong>Auto Subtitles:</strong> Automatic Turkish subtitle integration</li>
            </ul>
        `,
        technology: `
            <h2>Technology Stack</h2>
            <p>CyberStream is built using modern web technologies to ensure the best possible performance and user experience.</p>
            
            <h3>Frontend Technologies</h3>
            <ul>
                <li><strong>HTML5:</strong> Semantic markup for accessibility and SEO</li>
                <li><strong>CSS3:</strong> Advanced styling with CSS Grid, Flexbox, and custom properties</li>
                <li><strong>JavaScript ES6+:</strong> Modern JavaScript with async/await and modules</li>
                <li><strong>Canvas API:</strong> For dynamic background animations and effects</li>
            </ul>
            
            <h3>Video Technology</h3>
            <ul>
                <li><strong>Google Drive Integration:</strong> Leveraging Google's infrastructure for reliable video hosting</li>
                <li><strong>Adaptive Bitrate:</strong> Automatic quality adjustment based on network conditions</li>
                <li><strong>HTML5 Video:</strong> Native browser video playback for maximum compatibility</li>
            </ul>
            
            <h3>Performance Optimizations</h3>
            <ul>
                <li>Lazy loading of resources</li>
                <li>Efficient animation using requestAnimationFrame</li>
                <li>Minimal DOM manipulation</li>
                <li>Optimized asset delivery</li>
            </ul>
        `,
        features: `
            <h2>Platform Features</h2>
            <p>CyberStream offers a comprehensive set of features designed to enhance your video streaming experience.</p>
            
            <h3>Core Features</h3>
            <ul>
                <li><strong>High-Quality Streaming:</strong> Support for up to 1080p video quality with smooth playback</li>
                <li><strong>Automatic Subtitles:</strong> Turkish subtitles that sync perfectly with video content</li>
                <li><strong>Responsive Design:</strong> Optimized experience across all device sizes</li>
                <li><strong>Fast Loading:</strong> Optimized loading times with progressive enhancement</li>
                <li><strong>Privacy Protection:</strong> No user tracking or data collection</li>
            </ul>
            
            <h3>User Experience</h3>
            <ul>
                <li><strong>Intuitive Navigation:</strong> Simple, clean interface that's easy to use</li>
                <li><strong>Smooth Animations:</strong> Carefully crafted animations that enhance usability</li>
                <li><strong>Accessibility:</strong> Built with accessibility best practices</li>
                <li><strong>Mobile Optimized:</strong> Touch-friendly interface for mobile devices</li>
            </ul>
            
            <h3>Video Player Features</h3>
            <ul>
                <li>Fullscreen support</li>
                <li>Playback speed control</li>
                <li>Quality selection</li>
                <li>Subtitle toggle</li>
                <li>Keyboard shortcuts</li>
            </ul>
        `,
        support: `
            <h2>Support & Help</h2>
            <p>Need help with CyberStream? Here are some common solutions and support options.</p>
            
            <h3>Common Issues</h3>
            
            <h4>Video Won't Play</h4>
            <ul>
                <li>Check your internet connection</li>
                <li>Ensure your browser is up to date</li>
                <li>Try refreshing the page</li>
                <li>Clear your browser cache</li>
            </ul>
            
            <h4>Subtitles Not Showing</h4>
            <ul>
                <li>Make sure subtitles are enabled in the player</li>
                <li>Check if your browser supports WebVTT format</li>
                <li>Try switching to a different browser</li>
            </ul>
            
            <h4>Performance Issues</h4>
            <ul>
                <li>Close other tabs and applications</li>
                <li>Check your internet speed</li>
                <li>Try lowering the video quality</li>
                <li>Update your graphics drivers</li>
            </ul>
            
            <h3>Browser Compatibility</h3>
            <p>CyberStream works best with modern browsers:</p>
            <ul>
                <li>Chrome 90+</li>
                <li>Firefox 88+</li>
                <li>Safari 14+</li>
                <li>Edge 90+</li>
            </ul>
            
            <div class="note">
                <p><strong>Tip:</strong> For the best experience, we recommend using the latest version of Chrome or Firefox.</p>
            </div>
        `
    };
    
    function showDocContent(docId) {
        console.log('Showing documentation:', docId);
        if (docs[docId] && docContent) {
            docContent.innerHTML = docs[docId];
        }
        
        docLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`[data-subpage="${docId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    docLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const docId = this.getAttribute('data-subpage');
            showDocContent(docId);
        });
    });
    
    // Show default content
    if (docLinks.length > 0) {
        const firstDoc = docLinks[0].getAttribute('data-subpage');
        showDocContent(firstDoc);
    }
    
    console.log('Documentation system initialized');
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