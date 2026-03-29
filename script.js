// Function to link an SVG artifact to a Windows command
function activateArtifact(id, command) {
    const obj = document.getElementById(id);

    if (!obj) return; // Safety check

    obj.addEventListener('load', function() {
        const svgDoc = obj.contentDocument;
        
        // We target the root of the SVG so the whole drawing is clickable
        const svgRoot = svgDoc.documentElement;
        svgRoot.style.cursor = 'pointer';

        svgRoot.addEventListener('click', () => {
            console.log(`Activating ${id}...`);
            if (window.lively && window.lively.run) {
                window.lively.run(command);
            } else {
                console.log("Lively not detected, but would have run: " + command);
            }
        });
    });
}

// Now we "Assign" the powers to your specific files:
activateArtifact('ka-button', 'powershell.exe');
activateArtifact('thoth-button', 'code');