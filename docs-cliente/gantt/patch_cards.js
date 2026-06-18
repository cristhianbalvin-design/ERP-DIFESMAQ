const fs = require('fs');

const cardsDev = `        <div class="summary-grid">
            <div class="summary-card">
                <div class="val">6</div>
                <div class="lbl">Semanas de desarrollo</div>
            </div>
            <div class="summary-card c-green">
                <div class="val">139</div>
                <div class="lbl">Actividades totales</div>
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
            <div class="summary-card c-red">
                <div class="val">5</div>
                <div class="lbl">Hitos de cierre</div>
            </div>
        </div>`;

const cardsImp = `        <div class="summary-grid">
            <div class="summary-card">
                <div class="val">8</div>
                <div class="lbl">Semanas de implementación</div>
            </div>
            <div class="summary-card c-green">
                <div class="val">123</div>
                <div class="lbl">Actividades totales</div>
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
            <div class="summary-card c-red">
                <div class="val">5</div>
                <div class="lbl">Hitos de cierre</div>
            </div>
        </div>`;

// 1. gantt_desarrollo.html
let devHtml = fs.readFileSync('gantt_desarrollo.html', 'utf8');
let startDev = devHtml.indexOf('<div class="summary-grid">');
let endDev = devHtml.indexOf('</div>\r\n\r\n        <div class="gantt-scroll">', startDev);
if (endDev === -1) endDev = devHtml.indexOf('</div>\n\n        <div class="gantt-scroll">', startDev);
if (endDev !== -1) {
    devHtml = devHtml.substring(0, startDev) + cardsDev + devHtml.substring(endDev + 6);
    fs.writeFileSync('gantt_desarrollo.html', devHtml);
    console.log('Updated gantt_desarrollo.html');
}

// 2. gantt_implementacion.html
let impHtml = fs.readFileSync('gantt_implementacion.html', 'utf8');
let startImp = impHtml.indexOf('<div class="summary-grid">');
let endImp = impHtml.indexOf('</div>\r\n\r\n        <div class="gantt-scroll">', startImp);
if (endImp === -1) endImp = impHtml.indexOf('</div>\n\n        <div class="gantt-scroll">', startImp);
if (endImp !== -1) {
    impHtml = impHtml.substring(0, startImp) + cardsImp + impHtml.substring(endImp + 6);
    fs.writeFileSync('gantt_implementacion.html', impHtml);
    console.log('Updated gantt_implementacion.html');
}

// 3. index.html
let idxHtml = fs.readFileSync('index.html', 'utf8');
let startIdx1 = idxHtml.indexOf('<div class="summary-grid">');
let endIdx1 = idxHtml.indexOf('</div>\r\n\r\n        <div class="gantt-scroll">', startIdx1);
if (endIdx1 === -1) endIdx1 = idxHtml.indexOf('</div>\n\n        <div class="gantt-scroll">', startIdx1);
if (endIdx1 !== -1) {
    idxHtml = idxHtml.substring(0, startIdx1) + cardsDev + idxHtml.substring(endIdx1 + 6);
}

let startIdx2 = idxHtml.indexOf('<div class="summary-grid">', startIdx1 + cardsDev.length);
let endIdx2 = idxHtml.indexOf('</div>\r\n\r\n        <div class="gantt-scroll">', startIdx2);
if (endIdx2 === -1) endIdx2 = idxHtml.indexOf('</div>\n\n        <div class="gantt-scroll">', startIdx2);
if (endIdx2 !== -1) {
    idxHtml = idxHtml.substring(0, startIdx2) + cardsImp + idxHtml.substring(endIdx2 + 6);
}

fs.writeFileSync('index.html', idxHtml);
console.log('Updated index.html');
