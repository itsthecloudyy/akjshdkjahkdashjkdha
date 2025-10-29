// Device detection
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && window.innerHeight <= 1024);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if mobile device
    if (isMobileDevice()) {
        const mobileWarning = document.getElementById('mobileWarning');
        mobileWarning.classList.add('active');
        
        // Proceed anyway button
        document.getElementById('proceedAnyway').addEventListener('click', function() {
            mobileWarning.classList.remove('active');
            initializeApp();
        });
    } else {
        initializeApp();
    }
});

function initializeApp() {
    // Initialize navigation
    initNavigation();
    
    // Initialize documentation system
    initDocumentation();
    
    // Initialize intro animation
    initIntroAnimation();
}

// Multi-Player Selector
class MultiPlayerSelector {
    constructor() {
        this.playerOptions = document.querySelectorAll('.player-option');
        this.videoFrames = document.querySelectorAll('.video-frame');
        this.playerStatus = document.querySelector('.player-status');
        this.mixdropWarning = document.getElementById('mixdropWarning');
        
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
        // Update player options
        this.playerOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.player === playerId);
        });
        
        // Update video frames - hide all, then show active
        this.videoFrames.forEach(frame => {
            frame.classList.remove('active');
        });
        
        const activeFrame = document.getElementById(playerId + 'Player');
        if (activeFrame) {
            activeFrame.classList.add('active');
        }
        
        // Show/hide MixDrop warning
        if (playerId === 'mixdrop') {
            this.mixdropWarning.classList.add('active');
        } else {
            this.mixdropWarning.classList.remove('active');
        }
        
        // Update status message
        this.updatePlayerStatus(playerId);
    }
    
    updatePlayerStatus(playerId) {
        const statusMessages = {
            'doodstream': 'DoodStream - Fast streaming with Turkish subtitles',
            'filemoon': 'FileMoon - Modern player with Turkish subtitles',
            'mixdrop': 'MixDrop - Clean interface (manual subtitle upload required)'
        };
        
        this.playerStatus.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>Current: ${statusMessages[playerId]}</span>
        `;
    }
}

// Navigation system
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    let multiPlayer = null;
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Update active nav link
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page
            pageContents.forEach(page => page.classList.remove('active'));
            document.getElementById(targetPage + 'Page').classList.add('active');
            
            // Initialize multi-player when backup page is loaded
            if (targetPage === 'backup' && !multiPlayer) {
                setTimeout(() => {
                    multiPlayer = new MultiPlayerSelector();
                }, 100);
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
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

    loadDocsContent('about');
}

function loadDocsContent(subpage) {
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

    document.getElementById('docsContent').innerHTML = content[subpage] || content['about'];
}

// Intro animation system
function initIntroAnimation() {
    const intro = document.getElementById('introScreen');
    const statusContainer = document.getElementById('statusContainer');
    const header = document.getElementById('mainHeader');
    const background = document.getElementById('networkBackground');

    background.classList.add('active');

    const hasSeenIntro = sessionStorage.getItem('introPlayed') === 'true';

    if (!hasSeenIntro) {
        setTimeout(() => {
            statusContainer.classList.add('visible');
            setTimeout(() => {
                intro.classList.add('hidden');
                header.classList.add('active');
                background.classList.add('active'); 
                sessionStorage.setItem('introPlayed', 'true');
            }, 1000);
        }, 2000);
    } else {
        intro.classList.add('hidden');
        header.classList.add('active');
        background.classList.add('active');
    }
}
