const fs = require('fs');

const dynamicScript = `
<script>
(function() {
    const WEEKS = [
        { n: 1, d: new Date('2026-05-04T00:00:00') },
        { n: 2, d: new Date('2026-05-11T00:00:00') },
        { n: 3, d: new Date('2026-05-18T00:00:00') },
        { n: 4, d: new Date('2026-05-25T00:00:00') },
        { n: 5, d: new Date('2026-06-01T00:00:00') },
        { n: 6, d: new Date('2026-06-08T00:00:00') },
        { n: 9, d: new Date('2026-06-15T00:00:00') },
        { n: 10, d: new Date('2026-06-22T00:00:00') },
        { n: 11, d: new Date('2026-06-29T00:00:00') },
        { n: 12, d: new Date('2026-07-06T00:00:00') },
        { n: 13, d: new Date('2026-07-13T00:00:00') },
        { n: 14, d: new Date('2026-07-20T00:00:00') },
        { n: 15, d: new Date('2026-07-27T00:00:00') },
        { n: 16, d: new Date('2026-08-03T00:00:00') }
    ];
    let currentWeek = 1;
    const now = new Date();
    for(let w of WEEKS) {
        if (now >= w.d) currentWeek = w.n;
    }
    if (currentWeek > 16) currentWeek = 16;
    if (currentWeek === 7 || currentWeek === 8) currentWeek = 6;
    
    const devCumulative = {
        1: 19, 2: 36, 3: 51, 4: 83, 5: 116, 6: 139,
        9: 139, 10: 139, 11: 139, 12: 139, 13: 139, 14: 139, 15: 139, 16: 139
    };
    const impCumulative = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
        9: 17, 10: 34, 11: 35, 12: 53, 13: 72, 14: 91, 15: 109, 16: 123
    };
    
    const totalCurrent = devCumulative[currentWeek] + impCumulative[currentWeek];

    function updateDOM() {
        document.querySelectorAll('.val-current-week').forEach(el => el.innerHTML = currentWeek);
        document.querySelectorAll('.lbl-activities-upto').forEach(el => el.innerHTML = 'Actividades hasta S' + currentWeek);
        document.querySelectorAll('.val-activities-upto').forEach(el => el.innerHTML = totalCurrent);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateDOM);
    } else {
        updateDOM();
    }
})();
</script>
</body>`;

const cardsHTML = `        <div class="summary-grid">
            <div class="summary-card">
                <div class="val val-current-week">-</div>
                <div class="lbl">Semana actual</div>
            </div>
            <div class="summary-card c-green">
                <div class="val val-activities-upto">-</div>
                <div class="lbl lbl-activities-upto">Actividades hasta S-</div>
            </div>
            <div class="summary-card c-cyan">
                <div class="val">~74</div>
                <div class="lbl">Módulos ERP Administrativo</div>
            </div>
            <div class="summary-card">
                <div class="val">48</div>
                <div class="lbl">Módulos ERP Operativo</div>
            </div>
            <div class="summary-card c-orange">
                <div class="val">253</div>
                <div class="lbl">Tablas de base de datos</div>
            </div>
            <div class="summary-card c-purple">
                <div class="val">262</div>
                <div class="lbl">Actividades globales</div>
            </div>
            <div class="summary-card c-red">
                <div class="val">53%</div>
                <div class="lbl">Porcentaje de desarrollo</div>
            </div>
        </div>`;

function patchFile(filename) {
    let html = fs.readFileSync(filename, 'utf8');
    
    // Replace the summary grids
    // We can just use split/join trick since we know exactly where it is.
    // However, since we already patched it, it's easier to find the whole <div class="summary-grid">...</div>
    let pos = 0;
    while(true) {
        let start = html.indexOf('<div class="summary-grid">', pos);
        if (start === -1) break;
        let end = html.indexOf('</div>\r\n\r\n        <div class="gantt-scroll">', start);
        if (end === -1) end = html.indexOf('</div>\n\n        <div class="gantt-scroll">', start);
        if (end !== -1) {
            html = html.substring(0, start) + cardsHTML + html.substring(end + 6);
            pos = start + cardsHTML.length;
        } else {
            break;
        }
    }
    
    // Inject script at end of body if not already there
    if (!html.includes('const devCumulative')) {
        html = html.replace('</body>', dynamicScript);
    }
    
    fs.writeFileSync(filename, html);
    console.log('Updated ' + filename);
}

patchFile('gantt_desarrollo.html');
patchFile('gantt_implementacion.html');
patchFile('index.html');
