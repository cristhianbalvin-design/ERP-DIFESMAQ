const calculo = (() => {
  'use strict';
  const operativa = p => ['activa', 'puente'].includes(p.estado);
  const pendiente = p => ['maqueta', 'placeholder'].includes(p.estado);

  function calcular(plan, catalogo) {
    if (!plan || !Array.isArray(plan.secciones) || !Array.isArray(plan.excluir_del_alcance) ||
        !catalogo || !Array.isArray(catalogo.pantallas)) throw new Error('Formato de plan o catálogo inválido.');
    for (const p of catalogo.pantallas) {
      if (!p || !['clave', 'titulo', 'estado', 'app', 'modulo'].every(k => typeof p[k] === 'string' && p[k])) {
        throw new Error('Formato de pantalla inválido en el catálogo.');
      }
    }
    if (catalogo.pantallas.some(p => !['activa', 'puente', 'maqueta', 'placeholder', 'legado'].includes(p.estado))) {
      throw new Error('Estado de pantalla inválido en el catálogo.');
    }
    const porClave = new Map(catalogo.pantallas.map(p => [p.clave, p]));
    if (porClave.size !== catalogo.pantallas.length) throw new Error('El catálogo contiene claves duplicadas.');
    for (const clave of plan.excluir_del_alcance) {
      if (!porClave.has(clave)) throw new Error(`Clave de pantalla inexistente en el catálogo: ${clave} (exclusión)`);
    }
    const vigente = catalogo.pantallas.filter(p => p.estado !== 'legado' && !plan.excluir_del_alcance.includes(p.clave));
    const modulos = [];
    for (const p of vigente) {
      let m = modulos.find(m => m.app === p.app && m.modulo === p.modulo);
      if (!m) {
        m = { app: p.app, modulo: p.modulo, total: 0, operativas: 0, por_desarrollar: 0 };
        modulos.push(m);
      }
      m.total++;
      if (operativa(p)) m.operativas++;
      if (pendiente(p)) m.por_desarrollar++;
    }
    modulos.sort((a, b) => a.app.localeCompare(b.app) || a.modulo.localeCompare(b.modulo, 'es'));
    const etapa = JSON.parse(JSON.stringify(plan));
    for (const seccion of etapa.secciones) {
      const pantallas = (seccion.pantallas_catalogo || []).map(clave => {
        const p = porClave.get(clave);
        if (!p) throw new Error(`Clave de pantalla inexistente en el catálogo: ${clave} (sección: ${seccion.titulo})`);
        const sufijo = p.estado === 'maqueta' ? ' — conectar a datos reales' :
          p.estado === 'placeholder' ? ' — construir la pantalla' : '';
        return {
          id: clave, texto: p.titulo + sufijo, tipo: p.app === 'operaciones' ? 'OP' : 'ADM',
          periodos: [seccion.periodo], estado: operativa(p) ? 'terminado' : 'pendiente', clave_catalogo: clave
        };
      });
      seccion.actividades = [...(seccion.actividades || []), ...pantallas];
    }
    const actividades = etapa.secciones.flatMap(s => s.actividades);
    for (const hito of actividades.filter(a => a.tipo === 'HITO')) {
      const periodo = actividades.filter(a => a.tipo !== 'HITO' && a.periodos.some(p => hito.periodos.includes(p)));
      hito.estado = periodo.every(a => a.estado === 'terminado') ? 'terminado' : 'pendiente';
    }
    return {
      catalogo: {
        total: vigente.length, operativas: vigente.filter(operativa).length,
        por_desarrollar: vigente.filter(pendiente).length, modulos, nota_excluidas: plan.nota_excluidas
      },
      etapa
    };
  }
  return { calcular };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = calculo;
if (typeof window !== 'undefined') window.GANTT_CALCULO = calculo;
