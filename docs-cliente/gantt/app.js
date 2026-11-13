(() => {
    'use strict';
    let data = window.GANTT_DATOS;
    let origen = `Copia del ${new Intl.DateTimeFormat("es-PE").format(new Date(data.generado))}` +
        " · sin conexión al catálogo";
    const $ = s => document.querySelector(s);
    const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const localDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const today = localDate(new Date());
    const date = (s, options = { day: 'numeric', month: 'short', year: 'numeric' }) => new Intl.DateTimeFormat('es-PE',
         options).format(new Date(`${s}T12:00:00`)).replace(/\./g, '');
    const range = (a, b) => `${date(a, { day: 'numeric', month: 'short' })} – ${date(b)}`;
    const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
    const stateLabel = { terminado: 'Terminado', pendiente: 'Pendiente', 'en curso': 'En curso', atrasada: 'Atrasada',
         reprogramado: 'Reprogramado' };
    const types = { ADM: ['ERP Administrativo', '#147995'], OP: ['ERP Operativo', '#4359a2'], FIX: ['Corrección' +
        ' técnica', '#6f568f'], AUDIT: ['Auditoría', '#527071'], SUNAT: ['Facturación electrónica', '#a24f67'], CLIENTE:
         ['DIFESMAQ', '#706634'], HITO: ['Hito', '#3b6e55'] };
    function render() {
    const periods = data.etapas.flatMap(e => e.periodos);
    const all = data.etapas.flatMap(e => e.secciones.flatMap(s => s.actividades.map(a => ({ ...a, etapa: e.id, seccion: s.titulo }))));
    const displayedState = a => {
        if (a.estado !== 'pendiente')
            return a.estado;
        const ps = a.periodos.map(id => periods.find(p => p.id === id)).filter(Boolean);
        if (ps.some(p => p.inicio <= today && today <= p.fin))
            return 'en curso';
        if (ps.length && ps.every(p => p.fin < today))
            return 'atrasada';
        return 'pendiente';
    };
    const valid = all.filter(a => a.estado !== 'reprogramado');
    const done = valid.filter(a => a.estado === 'terminado').length;
    const metric = (label, value, note, progress, small = false) => `<div class="metric"><div\
 class="metric-label">${esc(label)}</div><strong class="metric-value ${small ? 'small' : ''}">${esc(value)}</strong><div\
 class="metric-note">${esc(note || '')}</div>${progress == null ? '' : `<div class="progress" aria-hidden="true"><span\
 style="width:${progress}%"></span></div>`}</div>`;
    const stageCards = data.etapas.map(e => {
        const acts = e.secciones.flatMap(s => s.actividades), eligible = acts.filter(a => a.estado !== 'reprogramado'),
         n = eligible.filter(a => a.estado === 'terminado').length, res = acts.filter(a => a.estado === 'reprogramado').length;
        return `<article class="stage"><div class="stage-top"><h3>${esc(e.titulo)}</h3><strong>${pct(n,
         eligible.length)}%</strong></div><p class="date">${esc(range(e.inicio, e.fin))}</p><div class="progress"><span\
 style="width:${pct(n, eligible.length)}%"></span></div><p class="metric-note">${n} de ${eligible.length} actividades\
 terminadas${res ? ` · ${res} reprogramadas a la Etapa 3` : ''}</p></article>`;
    }).join('');
    const cierre = data.etapas.at(-1).fin;
    const days = Math.round((Date.parse(`${cierre}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
    const cat = data.catalogo;
    const appNames = { admin: 'ERP Administrativo', operaciones: 'ERP Operativo', movil: 'Versión Móvil' };
    const pendingModules = cat.modulos.filter(m => m.por_desarrollar > 0)
        .sort((a, b) => b.por_desarrollar - a.por_desarrollar);
    const completeModules = cat.modulos.filter(m => m.por_desarrollar === 0);
    const renderModule = m => `<div class="module"><strong>${esc(m.modulo)}</strong>
    <span>${esc(appNames[m.app] || m.app)}</span>
    <span>${m.operativas} de ${m.total} operativas · ${m.por_desarrollar} por desarrollar</span>
    <div class="progress"><span style="width:${pct(m.operativas, m.total)}%"></span></div></div>`;
    $('#desarrollo-contenido').innerHTML = `<div class="hero"><div><div class="eyebrow">Proyecto DIFESMAQ ·\
 TIDEO</div><h1 id="titulo-desarrollo">Desarrollo — OPERA</h1><p>${esc(range(data.etapas[0].inicio, cierre))} ·\
 Responsabilidad de TIDEO</p></div><p class="updated" id="origen-catalogo">${esc(origen)}</p></div>
    <div class="metrics">${metric('Avance del desarrollo', `${pct(done, valid.length)}%`, `${done} de ${valid.length}
         actividades`, pct(done, valid.length))}${metric('Pantallas operativas', `${cat.operativas} de ${cat.total}`,
         `${pct(cat.operativas, cat.total)}% del alcance`, pct(cat.operativas, cat.total))}${metric('Por desarrollar',
         cat.por_desarrollar, 'Pantallas del alcance')}${metric('Cierre del desarrollo', days >= 0 ? `${days} días` :
         `Hace ${-days} días`, date(cierre))}${metric('Actividades terminadas', `${done} / ${valid.length}`, 'Sin contar' +
        ' reprogramadas')}</div>
    <div class="section-heading"><div><h2>Etapas del desarrollo</h2><p>Avance basado en actividades\
 terminadas.</p></div></div><div class="stages">${stageCards}</div>
    <div class="section-heading"><div><h2>Plan de desarrollo</h2><p>Explora las actividades por etapa y\
 periodo.</p></div></div><div class="panel"><div class="controls"><label>Etapa<select id="f-etapa"><option\
 value="">Todas las etapas</option>${data.etapas.map(e => `<option\
 value="${esc(e.id)}">${esc(e.titulo)}</option>`).join('')}</select></label><label>Estado<select id="f-estado"><option\
 value="">Todos los estados</option>${Object.entries(stateLabel).map(([k, v]) => `<option\
 value="${esc(k)}">${esc(v)}</option>`).join('')}</select></label><label>Tipo<select id="f-tipo"><option value="">Todos\
 los tipos</option>${Object.entries(types).map(([k, v]) => `<option value="${k}">${k} ·\
 ${esc(v[0])}</option>`).join('')}</select></label><label>Buscar<input id="f-buscar" type="search"\
 placeholder="Actividad o sección"></label></div><div class="gantt-actions"><span id="contador"\
 aria-live="polite"></span><div class="action-buttons"><button class="button" id="toggle-all" type="button">Desplegar\
 todo</button><button class="button" id="go-today" type="button">Ir a hoy</button></div></div><div\
 class="gantt-container"><div class="gantt-wrap" role="region" aria-label="Diagrama de Gantt" tabindex="0"><table\
 class="gantt" id="gantt"></table></div><div class="scroll-hint" hidden>Desplázate para ver más ↓</div></div><div\
 class="legend">${Object.entries(types).map(([k, v]) => `<span><i style="--c:${v[1]}"></i>${k} ·\
 ${esc(v[0])}</span>`).join('')}<span>Contorno: pendiente · rojo: atrasada · rayado: reprogramada</span></div></div>
    <div class="section-heading"><div><h2>Pendiente por módulo</h2><p>Pantallas por desarrollar / pantallas vigentes en\
 el alcance.</p></div></div><div class="panel"><div class="module-grid">${pendingModules.map(renderModule).join('')}</div><details\
 class="complete-modules"><summary>${completeModules.length} módulos completos</summary><div\
 class="module-grid">${completeModules.map(renderModule).join('')}</div></details><p class="notice">${esc(cat.nota_excluidas)}</p></div>`;
    const expanded = new Set(['etapa3']);
    const collapsedSections = new Set();
    function renderGantt() {
        const filters = { etapa: $('#f-etapa').value, estado: $('#f-estado').value, tipo: $('#f-tipo').value, q:
         $('#f-buscar').value.trim().toLocaleLowerCase('es') };
        const matches = a => (!filters.etapa || a.etapa === filters.etapa) && (!filters.estado || displayedState(a) ===
         filters.estado) && (!filters.tipo || a.tipo === filters.tipo) && (!filters.q ||
         `${a.texto} ${a.seccion}`.toLocaleLowerCase('es').includes(filters.q));
        const filtered = all.filter(matches);
        $('#contador').textContent = `${filtered.length} de ${all.length} actividades`;
        $('#toggle-all').textContent = expanded.size === data.etapas.length && !collapsedSections.size ? 'Plegar todo' : 'Desplegar todo';
        let html = `<colgroup><col style="width:var(--first)">${periods.map(() => '<col' +
        ' style="width:var(--cell)">').join('')}</colgroup><thead><tr><th scope="col"\
 rowspan="2">Actividad</th>${data.etapas.map(e => `<th scope="colgroup"\
 colspan="${e.periodos.length}">${esc(e.titulo)}</th>`).join('')}</tr><tr>${periods.map(p => `<th scope="col"\
 class="${p.inicio <= today && today <= p.fin ? 'today' : ''}">${esc(p.id)}<br><span class="muted">${esc(p.etiqueta !==
         p.id ? p.etiqueta : `${date(p.inicio, { day: 'numeric', month: 'short' })} – ${date(p.fin, { day: 'numeric',
         month: 'short' })}`)}</span>${p.inicio <= today && today <= p.fin ? '<span class="today-label">● HOY</span>' :
         ''}</th>`).join('')}</tr></thead><tbody>`;
        for (const e of data.etapas) {
            const ea = filtered.filter(a => a.etapa === e.id);
            if (!ea.length)
                continue;
            html += `<tr class="group"><th scope="row"><button type="button" data-stage="${e.id}"\
 aria-expanded="${expanded.has(e.id)}">${expanded.has(e.id) ? '▾' : '▸'} ${esc(e.titulo)} ·\
 ${ea.length}</button></th><td colspan="${periods.length}"></td></tr>`;
            if (!expanded.has(e.id))
                continue;
            for (const s of e.secciones) {
                const acts = ea.filter(a => a.seccion === s.titulo);
                if (!acts.length)
                    continue;
                const sectionId = `${e.id}:${s.titulo}`;
                const sectionOpen = !collapsedSections.has(sectionId);
                html += `<tr class="section-row"><th scope="row"><button type="button"
                    data-section="${esc(sectionId)}" aria-expanded="${sectionOpen}">
                    ${sectionOpen ? '▾' : '▸'} ${esc(s.titulo)} · ${acts.length}</button></th>
                    <td colspan="${periods.length}"></td></tr>`;
                if (!sectionOpen) continue;
                for (const a of acts) {
                    const st = displayedState(a), tip = `${a.texto}\nTipo: ${a.tipo} · ${types[a.tipo]?.[0] ||
         a.tipo}\nPeriodo: ${a.periodos.join(', ')}\nEstado: ${stateLabel[st]}${a.nota ? '\nNota: ' + a.nota : ''}`;
                    html += `<tr><th scope="row" title="${esc(tip)}">${esc(a.texto)}</th>${periods.map(p => `<td\
 class="${p.inicio <= today && today <= p.fin ? 'today' : ''}">${a.periodos.includes(p.id) ? `<span class="bar\
 ${st.replace(' ', '-')}" style="--type:${types[a.tipo]?.[1] || '#52627a'}" title="${esc(tip)}" role="img"\
 aria-label="${esc(tip)}"></span>` : ''}</td>`).join('')}</tr>`;
                }
            }
        }
        $('#gantt').innerHTML = html + '</tbody>';
        requestAnimationFrame(() => { goToToday(); updateScrollHint(); });
    }
    function goToToday() {
        const wrap = $('.gantt-wrap');
        const cell = $('#gantt thead .today');
        if (!cell)
            return;
        const firstWidth = $('#gantt thead th[rowspan]').getBoundingClientRect().width;
        const left = cell.offsetLeft;
        if (left < wrap.scrollLeft + firstWidth || left + cell.offsetWidth > wrap.scrollLeft + wrap.clientWidth) {
            wrap.scrollLeft = Math.max(0, left - firstWidth);
        }
    }
    function updateScrollHint() {
        const wrap = $('.gantt-wrap');
        $('.scroll-hint').hidden = wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 2;
    }
    $('.gantt-wrap').addEventListener('scroll', updateScrollHint);
    window.onresize = updateScrollHint;
    $('#go-today').addEventListener('click', goToToday);
    ['#f-etapa', '#f-estado', '#f-tipo', '#f-buscar'].forEach(s => $(s).addEventListener('input', renderGantt));
    $('#gantt').addEventListener('click', event => {
        const section = event.target.closest('[data-section]');
        if (section) {
            const id = section.dataset.section;
            if (collapsedSections.has(id)) collapsedSections.delete(id);
            else collapsedSections.add(id);
            renderGantt();
            return;
        }
        const stage = event.target.closest('[data-stage]');
        if (!stage) return;
        const id = stage.dataset.stage;
        if (expanded.has(id)) expanded.delete(id);
        else expanded.add(id);
        renderGantt();
    });
    $('#toggle-all').addEventListener('click', () => {
        if (expanded.size === data.etapas.length && !collapsedSections.size) {
            expanded.clear();
        } else {
            data.etapas.forEach(e => expanded.add(e.id));
            collapsedSections.clear();
        }
        renderGantt();
    });
    renderGantt();
    const cap = data.capacitacion, sessions = cap.sesiones, realizadas = sessions.filter(s => s.estado ===
         'realizada').length, confirmadas = sessions.filter(s => s.estado === 'confirmada').length, next =
         [...sessions].sort((a, b) => a.fecha.localeCompare(b.fecha)).find(s => s.fecha >= today && s.estado !==
         'realizada'), areas = new Set(sessions.map(s => s.area));
    const weekStart = s => { const d = new Date(`${s}T12:00:00`); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return localDate(d); };
    const weeks = new Map();
    for (const s of [...sessions].sort((a, b) => a.fecha.localeCompare(b.fecha))) {
        const w = weekStart(s.fecha);
        if (!weeks.has(w))
            weeks.set(w, []);
        weeks.get(w).push(s);
    }
    const sessionCard = s => {
        const waiting = s.requiere_desarrollo && all.some(a => a.etapa === 'etapa3' &&
         a.periodos.includes(s.requiere_desarrollo) && a.estado !== 'terminado');
        const estado = s.fecha < today && ['programada', 'confirmada'].includes(s.estado) ? 'por-registrar' : s.estado;
        const etiqueta = estado === 'por-registrar' ? 'Por registrar' : (cap.estados[estado] || estado);
        return `<article class="session"><div class="date-box"><strong>${esc(date(s.fecha, { day: 'numeric'
         }))}</strong><span>${esc(date(s.fecha, { month: 'short' }))}</span></div><div><div\
 class="session-meta"><span>${esc(s.dia)} · ${esc(s.area)}</span><span class="badge\
 ${esc(estado)}">${esc(etiqueta)}</span></div><h3>${esc(s.titulo)}</h3><h4>Temas</h4><ul>${s.temas.map(t =>
         `<li>${esc(t)}</li>`).join('')}</ul><h4>Preparación a cargo de DIFESMAQ</h4><ul\
 class="checks">${s.preparacion_cliente.map(t => `<li>${esc(t)}</li>`).join('')}</ul>${waiting ? `<p class="notice">⚠\
 Depende del desarrollo ${esc(s.requiere_desarrollo)}, que aún tiene actividades sin terminar.</p>` : ''}</div></article>`;
    };
    const trainingMetrics = [
        metric('Sesiones realizadas', `${realizadas} / ${sessions.length}`,
            `${pct(realizadas, sessions.length)}% completado`, pct(realizadas, sessions.length)),
        metric('Confirmadas', confirmadas, 'Por DIFESMAQ'),
        metric('Próxima sesión', next ? date(next.fecha) : 'Sin próxima sesión', next ? next.titulo : '', null, true),
        metric('Áreas cubiertas', areas.size, 'Áreas incluidas en la agenda')
    ].join('');
    const trainingWeeks = [...weeks].map(([w, ss]) => `<section class="week">
        <h3 class="week-title">Semana del ${esc(date(w))}</h3>
        <div class="sessions">${ss.map(sessionCard).join('')}</div></section>`).join('');
    $('#capacitacion-contenido').innerHTML = `<div class="hero"><div>
        <div class="eyebrow">Proyecto DIFESMAQ · TIDEO</div><h1 id="titulo-capacitacion">Capacitación — OPERA</h1>
        <p>Agenda de DIFESMAQ · ${esc(range(sessions[0].fecha, sessions.at(-1).fecha))}</p></div>
        <p class="updated">Actualizado: ${esc(date(data.generado.slice(0, 10)))}</p></div>
        <div class="metrics training">${trainingMetrics}</div>
        <div class="notice training-intro">${esc(cap.nota)}<br><strong>${esc(cap.dias.join(' · '))}</strong>
        · ${esc(cap.duracion_sugerida)} · ${esc(cap.horario)}</div>
        <div class="section-heading"><div><h2>Agenda de sesiones</h2>
        <p>Preparación y temas para cada encuentro.</p></div></div>${trainingWeeks}
        <div class="section-heading"><div><h2>Responsabilidades</h2>
        <p>Un trabajo coordinado para avanzar juntos.</p></div></div>
        <div class="panel responsibilities"><div><h3>TIDEO</h3>
        <p>Desarrollo de OPERA y acompañamiento en la capacitación.</p></div><div><h3>DIFESMAQ</h3>
        <p>Preparación de la información y disponibilidad de sus equipos.</p></div></div>`;
    }
    render();
    const fuente = data.fuente_en_vivo;
    const jsonEnVivo = async url => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), fuente.tiempo_maximo_ms);
        try {
            const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } finally { clearTimeout(timer); }
    };
    let ultimoCambio = null;
    let enVivo = false;
    function actualizarOrigen() {
        if (!enVivo) return;
        origen = ultimoCambio ? `En vivo · catálogo actualizado el ${ultimoCambio}` : 'En vivo';
        const indicador = $('#origen-catalogo');
        if (indicador) indicador.textContent = origen;
    }
    jsonEnVivo(fuente.ultimo_cambio_url).then(commits => {
        const fecha = commits?.[0]?.commit?.committer?.date;
        if (!fecha || Number.isNaN(Date.parse(fecha))) throw new Error('Fecha de último cambio inválida');
        ultimoCambio = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
            .format(new Date(fecha));
        actualizarOrigen();
    }).catch(error => console.warn('No se pudo obtener el último cambio del catálogo:', error));
    jsonEnVivo(fuente.catalogo_url).then(catalogo => {
        const resultado = window.GANTT_CALCULO.calcular(data.plan_etapa3, catalogo);
        data = { ...data, catalogo: { ...data.catalogo, ...resultado.catalogo },
            etapas: data.etapas.map(e => e.id === resultado.etapa.id ? resultado.etapa : e) };
        enVivo = true;
        actualizarOrigen();
        render();
    }).catch(error => console.warn('No se pudo actualizar el catálogo en vivo:', error));
    function route() { const view = location.hash === '#capacitacion' ? 'capacitacion' : 'desarrollo'; for (const id of
         ['desarrollo', 'capacitacion']) {
        document.getElementById(id).hidden = id !== view;
        const a = document.querySelector(`[data-view="${id}"]`);
        a.classList.toggle('active', id === view);
        if (id === view)
            a.setAttribute('aria-current', 'page');
        else
            a.removeAttribute('aria-current');
    } }
    window.addEventListener('hashchange', route);
    route();
})();
