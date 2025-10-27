// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const { page = 'home', subpage = 'getting-started' } = router.query;
  const [introPlayed, setIntroPlayed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('introPlayed') === 'true';
    if (hasSeenIntro) {
      setIntroPlayed(true);
      setIsLoaded(true);
    } else {
      const timer = setTimeout(() => {
        setIntroPlayed(true);
        setIsLoaded(true);
        sessionStorage.setItem('introPlayed', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const Navigation = () => (
    <header className={`header ${isLoaded ? 'active' : ''}`}>
      <div className="navbar">
        <div className="nav-brand">
          <i className="fas fa-crosshairs"></i>
          <span>Scope</span>
        </div>
        <ul className="nav-menu">
          <li>
            <a 
              href="/" 
              className={page === 'home' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                router.push('/');
              }}
            >
              <i className="fas fa-home"></i> Home
            </a>
          </li>
          <li>
            <a 
              href="/?page=download" 
              className={page === 'download' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                router.push('/?page=download');
              }}
            >
              <i className="fas fa-download"></i> Download
            </a>
          </li>
          <li>
            <a 
              href="/?page=docs&subpage=getting-started" 
              className={page === 'docs' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                router.push('/?page=docs&subpage=getting-started');
              }}
            >
              <i className="fas fa-book"></i> Docs
            </a>
          </li>
          <li>
            <a 
              href="/?page=dashboard" 
              className={page === 'dashboard' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                router.push('/?page=dashboard');
              }}
            >
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </a>
          </li>
        </ul>
      </div>
    </header>
  );

  const NetworkBackground = () => {
    const [nodes, setNodes] = useState([]);
    const [lines, setLines] = useState([]);

    useEffect(() => {
      const nodeCount = 20;
      const newNodes = [];
      
      for (let i = 0; i < nodeCount; i++) {
        const x = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200);
        const y = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800);
        newNodes.push({
          id: i,
          x,
          y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          pulse: Math.random() > 0.7
        });
      }
      setNodes(newNodes);

      const newLines = [];
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dist = Math.hypot(newNodes[i].x - newNodes[j].x, newNodes[i].y - newNodes[j].y);
          if (dist < 180) {
            newLines.push({ from: i, to: j });
          }
        }
      }
      setLines(newLines);

      const animate = () => {
        setNodes(prevNodes => 
          prevNodes.map(node => {
            let newX = node.x + node.vx;
            let newY = node.y + node.vy;
            let newVx = node.vx;
            let newVy = node.vy;

            if (newX < 0 || newX > (typeof window !== 'undefined' ? window.innerWidth : 1200)) newVx *= -1;
            if (newY < 0 || newY > (typeof window !== 'undefined' ? window.innerHeight : 800)) newVy *= -1;

            newX = Math.max(0, Math.min((typeof window !== 'undefined' ? window.innerWidth : 1200), newX));
            newY = Math.max(0, Math.min((typeof window !== 'undefined' ? window.innerHeight : 800), newY));

            return { ...node, x: newX, y: newY, vx: newVx, vy: newVy };
          })
        );
      };

      const interval = setInterval(animate, 50);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className={`background ${isLoaded ? 'active' : ''}`} id="networkBackground">
        {nodes.map(node => (
          <div
            key={node.id}
            className={`node ${node.pulse ? 'pulse' : ''}`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`
            }}
          />
        ))}
        {lines.map((line, index) => {
          const fromNode = nodes[line.from];
          const toNode = nodes[line.to];
          if (!fromNode || !toNode) return null;

          const x1 = fromNode.x + 2;
          const y1 = fromNode.y + 2;
          const x2 = toNode.x + 2;
          const y2 = toNode.y + 2;
          const dist = Math.hypot(x2 - x1, y2 - y1);
          const length = dist;
          const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
          const opacity = Math.max(0, 1 - dist / 200) * 0.4;

          return (
            <div
              key={index}
              className="line"
              style={{
                width: `${length}px`,
                transform: `rotate(${angle}deg)`,
                left: `${x1}px`,
                top: `${y1}px`,
                opacity: opacity
              }}
            />
          );
        })}
      </div>
    );
  };

  const IntroScreen = () => (
    <div className={`intro ${introPlayed ? 'hidden' : ''}`}>
      <div className="typewriter">Scope Executor</div>
      <div className={`status-container ${introPlayed ? 'visible' : ''}`}>
        <i className="fas fa-crosshairs status-icon"></i>
        <span className="status-text">Coming Soon (Not Released)</span>
      </div>
    </div>
  );

  const ScrollArrow = () => (
    <i 
      className={`fas fa-arrow-down scroll-arrow ${isLoaded ? 'visible' : ''}`}
      onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
    />
  );

  const CopyButton = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <button className="copy-btn" onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    );
  };

  const CodeBlock = ({ code }) => (
    <div className="code-block">
      <CopyButton code={code} />
      <pre><code>{code}</code></pre>
    </div>
  );

  const HomeContent = () => (
    <>
      <section className="hero section">
        <h1>Improve Your Scripting</h1>
        <p className="tagline">Basic Roblox luau external executor.</p>
        <div className="btn-group">
          <a 
            href="/?page=download" 
            className="btn"
            onClick={(e) => {
              e.preventDefault();
              router.push('/?page=download');
            }}
          >
            <i className="fas fa-download"></i> Get Early Access
          </a>
          <a 
            href="/?page=docs&subpage=getting-started" 
            className="btn"
            onClick={(e) => {
              e.preventDefault();
              router.push('/?page=docs&subpage=getting-started');
            }}
          >
            <i className="fas fa-book"></i> Learn More
          </a>
        </div>
      </section>
      
      <section className="section">
        <h2>Why Choose Scope?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-shield-alt"></i>
            <h3>Secure Execution</h3>
            <p>Run scripts externally with advanced protection and memory isolation.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-bolt"></i>
            <h3>High Performance</h3>
            <p>Optimized Luau runtime for fast execution and low latency.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-tools"></i>
            <h3>Developer Tools</h3>
            <p>Comprehensive documentation for our API.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-plug"></i>
            <h3>Extensible API</h3>
            <p>Build custom integrations with our comprehensive SDK.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Roadmap</h2>
        <div className="roadmap">
          <div className="roadmap-item">
            <i className="fas fa-check"></i>
            <div>
              <h3>Q4 2025: Beta Release</h3>
              <p>Launch of the UI and the API with core functionality.</p>
            </div>
          </div>
          <div className="roadmap-item">
            <i className="fas fa-hourglass-half"></i>
            <div>
              <h3>Q1 2026: Advanced Debugging</h3>
              <p>Add breakpoint support and variable inspection tools.</p>
            </div>
          </div>
          <div className="roadmap-item">
            <i className="fas fa-hourglass-start"></i>
            <div>
              <h3>Q2 2026: Multi-Process Support</h3>
              <p>Simultaneous attachment to multiple target processes.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const DownloadContent = () => (
    <>
      <section className="hero-download">
        <h1>Early Access Downloads</h1>
        <p className="tagline">Join the beta program (coming soon)</p>
      </section>
      <div className="download-section section">
        <div className="download-card">
          <i className="fas fa-file-code"></i>
          <h3>Scope Executor Beta</h3>
          <p>Full installer with editor and runtime.</p>
          <div className="file-list">
            <div className="file-item"><i className="fas fa-file"></i> scope.exe (~30 MB)</div>
            <div className="file-item"><i className="fas fa-tag"></i> Beta v0.1</div>
            <div className="file-item"><i className="fas fa-desktop"></i> Windows x64</div>
          </div>
          <a 
            href="#" 
            className="btn" 
            onClick={(e) => {
              e.preventDefault();
              alert('Not released yet');
            }}
          >
            <i className="fas fa-download"></i> Download (Soon)
          </a>
        </div>
      </div>
    </>
  );

  const DocsContent = () => {
    const DocsSidebar = () => (
      <aside className="docs-sidebar">
        <ul className="docs-nav">
          {[
            { id: 'getting-started', icon: 'rocket', label: 'Getting Started' },
            { id: 'interface', icon: 'desktop', label: 'User Interface' },
            { id: 'luau', icon: 'code', label: 'Luau Language' },
            { id: 'api', icon: 'plug', label: 'API Reference' },
            { id: 'advanced', icon: 'cog', label: 'Advanced Topics' }
          ].map(item => (
            <li key={item.id}>
              <a 
                href={`/?page=docs&subpage=${item.id}`}
                className={subpage === item.id ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/?page=docs&subpage=${item.id}`);
                }}
              >
                <i className={`fas fa-${item.icon}`}></i> {item.label}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    );

    const GettingStarted = () => (
      <>
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
        <CodeBlock code={`1. Download scope.exe from the Downloads page
2. Run the installer as Administrator
3. Follow the installation wizard
4. Launch Scope Executor from the desktop shortcut`} />

        <div className="note">
          <p><strong>Note:</strong> The first time you run Scope, Windows Defender may flag it. This is normal for external executors. Add it to your exclusions list.</p>
        </div>

        <h3>Your First Script</h3>
        <p>Let's execute your first script to verify everything is working:</p>
        <CodeBlock code={`-- Simple test script
print("Hello from Scope Executor!")
print("Current time: " .. os.date("%X"))`} />

        <h4>Execution Steps:</h4>
        <ul>
          <li>Launch Roblox and join any game</li>
          <li>Open Scope Executor</li>
          <li>Click "Attach" to connect to Roblox</li>
          <li>Paste the script above into the editor</li>
          <li>Click "Execute" to run the script</li>
        </ul>

        <div className="warning">
          <p><strong>Warning:</strong> Always be cautious when executing scripts from unknown sources. Only use scripts you trust.</p>
        </div>
      </>
    );

    const InterfaceDocs = () => (
      <>
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
      </>
    );

    const renderDocsContent = () => {
      switch (subpage) {
        case 'getting-started':
          return <GettingStarted />;
        case 'interface':
          return <InterfaceDocs />;
        case 'luau':
          return <h2>Luau Language Documentation</h2>;
        case 'api':
          return <h2>API Reference</h2>;
        case 'advanced':
          return <h2>Advanced Topics</h2>;
        default:
          return <GettingStarted />;
      }
    };

    return (
      <>
        <section className="hero-docs">
          <h1>Comprehensive Documentation</h1>
          <p className="tagline">Everything you need to master Scope Executor</p>
        </section>
        <div className="docs-layout">
          <DocsSidebar />
          <article className="docs-content">
            {renderDocsContent()}
          </article>
        </div>
      </>
    );
  };

  const DashboardContent = () => (
    <>
      <section className="hero-dashboard">
        <h1>Dashboard Preview</h1>
        <p className="tagline">Manage your scripts and executions (Coming Soon)</p>
      </section>
      <section className="section">
        <div className="dashboard-preview">
          <i className="fas fa-chart-line" style={{fontSize: '5rem', color: '#666', margin: '2rem 0'}}></i>
          <h3>Dashboard Coming Soon</h3>
          <p style={{color: '#888', maxWidth: '600px', margin: '0 auto'}}>
            The dashboard will provide real-time analytics, script management, execution history, 
            and performance metrics. Stay tuned for updates!
          </p>
        </div>
      </section>
    </>
  );

  const renderContent = () => {
    switch (page) {
      case 'home':
        return <HomeContent />;
      case 'download':
        return <DownloadContent />;
      case 'docs':
        return <DocsContent />;
      case 'dashboard':
        return <DashboardContent />;
      default:
        return <HomeContent />;
    }
  };

  return (
    <>
      <Head>
        <title>Scope Executor</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="container">
        <IntroScreen />
        <NetworkBackground />
        <Navigation />
        <ScrollArrow />
        
        <main className="main-content">
          <div className="container">
            {renderContent()}
          </div>
        </main>

        <footer className="footer">
          <div className="container">
            <p>Scope Executor &mdash; Next-Gen External Executor &copy; 2025</p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Roboto Mono', monospace; }
        body { background: #000000; color: #ffffff; min-height: 100vh; overflow-x: hidden; line-height: 1.6; }
        .background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; opacity: 0; transition: opacity 1s ease; }
        .background.active { opacity: 0.4; }
        .node { position: absolute; width: 4px; height: 4px; background: #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(255, 255, 255, 0.4); transition: all 0.3s ease; }
        .node.pulse { animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.6; } }
        .line { position: absolute; height: 1px; background: linear-gradient(90deg, transparent, #aaaaaa, transparent); opacity: 0.3; transform-origin: left center; transition: opacity 0.3s ease; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .header { border: 1px solid hsl(0deg 0% 100% / 12%); border-radius: 6px; position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.8); border-radius: 50px; padding: 10px 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); z-index: 100; opacity: 0; transition: opacity 0.5s ease; backdrop-filter: blur(10px); }
        .header.active { opacity: 1; }
        .navbar { display: flex; justify-content: center; align-items: center; }
        .nav-brand { display: flex; align-items: center; gap: 12px; font-size: 1.4rem; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; margin-right: 2rem; padding: 4px 8px; }
        .nav-brand i { font-size: 1.6rem; color: #cccccc; }
        .nav-menu { display: flex; list-style: none; gap: 2.5rem; border: 1px solid hsl(0deg 0% 100% / 12%); border-radius: 6px; }
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
      `}</style>
    </>
  );
}
