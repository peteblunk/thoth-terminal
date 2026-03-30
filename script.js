// Fetch an SVG file, inject it inline into its container div, then wire up the click handler.
// Inline SVGs inherit CSS `color` from the page, so currentColor in the SVG follows style.css.
async function inlineSVG(containerId, command) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const src = container.dataset.src;
    const response = await fetch(src);
    const text = await response.text();

    // innerHTML lets the HTML parser handle Inkscape namespaces gracefully
    container.innerHTML = text;

    const svg = container.querySelector('svg');
    if (!svg) return;

    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.cursor = 'pointer';

    // Lively's web-wallpaper sandbox has no native process-launch API.
    // launcher.js bridges that gap — run it once: node launcher.js
    svg.addEventListener('click', () => {
        console.log(`Activating ${containerId}...`);
        fetch(`http://127.0.0.1:7890/launch?cmd=${encodeURIComponent(command)}`)
            .then(r => r.json())
            .then(data => console.log('Launch result:', data))
            .catch(() => console.warn('Launcher not running. Start it with: node launcher.js'));
    });
}

// Assign the powers to your specific artifacts:
inlineSVG('ka-button', 'powershell');
inlineSVG('thoth-button', 'code');
inlineSVG('duamutef-button', 'recycle-bin');
inlineSVG('seshat-button', 'notepad');