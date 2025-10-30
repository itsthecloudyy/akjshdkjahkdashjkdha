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

// Global variables
let currentSubtitles = [];
let subtitleInterval = null;
let isFullscreen = false;
let subtitlesEnabled = true;
let videoTime = 0;
let isVideoPlaying = true;
let videoStartTime = 0;

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
                    lazyLoadMainVideo();
                }, 100);
            } else {
                stopSubtitleSystem();
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

// SIMPLE WORKING VIDEO SYSTEM
function lazyLoadMainVideo() {
    console.log('Loading Google Drive video - SIMPLE WORKING VERSION');
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
    videoContainer.className = 'video-with-subtitles';
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
        <small>Subtitles will start automatically</small>
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
    
    // Subtitle overlay
    const subtitleOverlay = document.createElement('div');
    subtitleOverlay.id = 'subtitleOverlay';
    subtitleOverlay.className = 'subtitle-overlay';
    subtitleOverlay.innerHTML = '<div class="subtitle-text"></div>';
    
    // SIMPLE CONTROLS - Manual time input
    const videoControls = document.createElement('div');
    videoControls.className = 'video-controls-overlay';
    videoControls.innerHTML = `
        <div class="control-group">
            <div class="time-input-group">
                <input type="text" id="timeInput" placeholder="MM:SS" class="time-input">
                <button id="setTimeBtn" class="control-btn">
                    <i class="fas fa-play"></i> Set Time
                </button>
            </div>
            <button id="subtitleToggle" class="control-btn">
                <i class="fas fa-closed-captioning"></i> <span id="subtitleStatus">ON</span>
            </button>
            <button id="fullscreenBtn" class="control-btn">
                <i class="fas fa-expand"></i> Fullscreen
            </button>
        </div>
        <div class="time-display">
            <span id="currentTimeDisplay">0:00</span> / <span id="totalTimeDisplay">2:10:08</span>
            <div id="syncStatus" style="font-size:10px;color:#00ff88;margin-top:5px;">Enter time when you seek</div>
        </div>
    `;
    
    videoContainer.appendChild(iframe);
    videoContainer.appendChild(subtitleOverlay);
    videoContainer.appendChild(videoControls);
    videoWrapper.appendChild(videoContainer);
    
    console.log('Video elements created');
    
    iframe.addEventListener('load', () => {
        console.log('Google Drive player loaded successfully');
        loadingDiv.style.display = 'none';
        
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
    
    setTimeout(() => {
        if (loadingDiv.parentNode && loadingDiv.style.display !== 'none') {
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
            setupSimpleSyncSystem();
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
            const text = lines.slice(2).join(' ').replace(/<[^>]*>/g, '');
            
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
    
    subtitles.sort((a, b) => a.start - b.start);
    return subtitles;
}

// Time parser (HH:MM:SS,mmm -> seconds)
function parseTime(timeString) {
    try {
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

// SIMPLE WORKING SYNC SYSTEM
function setupSimpleSyncSystem() {
    console.log('Setting up SIMPLE sync system');
    
    const timeInput = document.getElementById('timeInput');
    const setTimeBtn = document.getElementById('setTimeBtn');
    const subtitleToggle = document.getElementById('subtitleToggle');
    const subtitleStatus = document.getElementById('subtitleStatus');
    const syncStatus = document.getElementById('syncStatus');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!timeInput || !setTimeBtn) {
        console.error('Time input elements not found');
        return;
    }
    
    // Manual time set button
    setTimeBtn.addEventListener('click', () => {
        const timeValue = timeInput.value.trim();
        
        if (timeValue) {
            const newTime = parseManualTime(timeValue);
            if (newTime !== null) {
                videoTime = newTime;
                videoStartTime = Date.now() - (videoTime * 1000);
                syncStatus.textContent = `Time set to ${formatTime(videoTime)}`;
                syncStatus.style.color = '#00ff88';
                timeInput.value = '';
                
                console.log('Manual time set to:', videoTime);
            } else {
                syncStatus.textContent = 'Invalid time format (use MM:SS)';
                syncStatus.style.color = '#ff4444';
            }
        }
    });
    
    // Enter key support for time input
    timeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            setTimeBtn.click();
        }
    });
    
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
    
    // Fullscreen
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Start subtitle tracking
    startSubtitleTracking();
}

// Parse manual time input (MM:SS or HH:MM:SS)
function parseManualTime(timeString) {
    const parts = timeString.split(':');
    
    if (parts.length === 2) {
        // MM:SS format
        const minutes = parseInt(parts[0]);
        const seconds = parseInt(parts[1]);
        
        if (!isNaN(minutes) && !isNaN(seconds)) {
            return (minutes * 60) + seconds;
        }
    } else if (parts.length === 3) {
        // HH:MM:SS format
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = parseInt(parts[2]);
        
        if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
            return (hours * 3600) + (minutes * 60) + seconds;
        }
    }
    
    return null;
}

// Format time for display
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

function startSubtitleTracking() {
    console.log('Starting subtitle tracking');
    stopSubtitleTracking();
    
    isVideoPlaying = true;
    videoStartTime = Date.now() - (videoTime * 1000);
    
    subtitleInterval = setInterval(() => {
        if (isVideoPlaying) {
            const currentTime = Date.now();
            const elapsed = (currentTime - videoStartTime) / 1000;
            videoTime = Math.min(7808, elapsed);
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
        timeDisplay.textContent = formatTime(currentTime);
    }
}

// Fullscreen functionality
function toggleFullscreen() {
    const videoContainer = document.getElementById('videoContainer');
    
    if (!document.fullscreenElement) {
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
        isFullscreen = true;
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
        fullscreenBtn.style.background = '#ff4444';
        
        if (subtitleOverlay) {
            subtitleOverlay.classList.add('fullscreen');
        }
    } else {
        isFullscreen = false;
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
        fullscreenBtn.style.background = '#00ccff';
        
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

    loadDocsContent('about');
}

function loadDocsContent(subpage) {
    const docsContent = document.getElementById('docsContent');
    if (!docsContent) return;
    
    const content = {
        'about': `
            <h2>About CyberStream</h2>
            <p>CyberStream is a next-generation video streaming platform with manual time synchronization for Google Drive videos.</p>
            
            <h3>How to Use</h3>
            <p>When you seek in Google Drive video, simply enter the new time in MM:SS format and click "Set Time" to synchronize subtitles.</p>
            
            <h3>Features</h3>
            <ul>
                <li><strong>Manual Time Sync:</strong> Enter time when you seek in Google Drive</li>
                <li><strong>Turkish Subtitles:</strong> Automatic subtitle loading</li>
                <li><strong>Simple Controls:</strong> Easy-to-use interface</li>
            </ul>
        `,
        'support': `
            <h2>Support & Help</h2>
            
            <h3>Using Time Sync</h3>
            <ol>
                <li>Play your Google Drive video normally</li>
                <li>When you seek to a new position, note the time</li>
                <li>Enter the time in MM:SS format (e.g., 45:30 for 45 minutes 30 seconds)</li>
                <li>Click "Set Time" or press Enter</li>
                <li>Subtitles will instantly sync to the new time</li>
            </ol>
            
            <h3>Time Format Examples</h3>
            <ul>
                <li><strong>15:30</strong> = 15 minutes, 30 seconds</li>
                <li><strong>1:05:20</strong> = 1 hour, 5 minutes, 20 seconds</li>
                <li><strong>2:00</strong> = 2 minutes, 0 seconds</li>
            </ul>
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
