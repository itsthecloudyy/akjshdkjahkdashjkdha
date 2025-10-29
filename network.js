// Network background animation with performance optimizations
let animationId = null;
let nodes = [];
let lines = [];
let isAnimating = false;

function initNetworkBackground() {
    const background = document.getElementById('networkBackground');
    
    // Clear any existing nodes
    background.innerHTML = '';
    nodes = [];
    lines = [];
    
    // Adaptive settings based on device performance
    const isSlowDevice = window.innerWidth < 768 || 
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const nodeCount = isSlowDevice ? 12 : 18;
    const maxDistance = isSlowDevice ? 120 : 180;
    const animationSpeed = isSlowDevice ? 0.15 : 0.25;
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
        const node = document.createElement('div');
        node.classList.add('node');
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        
        // Fewer pulsing nodes on slow devices
        if (Math.random() > (isSlowDevice ? 0.85 : 0.75)) {
            node.classList.add('pulse');
        }
        
        background.appendChild(node);
        nodes.push({ 
            element: node, 
            x: x, 
            y: y,
            vx: (Math.random() - 0.5) * animationSpeed,
            vy: (Math.random() - 0.5) * animationSpeed
        });
    }
    
    // Create lines between nearby nodes (optimized)
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
            if (dist < maxDistance) {
                const line = document.createElement('div');
                line.classList.add('line');
                background.appendChild(line);
                lines.push({ 
                    element: line, 
                    from: i, 
                    to: j,
                    maxDistance: maxDistance
                });
            }
        }
    }
    
    // Start optimized animation
    startNetworkAnimation(isSlowDevice);
}

function startNetworkAnimation(isSlowDevice) {
    if (isAnimating) return;
    
    isAnimating = true;
    let lastTime = 0;
    const fps = isSlowDevice ? 20 : 30; // Even lower FPS for better performance
    const interval = 1000 / fps;
    let frameCount = 0;
    
    function update(currentTime) {
        if (!lastTime || currentTime - lastTime >= interval) {
            lastTime = currentTime;
            frameCount++;
            
            // Update nodes position (batched for performance)
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                node.x += node.vx;
                node.y += node.vy;
                
                // Bounce off edges
                if (node.x < 0 || node.x > window.innerWidth) node.vx *= -1;
                if (node.y < 0 || node.y > window.innerHeight) node.vy *= -1;
                
                // Keep within bounds
                node.x = Math.max(0, Math.min(window.innerWidth, node.x));
                node.y = Math.max(0, Math.min(window.innerHeight, node.y));
            }
            
            // Update DOM in batches (every 2 frames for lines, every frame for nodes)
            if (frameCount % 2 === 0) {
                updateNodePositions();
                updateLinePositions();
            } else {
                updateNodePositions();
            }
        }
        
        animationId = requestAnimationFrame(update);
    }
    
    function updateNodePositions() {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            node.element.style.left = node.x + 'px';
            node.element.style.top = node.y + 'px';
        }
    }
    
    function updateLinePositions() {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const from = nodes[line.from];
            const to = nodes[line.to];
            
            const x1 = from.x + 2;
            const y1 = from.y + 2;
            const x2 = to.x + 2;
            const y2 = to.y + 2;
            
            const dist = Math.hypot(x2 - x1, y2 - y1);
            const length = dist;
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            
            const opacity = Math.max(0, 1 - dist / line.maxDistance) * 0.3;
            
            line.element.style.width = length + 'px';
            line.element.style.transform = 'rotate(' + angle + 'deg)';
            line.element.style.left = x1 + 'px';
            line.element.style.top = y1 + 'px';
            line.element.style.opacity = opacity;
        }
    }
    
    animationId = requestAnimationFrame(update);
}

function stopNetworkAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    isAnimating = false;
}

function pauseNetworkAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function resumeNetworkAnimation() {
    if (!animationId && isAnimating) {
        const isSlowDevice = window.innerWidth < 768;
        startNetworkAnimation(isSlowDevice);
    }
}

// Initialize network background when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (!isMobileDevice()) {
        // Delay initialization to prioritize page content
        setTimeout(() => {
            initNetworkBackground();
        }, 1000);
    }
});

// Optimize performance based on page activity
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, pause animation to save resources
        pauseNetworkAnimation();
        
        // Reduce network background opacity
        const background = document.getElementById('networkBackground');
        if (background) {
            background.style.opacity = '0.1';
        }
    } else {
        // Page is visible, resume animation
        resumeNetworkAnimation();
        
        // Restore network background opacity
        const background = document.getElementById('networkBackground');
        if (background) {
            background.style.opacity = '0.4';
        }
    }
});

// Adjust animation based on page focus
window.addEventListener('focus', function() {
    const background = document.getElementById('networkBackground');
    if (background) {
        background.style.opacity = '0.4';
    }
});

window.addEventListener('blur', function() {
    const background = document.getElementById('networkBackground');
    if (background) {
        background.style.opacity = '0.2';
    }
});

// Handle resize efficiently
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        if (isAnimating) {
            stopNetworkAnimation();
            initNetworkBackground();
        }
    }, 250);
});

// Reduce animation intensity when videos are playing
function reduceAnimationIntensity() {
    const background = document.getElementById('networkBackground');
    if (background) {
        background.style.opacity = '0.2';
        
        // Slow down animation
        nodes.forEach(node => {
            node.vx *= 0.5;
            node.vy *= 0.5;
        });
    }
}

function restoreAnimationIntensity() {
    const background = document.getElementById('networkBackground');
    if (background) {
        background.style.opacity = '0.4';
        
        // Restore animation speed
        const isSlowDevice = window.innerWidth < 768;
        const animationSpeed = isSlowDevice ? 0.15 : 0.25;
        
        nodes.forEach(node => {
            node.vx = (Math.random() - 0.5) * animationSpeed;
            node.vy = (Math.random() - 0.5) * animationSpeed;
        });
    }
}

// Device detection function
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && window.innerHeight <= 1024);
}

// Export functions for use in other scripts
window.NetworkAnimation = {
    reduceIntensity: reduceAnimationIntensity,
    restoreIntensity: restoreAnimationIntensity,
    pause: pauseNetworkAnimation,
    resume: resumeNetworkAnimation
};
