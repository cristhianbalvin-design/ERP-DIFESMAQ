import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(name); if (i < 0) return undefined; if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Falta el valor de ${name}`); return args[i + 1]; };
try {
  const erp = resolve(root, option('--erp') || process.env.GANTT_ERP_DIR || '../ERP - TIDEO');
  const dir = resolve(root, option('--datos') || 'docs-cliente/gantt/datos');
  const read = name => JSON.parse(readFileSync(resolve(dir, `${name}.json`), 'utf8').replace(/^\uFEFF/, ''));
  const etapas = ['etapa1', 'etapa2', 'etapa3'].map(read);
  const capacitacion = read('capacitacion');
  let catalogo, fuente, commit = null;
  try { catalogo = JSON.parse(execFileSync('git', ['show', 'origin/main:catalogo/pantallas.json'], { cwd: erp, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 10 * 1024 * 1024 })); fuente = 'git show origin/main:catalogo/pantallas.json'; }
  catch { catalogo = JSON.parse(readFileSync(resolve(erp, 'catalogo/pantallas.json'), 'utf8')); fuente = 'archivo en disco (alternativa)'; }
  try { commit = execFileSync('git', ['rev-parse', '--short', 'origin/main'], { cwd: erp, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); } catch { /* El catálogo puede estar disponible sin Git. */ }
  const porClave = new Map(catalogo.pantallas.map(p => [p.clave, p]));
  const vigente = catalogo.pantallas.filter(p => p.estado !== 'legado' && !etapas[2].excluir_del_alcance.includes(p.clave));
  const operativa = p => ['activa', 'puente'].includes(p.estado);
  const pendiente = p => ['maqueta', 'placeholder'].includes(p.estado);
  const modulos = [];
  for (const p of vigente) {
    let m = modulos.find(m => m.app === p.app && m.modulo === p.modulo);
    if (!m) { m = { app: p.app, modulo: p.modulo, total: 0, operativas: 0, por_desarrollar: 0 }; modulos.push(m); }
    m.total++; if (operativa(p)) m.operativas++; if (pendiente(p)) m.por_desarrollar++;
  }
  modulos.sort((a, b) => a.app.localeCompare(b.app) || a.modulo.localeCompare(b.modulo, 'es'));
  for (const seccion of etapas[2].secciones) {
    const pantallas = (seccion.pantallas_catalogo || []).map(clave => {
      const p = porClave.get(clave);
      if (!p) throw new Error(`Clave de pantalla inexistente en el catálogo: ${clave} (sección: ${seccion.titulo})`);
      return { id: clave, texto: p.titulo + (p.estado === 'maqueta' ? ' — conectar a datos reales' : p.estado === 'placeholder' ? ' — construir la pantalla' : ''), tipo: p.app === 'operaciones' ? 'OP' : 'ADM', periodos: [seccion.periodo], estado: operativa(p) ? 'terminado' : 'pendiente', clave_catalogo: clave };
    });
    seccion.actividades = [...(seccion.actividades || []), ...pantallas];
  }
  const actividades3 = etapas[2].secciones.flatMap(s => s.actividades);
  for (const hito of actividades3.filter(a => a.tipo === 'HITO')) {
    hito.estado = actividades3.filter(a => a.tipo !== 'HITO' && a.periodos.some(p => hito.periodos.includes(p))).every(a => a.estado === 'terminado') ? 'terminado' : 'pendiente';
  }
  const datos = { generado: new Date().toISOString(), catalogo: { fuente, commit, total: vigente.length, operativas: vigente.filter(operativa).length, por_desarrollar: vigente.filter(pendiente).length, modulos, nota_excluidas: etapas[2].nota_excluidas }, etapas, capacitacion };
  const destino = resolve(root, 'docs-cliente/gantt/datos.js');
  const serializar = d => `window.GANTT_DATOS = ${JSON.stringify(d, null, 2)};\n`;
  console.log(`Fuente del catálogo: ${fuente}`);
  console.log(`Commit origin/main: ${commit || 'no disponible'}`);
  console.log(`Pantallas vigentes: ${datos.catalogo.total}; operativas: ${datos.catalogo.operativas}; por desarrollar: ${datos.catalogo.por_desarrollar}`);
  for (const etapa of etapas) {
    const counts = {}; for (const a of etapa.secciones.flatMap(s => s.actividades)) counts[a.estado] = (counts[a.estado] || 0) + 1;
    console.log(`${etapa.titulo}: ${Object.entries(counts).map(([s, n]) => `${n} ${s}`).join(', ')}`);
  }
  if (args.includes('--verificar')) {
    let anterior; try { const raw = readFileSync(destino, 'utf8'); anterior = JSON.parse(raw.replace(/^window\.GANTT_DATOS = /, '').replace(/;\s*$/, '')); } catch { throw new Error('No se pudo leer datos.js para verificarlo.'); }
    anterior.generado = datos.generado;
    if (serializar(anterior) !== serializar(datos)) throw new Error('datos.js no coincide con los datos generados.');
    console.log('Verificación correcta: datos.js coincide (se ignora la fecha de generación).');
  } else { writeFileSync(destino, serializar(datos), 'utf8'); console.log('Generado: docs-cliente/gantt/datos.js'); }
} catch (error) { console.error(`Error: ${error.message}`); process.exitCode = 1; }
