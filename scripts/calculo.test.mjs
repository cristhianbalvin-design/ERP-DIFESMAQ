import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { construirDatos, mismoContenido } from './generar-gantt.mjs';

const { calcular } = createRequire(import.meta.url)('../docs-cliente/gantt/calculo.js');
const pantalla = (clave, estado, app = 'operaciones') => ({ clave, estado, app, modulo: 'Módulo', titulo: clave });
const catalogo = { pantallas: [pantalla('a', 'activa'), pantalla('b', 'puente'), pantalla('c', 'maqueta'),
  pantalla('d', 'placeholder', 'admin'), pantalla('e', 'legado'), pantalla('f', 'activa')] };
const plan = { id: 'etapa3', titulo: 'Etapa 3', excluir_del_alcance: ['f'], nota_excluidas: 'Internas', secciones: [
  { titulo: 'D1', periodo: 'D1', pantallas_catalogo: ['a', 'b', 'c', 'd'] },
  { titulo: 'Hito', periodo: 'D1', actividades: [{ id: 'h', tipo: 'HITO', periodos: ['D1'], estado: 'pendiente' }] }
] };

test('alcance, exclusiones y resumen por módulo', () => {
  const { catalogo: c } = calcular(plan, catalogo);
  assert.deepEqual([c.total, c.operativas, c.por_desarrollar], [4, 2, 2]);
  assert.deepEqual(c.modulos.map(m => [m.app, m.total, m.operativas, m.por_desarrollar]),
    [['admin', 1, 0, 1], ['operaciones', 3, 2, 1]]);
});
test('estados y textos de pantallas', () => {
  const a = calcular(plan, catalogo).etapa.secciones[0].actividades;
  assert.deepEqual(a.map(x => x.estado), ['terminado', 'terminado', 'pendiente', 'pendiente']);
  assert.equal(a[2].texto, 'c — conectar a datos reales');
  assert.equal(a[3].texto, 'd — construir la pantalla');
  assert.equal(a[3].tipo, 'ADM');
});
test('el hito termina solo cuando termina todo su periodo', () => {
  assert.equal(calcular(plan, catalogo).etapa.secciones[1].actividades[0].estado, 'pendiente');
  const completo = { pantallas: catalogo.pantallas.map(p => ({ ...p, estado: 'activa' })) };
  assert.equal(calcular(plan, completo).etapa.secciones[1].actividades[0].estado, 'terminado');
});
test('rechaza claves inexistentes sin mutar el plan', () => {
  const original = JSON.stringify(plan);
  const invalido = { ...plan, secciones: [{ titulo: 'Error', pantallas_catalogo: ['ausente'] }] };
  assert.throws(() => calcular(invalido, catalogo), /Clave de pantalla inexistente/);
  calcular(plan, catalogo);
  assert.equal(JSON.stringify(plan), original);
});
test('el generador utiliza el mismo cálculo para los mismos datos', () => {
  const etapa = { titulo: 'Etapa', secciones: [{ actividades: [] }] };
  const datos = construirDatos({
    etapas: [etapa, etapa, plan], capacitacion: {}, fuente_en_vivo: {}, catalogo,
    fuente: 'prueba', commit: null, generado: '2026-01-01T00:00:00Z'
  });
  const esperado = calcular(plan, catalogo);
  assert.deepEqual(datos.etapas[2], esperado.etapa);
  const { fuente, commit, ...resumen } = datos.catalogo;
  assert.deepEqual(resumen, esperado.catalogo);
});

test('la comparación ignora metadatos y detecta cambios de estado', () => {
  const etapa = { titulo: 'Etapa', secciones: [{ actividades: [] }] };
  const base = { etapas: [etapa, etapa, plan], capacitacion: {}, fuente_en_vivo: {}, catalogo };
  const primero = construirDatos({ ...base, fuente: 'git', commit: 'abc', generado: '2026-01-01T00:00:00Z' });
  const segundo = construirDatos({ ...base, fuente: 'url', commit: null, generado: '2026-02-01T00:00:00Z' });
  const cambiado = { pantallas: catalogo.pantallas.map(p => p.clave === 'c' ? { ...p, estado: 'activa' } : p) };
  const tercero = construirDatos({ ...base, catalogo: cambiado, fuente: 'url', commit: null, generado: segundo.generado });
  assert.equal(mismoContenido(primero, segundo), true);
  assert.equal(mismoContenido(primero, tercero), false);
});
