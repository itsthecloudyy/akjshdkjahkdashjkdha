// Network background animation with performance optimizations
class NetworkBackground {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.nodes = [];
        this.connections = [];
        this.mouse = { x: 0, y: 0, radius: 150 };
        this.animationId = null;
        this.isAnimating = false;
        
        // Performance settings
        this.maxNodes = 50;
        this.maxConnections = 3;
        this.connectionDistance = 150;
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.createNodes();
        this.bindEvents();
        this.startAnimation();
    }

    createCanvas() {
        this.canvas = document.getElementById('networkBackground');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'networkBackground';
            this.canvas.className = 'background';
            document.body.appendChild(this.canvas);
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createNodes() {
        this.nodes = [];
        const nodeCount = Math.min(this.maxNodes, Math.floor((window.innerWidth * window.innerHeight) / 20000));
        
        for (let i = 0; i < nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                baseColor: Math.random() * 60 + 160 // Green-cyan colors
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createNodes();
        });

        // Mouse move with throttling for performance
        let mouseMoveTimeout;
        window.addEventListener('mousemove', (e) => {
            if (!mouseMoveTimeout) {
                mouseMoveTimeout = setTimeout(() => {
                    this.mouse.x = e.clientX;
                    this.mouse.y = e.clientY;
                    mouseMoveTimeout = null;
                }, 16); // ~60fps
            }
        });

        // Mouse leave
        window.addEventListener('mouseleave', () => {
            this.mouse.x = 0;
            this.mouse.y = 0;
        });
    }

    startAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.animate();
    }

    stopAnimation() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    animate() {
        if (!this.isAnimating) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        this.update();
        this.draw();
    }

    update() {
        // Update node positions
        this.nodes.forEach(node => {
            // Move node
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off walls with some randomness
            if (node.x <= 0 || node.x >= this.canvas.width) {
                node.vx *= -1;
                node.x = Math.max(0, Math.min(this.canvas.width, node.x));
            }
            if (node.y <= 0 || node.y >= this.canvas.height) {
                node.vy *= -1;
                node.y = Math.max(0, Math.min(this.canvas.height, node.y));
            }
            
            // Mouse interaction
            if (this.mouse.x !== 0 && this.mouse.y !== 0) {
                const dx = node.x - this.mouse.x;
                const dy = node.y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    
                    node.vx += Math.cos(angle) * force * 0.5;
                    node.vy += Math.sin(angle) * force * 0.5;
                }
            }
            
            // Apply friction
            node.vx *= 0.99;
            node.vy *= 0.99;
            
            // Limit velocity
            const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
            const maxSpeed = 2;
            if (speed > maxSpeed) {
                node.vx = (node.vx / speed) * maxSpeed;
                node.vy = (node.vy / speed) * maxSpeed;
            }
        });
    }

    draw() {
        // Clear canvas with semi-transparent background for trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections
        this.drawConnections();
        
        // Draw nodes
        this.drawNodes();
    }

    drawConnections() {
        this.connections = [];
        
        for (let i = 0; i < this.nodes.length; i++) {
            const nodeA = this.nodes[i];
            let connectionCount = 0;
            
            for (let j = i + 1; j < this.nodes.length && connectionCount < this.maxConnections; j++) {
                const nodeB = this.nodes[j];
                const dx = nodeA.x - nodeB.x;
                const dy = nodeA.y - nodeB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.connectionDistance) {
                    const opacity = 1 - (distance / this.connectionDistance);
                    
                    // Create gradient for connection line
                    const gradient = this.ctx.createLinearGradient(
                        nodeA.x, nodeA.y, nodeB.x, nodeB.y
                    );
                    
                    gradient.addColorStop(0, `rgba(0, 255, 136, ${opacity * 0.3})`);
                    gradient.addColorStop(1, `rgba(0, 204, 255, ${opacity * 0.3})`);
                    
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 0.5;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(nodeA.x, nodeA.y);
                    this.ctx.lineTo(nodeB.x, nodeB.y);
                    this.ctx.stroke();
                    
                    connectionCount++;
                    this.connections.push({ nodeA, nodeB, opacity });
                }
            }
        }
    }

    drawNodes() {
        this.nodes.forEach(node => {
            // Create radial gradient for node glow
            const gradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius * 3
            );
            
            gradient.addColorStop(0, `hsla(${node.baseColor}, 100%, 50%, 0.8)`);
            gradient.addColorStop(1, `hsla(${node.baseColor}, 100%, 50%, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Node core
            this.ctx.fillStyle = `hsl(${node.baseColor}, 100%, 60%)`;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    // Public method to adjust animation intensity based on performance
    adjustPerformance(level) {
        switch(level) {
            case 'low':
                this.maxNodes = 25;
                this.connectionDistance = 100;
                break;
            case 'medium':
                this.maxNodes = 50;
                this.connectionDistance = 150;
                break;
            case 'high':
                this.maxNodes = 80;
                this.connectionDistance = 200;
                break;
        }
        
        // Recreate nodes with new settings
        this.createNodes();
    }
}

// Initialize network background
function initNetworkBackground() {
    try {
        const network = new NetworkBackground();
        
        // Adjust performance based on device capabilities
        if (window.innerWidth < 768) {
            network.adjustPerformance('low');
        } else {
            network.adjustPerformance('medium');
        }
        
        return network;
    } catch (error) {
        console.warn('Network background initialization failed:', error);
        return null;
    }
}

// Performance monitoring for background animation
function monitorBackgroundPerformance() {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;
    
    function checkPerformance() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
            fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            frameCount = 0;
            lastTime = currentTime;
            
            // Adjust background complexity based on FPS
            const background = document.getElementById('networkBackground');
            if (background && fps < 30) {
                background.style.opacity = '0.1';
            }
        }
        
        requestAnimationFrame(checkPerformance);
    }
    
    checkPerformance();
}

// Start performance monitoring when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(monitorBackgroundPerformance, 3000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NetworkBackground, initNetworkBackground };
}
