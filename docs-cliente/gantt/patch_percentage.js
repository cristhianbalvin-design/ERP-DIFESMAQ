const fs = require('fs');

function patchFile(filename) {
    let html = fs.readFileSync(filename, 'utf8');
    
    // Replace the static 53% with a placeholder and a dynamic class
    html = html.replace(/<div class="val">53%<\/div>/g, '<div class="val val-percentage">-</div>');
    
    // Add logic to calculate and display the percentage
    const targetScript = `        document.querySelectorAll('.val-activities-upto').forEach(el => el.innerHTML = totalCurrent);`;
    const newScript = `        document.querySelectorAll('.val-activities-upto').forEach(el => el.innerHTML = totalCurrent);
        const percentage = Math.round((totalCurrent / 262) * 100);
        document.querySelectorAll('.val-percentage').forEach(el => el.innerHTML = percentage + '%');`;
        
    html = html.replace(targetScript, newScript);
    
    fs.writeFileSync(filename, html);
    console.log('Updated ' + filename);
}

patchFile('index.html');
patchFile('gantt_desarrollo.html');
patchFile('gantt_implementacion.html');
