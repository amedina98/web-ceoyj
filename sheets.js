/* Datos públicos de Google Sheets, mediante Google Visualization. */
(() => {
  const columns = {
    Config: ['clave', 'valor'],
    Torneos: ['id', 'nombre', 'formato', 'dia', 'organiza', 'fecha_actual', 'puntos_victoria', 'titulo_playoffs'],
    Partidos: ['torneo', 'jornada', 'dia', 'hora', 'local', 'visita', 'goles_local', 'goles_visita', 'cancha', 'estado', 'nota'],
    Plantel: ['nombre', 'apodo', 'dorsal', 'posicion', 'goles', 'instagram', 'foto'],
    Figuras: ['jugador', 'torneo', 'dia', 'texto', 'foto'],
    Sponsors: ['nombre', 'foto', 'enlace', 'descripcion', 'estado'],
    Playoffs: ['torneo', 'ronda', 'local', 'visita', 'goles_local', 'goles_visita']
  };
  const pad = n => String(n).padStart(2, '0');
  function value(cell) {
    const v = cell?.v;
    const date = typeof v === 'string' && v.match(/^Date\((\d+),(\d+),(\d+)(?:,.*)?\)$/);
    if (date) return `${date[1]}-${pad(+date[2] + 1)}-${pad(date[3])}`;
    if (Array.isArray(v)) return `${pad(v[0])}:${pad(v[1])}`;
    return String(v ?? '').trim();
  }
  function readTab(id, name, headers) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const callback = 'ceoyjSheet' + name;
      const finish = (fn, arg) => {
        clearTimeout(timer);
        delete window[callback];
        script.remove();
        fn(arg);
      };
      const fail = () => finish(reject, new Error('No se pudo leer ' + name));
      const timer = setTimeout(fail, 8000);
      window[callback] = response => {
        const table = response?.table;
        if (response?.status !== 'ok' || headers.some((h, i) => table?.cols[i]?.label !== h)) {
          fail();
          return;
        }
        const rows = (table.rows ?? []).map(row => Object.fromEntries(headers.map((h, i) => [h, value(row.c[i])])));
        finish(resolve, rows.filter(row => row[headers[0]]));
      };
      script.onerror = fail;
      const query = new URLSearchParams({ sheet: name, headers: '1', tqx: 'responseHandler:' + callback });
      script.src = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?${query}`;
      document.head.append(script);
    });
  }
  const number = (s, fallback = 0) => /^\d+$/.test(s) ? Number(s) : fallback;
  const score = s => number(s, null);
  const date = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
  const time = s => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(s);

  function assemble(tabs, original) {
    const config = { ...original.config };
    for (const { clave, valor } of tabs.Config) {
      if (Object.hasOwn(config, clave) && (valor || !['whatsapp', 'email'].includes(clave))) config[clave] = valor;
    }
    const torneos = tabs.Torneos.filter(t => t.nombre).map(t => {
      const partidos = tabs.Partidos.filter(p => p.torneo === t.id && p.local && p.visita && number(p.jornada)).map(p => ({
        fecha: number(p.jornada), dia: date(p.dia) ? p.dia : '', hora: time(p.hora) ? p.hora : '',
        local: p.local, visita: p.visita, gl: score(p.goles_local), gv: score(p.goles_visita),
        cancha: p.cancha, estado: p.estado.toLowerCase(), nota: p.nota
      }));
      const rounds = new Map();
      for (const p of tabs.Playoffs.filter(p => p.torneo === t.id && p.ronda && p.local && p.visita)) {
        if (!rounds.has(p.ronda)) rounds.set(p.ronda, []);
        rounds.get(p.ronda).push({ a: p.local, b: p.visita, ga: score(p.goles_local), gb: score(p.goles_visita) });
      }
      return {
        id: t.id, nombre: t.nombre, formato: t.formato, dia: t.dia, organiza: t.organiza,
        fechaActual: number(t.fecha_actual, 1), puntosVictoria: number(t.puntos_victoria, 3),
        equipos: [...new Set(partidos.flatMap(p => [p.local, p.visita]))], partidos,
        llaves: rounds.size ? { titulo: t.titulo_playoffs, rondas: [...rounds].map(([nombre, partidos]) => ({ nombre, partidos })) } : null
      };
    });
    if (!torneos.length) throw new Error('La pestaña Torneos está vacía');
    return {
      ...original, config, torneos,
      plantel: tabs.Plantel.map(j => ({ nombre: j.nombre, apodo: j.apodo, dorsal: number(j.dorsal), pos: j.posicion, goles: number(j.goles), ig: j.instagram, img: j.foto })),
      figuras: tabs.Figuras.filter(f => date(f.dia)).map(f => ({ jugador: f.jugador, torneo: f.torneo, fecha: f.dia, texto: f.texto, img: f.foto })),
      sponsors: tabs.Sponsors.filter(s => s.estado.toLowerCase() === 'activo').map(s => ({
        ...s,
        // La primera fila de ByM Tech conserva el nombre anterior del archivo.
        foto: s.foto === 'faef24e7-4586-475d-95eb-d88c39ee016f_removalai_preview.png'
          ? 'img/bym-tech.png' : s.foto
      }))
    };
  }
  window.CEOYJ.readSheet = async original => {
    const link = window.CEOYJ_SHEET_URL.trim();
    if (!link) return { data: original, state: 'local' };
    try {
      const id = link.match(/^https:\/\/docs\.google\.com\/spreadsheets\/d\/([\w-]+)(?:[/?#]|$)/)?.[1];
      if (!id || id === 'e') throw new Error('Enlace de Google Sheets inválido');
      const tabs = await Promise.all(Object.entries(columns).map(async ([name, headers]) => [name, await readTab(id, name, headers)]));
      return { data: assemble(Object.fromEntries(tabs), original), state: 'live' };
    } catch (error) {
      console.warn('Google Sheets:', error.message);
      return { data: original, state: 'offline' };
    }
  };
})();
