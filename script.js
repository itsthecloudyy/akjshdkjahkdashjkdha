// Lazy load main video with subtitle support
function lazyLoadMainVideo() {
    console.log('Loading main video');
    const videoWrapper = document.querySelector('#videoPage .video-wrapper');
    if (!videoWrapper) return;
    
    const existingFrame = videoWrapper.querySelector('.video-frame');
    
    // Only load if not already loaded
    if (!existingFrame || !existingFrame.src) {
        // Clear existing content
        videoWrapper.innerHTML = '';
        
        // Create video container with subtitle support
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-with-subtitles';
        videoContainer.style.position = 'relative';
        videoContainer.style.width = '100%';
        videoContainer.style.height = '100%';
        
        // Google Drive iframe
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
        iframe.style.zIndex = '1';
        
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
        
        subtitleControls.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <button id="toggleSubtitles" style="padding: 5px 10px; background: #00ff88; color: black; border: none; border-radius: 3px; cursor: pointer;">
                    <i class="fas fa-closed-captioning"></i> Altyazıları Aç
                </button>
                <span id="subtitleStatus" style="font-size: 12px;">Kapalı</span>
            </div>
        `;
        
        videoContainer.appendChild(iframe);
        videoContainer.appendChild(subtitleOverlay);
        videoContainer.appendChild(subtitleControls);
        videoWrapper.appendChild(videoContainer);
        
        // Load external subtitle file
        loadExternalSubtitles();
        
        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'video-loading';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading Google Drive player and Turkish subtitles...</p>
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
    }
}

// External subtitle loader
function loadExternalSubtitles() {
    const subtitleUrl = 'https://raw.githubusercontent.com/itsthecloudyy/cdn/refs/heads/main/Dead.Poets.Society.1989.1080p.BluRay.X264-AMIABLE%20YIFY-Turkish.srt';
    
    console.log('Loading subtitles from:', subtitleUrl);
    
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
    const overlay = document.getElementById('subtitleOverlay');
    const toggleBtn = document.getElementById('toggleSubtitles');
    const statusSpan = document.getElementById('subtitleStatus');
    
    let currentSubtitleIndex = -1;
    let subtitlesEnabled = false;
    let currentTime = 0;
    let timeInterval;
    
    // Toggle subtitle visibility
    toggleBtn.addEventListener('click', () => {
        subtitlesEnabled = !subtitlesEnabled;
        
        if (subtitlesEnabled) {
            statusSpan.textContent = 'Açık';
            toggleBtn.innerHTML = '<i class="fas fa-closed-captioning"></i> Altyazıları Kapat';
            toggleBtn.style.background = '#ff4444';
            overlay.style.display = 'block';
            startTimeSimulation();
        } else {
            statusSpan.textContent = 'Kapalı';
            toggleBtn.innerHTML = '<i class="fas fa-closed-captioning"></i> Altyazıları Aç';
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
    const timeControls = document.createElement('div');
    timeControls.style.marginTop = '10px';
    timeControls.style.display = 'flex';
    timeControls.style.gap = '5px';
    timeControls.style.alignItems = 'center';
    
    timeControls.innerHTML = `
        <button id="rewindBtn" style="padding: 3px 8px; background: #00ccff; border: none; border-radius: 3px; cursor: pointer;">
            <i class="fas fa-backward"></i> 10s
        </button>
        <button id="forwardBtn" style="padding: 3px 8px; background: #00ccff; border: none; border-radius: 3px; cursor: pointer;">
            <i class="fas fa-forward"></i> 10s
        </button>
        <span style="font-size: 11px; color: #aaa;">Time: <span id="currentTime">0:00</span></span>
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
        document.getElementById('currentTime').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    console.log('Subtitle player setup completed');
}

// Manual subtitle controls as fallback
function setupManualSubtitleControls() {
    const subtitleControls = document.querySelector('.subtitle-controls');
    
    subtitleControls.innerHTML += `
        <div style="margin-top: 10px; color: #ff4444; font-size: 12px;">
            <i class="fas fa-exclamation-triangle"></i> Altyazılar yüklenemedi
        </div>
    `;
}
