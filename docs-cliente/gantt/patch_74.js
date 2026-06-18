const fs = require('fs');

function patchFile(filename) {
    let html = fs.readFileSync(filename, 'utf8');
    
    // Replace ~74 with 74
    html = html.replace(/<div class="val">~74<\/div>/g, '<div class="val">74</div>');
    
    fs.writeFileSync(filename, html);
    console.log('Updated ' + filename);
}

patchFile('index.html');
patchFile('gantt_desarrollo.html');
patchFile('gantt_implementacion.html');
