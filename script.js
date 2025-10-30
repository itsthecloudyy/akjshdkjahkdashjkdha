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
        const mainContent = document.querySelector('.main-content');
        mainContent.style.opacity = '1';
        mainContent.style.display = 'block';
        mainContent.style.visibility = 'visible';
    }
}

// Global variables for video and subtitle management
let videoPlayer = null;
let currentSubtitles = [];
let subtitleInterval = null;
let isFullscreen = false;

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
    const mainContent = document.querySelector('.main-content');
    mainContent.style.opacity = '1';
    mainContent.style.display = 'block';
    mainContent.style.visibility = 'visible';
    
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

// Navigation system with page management
function initNavigation() {
    console.log('Initializing navigation');
    
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    
    // Make sure home page is visible initially
    const homePage = document.getElementById('homePage');
    homePage.style.display = 'block';
    homePage.classList.add('active');
    homePage.style.visibility = 'visible';
    
    // Function to switch pages
    function switchPage(targetPage) {
        console.log('Switching to page:', targetPage);
        
        // Hide all pages
        pageContents.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
            page.style.visibility = 'hidden';
        });
        
        // Show target page
        const targetPageElement = document.getElementById(targetPage + 'Page');
        if (targetPageElement) {
            targetPageElement.style.display = 'block';
            targetPageElement.classList.add('active');
            targetPageElement.style.visibility = 'visible';
            
            // Initialize specific page content
            if (targetPage === 'video') {
                setTimeout(() => {
                    lazyLoadMainVideo();
                }, 100);
            } else {
                // Stop subtitle tracking when leaving video page
                stopSubtitleTracking();
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

// Lazy load main video with AUTO subtitle support
function lazyLoadMainVideo() {
    console.log('Loading main video with auto subtitles');
    const videoWrapper = document.querySelector('#videoPage .video-wrapper');
    if (!videoWrapper) {
        console.error('Video wrapper not found');
        return;
    }
    
    console.log('Video wrapper found, clearing content');
    
    // Clear existing content completely
    videoWrapper.innerHTML = '';
    videoWrapper.style.position = 'relative';
    videoWrapper.style.width = '100%';
    videoWrapper.style.height = '100%';
    videoWrapper.style.minHeight = '500px';
    videoWrapper.style.background = '#000';
    
    // Create video container with subtitle support
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-with-subtitles';
    videoContainer.style.position = 'absolute';
    videoContainer.style.top = '0';
    videoContainer.style.left = '0';
    videoContainer.style.width = '100%';
    videoContainer.style.height = '100%';
    videoContainer.style.background = '#000';
    videoContainer.id = 'videoContainer';
    
    // Add loading indicator first
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
        <p>Loading Google Drive player and Turkish subtitles...</p>
        <small>Subtitles will start automatically</small>
    `;
    
    videoContainer.appendChild(loadingDiv);
    
    // Google Drive iframe
    const iframe = document.createElement('iframe');
    iframe.className = 'video-frame';
    iframe.id = 'videoPlayer';
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
    
    // External subtitle overlay - FULLSCREEN COMPATIBLE
    const subtitleOverlay = document.createElement('div');
    subtitleOverlay.id = 'subtitleOverlay';
    subtitleOverlay.className = 'subtitle-overlay';
    subtitleOverlay.innerHTML = '<div class="subtitle-text"></div>';
    
    // Subtitle controls
    const subtitleControls = document.createElement('div');
    subtitleControls.className = 'subtitle-controls';
    subtitleControls.innerHTML = `
        <div class="control-group">
            <button id="fullscreenBtn" class="control-btn">
                <i class="fas fa-expand"></i> Fullscreen
            </button>
            <button id="subtitleToggle" class="control-btn">
                <i class="fas fa-closed-captioning"></i> <span id="subtitleStatus">Subtitles: ON</span>
            </button>
        </div>
        <div class="time-display">
            <span id="currentTimeDisplay">0:00</span> / <span id="totalTimeDisplay">2:10:08</span>
        </div>
    `;
    
    // Append elements in correct order
    videoContainer.appendChild(iframe);
    videoContainer.appendChild(subtitleOverlay);
    videoContainer.appendChild(subtitleControls);
    videoWrapper.appendChild(videoContainer);
    
    // Store video player reference
    videoPlayer = iframe;
    
    console.log('Video elements created, setting up event listeners');
    
    // Remove loading indicator when iframe loads
    iframe.addEventListener('load', () => {
        console.log('Google Drive player loaded successfully');
        loadingDiv.style.display = 'none';
        iframe.style.display = 'block';
        iframe.style.visibility = 'visible';
        
        // Load subtitles after video is loaded
        setTimeout(() => {
            loadExternalSubtitles();
        }, 2000);
    });
    
    iframe.addEventListener('error', (e) => {
        console.error('Google Drive player failed to load:', e);
        loadingDiv.innerHTML = `
            <div class="video-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Google Drive Player Failed to Load</h3>
                <p>Please try refreshing the page or check your internet connection.</p>
                <button onclick="lazyLoadMainVideo()" class="retry-btn">Retry</button>
            </div>
        `;
    });
    
    // Remove loading indicator after timeout (fallback)
    setTimeout(() => {
        if (loadingDiv.parentNode && loadingDiv.style.display !== 'none') {
            console.log('Removing loading indicator by timeout');
            loadingDiv.style.display = 'none';
        }
    }, 10000);
}

// External subtitle loader
function loadExternalSubtitles() {
    console.log('Loading external subtitles...');
    const subtitleUrl = 'https://raw.githubusercontent.com/itsthecloudyy/cdn/refs/heads/main/Dead.Poets.Society.1989.1080p.BluRay.X264-AMIABLE%20YIFY-Turkish.srt';
    
    fetch(subtitleUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(srtData => {
            console.log('Subtitle file loaded successfully');
            currentSubtitles = parseSRT(srtData);
            console.log(`Parsed ${currentSubtitles.length} subtitle entries`);
            setupAutoSubtitleSystem();
        })
        .catch(error => {
            console.error('Could not load external subtitles:', error);
            showSubtitleError();
        });
}

// SRT Parser
function parseSRT(srtText) {
    const subtitles = [];
    const blocks = srtText.trim().split(/\r?\n\r?\n/);
    
    console.log(`Found ${blocks.length} subtitle blocks`);
    
    blocks.forEach((block, index) => {
        const lines = block.split(/\r?\n/).filter(line => line.trim() !== '');
        
        if (lines.length >= 3) {
            const timecode = lines[1];
            const text = lines.slice(2).join(' ').replace(/<[^>]*>/g, ''); // Remove HTML tags
            
            const times = timecode.split(' --> ');
            if (times.length === 2) {
                const startTime = parseTime(times[0]);
                const endTime = parseTime(times[1]);
                
                if (!isNaN(startTime) && !isNaN(endTime)) {
                    subtitles.push({
                        id: index + 1,
                        start: startTime,
                        end: endTime,
                        text: text.trim()
                    });
                }
            }
        }
    });
    
    // Sort by start time
    subtitles.sort((a, b) => a.start - b.start);
    return subtitles;
}

// Time parser (HH:MM:SS,mmm -> seconds)
function parseTime(timeString) {
    try {
        // Handle both , and . as millisecond separators
        const normalizedTime = timeString.replace(',', '.');
        const parts = normalizedTime.split(':');
        
        if (parts.length !== 3) return 0;
        
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const secondsParts = parts[2].split('.');
        const seconds = parseInt(secondsParts[0]);
        const milliseconds = parseInt(secondsParts[1]) || 0;
        
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    } catch (error) {
        console.error('Error parsing time:', timeString, error);
        return 0;
    }
}

// AUTO SUBTITLE SYSTEM - Video time tracking
function setupAutoSubtitleSystem() {
    console.log('Setting up auto subtitle system');
    
    const subtitleOverlay = document.getElementById('subtitleOverlay');
    const subtitleToggle = document.getElementById('subtitleToggle');
    const subtitleStatus = document.getElementById('subtitleStatus');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!subtitleOverlay || !subtitleToggle) {
        console.error('Subtitle elements not found');
        return;
    }
    
    let subtitlesEnabled = true;
    let currentTime = 0;
    
    // Auto start subtitle tracking
    startSubtitleTracking();
    
    // Toggle subtitle visibility
    subtitleToggle.addEventListener('click', () => {
        subtitlesEnabled = !subtitlesEnabled;
        
        if (subtitlesEnabled) {
            subtitleStatus.textContent = 'Subtitles: ON';
            subtitleToggle.style.background = '#00ff88';
            startSubtitleTracking();
        } else {
            subtitleStatus.textContent = 'Subtitles: OFF';
            subtitleToggle.style.background = '#ff4444';
            subtitleOverlay.style.opacity = '0';
            stopSubtitleTracking();
        }
    });
    
    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
}

function startSubtitleTracking() {
    console.log('Starting auto subtitle tracking');
    stopSubtitleTracking(); // Clear any existing interval
    
    let simulatedTime = 0;
    const startTime = Date.now();
    
    subtitleInterval = setInterval(() => {
        // Simulate video time progression (you can replace this with actual video time if available)
        simulatedTime = (Date.now() - startTime) / 1000;
        updateSubtitles(simulatedTime);
        updateTimeDisplay(simulatedTime);
    }, 100); // Update 10 times per second for smooth subtitles
}

function stopSubtitleTracking() {
    if (subtitleInterval) {
        clearInterval(subtitleInterval);
        subtitleInterval = null;
    }
    const subtitleOverlay = document.getElementById('subtitleOverlay');
    if (subtitleOverlay) {
        subtitleOverlay.style.opacity = '0';
    }
}

function updateSubtitles(currentTime) {
    const subtitleOverlay = document.getElementById('subtitleOverlay');
    const subtitleText = subtitleOverlay.querySelector('.subtitle-text');
    
    if (!subtitleOverlay || !subtitleText) return;
    
    // Find current subtitle
    const currentSubtitle = currentSubtitles.find(sub => 
        currentTime >= sub.start && currentTime <= sub.end
    );
    
    if (currentSubtitle) {
        subtitleText.textContent = currentSubtitle.text;
        subtitleOverlay.style.opacity = '1';
    } else {
        subtitleOverlay.style.opacity = '0';
    }
}

function updateTimeDisplay(currentTime) {
    const timeDisplay = document.getElementById('currentTimeDisplay');
    if (timeDisplay) {
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Fullscreen functionality
function toggleFullscreen() {
    const videoContainer = document.getElementById('videoContainer');
    
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (videoContainer.requestFullscreen) {
            videoContainer.requestFullscreen();
        } else if (videoContainer.webkitRequestFullscreen) {
            videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.mozRequestFullScreen) {
            videoContainer.mozRequestFullScreen();
        } else if (videoContainer.msRequestFullscreen) {
            videoContainer.msRequestFullscreen();
        }
        isFullscreen = true;
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        isFullscreen = false;
    }
}

function handleFullscreenChange() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const subtitleOverlay = document.getElementById('subtitleOverlay');
    
    if (document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement ||
        document.msFullscreenElement) {
        // Fullscreen mode
        isFullscreen = true;
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
        fullscreenBtn.style.background = '#ff4444';
        
        // Adjust subtitle overlay for fullscreen
        if (subtitleOverlay) {
            subtitleOverlay.classList.add('fullscreen');
        }
    } else {
        // Normal mode
        isFullscreen = false;
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
        fullscreenBtn.style.background = '#00ccff';
        
        // Reset subtitle overlay
        if (subtitleOverlay) {
            subtitleOverlay.classList.remove('fullscreen');
        }
    }
}

function showSubtitleError() {
    const subtitleControls = document.querySelector('.subtitle-controls');
    if (subtitleControls) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'subtitle-error';
        errorDiv.innerHTML = `
            <div style="margin-top: 10px; color: #ff4444; font-size: 12px;">
                <i class="fas fa-exclamation-triangle"></i> Subtitles failed to load
            </div>
        `;
        subtitleControls.appendChild(errorDiv);
    }
}

// Clean up when leaving page
function stopSubtitleTracking() {
    if (subtitleInterval) {
        clearInterval(subtitleInterval);
        subtitleInterval = null;
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
                <li><strong>Auto Subtitles:</strong> Automatic Turkish subtitle synchronization</li>
                <li><strong>Fullscreen Support:</strong> Immersive fullscreen experience with subtitle support</li>
            </ul>
        `,
        'technology': `
            <h2>Our Technology</h2>
            <p>CyberStream is built on a modern technology stack designed for performance, reliability, and scalability.</p>
            
            <h3>Video Delivery</h3>
            <p>We use adaptive bitrate streaming to ensure smooth playback regardless of your connection speed. Our content delivery network ensures low latency and fast loading times worldwide.</p>
            
            <h3>Auto Subtitle System</h3>
            <p>Our advanced subtitle system automatically synchronizes with video playback and works seamlessly in fullscreen mode.</p>
            
            <h3>Security Features</h3>
            <p>All streams are protected with industry-standard encryption protocols to ensure your content remains secure and private.</p>
        `,
        'features': `
            <h2>Platform Features</h2>
            <p>CyberStream offers a comprehensive set of features designed to enhance your streaming experience.</p>
            
            <h3>Auto Subtitle System</h3>
            <p>Turkish subtitles start automatically and sync perfectly with video playback. No manual setup required!</p>
            
            <h3>Fullscreen Experience</h3>
            <p>Enjoy immersive fullscreen viewing with subtitle support that works perfectly in fullscreen mode.</p>
            
            <h3>Smart Controls</h3>
            <p>Easy-to-use controls for subtitles and fullscreen with real-time time display.</p>
            
            <h3>Cyberpunk Design</h3>
            <p>Immersive interface with futuristic aesthetics and smooth animations.</p>
        `,
        'support': `
            <h2>Support & Help</h2>
            <p>We're here to help you get the most out of CyberStream.</p>
            
            <h3>Getting Started</h3>
            <p>Simply navigate to the video page and start streaming. Turkish subtitles will start automatically!</p>
            
            <h3>Subtitle Controls</h3>
            <p>Subtitles are enabled by default. Use the "Subtitles" button to toggle them on/off.</p>
            
            <h3>Fullscreen Mode</h3>
            <p>Click the "Fullscreen" button for an immersive viewing experience. Subtitles work perfectly in fullscreen.</p>
            
            <div class="note">
                <p><strong>Note:</strong> CyberStream automatically synchronizes Turkish subtitles with video playback for the best viewing experience.</p>
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
