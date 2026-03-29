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

    svg.addEventListener('click', () => {
        console.log(`Activating ${containerId}...`);
        if (window.lively && window.lively.run) {
            window.lively.run(command);
        } else {
            console.log("Lively not detected, but would have run: " + command);
        }
    });
}

// Assign the powers to your specific artifacts:
inlineSVG('ka-button', 'powershell.exe');
inlineSVG('thoth-button', 'code');