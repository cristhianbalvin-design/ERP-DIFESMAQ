const fs = require('fs');

function replaceAll(str, find, replace) {
    return str.split(find).join(replace);
}

function shiftImplementationWeeks(content) {
    let newContent = content;
    
    // Shift from 9-16 to 7-14
    // Replace 16 down to 9 so we don't accidentally replace something we just changed
    for (let i = 16; i >= 9; i--) {
        const newNum = i - 2;
        
        // 1. "SEMANA X"
        newContent = replaceAll(newContent, `SEMANA ${i}`, `SEMANA ${newNum}`);
        
        // 2. ">SX<"
        newContent = replaceAll(newContent, `>S${i}<`, `>S${newNum}<`);
        
        // 3. "<td>SX</td>"
        newContent = replaceAll(newContent, `<td>S${i}</td>`, `<td>S${newNum}</td>`);
        
        // 4. "'SX ·"
        newContent = replaceAll(newContent, `'S${i} ·`, `'S${newNum} ·`);
        
        // 5. ">SX<br>"
        newContent = replaceAll(newContent, `>S${i}<br>`, `>S${newNum}<br>`);
    }

    return newContent;
}

// Update gantt_implementacion.html
let implHtml = fs.readFileSync('gantt_implementacion.html', 'utf8');
implHtml = shiftImplementationWeeks(implHtml);
fs.writeFileSync('gantt_implementacion.html', implHtml);
console.log('Updated gantt_implementacion.html');

// Update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');

// The implementation view HTML block starts with id="view-implementacion" and ends with <script>
let startView = indexHtml.indexOf('id="view-implementacion"');
let endView = indexHtml.indexOf('<script>', startView);
if (endView === -1) endView = indexHtml.length;
let viewImplHtml = indexHtml.substring(startView, endView);
viewImplHtml = shiftImplementationWeeks(viewImplHtml);
indexHtml = indexHtml.substring(0, startView) + viewImplHtml + indexHtml.substring(endView);

// The implementation JS block starts with const impModule
let startJS = indexHtml.indexOf('const impModule');
let endJS = indexHtml.indexOf('})();', startJS);
if (endJS === -1) endJS = indexHtml.length;
let viewImplJS = indexHtml.substring(startJS, endJS);
viewImplJS = shiftImplementationWeeks(viewImplJS);
indexHtml = indexHtml.substring(0, startJS) + viewImplJS + indexHtml.substring(endJS);

// We also need to update the injected script at the bottom of the files!
function updateInjectedScript(html) {
    let newHtml = html;
    
    // Change WEEKS array
    newHtml = newHtml.replace(/{ n: 9, d: new Date\('2026-06-15T00:00:00'\) }/, "{ n: 7, d: new Date('2026-06-15T00:00:00') }");
    newHtml = newHtml.replace(/{ n: 10, d: new Date\('2026-06-22T00:00:00'\) }/, "{ n: 8, d: new Date('2026-06-22T00:00:00') }");
    newHtml = newHtml.replace(/{ n: 11, d: new Date\('2026-06-29T00:00:00'\) }/, "{ n: 9, d: new Date('2026-06-29T00:00:00') }");
    newHtml = newHtml.replace(/{ n: 12, d: new Date\('2026-07-06T00:00:00'\) }/, "{ n: 10, d: new Date('2026-07-06T00:00:00') }");
    newHtml = newHtml.replace(/{ n: 13, d: new Date\('2026-07-13T00:00:00'\) }/, "{ n: 11, d: new Date('2026-07-13T00:00:00') }");
    newHtml = newHtml.replace(/{ n: 14, d: new Date\('2026-07-20T00:00:00'\) }/, "{ n: 12, d: new Date('2026-07-20T00:00:00') }");
    newHtml = newHtml.replace(/{ n: 15, d: new Date\('2026-07-27T00:00:00'\) }/, "{ n: 13, d: new Date('2026-07-27T00:00:00') }");
    newHtml = newHtml.replace(/{ n: 16, d: new Date\('2026-08-03T00:00:00'\) }/, "{ n: 14, d: new Date('2026-08-03T00:00:00') }");
    
    // Change upper bounds
    newHtml = newHtml.replace(/if \(currentWeek > 16\) currentWeek = 16;/g, "if (currentWeek > 14) currentWeek = 14;");
    // Since 7 and 8 are now valid weeks, we should remove the line:
    // if (currentWeek === 7 || currentWeek === 8) currentWeek = 6;
    newHtml = newHtml.replace(/if \(currentWeek === 7 \|\| currentWeek === 8\) currentWeek = 6;/g, "");

    // Change devCumulative map
    newHtml = newHtml.replace(/9: 139, 10: 139, 11: 139, 12: 139, 13: 139, 14: 139, 15: 139, 16: 139/g, "7: 139, 8: 139, 9: 139, 10: 139, 11: 139, 12: 139, 13: 139, 14: 139");
    
    // Change impCumulative map
    newHtml = newHtml.replace(/9: 17, 10: 34, 11: 35, 12: 53, 13: 72, 14: 91, 15: 109, 16: 123/g, "7: 17, 8: 34, 9: 35, 10: 53, 11: 72, 12: 91, 13: 109, 14: 123");
    
    return newHtml;
}

indexHtml = updateInjectedScript(indexHtml);
fs.writeFileSync('index.html', indexHtml);
console.log('Updated index.html logic');

let impHtmlScript = fs.readFileSync('gantt_implementacion.html', 'utf8');
impHtmlScript = updateInjectedScript(impHtmlScript);
fs.writeFileSync('gantt_implementacion.html', impHtmlScript);
console.log('Updated gantt_implementacion.html logic');

let devHtmlScript = fs.readFileSync('gantt_desarrollo.html', 'utf8');
devHtmlScript = updateInjectedScript(devHtmlScript);
fs.writeFileSync('gantt_desarrollo.html', devHtmlScript);
console.log('Updated gantt_desarrollo.html logic');

