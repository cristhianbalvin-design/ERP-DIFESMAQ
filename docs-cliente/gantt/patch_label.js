const fs = require('fs');

function patchFile(filename) {
    let html = fs.readFileSync(filename, 'utf8');
    
    // Replace the label
    html = html.replace(/>Porcentaje de desarrollo<\/div>/g, '>Porcentaje de avance del proyecto</div>');
    
    fs.writeFileSync(filename, html);
    console.log('Updated ' + filename);
}

patchFile('index.html');
patchFile('gantt_desarrollo.html');
patchFile('gantt_implementacion.html');
