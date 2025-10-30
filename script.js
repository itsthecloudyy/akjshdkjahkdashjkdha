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

// Lazy load main video with subtitle support
function lazyLoadMainVideo() {
    console.log('Loading main video');
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
        <div class="loading-spinner" style="width: 50px; height: 50px; border: 4px solid rgba(0, 255, 136, 0.3); border-top: 4px solid #00ff88; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
        <p style="color: #00ff88; font-size: 1.1rem; margin-bottom: 0.5rem;">Loading Google Drive player...</p>
        <small style="color: #888; font-size: 0.9rem;">This may take a few moments</small>
    `;
    
    videoContainer.appendChild(loadingDiv);
    
    // Google Drive iframe - FIXED URL
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
    
    // External subtitle overlay
    const subtitleOverlay = document.createElement('div');
    subtitleOverlay.id = 'subtitleOverlay';
    subtitleOverlay.style.position = 'absolute';
    subtitleOverlay.style.bottom = '80px';
    subtitleOverlay.style.left = '0';
    subtitleOverlay.style.width = '100%';
    subtitleOverlay.style.textAlign = 'center';
    subtitleOverlay.style.zIndex = '2';
    subtitleOverlay.style.pointerEvents = 'none';
    subtitleOverlay.style.color = '#ffffff';
    subtitleOverlay.style.fontSize = '24px';
    subtitleOverlay.style.fontWeight = 'bold';
    subtitleOverlay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
    subtitleOverlay.style.fontFamily = 'Arial, sans-serif';
    subtitleOverlay.style.padding = '10px 20px';
    subtitleOverlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    subtitleOverlay.style.borderRadius = '5px';
    subtitleOverlay.style.display = 'none';
    subtitleOverlay.style.maxWidth = '80%';
    subtitleOverlay.style.margin = '0 auto';
    subtitleOverlay.style.lineHeight = '1.4';
    
    // Subtitle controls
    const subtitleControls = document.createElement('div');
    subtitleControls.className = 'subtitle-controls';
    subtitleControls.style.position = 'absolute';
    subtitleControls.style.bottom = '20px';
    subtitleControls.style.left = '20px';
    subtitleControls.style.zIndex = '3';
    subtitleControls.style.background = 'rgba(0,0,0,0.8)';
    subtitleControls.style.padding = '10px';
    subtitleControls.style.borderRadius = '5px';
    subtitleControls.style.color = 'white';
    subtitleControls.style.fontSize = '14px';
    
    subtitleControls.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <button id="toggleSubtitles" style="padding: 8px 16px; background: #00ff88; color: black; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: all 0.3s ease;">
                <i class="fas fa-closed-captioning"></i> Turn On Subtitles
            </button>
            <span id="subtitleStatus" style="font-size: 12px; color: #aaa;">Off</span>
        </div>
    `;
    
    // Append elements in correct order
    videoContainer.appendChild(iframe);
    videoContainer.appendChild(subtitleOverlay);
    videoContainer.appendChild(subtitleControls);
    videoWrapper.appendChild(videoContainer);
    
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
        }, 1000);
    });
    
    iframe.addEventListener('error', (e) => {
        console.error('Google Drive player failed to load:', e);
        loadingDiv.innerHTML = `
            <div class="video-error" style="text-align: center; color: #ff4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3 style="color: #ff4444; margin-bottom: 1rem;">Google Drive Player Failed to Load</h3>
                <p style="color: #ccc; margin-bottom: 1.5rem;">Please try refreshing the page or check your internet connection.</p>
                <button onclick="lazyLoadMainVideo()" style="padding: 10px 20px; background: #ff4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;">Retry</button>
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
            const subtitles = parseSRT(srtData);
            console.log(`Parsed ${subtitles.length} subtitle entries`);
            setupSubtitlePlayer(subtitles);
        })
        .catch(error => {
            console.error('Could not load external subtitles:', error);
            setupManualSubtitleControls();
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

// Subtitle player
function setupSubtitlePlayer(subtitles) {
    console.log('Setting up subtitle player');
    const overlay = document.getElementById('subtitleOverlay');
    const toggleBtn = document.getElementById('toggleSubtitles');
    const statusSpan = document.getElementById('subtitleStatus');
    
    if (!overlay || !toggleBtn || !statusSpan) {
        console.error('Subtitle elements not found');
        return;
    }
    
    let currentSubtitleIndex = -1;
    let subtitlesEnabled = false;
    let currentTime = 0;
    let timeInterval;
    
    // Toggle subtitle visibility
    toggleBtn.addEventListener('click', () => {
        subtitlesEnabled = !subtitlesEnabled;
        
        if (subtitlesEnabled) {
            statusSpan.textContent = 'On';
            statusSpan.style.color = '#00ff88';
            toggleBtn.innerHTML = '<i class="fas fa-closed-captioning"></i> Turn Off Subtitles';
            toggleBtn.style.background = '#ff4444';
            overlay.style.display = 'block';
            startTimeSimulation();
        } else {
            statusSpan.textContent = 'Off';
            statusSpan.style.color = '#aaa';
            toggleBtn.innerHTML = '<i class="fas fa-closed-captioning"></i> Turn On Subtitles';
            toggleBtn.style.background = '#00ff88';
            overlay.style.display = 'none';
            stopTimeSimulation();
        }
    });
    
    function startTimeSimulation() {
        currentTime = 0;
        clearInterval(timeInterval);
        
        timeInterval = setInterval(() => {
            if (subtitlesEnabled) {
                currentTime += 0.1;
                updateSubtitles();
            }
        }, 100);
    }
    
    function stopTimeSimulation() {
        clearInterval(timeInterval);
        overlay.style.display = 'none';
        currentSubtitleIndex = -1;
    }
    
    function updateSubtitles() {
        if (!subtitlesEnabled) return;
        
        // Find current subtitle
        const newSubtitleIndex = subtitles.findIndex(sub => 
            currentTime >= sub.start && currentTime <= sub.end
        );
        
        if (newSubtitleIndex !== currentSubtitleIndex) {
            currentSubtitleIndex = newSubtitleIndex;
            
            if (currentSubtitleIndex !== -1) {
                overlay.textContent = subtitles[currentSubtitleIndex].text;
                overlay.style.display = 'block';
            } else {
                overlay.style.display = 'none';
            }
        }
    }
    
    // Manual time control buttons
    const controls = document.querySelector('.subtitle-controls');
    if (controls) {
        const timeControls = document.createElement('div');
        timeControls.style.marginTop = '10px';
        timeControls.style.display = 'flex';
        timeControls.style.gap = '5px';
        timeControls.style.alignItems = 'center';
        timeControls.style.flexWrap = 'wrap';
        
        timeControls.innerHTML = `
            <button id="rewindBtn" style="padding: 5px 10px; background: #00ccff; color: black; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">
                <i class="fas fa-backward"></i> 10s
            </button>
            <button id="forwardBtn" style="padding: 5px 10px; background: #00ccff; color: black; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">
                <i class="fas fa-forward"></i> 10s
            </button>
            <span style="font-size: 11px; color: #aaa;">Time: <span id="currentTime" style="color: #00ff88;">0:00</span></span>
        `;
        
        controls.appendChild(timeControls);
        
        // Time control handlers
        document.getElementById('rewindBtn').addEventListener('click', () => {
            currentTime = Math.max(0, currentTime - 10);
            updateSubtitles();
            updateTimeDisplay();
        });
        
        document.getElementById('forwardBtn').addEventListener('click', () => {
            currentTime += 10;
            updateSubtitles();
            updateTimeDisplay();
        });
        
        function updateTimeDisplay() {
            const minutes = Math.floor(currentTime / 60);
            const seconds = Math.floor(currentTime % 60);
            const timeDisplay = document.getElementById('currentTime');
            if (timeDisplay) {
                timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }
    
    console.log('Subtitle player setup completed');
}

// Manual subtitle controls as fallback
function setupManualSubtitleControls() {
    console.log('Setting up manual subtitle controls');
    const subtitleControls = document.querySelector('.subtitle-controls');
    
    if (subtitleControls) {
        subtitleControls.innerHTML += `
            <div style="margin-top: 10px; color: #ff4444; font-size: 12px;">
                <i class="fas fa-exclamation-triangle"></i> Subtitles failed to load
            </div>
        `;
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
            
            <h3>Subtitle Support</h3>
            <p>Built-in subtitle system with synchronized timing and manual controls for the best viewing experience.</p>
            
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
            
            <h3>Subtitle Support</h3>
            <p>Use the subtitle controls below the video player to enable Turkish subtitles and adjust timing if needed.</p>
            
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

// Add CSS for loading spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
