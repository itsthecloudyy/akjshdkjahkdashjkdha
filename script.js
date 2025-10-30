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
let subtitlesEnabled = true;
let videoTime = 0;
let isVideoPlaying = true;
let videoStartTime = 0;
let lastVideoTime = 0;

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
                stopSubtitleSystem();
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

// Lazy load main video with SMART SYNC system
function lazyLoadMainVideo() {
    console.log('Loading Google Drive video with SMART SYNC');
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
        <p>Loading Google Drive player with SMART SYNC...</p>
        <small>Use SYNC button when you seek in video</small>
    `;
    
    videoContainer.appendChild(loadingDiv);
    
    // Google Drive iframe
    const iframe = document.createElement('iframe');
    iframe.className = 'video-frame';
    iframe.id = 'videoPlayer';
    iframe.src = 'https://drive.google.com/file/d/1kujv8Jnj76rzEWVNsaJwcLSqN7o4nriq/preview';
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
    iframe.style.opacity = '0.9';
    
    // External subtitle overlay - FULLSCREEN COMPATIBLE
    const subtitleOverlay = document.createElement('div');
    subtitleOverlay.id = 'subtitleOverlay';
    subtitleOverlay.className = 'subtitle-overlay';
    subtitleOverlay.innerHTML = '<div class="subtitle-text"></div>';
    
    // SMART CONTROLS with Sync button
    const videoControls = document.createElement('div');
    videoControls.className = 'video-controls-overlay';
    videoControls.innerHTML = `
        <div class="control-group">
            <button id="syncSubtitlesBtn" class="control-btn sync-btn">
                <i class="fas fa-sync-alt"></i> <span id="syncText">Sync Subtitles</span>
            </button>
            <button id="subtitleToggle" class="control-btn">
                <i class="fas fa-closed-captioning"></i> <span id="subtitleStatus">ON</span>
            </button>
            <button id="fullscreenBtn" class="control-btn">
                <i class="fas fa-expand"></i> Fullscreen
            </button>
        </div>
        <div class="time-display">
            <span id="currentTimeDisplay">0:00</span> / <span id="totalTimeDisplay">2:10:08</span>
            <div id="syncStatus" style="font-size:10px;color:#00ff88;margin-top:5px;">Auto-sync ready</div>
        </div>
    `;
    
    // Append elements in correct order
    videoContainer.appendChild(iframe);
    videoContainer.appendChild(subtitleOverlay);
    videoContainer.appendChild(videoControls);
    videoWrapper.appendChild(videoContainer);
    
    // Store video player reference
    videoPlayer = iframe;
    
    console.log('Video elements created, setting up SMART SYNC system');
    
    // Remove loading indicator when iframe loads
    iframe.addEventListener('load', () => {
        console.log('Google Drive player loaded successfully');
        loadingDiv.style.display = 'none';
        iframe.style.display = 'block';
        iframe.style.visibility = 'visible';
        
        // Load subtitles after video is loaded
        setTimeout(() => {
            loadExternalSubtitles();
        }, 1000);
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
    console.log('Loading external subtitles for SMART SYNC...');
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
            setupSmartSyncSystem();
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

// SMART SYNC SYSTEM for Google Drive
function setupSmartSyncSystem() {
    console.log('Setting up SMART SYNC system for Google Drive');
    
    const syncBtn = document.getElementById('syncSubtitlesBtn');
    const syncText = document.getElementById('syncText');
    const subtitleToggle = document.getElementById('subtitleToggle');
    const subtitleStatus = document.getElementById('subtitleStatus');
    const syncStatus = document.getElementById('syncStatus');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!syncBtn || !syncStatus) {
        console.error('Smart sync elements not found');
        return;
    }
    
    let seekDetected = false;
    lastVideoTime = 0;
    
    // Manual sync button - Kullanıcı sardırdığında buna basacak
    syncBtn.addEventListener('click', () => {
        // Reset time tracking with current position
        videoStartTime = Date.now() - (videoTime * 1000);
        seekDetected = false;
        syncStatus.textContent = '✓ Subtitles synced!';
        syncStatus.style.color = '#00ff88';
        syncBtn.style.background = '#00ff88';
        syncText.textContent = 'Synced!';
        
        // Show confirmation for 2 seconds
        setTimeout(() => {
            syncStatus.textContent = 'Auto-sync ready';
            syncBtn.style.background = '#ffaa00';
            syncText.textContent = 'Sync Subtitles';
        }, 2000);
        
        console.log('Manual sync activated at time:', videoTime);
    });
    
    // Auto-detect seeking (approximate detection)
    setInterval(() => {
        const timeDiff = Math.abs(videoTime - lastVideoTime);
        
        // If time jump is more than 3 seconds, detect as seek
        if (timeDiff > 3 && lastVideoTime > 0) {
            if (!seekDetected) {
                seekDetected = true;
                syncStatus.textContent = '⚠ Seek detected - Click SYNC';
                syncStatus.style.color = '#ffaa00';
                syncBtn.style.background = '#ff4444';
                syncText.textContent = 'Sync Needed!';
                console.log('Seek detected! Time jump:', timeDiff, 'seconds');
            }
        }
        
        lastVideoTime = videoTime;
    }, 1000);
    
    // Subtitle toggle
    subtitlesEnabled = true;
    subtitleStatus.textContent = 'ON';
    subtitleToggle.style.background = '#00ff88';
    
    subtitleToggle.addEventListener('click', () => {
        subtitlesEnabled = !subtitlesEnabled;
        
        if (subtitlesEnabled) {
            subtitleStatus.textContent = 'ON';
            subtitleToggle.style.background = '#00ff88';
            updateSubtitles(videoTime);
        } else {
            subtitleStatus.textContent = 'OFF';
            subtitleToggle.style.background = '#ff4444';
            const subtitleOverlay = document.getElementById('subtitleOverlay');
            if (subtitleOverlay) subtitleOverlay.style.opacity = '0';
        }
    });
    
    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Start auto subtitle tracking
    startSubtitleTracking();
}

function startSubtitleTracking() {
    console.log('Starting SMART subtitle tracking');
    stopSubtitleTracking();
    
    isVideoPlaying = true;
    videoStartTime = Date.now() - (videoTime * 1000);
    
    subtitleInterval = setInterval(() => {
        if (isVideoPlaying) {
            const currentTime = Date.now();
            const elapsed = (currentTime - videoStartTime) / 1000;
            videoTime = Math.min(7808, elapsed); // Cap at 2:10:08
            updateSubtitles(videoTime);
            updateTimeDisplay(videoTime);
        }
    }, 100);
}

function stopSubtitleTracking() {
    if (subtitleInterval) {
        clearInterval(subtitleInterval);
        subtitleInterval = null;
    }
}

function stopSubtitleSystem() {
    stopSubtitleTracking();
    isVideoPlaying = false;
    
    const subtitleOverlay = document.getElementById('subtitleOverlay');
    if (subtitleOverlay) {
        subtitleOverlay.style.opacity = '0';
    }
}

function updateSubtitles(currentTime) {
    const subtitleOverlay = document.getElementById('subtitleOverlay');
    const subtitleText = subtitleOverlay?.querySelector('.subtitle-text');
    
    if (!subtitleOverlay || !subtitleText || !subtitlesEnabled) return;
    
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
        const hours = Math.floor(currentTime / 3600);
        const minutes = Math.floor((currentTime % 3600) / 60);
        const seconds = Math.floor(currentTime % 60);
        
        if (hours > 0) {
            timeDisplay.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
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
            videoContainer.webkitRequestfullscreen();
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
    const videoControls = document.querySelector('.video-controls-overlay');
    if (videoControls) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'subtitle-error';
        errorDiv.innerHTML = `
            <div style="margin-top: 10px; color: #ff4444; font-size: 12px;">
                <i class="fas fa-exclamation-triangle"></i> Subtitles failed to load
            </div>
        `;
        videoControls.appendChild(errorDiv);
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
            
            <h3>SMART SYNC Technology</h3>
            <p>Our advanced SMART SYNC system automatically detects when you seek in Google Drive videos and allows you to instantly resynchronize Turkish subtitles with a single click.</p>
            
            <h3>What We Offer</h3>
            <ul>
                <li><strong>Smart Subtitle Sync:</strong> Automatic seek detection and one-click subtitle synchronization</li>
                <li><strong>Google Drive Integration:</strong> Seamless integration with Google Drive videos</li>
                <li><strong>Auto Subtitles:</strong> Turkish subtitles enabled by default</li>
                <li><strong>Fullscreen Support:</strong> Immersive fullscreen experience</li>
            </ul>
        `,
        'technology': `
            <h2>Our SMART SYNC Technology</h2>
            <p>CyberStream features revolutionary SMART SYNC technology designed specifically for Google Drive integration.</p>
            
            <h3>Seek Detection</h3>
            <p>Our system automatically monitors video playback and detects when you jump to different time positions in Google Drive videos.</p>
            
            <h3>One-Click Sync</h3>
            <p>When a seek is detected, simply click the "Sync Subtitles" button to instantly resynchronize Turkish subtitles with the new video position.</p>
            
            <h3>Smart Controls</h3>
            <p>The sync button changes color to indicate status: Orange when ready, Red when sync needed, Green when synchronized.</p>
        `,
        'features': `
            <h2>Platform Features</h2>
            <p>CyberStream offers advanced features designed specifically for Google Drive video streaming.</p>
            
            <h3>SMART SYNC System</h3>
            <p>Automatic seek detection and one-click subtitle synchronization for Google Drive videos.</p>
            
            <h3>Color-Coded Status</h3>
            <ul>
                <li><span style="color:#ffaa00">🟠 Orange:</span> Sync button ready</li>
                <li><span style="color:#ff4444">🔴 Red:</span> Sync needed (seek detected)</li>
                <li><span style="color:#00ff88">🟢 Green:</span> Subtitles synchronized</li>
            </ul>
            
            <h3>Seamless Integration</h3>
            <p>Works perfectly with Google Drive's native video player while providing advanced subtitle synchronization.</p>
        `,
        'support': `
            <h2>Support & Help</h2>
            <p>We're here to help you get the most out of CyberStream's SMART SYNC technology.</p>
            
            <h3>Using SMART SYNC</h3>
            <ol>
                <li>Play your Google Drive video normally</li>
                <li>When you seek (jump to different time), the system will detect it automatically</li>
                <li>Click the <strong>"Sync Subtitles"</strong> button (it will turn red when sync is needed)</li>
                <li>Subtitles will instantly synchronize with the new video position</li>
            </ol>
            
            <h3>Video Controls</h3>
            <ul>
                <li><strong>Sync Subtitles:</strong> Resynchronize subtitles after seeking</li>
                <li><strong>Subtitles Toggle:</strong> Turn Turkish subtitles on/off</li>
                <li><strong>Fullscreen:</strong> Enter immersive fullscreen mode</li>
            </ul>
            
            <div class="note">
                <p><strong>Pro Tip:</strong> The system automatically detects when you seek in the video. Just click the sync button when it turns red to instantly fix subtitle timing.</p>
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
    
    @keyframes pulse-sync {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);
