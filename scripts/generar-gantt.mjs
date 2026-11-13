import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { calcular } = createRequire(import.meta.url)('../docs-cliente/gantt/calculo.js');
const args = process.argv.slice(2);
const option = name => {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Falta el valor de ${name}`);
  return args[i + 1];
};
export function construirDatos({ etapas, capacitacion, fuente_en_vivo, catalogo, fuente, commit, generado }) {
  const plan_etapa3 = etapas[2];
  const resultado = calcular(plan_etapa3, catalogo);
  return {
    generado, catalogo: { fuente, commit, ...resultado.catalogo },
    etapas: [etapas[0], etapas[1], resultado.etapa], capacitacion, plan_etapa3, fuente_en_vivo
  };
}

export function mismoContenido(a, b) {
  const contenido = ({ generado, catalogo: { fuente, commit, ...catalogo }, ...resto }) => ({ catalogo, ...resto });
  return JSON.stringify(contenido(a)) === JSON.stringify(contenido(b));
}

async function main() {
try {
  const erp = resolve(root, option('--erp') || process.env.GANTT_ERP_DIR || '../ERP - TIDEO');
  const dir = resolve(root, option('--datos') || 'docs-cliente/gantt/datos');
  const read = name => JSON.parse(readFileSync(resolve(dir, `${name}.json`), 'utf8').replace(/^\uFEFF/, ''));
  const etapas = ['etapa1', 'etapa2', 'etapa3'].map(read);
  const capacitacion = read('capacitacion');
  const fuente_en_vivo = read('fuente-en-vivo');
  const url = option('--catalogo-url');
  let catalogo, fuente, commit = null;
  if (url) {
    const response = await fetch(url, { signal: AbortSignal.timeout(fuente_en_vivo.tiempo_maximo_ms), cache: 'no-store' });
    if (!response.ok) throw new Error(`Catálogo: HTTP ${response.status}`);
    catalogo = await response.json();
    fuente = url;
  } else {
    try {
      const raw = execFileSync('git', ['show', 'origin/main:catalogo/pantallas.json'], {
        cwd: erp, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 10 * 1024 * 1024
      });
      catalogo = JSON.parse(raw);
      fuente = 'git show origin/main:catalogo/pantallas.json';
    } catch {
      catalogo = JSON.parse(readFileSync(resolve(erp, 'catalogo/pantallas.json'), 'utf8'));
      fuente = 'archivo en disco (alternativa)';
    }
    try {
      commit = execFileSync('git', ['rev-parse', '--short', 'origin/main'], {
        cwd: erp, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']
      }).trim();
    } catch { /* El catálogo puede estar disponible sin Git. */ }
  }
  const datos = construirDatos({
    etapas, capacitacion, fuente_en_vivo, catalogo, fuente, commit, generado: new Date().toISOString()
  });
  const destino = resolve(root, 'docs-cliente/gantt/datos.js');
  const serializar = d => `window.GANTT_DATOS = ${JSON.stringify(d, null, 2)};\n`;
  console.log(`Fuente del catálogo: ${fuente}`);
  console.log(`Commit origin/main: ${commit || 'no disponible'}`);
  console.log(`Pantallas vigentes: ${datos.catalogo.total}; operativas: ${datos.catalogo.operativas}; ` +
    `por desarrollar: ${datos.catalogo.por_desarrollar}`);
  for (const etapa of datos.etapas) {
    const counts = {};
    for (const a of etapa.secciones.flatMap(s => s.actividades)) counts[a.estado] = (counts[a.estado] || 0) + 1;
    console.log(`${etapa.titulo}: ${Object.entries(counts).map(([s, n]) => `${n} ${s}`).join(', ')}`);
  }
  if (args.includes('--verificar')) {
    let anterior;
    try {
      const raw = readFileSync(destino, 'utf8');
      anterior = JSON.parse(raw.replace(/^window\.GANTT_DATOS = /, '').replace(/;\s*$/, ''));
    } catch { throw new Error('No se pudo leer datos.js para verificarlo.'); }
    if (!mismoContenido(anterior, datos)) {
      console.error('datos.js no coincide con los datos generados.');
      process.exitCode = 2;
    } else console.log('Verificación correcta: datos.js coincide (se ignoran fecha, fuente y commit).');
  } else {
    writeFileSync(destino, serializar(datos), 'utf8');
    console.log('Generado: docs-cliente/gantt/datos.js');
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}

}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
