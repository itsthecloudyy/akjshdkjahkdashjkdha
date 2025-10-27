<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$page = isset($_GET['page']) ? $_GET['page'] : 'home';
$subpage = isset($_GET['subpage']) ? $_GET['subpage'] : 'getting-started';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scope Executor</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Roboto Mono', monospace; }
        body { background: #000000; color: #ffffff; min-height: 100vh; overflow-x: hidden; line-height: 1.6; }
        .background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; opacity: 0; transition: opacity 1s ease; }
        .background.active { opacity: 0.4; }
        .node { position: absolute; width: 4px; height: 4px; background: #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(255, 255, 255, 0.4); transition: all 0.3s ease; }
        .node.pulse { animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.6; } }
        .line { position: absolute; height: 1px; background: linear-gradient(90deg, transparent, #aaaaaa, transparent); opacity: 0.3; transform-origin: left center; transition: opacity 0.3s ease; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .header { border: 1px solid hsl(0deg 0% 100% / 12%);
            border-radius: 6px; position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.8); border-radius: 50px; padding: 10px 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); z-index: 100; opacity: 0; transition: opacity 0.5s ease; backdrop-filter: blur(10px); }
        .header.active { opacity: 1; }
        .navbar { display: flex; justify-content: center; align-items: center; }
        .nav-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.4rem;
            font-weight: 700;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-right: 2rem;
            padding: 4px 8px;
            }

            .nav-brand i {
            font-size: 1.6rem;
            color: #cccccc;
            }
        .nav-menu { display: flex; list-style: none; gap: 2.5rem;             border: 1px solid hsl(0deg 0% 100% / 12%);
            border-radius: 6px; }
        .nav-menu a { color: #aaaaaa; text-decoration: none; padding: 0.6rem 1.2rem; border: 1px solid transparent; transition: all 0.3s ease; font-size: 1rem; display: flex; align-items: center; gap: 8px; border-radius: 4px; }
        .nav-menu a:hover, .nav-menu a.active { color: #ffffff; border: 1px solid #ffffff; }
        .main-content { padding: 100px 0 3rem; min-height: 100vh; }
        .intro { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 50; background: #000000; transition: opacity 1s ease; }
        .intro.hidden { opacity: 0; pointer-events: none; }
        .typewriter { font-size: 4rem; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; border-right: 3px solid #ffffff; width: 0; animation: typing 2s steps(14) forwards, blink 0.75s step-end infinite; }
        @keyframes typing { from { width: 0; } to { width: 14ch; } }
        @keyframes blink { 50% { border-color: transparent; } }
        .status-container { display: flex; align-items: center; gap: 10px; margin-top: 20px; opacity: 0; transition: opacity 0.5s ease 2.5s; }
        .status-container.visible { opacity: 1; }
        .status-icon { font-size: 1.5rem; color: #ff0000; animation: blink-icon 1.5s infinite; }
        @keyframes blink-icon { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .status-text { font-size: 1.2rem; color: #aaaaaa; }
        .scroll-arrow { position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); font-size: 2rem; color: #ffffff; animation: bounce 2s infinite; opacity: 0; transition: opacity 0.5s ease; z-index: 10; cursor: pointer; }
        .scroll-arrow.visible { opacity: 1; }
        @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); } 40% { transform: translateX(-50%) translateY(-10px); } 60% { transform: translateX(-50%) translateY(-5px); } }
        .hero { text-align: center; padding: 20rem 0; margin-bottom: 4rem; }
        .hero-home { text-align: center; padding: 20rem 0; margin-bottom: 4rem; }
        .hero-download { text-align: center; padding: 1rem 0; margin-bottom: 4rem; }
        .hero-docs { text-align: center; padding: 4rem 0; margin-bottom: 4rem; }
        .hero-dashboard { text-align: center; padding: 5rem 0; margin-bottom: 4rem; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 1.2rem; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 2px; }
        .tagline { color: #888888; font-size: 1.3rem; margin-bottom: 2.5rem; }
        .btn-group { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; }
        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; text-decoration: none; border: 1px solid #ffffff; color: #ffffff; background: transparent; transition: all 0.3s ease; font-size: 1rem; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #ffffff; color: #000000; box-shadow: 0 0 15px rgba(255, 255, 255, 0.3); transform: translateY(-2px); }
        .section { margin-bottom: 6rem; }
        .section h2 { font-size: 2.5rem; margin-bottom: 2rem; text-align: center; color: #ffffff; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2.5rem; }
        .feature-card { border: 1px solid #333333; padding: 2.5rem; background: #111111; border-radius: 8px; transition: all 0.3s ease; text-align: center; }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3); border-color: #555555; }
        .feature-card i { font-size: 3rem; color: #cccccc; margin-bottom: 1rem; }
        .feature-card h3 { margin-bottom: 1.2rem; font-size: 1.3rem; color: #ffffff; }
        .feature-card p { color: #888888; font-size: 1rem; }
        .dashboard-preview { background: #111111; border: 1px solid #333333; border-radius: 8px; padding: 2.5rem; text-align: center; }
        .dashboard-preview img { max-width: 100%; border-radius: 8px; margin-bottom: 1.5rem; }
        .roadmap { display: flex; flex-direction: column; gap: 2rem; }
        .roadmap-item { background: #111111; border: 1px solid #333333; padding: 1.5rem; border-radius: 8px; display: flex; align-items: center; gap: 1.5rem; transition: all 0.3s ease; }
        .roadmap-item:hover { border-color: #555555; transform: translateX(5px); }
        .roadmap-item i { font-size: 2rem; color: #cccccc; min-width: 40px; }
        .roadmap-item h3 { font-size: 1.2rem; color: #ffffff; margin-bottom: 0.5rem; }
        .roadmap-item p { color: #888888; margin: 0; }
        .download-section { background: #000000ff; border: 1px solid #000000ff; border-radius: 8px; padding: 2.5rem; display: flex; justify-content: center; align-items: center; flex-direction: column; }
        .download-card { display: flex; flex-direction: column; align-items: center; background: #000000ff; border-radius: 8px; padding: 2.5rem 2rem 2rem 2rem; box-shadow: 0 2px 16px rgba(0,0,0,0.2); width: 100%; max-width: 400px; }
        .download-card i { font-size: 3rem; color: #cccccc; margin-bottom: 1rem; }
        .download-card h3 { margin-bottom: 1.2rem; font-size: 1.3rem; color: #ffffff; }
        .download-card p { color: #888888; font-size: 1rem; margin-bottom: 1.5rem; text-align: center; }
        .file-list { margin-bottom: 2rem; width: 100%; }
        .file-item { color: #aaa; font-size: 1rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px; }
        .download-card .btn { margin-top: 1.5rem; width: 100%; justify-content: center; }
        .docs-layout { background: #111111; border: 1px solid #333333; border-radius: 8px; padding: 2.5rem; display: flex; gap: 2.5rem; }
        .docs-sidebar { min-width: 220px; }
        .docs-nav { list-style: none; padding: 0; }
        .docs-nav li { margin-bottom: 1.2rem; }
        .docs-nav a { color: #aaaaaa; text-decoration: none; padding: 0.6rem 1.2rem; border-radius: 4px; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; }
        .docs-nav a.active, .docs-nav a:hover { color: #ffffff; background: #222; }
        .docs-content { flex: 1; }
        .docs-content h2 { font-size: 2rem; margin-bottom: 1.5rem; color: #ffffff; }
        .docs-content h3 { font-size: 1.4rem; margin-top: 2rem; margin-bottom: 1rem; color: #ffffff; }
        .docs-content h4 { font-size: 1.1rem; margin-top: 1.5rem; margin-bottom: 0.8rem; color: #cccccc; }
        .docs-content p { color: #aaaaaa; margin-bottom: 1.2rem; line-height: 1.8; }
        .docs-content ul { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .docs-content ul li { color: #aaaaaa; margin-bottom: 0.8rem; line-height: 1.8; }
        .docs-content code { background: #222222; padding: 3px 6px; border-radius: 4px; color: #00ff88; font-size: 0.9rem; }
        .code-block { position: relative; margin: 1.5rem 0; background: #1a1a1a; border: 1px solid #333; border-radius: 6px; overflow: hidden; }
        .code-block pre { margin: 0; padding: 1.5rem; overflow-x: auto; }
        .code-block code { background: transparent; padding: 0; display: block; color: #ffffff; white-space: pre; }
        .code-block .copy-btn { position: absolute; top: 10px; right: 10px; background: #333333; color: #ffffff; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-size: 0.85rem; transition: all 0.3s ease; }
        .code-block .copy-btn:hover { background: #555555; }
        .note { background: #1a1a2e; border-left: 4px solid #4a90e2; padding: 1rem 1.5rem; margin: 1.5rem 0; border-radius: 4px; }
        .note p { margin: 0; color: #aaaaaa; }
        .warning { background: #2e1a1a; border-left: 4px solid #e24a4a; padding: 1rem 1.5rem; margin: 1.5rem 0; border-radius: 4px; }
        .warning p { margin: 0; color: #aaaaaa; }
        .footer { border-top: 1px solid #333333; padding: 2.5rem 0; text-align: center; color: #666666; font-size: 1rem; }
        @media (max-width: 768px) {
            .hero { padding: 15rem 0; }
            .hero h1 { font-size: 2.5rem; }
            .typewriter { font-size: 2.5rem; }
            .docs-layout { flex-direction: column; gap: 1.5rem; }
            .docs-sidebar { min-width: 0; }
            .nav-menu { gap: 1rem; }
        }
    </style>
</head>
<body>
    <div class="intro">
        <div class="typewriter">Scope Executor</div>
        <div class="status-container">
            <i class="fas fa-crosshairs status-icon"></i>
            <span class="status-text">Coming Soon (Not Released)</span>
        </div>
    </div>
    <div class="background" id="networkBackground"></div>
    <header class="header">
        <div class="navbar">
            <div class="nav-brand">
                <i class="fas fa-crosshairs"></i>
                <span>Scope</span>
            </div>
            <ul class="nav-menu">
                <li><a href="?page=home" class="<?php echo ($page === 'home' ? 'active' : ''); ?>"><i class="fas fa-home"></i> Home</a></li>
                <li><a href="?page=download" class="<?php echo ($page === 'download' ? 'active' : ''); ?>"><i class="fas fa-download"></i> Download</a></li>
                <li><a href="?page=docs&subpage=getting-started" class="<?php echo ($page === 'docs' ? 'active' : ''); ?>"><i class="fas fa-book"></i> Docs</a></li>
                <li><a href="?page=dashboard" class="<?php echo ($page === 'dashboard' ? 'active' : ''); ?>"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
            </ul>
        </div>
    </header>
    <i class="fas fa-arrow-down scroll-arrow"></i>
    <main class="main-content">
        <div class="container">
            <?php if ($page === 'home'): ?>
                <section class="hero section">
                    <h1>Improve Your Scripting</h1>
                    <p class="tagline">Basic Roblox luau external executor.</p>
                    <div class="btn-group">
                        <a href="?page=download" class="btn"><i class="fas fa-download"></i> Get Early Access</a>
                        <a href="?page=docs" class="btn"><i class="fas fa-book"></i> Learn More</a>
                    </div>
                </section>
                <section class="section">
                    <h2>Why Choose Scope?</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <i class="fas fa-shield-alt"></i>
                            <h3>Secure Execution</h3>
                            <p>Run scripts externally with advanced protection and memory isolation.</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-bolt"></i>
                            <h3>High Performance</h3>
                            <p>Optimized Luau runtime for fast execution and low latency.</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-tools"></i>
                            <h3>Developer Tools</h3>
                            <p>Comprehensive documentation for our API.</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-plug"></i>
                            <h3>Extensible API</h3>
                            <p>Build custom integrations with our comprehensive SDK.</p>
                        </div>
                    </div>
                </section>
                <section class="section">
                    <h2>Roadmap</h2>
                    <div class="roadmap">
                        <div class="roadmap-item">
                            <i class="fas fa-check"></i>
                            <div>
                                <h3>Q4 2025: Beta Release</h3>
                                <p>Launch of the UI and the API with core functionality.</p>
                            </div>
                        </div>
                        <div class="roadmap-item">
                            <i class="fas fa-hourglass-half"></i>
                            <div>
                                <h3>Q1 2026: Advanced Debugging</h3>
                                <p>Add breakpoint support and variable inspection tools.</p>
                            </div>
                        </div>
                        <div class="roadmap-item">
                            <i class="fas fa-hourglass-start"></i>
                            <div>
                                <h3>Q2 2026: Multi-Process Support</h3>
                                <p>Simultaneous attachment to multiple target processes.</p>
                            </div>
                        </div>
                    </div>
                </section>
            <?php elseif ($page === 'download'): ?>
                <section class="hero-download">
                    <h1>Early Access Downloads</h1>
                    <p class="tagline">Join the beta program (coming soon)</p>
                </section>
                <div class="download-section section">
                    <div class="download-card">
                        <i class="fas fa-file-code"></i>
                        <h3>Scope Executor Beta</h3>
                        <p>Full installer with editor and runtime.</p>
                        <div class="file-list">
                            <div class="file-item"><i class="fas fa-file"></i> scope.exe (~30 MB)</div>
                            <div class="file-item"><i class="fas fa-tag"></i> Beta v0.1</div>
                            <div class="file-item"><i class="fas fa-desktop"></i> Windows x64</div>
                        </div>
                        <a href="#" class="btn" onclick="alert('Not released yet'); return false;"><i class="fas fa-download"></i> Download (Soon)</a>
                    </div>
                </div>
            <?php elseif ($page === 'docs'): ?>
                <section class="hero-docs">
                    <h1>Comprehensive Documentation</h1>
                    <p class="tagline">Everything you need to master Scope Executor</p>
                </section>
                <div class="docs-layout">
                    <aside class="docs-sidebar">
                        <ul class="docs-nav">
                            <li><a href="?page=docs&subpage=getting-started" class="<?php echo ($subpage === 'getting-started' ? 'active' : ''); ?>"><i class="fas fa-rocket"></i> Getting Started</a></li>
                            <li><a href="?page=docs&subpage=interface" class="<?php echo ($subpage === 'interface' ? 'active' : ''); ?>"><i class="fas fa-desktop"></i> User Interface</a></li>
                            <li><a href="?page=docs&subpage=luau" class="<?php echo ($subpage === 'luau' ? 'active' : ''); ?>"><i class="fas fa-code"></i> Luau Language</a></li>
                            <li><a href="?page=docs&subpage=api" class="<?php echo ($subpage === 'api' ? 'active' : ''); ?>"><i class="fas fa-plug"></i> API Reference</a></li>
                            <li><a href="?page=docs&subpage=advanced" class="<?php echo ($subpage === 'advanced' ? 'active' : ''); ?>"><i class="fas fa-cog"></i> Advanced Topics</a></li>
                        </ul>
                    </aside>
                    <article class="docs-content">
                        <?php if ($subpage === 'getting-started'): ?>
                            <h2>Getting Started</h2>
                            <p>Welcome to Scope Executor! This guide will help you get up and running with your first script execution.</p>
                            
                            <h3>Prerequisites</h3>
                            <ul>
                                <li><strong>Operating System:</strong> Windows 10 or later (64-bit)</li>
                                <li><strong>Target Process:</strong> Roblox Player (RobloxPlayerBeta.exe)</li>
                                <li><strong>Permissions:</strong> Administrator rights may be required</li>
                                <li><strong>Antivirus:</strong> You may need to whitelist Scope Executor</li>
                            </ul>

                            <h3>Installation Steps</h3>
                            <p>Once the beta is released, follow these steps to install Scope Executor:</p>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>1. Download scope.exe from the Downloads page
2. Run the installer as Administrator
3. Follow the installation wizard
4. Launch Scope Executor from the desktop shortcut</code></pre>
                            </div>

                            <div class="note">
                                <p><strong>Note:</strong> The first time you run Scope, Windows Defender may flag it. This is normal for external executors. Add it to your exclusions list.</p>
                            </div>

                            <h3>Your First Script</h3>
                            <p>Let's execute your first script to verify everything is working:</p>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Simple test script
print("Hello from Scope Executor!")
print("Current time: " .. os.date("%X"))</code></pre>
                            </div>

                            <h4>Execution Steps:</h4>
                            <ul>
                                <li>Launch Roblox and join any game</li>
                                <li>Open Scope Executor</li>
                                <li>Click "Attach" to connect to Roblox</li>
                                <li>Paste the script above into the editor</li>
                                <li>Click "Execute" to run the script</li>
                            </ul>

                            <div class="warning">
                                <p><strong>Warning:</strong> Always be cautious when executing scripts from unknown sources. Only use scripts you trust.</p>
                            </div>

                        <?php elseif ($subpage === 'interface'): ?>
                            <h2>User Interface</h2>
                            <p>The Scope Executor interface is designed for efficiency and ease of use. Here's a detailed overview of each component.</p>

                            <h3>Main Window Components</h3>
                            
                            <h4>1. Script Editor</h4>
                            <p>The central editing area features:</p>
                            <ul>
                                <li><strong>Syntax Highlighting:</strong> Color-coded Luau syntax for better readability</li>
                                <li><strong>Line Numbers:</strong> Quick reference and debugging aid</li>
                                <li><strong>Auto-Completion:</strong> Intelligent code suggestions as you type</li>
                                <li><strong>Bracket Matching:</strong> Automatic pairing of parentheses and brackets</li>
                            </ul>

                            <h4>2. Execution Controls</h4>
                            <p>Located at the top of the interface:</p>
                            <ul>
                                <li><strong>Attach Button:</strong> Connect to the target Roblox process</li>
                                <li><strong>Execute Button:</strong> Run the current script in the editor</li>
                                <li><strong>Clear Button:</strong> Reset the editor to a blank state</li>
                                <li><strong>Save/Load:</strong> Manage your script library</li>
                            </ul>

                            <h4>3. Process Panel</h4>
                            <p>Displays information about the attached process:</p>
                            <ul>
                                <li>Process name and ID (PID)</li>
                                <li>Connection status indicator</li>
                                <li>Quick detach option</li>
                            </ul>

                            <h4>4. Console Output</h4>
                            <p>The bottom panel shows:</p>
                            <ul>
                                <li>Script execution results</li>
                                <li>Error messages and warnings</li>
                                <li>System notifications</li>
                                <li>Debug information</li>
                            </ul>

                        <?php elseif ($subpage === 'luau'): ?>
                            <h2>Luau Language</h2>
                            <p>Luau is a fast, small, safe, gradually typed scripting language derived from Lua. Scope Executor supports most standard Luau features.</p>

                            <h3>Basic Syntax</h3>
                            
                            <h4>Variables and Data Types</h4>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Variables
local name = "Player"
local health = 100
local isAlive = true

-- Tables
local inventory = {
    sword = true,
    shield = false,
    potions = 3
}

-- Functions
local function heal(amount)
    health = health + amount
    print("Healed: " .. amount)
end</code></pre>
                            </div>

                            <h4>Control Structures</h4>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- If statements
if health > 50 then
    print("Healthy")
elseif health > 20 then
    print("Injured")
else
    print("Critical")
end

-- Loops
for i = 1, 10 do
    print("Iteration: " .. i)
end

while health > 0 do
    -- Game loop
    wait(1)
end</code></pre>
                            </div>

                            <h3>Common Patterns</h3>
                            
                            <h4>Table Manipulation</h4>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Insert and remove
table.insert(inventory, "new_item")
table.remove(inventory, 1)

-- Iteration
for key, value in pairs(inventory) do
    print(key .. ": " .. tostring(value))
end</code></pre>
                            </div>

                            <h4>String Operations</h4>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- String manipulation
local text = "Scope Executor"
print(string.upper(text))
print(string.lower(text))
print(string.sub(text, 1, 5))  -- "Scope"
print(string.format("Health: %d%%", health))</code></pre>
                            </div>

                            <h3>Execution Context</h3>
                            <p>Scripts run in an external context with some limitations:</p>
                            <ul>
                                <li>Access to most standard Luau libraries</li>
                                <li>Some Roblox-specific functions may behave differently</li>
                                <li>File I/O operations are restricted for security</li>
                                <li>Network requests may be limited</li>
                            </ul>

                            <div class="warning">
                                <p><strong>Important:</strong> Not all Roblox game functions are available. Test your scripts in a safe environment first.</p>
                            </div>

                        <?php elseif ($subpage === 'api'): ?>
                            <h2>API Reference</h2>
                            <p>Scope Executor provides a comprehensive API for process attachment and script execution. Below is the complete reference for available functions.</p>

                            <h3>Core Functions</h3>
                            
                            <h4>scope.attach(processName)</h4>
                            <p>Attaches Scope to a running process by name.</p>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Attach to Roblox
local success = scope.attach("RobloxPlayerBeta.exe")

if success then
    print("Successfully attached!")
else
    print("Failed to attach to process")
end</code></pre>
                            </div>
                            <p><strong>Parameters:</strong></p>
                            <ul>
                                <li><code>processName</code> (string) - The name of the target process</li>
                            </ul>
                            <p><strong>Returns:</strong> boolean - true if successful, false otherwise</p>

                            <h4>scope.run(script)</h4>
                            <p>Executes a Luau script in the attached process context.</p>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Execute a simple script
scope.run([[
    print("Hello from injected script!")
    
    -- Your script logic here
    local player = game.Players.LocalPlayer
    print("Player name: " .. player.Name)
]])</code></pre>
                            </div>
                            <p><strong>Parameters:</strong></p>
                            <ul>
                                <li><code>script</code> (string) - The Luau script to execute</li>
                            </ul>
                            <p><strong>Returns:</strong> void</p>

                            <h4>scope.detach()</h4>
                            <p>Disconnects from the currently attached process.</p>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Clean disconnect
scope.detach()
print("Detached from process")</code></pre>
                            </div>

                            <h3>Utility Functions</h3>
                            
                            <h4>scope.isAttached()</h4>
                            <p>Checks if Scope is currently attached to a process.</p>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>if scope.isAttached() then
    print("Currently attached")
    scope.run([[print("Running script...")]])
else
    print("Not attached to any process")
end</code></pre>
                            </div>
                            <p><strong>Returns:</strong> boolean - true if attached, false otherwise</p>

                            <h4>scope.getProcessInfo()</h4>
                            <p>Retrieves information about the attached process.</p>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>local info = scope.getProcessInfo()

if info then
    print("Process Name: " .. info.name)
    print("Process ID: " .. info.pid)
    print("Memory Usage: " .. info.memory .. " MB")
end</code></pre>
                            </div>
                            <p><strong>Returns:</strong> table or nil - Process information or nil if not attached</p>

                            <h3>Advanced Features</h3>
                            
                            <h4>scope.loadScript(filepath)</h4>
                            <p>Loads and executes a script from a file.</p>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Load from file
scope.loadScript("scripts/myscript.lua")</code></pre>
                            </div>

                            <h4>scope.setAutoAttach(enabled)</h4>
                            <p>Enables or disables automatic attachment when a target process is detected.</p>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Enable auto-attach
scope.setAutoAttach(true)</code></pre>
                            </div>

                            <div class="note">
                                <p><strong>Best Practice:</strong> Always check if attachment was successful before executing scripts to avoid errors.</p>
                            </div>

                            <h3>Complete Example</h3>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Complete workflow example
local function main()
    -- Attach to process
    if not scope.attach("RobloxPlayerBeta.exe") then
        print("Failed to attach!")
        return
    end
    
    print("Attached successfully!")
    
    -- Check connection
    if scope.isAttached() then
        -- Execute main script
        scope.run([[
            local Players = game:GetService("Players")
            local LocalPlayer = Players.LocalPlayer
            
            print("Connected as: " .. LocalPlayer.Name)
            
            -- Your game logic here
            LocalPlayer.Character.Humanoid.WalkSpeed = 16
        ]])
    end
    
    -- Cleanup when done
    wait(60)
    scope.detach()
end

main()</code></pre>
                            </div>

                        <?php elseif ($subpage === 'advanced'): ?>
                            <h2>Advanced Topics</h2>
                            <p>Deep dive into advanced features, optimization techniques, and best practices for power users.</p>

                            <h3>Memory Management</h3>
                            <p>Understanding how Scope handles memory is crucial for writing efficient scripts.</p>
                            
                            <h4>Memory Isolation</h4>
                            <p>Scope uses advanced memory isolation techniques to ensure:</p>
                            <ul>
                                <li><strong>Process Separation:</strong> Your scripts run in an isolated context</li>
                                <li><strong>Crash Protection:</strong> Script errors won't crash the target process</li>
                                <li><strong>Memory Safety:</strong> Automatic cleanup of allocated resources</li>
                                <li><strong>Stack Protection:</strong> Prevents stack overflow from recursive scripts</li>
                            </ul>

                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Good: Manual cleanup
local function processData()
    local largeTable = {}
    
    -- Process data
    for i = 1, 1000000 do
        largeTable[i] = i
    end
    
    -- Clear reference when done
    largeTable = nil
    collectgarbage()
end</code></pre>
                            </div>

                            <h3>Performance Optimization</h3>
                            
                            <h4>Script Execution Tips</h4>
                            <ul>
                                <li><strong>Minimize Global Variables:</strong> Use local variables whenever possible</li>
                                <li><strong>Cache Function Calls:</strong> Store frequently used values</li>
                                <li><strong>Avoid Tight Loops:</strong> Use wait() or task.wait() in loops</li>
                                <li><strong>Batch Operations:</strong> Group multiple operations together</li>
                            </ul>

                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Bad: Inefficient
for i = 1, 100 do
    print(game.Players.LocalPlayer.Name)
end

-- Good: Cached reference
local playerName = game.Players.LocalPlayer.Name
for i = 1, 100 do
    print(playerName)
end</code></pre>
                            </div>

                            <h3>Debugging Techniques</h3>
                            
                            <h4>Error Handling</h4>
                            <p>Proper error handling prevents script crashes and provides useful feedback.</p>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Protected call pattern
local success, result = pcall(function()
    -- Potentially failing code
    local player = game.Players.LocalPlayer
    return player.Character.Humanoid.Health
end)

if success then
    print("Health: " .. result)
else
    print("Error: " .. result)
end</code></pre>
                            </div>

                            <h4>Logging and Debugging</h4>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Debug logging utility
local DEBUG = true

local function debug(message)
    if DEBUG then
        print("[DEBUG] " .. os.date("%X") .. " - " .. message)
    end
end

debug("Script started")
debug("Player connected")
debug("Script completed")</code></pre>
                            </div>

                            <h3>Plugin Development</h3>
                            <p>Extend Scope's functionality with custom plugins (coming in future updates).</p>
                            
                            <h4>Plugin Structure</h4>
                            <div class="code-block">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>-- Basic plugin template
local MyPlugin = {}
MyPlugin.Name = "Custom Plugin"
MyPlugin.Version = "1.0.0"

function MyPlugin:Initialize()
    print("Plugin initialized")
end

function MyPlugin:OnAttach()
    print("Process attached")
end

function MyPlugin:OnDetach()
    print("Process detached")
end

return MyPlugin</code></pre>
                            </div>

                            <h3>Security Considerations</h3>
                            <div class="warning">
                                <p><strong>Important Security Notes:</strong></p>
                                <ul>
                                    <li>Review all scripts before execution</li>
                                    <li>Be cautious with scripts that request sensitive data</li>
                                    <li>Keep Scope Executor updated for security patches</li>
                                    <li>Use antivirus software alongside Scope</li>
                                </ul>
                            </div>

                            <h3>Troubleshooting</h3>
                            
                            <h4>Common Issues</h4>
                            <p><strong>Issue:</strong> "Failed to attach to process"</p>
                            <ul>
                                <li>Ensure Roblox is running</li>
                                <li>Run Scope as Administrator</li>
                                <li>Check antivirus isn't blocking Scope</li>
                                <li>Verify Windows Defender exclusions</li>
                            </ul>

                            <p><strong>Issue:</strong> "Script execution timeout"</p>
                            <ul>
                                <li>Avoid infinite loops without wait()</li>
                                <li>Optimize heavy computations</li>
                                <li>Break large scripts into smaller chunks</li>
                            </ul>

                            <p><strong>Issue:</strong> "Memory access violation"</p>
                            <ul>
                                <li>Update to latest Scope version</li>
                                <li>Verify roblox process compatibility</li>
                                <li>Restart both Scope and roblox process</li>
                            </ul>

                            <div class="note">
                                <p><strong>Need Help?</strong> Check our community forums or submit a bug report through the dashboard.</p>
                            </div>

                        <?php endif; ?>
                    </article>
                </div>
            <?php elseif ($page === 'dashboard'): ?>
                <section class="hero-dashboard">
                    <h1>Dashboard Preview</h1>
                    <p class="tagline">Manage your scripts and executions (Coming Soon)</p>
                </section>
                <section class="section">
                    <div class="dashboard-preview">
                        <i class="fas fa-chart-line" style="font-size: 5rem; color: #666; margin: 2rem 0;"></i>
                        <h3>Dashboard Coming Soon</h3>
                        <p style="color: #888; max-width: 600px; margin: 0 auto;">
                            The dashboard will provide real-time analytics, script management, execution history, 
                            and performance metrics. Stay tuned for updates!
                        </p>
                    </div>
                </section>
            <?php endif; ?>
        </div>
    </main>
    <footer class="footer">
        <div class="container">
            <p>Scope Executor &mdash; Next-Gen External Executor &copy; 2025</p>
        </div>
    </footer>
    <script>
        const intro = document.querySelector('.intro');
        const typewriter = document.querySelector('.typewriter');
        const statusContainer = document.querySelector('.status-container');
        const header = document.querySelector('.header');
        const background = document.getElementById('networkBackground');
        const scrollArrow = document.querySelector('.scroll-arrow');
        const hasSeenIntro = sessionStorage.getItem('introPlayed') === '1';

        background.classList.add('active');

        if (!hasSeenIntro) {
            typewriter.addEventListener('animationend', () => {
                statusContainer.classList.add('visible');
                setTimeout(() => {
                    intro.classList.add('hidden');
                    header.classList.add('active');
                    background.classList.add('active'); 
                    scrollArrow.classList.add('visible');
                    createNetwork();
                    sessionStorage.setItem('introPlayed', '1');
                }, 1000);
            }, { once: true });
        } else {
            intro.classList.add('hidden');
            header.classList.add('active');
            background.classList.add('active');
            if (typewriter) typewriter.style.display = 'none';
            if (scrollArrow) scrollArrow.style.display = 'none';
            background.innerHTML = '';
            createNetwork();
        }
        
        const nodes = [];
        const lines = [];
        
        function createNetwork() {
            const nodeCount = 20;
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
            animateNetwork();
        }
        
        createNetwork();

        function animateNetwork() {
            nodes.forEach(function(node, i) {
                node.x += node.vx;
                node.y += node.vy;
                
                if (node.x < 0 || node.x > window.innerWidth) node.vx *= -1;
                if (node.y < 0 || node.y > window.innerHeight) node.vy *= -1;
                
                node.x = Math.max(0, Math.min(window.innerWidth, node.x));
                node.y = Math.max(0, Math.min(window.innerHeight, node.y));
                
                node.element.style.left = node.x + 'px';
                node.element.style.top = node.y + 'px';
            });
            
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
            
            requestAnimationFrame(animateNetwork);
        }
        
        scrollArrow.addEventListener('click', function() {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        });
        
        function copyCode(btn) {
            const code = btn.nextElementSibling.textContent;
            navigator.clipboard.writeText(code);
            btn.textContent = 'Copied!';
            setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
        }
    </script>
</body>
</html>