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

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded - initializing app');
    
    if (isMobileDevice()) {
        const mobileWarning = document.getElementById('mobileWarning');
        mobileWarning.style.display = 'flex';
        
        document.getElementById('proceedAnyway').addEventListener('click', function() {
            mobileWarning.style.display = 'none';
            initializeApp();
        });
    } else {
        const loadingScreen = new LoadingScreen();
        await loadingScreen.start();
        initializeApp();
    }
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
                    loadDirectVideoPlayer();
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

// DIRECT VIDEO PLAYER - NO CUSTOM UI
function loadDirectVideoPlayer() {
    console.log('Loading direct video player - NO CUSTOM UI');
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
    videoContainer.className = 'video-container-simple';
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
        <p>Loading video with Turkish subtitles...</p>
        <small>Subtitles are burned into the video</small>
    `;
    
    videoContainer.appendChild(loadingDiv);
    
    // HTML5 Video Player - SIMPLE
    const video = document.createElement('video');
    video.className = 'direct-video-player';
    video.id = 'directVideoPlayer';
    video.controls = true;
    video.autoplay = false;
    video.preload = 'auto';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'contain';
    video.style.background = '#000';
    
    // Video source - REPLACE THIS WITH YOUR ACTUAL VIDEO URL
    const source = document.createElement('source');
    source.src = 'YOUR_VIDEO_URL_HERE.mp4'; // Replace with your video URL
    source.type = 'video/mp4';
    
    video.appendChild(source);
    
    // Fallback message
    const fallbackText = document.createElement('p');
    fallbackText.textContent = 'Your browser does not support the video tag.';
    fallbackText.style.color = '#fff';
    fallbackText.style.textAlign = 'center';
    fallbackText.style.padding = '2rem';
    
    video.appendChild(fallbackText);
    
    // Append only the video (NO CUSTOM CONTROLS)
    videoContainer.appendChild(video);
    videoWrapper.appendChild(videoContainer);
    
    console.log('Direct video player created - no custom UI');
    
    // Remove loading when video can play
    video.addEventListener('canplay', () => {
        console.log('Video can play');
        loadingDiv.style.display = 'none';
    });
    
    video.addEventListener('error', (e) => {
        console.error('Video failed to load:', e);
        loadingDiv.innerHTML = `
            <div class="video-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Video Failed to Load</h3>
                <p>Please check the video URL or try a different browser.</p>
                <p><strong>Current URL:</strong> ${source.src}</p>
                <button onclick="loadDirectVideoPlayer()" class="retry-btn">Retry</button>
            </div>
        `;
    });
    
    // Remove loading after timeout
    setTimeout(() => {
        if (loadingDiv.parentNode && loadingDiv.style.display !== 'none') {
            loadingDiv.style.display = 'none';
        }
    }, 8000);
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

    loadDocsContent('about');
}

function loadDocsContent(subpage) {
    const docsContent = document.getElementById('docsContent');
    if (!docsContent) return;
    
    const content = {
        'about': `
            <h2>About CyberStream</h2>
            <p>CyberStream is a next-generation video streaming platform with direct video playback.</p>
            
            <h3>Features</h3>
            <ul>
                <li><strong>Direct Video Playback:</strong> Native HTML5 video player</li>
                <li><strong>Burned-in Subtitles:</strong> Turkish subtitles embedded in video</li>
                <li><strong>Clean Interface:</strong> No custom UI - just the video</li>
            </ul>
        `,
        'support': `
            <h2>Support & Help</h2>
            
            <h3>Video Player</h3>
            <p>The video player uses your browser's native HTML5 video controls. All standard video controls are available:</p>
            <ul>
                <li>Play/Pause</li>
                <li>Volume control</li>
                <li>Fullscreen</li>
                <li>Seeking</li>
                <li>Playback speed</li>
            </ul>
            
            <h3>Subtitles</h3>
            <p>Turkish subtitles are burned directly into the video stream and cannot be turned off.</p>
        `
    };

    docsContent.innerHTML = content[subpage] || content['about'];
}

// Performance monitoring
function monitorPerformance() {
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

document.addEventListener('DOMContentLoaded', monitorPerformance);

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
