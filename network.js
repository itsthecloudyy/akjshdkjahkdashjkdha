// Network background animation
function initNetworkBackground() {
    const nodes = [];
    const lines = [];
    const background = document.getElementById('networkBackground');
    const nodeCount = 20;
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
        const node = document.createElement('div');
        node.classList.add('node');
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        
        if (Math.random() > 0.7) {
            node.classList.add('pulse');
        }
        
        background.appendChild(node);
        nodes.push({ 
            element: node, 
            x: x, 
            y: y,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3
        });
    }
    
    // Create lines between nearby nodes
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
            if (dist < 180) {
                const line = document.createElement('div');
                line.classList.add('line');
                background.appendChild(line);
                lines.push({ element: line, from: i, to: j });
            }
        }
    }
    
    // Start animation
    animateNetwork(nodes, lines);
}

function animateNetwork(nodes, lines) {
    nodes.forEach(function(node) {
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off edges
        if (node.x < 0 || node.x > window.innerWidth) node.vx *= -1;
        if (node.y < 0 || node.y > window.innerHeight) node.vy *= -1;
        
        // Keep within bounds
        node.x = Math.max(0, Math.min(window.innerWidth, node.x));
        node.y = Math.max(0, Math.min(window.innerHeight, node.y));
        
        // Update position
        node.element.style.left = node.x + 'px';
        node.element.style.top = node.y + 'px';
    });
    
    // Update lines
    lines.forEach(function(line) {
        const from = nodes[line.from];
        const to = nodes[line.to];
        
        const x1 = from.x + 2;
        const y1 = from.y + 2;
        const x2 = to.x + 2;
        const y2 = to.y + 2;
        
        const dist = Math.hypot(x2 - x1, y2 - y1);
        const length = dist;
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        
        const opacity = Math.max(0, 1 - dist / 200) * 0.4;
        
        line.element.style.width = length + 'px';
        line.element.style.transform = 'rotate(' + angle + 'deg)';
        line.element.style.left = x1 + 'px';
        line.element.style.top = y1 + 'px';
        line.element.style.opacity = opacity;
    });
    
    requestAnimationFrame(() => animateNetwork(nodes, lines));
}

// Initialize network background when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initNetworkBackground();
});
