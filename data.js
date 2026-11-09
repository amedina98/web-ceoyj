/* Datos de respaldo de la web original. El fixture incluye datos de demostración. */
(function () {

  // Genera un fixture todos contra todos (método del círculo)
  function roundRobin(teams) {
    const t = teams.slice();
    if (t.length % 2) t.push('Libre');
    const n = t.length, rounds = [];
    for (let r = 0; r < n - 1; r++) {
      const m = [];
      for (let i = 0; i < n / 2; i++) {
        const a = t[i], b = t[n - 1 - i];
        m.push(r % 2 ? [b, a] : [a, b]);
      }
      rounds.push(m);
      t.splice(1, 0, t.pop());
    }
    return rounds.concat(rounds.map(ms => ms.map(([a, b]) => [b, a])));
  }
  // RNG con semilla para que los datos de ejemplo sean siempre iguales
  function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

  const US = 'Cerrá el Orto y Jugá';

  function buildFixture(teams, playedFechas, seed, forced, startDate, stepDays, hour) {
    const R = rng(seed), rounds = roundRobin(teams), out = [];
    rounds.forEach((ms, ri) => {
      const d = new Date(startDate); d.setUTCDate(d.getUTCDate() + ri * stepDays);
      const date = d.toISOString().slice(0, 10);
      ms.forEach(([l, v]) => {
        const m = { fecha: ri + 1, dia: date, hora: hour, local: l, visita: v, gl: null, gv: null };
        if (ri < playedFechas) {
          const key = (ri + 1) + '|' + (l === US ? v : l);
          if ((l === US || v === US) && forced[key]) {
            const [us, them] = forced[key];
            m.gl = l === US ? us : them; m.gv = l === US ? them : us;
          } else if (l !== 'Libre' && v !== 'Libre') {
            m.gl = Math.floor(R() * 5); m.gv = Math.floor(R() * 5);
          }
        }
        if (l !== 'Libre' && v !== 'Libre') out.push(m);
      });
    });
    return out;
  }

  const f9Teams = [US, 'Real Asado', 'Deportivo Tercer Tiempo', 'Los Pibes del Barrio', 'Atlético Fénix', 'Sacachispas del Oeste', 'La 12 FC', 'La Banda de Isa'];
  const f7Teams = [US, 'Los Cuñados', 'Juventud Unida', 'Halcones FC', 'El Rejunte', 'Mandarina FC', 'Club Tucán', 'Deportivo Birra'];

  // fixture de F9: primera rueda contra La Banda de Isa (2 a 2, dos del Rubio)
  const f9 = buildFixture(f9Teams, 2, 9, { '1|La Banda de Isa': [2, 2] }, '2026-10-25', 7, '10:00');
  f9.filter(m => m.fecha === 2 && (m.local === US || m.visita === US)).forEach(m => {
    if (m.local === US) { m.gl = 3; m.gv = 1; } else { m.gl = 1; m.gv = 3; }
  });
  const f7 = buildFixture(f7Teams, 7, 77, {}, '2026-09-14', 7, '21:00');
  // Resultados nuestros en F7: sale puntero
  const ourF7 = { 1: [3, 1], 2: [4, 1], 3: [2, 2], 4: [9, 5], 5: [3, 0], 6: [1, 2], 7: [2, 1] };
  f7.forEach(m => {
    if ((m.local === US || m.visita === US) && ourF7[m.fecha]) {
      const [a, b] = ourF7[m.fecha];
      if (m.local === US) { m.gl = a; m.gv = b; } else { m.gl = b; m.gv = a; }
    }
  });

  const DEFAULT = {
    config: {
      whatsapp: '5491170819647',
      formulario_sponsors: '',
      instagram: 'cerraelortoyjuga',
      tiktok: 'cerraelortoyjuga',
      facebook: 'https://www.facebook.com/cerraelortoyjuga',
      lema: 'Somos un equipo de amigos y familia. Menos charla, más fútbol.',
      email: 'alexisriver35@gmail.com'
    },
    proximo: {
      torneo: 'f9',
      rival: (f9.find(m => m.fecha === 3 && (m.local === US || m.visita === US)) || {}).local === US
        ? f9.find(m => m.fecha === 3 && m.local === US).visita
        : (f9.find(m => m.fecha === 3 && m.visita === US) || {}).local,
      fecha: '2026-11-08T10:00',
      cancha: 'Complejo El Ceibo',
      nota: 'Fecha 3 del Torneo El Ceibo F9. Venimos invictos: a sostenerlo.'
    },
    torneos: [
      {
        id: 'f9', nombre: 'Torneo El Ceibo F9', formato: 'Fútbol 9', dia: 'Domingos',
        organiza: 'torneos_elceibo', fechaActual: 3, puntosVictoria: 3,
        equipos: f9Teams, partidos: f9,
        llaves: null
      },
      {
        id: 'f7', nombre: 'Liga de los Lunes F7', formato: 'Fútbol 7', dia: 'Lunes',
        organiza: 'torneos_elceibo', fechaActual: 8, puntosVictoria: 3,
        equipos: f7Teams, partidos: f7,
        llaves: {
          titulo: 'Playoffs F7 (cuando termine la fase regular)',
          rondas: [
            { nombre: 'Cuartos', partidos: [
              { a: '1° de la tabla', b: '8° de la tabla', ga: null, gb: null },
              { a: '4° de la tabla', b: '5° de la tabla', ga: null, gb: null },
              { a: '2° de la tabla', b: '7° de la tabla', ga: null, gb: null },
              { a: '3° de la tabla', b: '6° de la tabla', ga: null, gb: null }
            ]},
            { nombre: 'Semis', partidos: [
              { a: 'Ganador C1', b: 'Ganador C2', ga: null, gb: null },
              { a: 'Ganador C3', b: 'Ganador C4', ga: null, gb: null }
            ]},
            { nombre: 'Final', partidos: [ { a: 'Ganador S1', b: 'Ganador S2', ga: null, gb: null } ] }
          ]
        }
      }
    ],
    plantel: [
      { nombre: 'Agustín Acosta', apodo: 'El Tirri', dorsal: 11, pos: 'Mediocampista', goles: 6, ig: 'acosta.agustiinn', img: 'img/acosta.webp' },
      { nombre: 'Alan Monzón', apodo: '', dorsal: 24, pos: 'Defensor', goles: 3, ig: 'alanmonzon.ok10', img: 'img/monzon.webp' },
      { nombre: 'Joaquín Alexander', apodo: '', dorsal: 4, pos: 'Defensor', goles: 1, ig: 'joaquin_alexander', img: 'img/alexander.webp' },
      { nombre: 'Valentín Suárez', apodo: '', dorsal: 30, pos: 'Mediocampista', goles: 4, ig: 'suarezvalentin', img: 'img/suarez.webp' },
      { nombre: 'Juan Campopiano', apodo: '', dorsal: 14, pos: 'Defensor', goles: 2, ig: 'manu14', img: 'img/campopiano.webp' },
      { nombre: 'Nico Fernández', apodo: '', dorsal: 0, pos: 'Mediocampista', goles: 5, ig: 'nico_fernandez_10', img: 'img/fernandez.webp' },
      { nombre: 'Diego López', apodo: 'Rubio', dorsal: 10, pos: 'Delantero', goles: 14, ig: 'd.lopeez10', img: 'img/mvp-lopez.webp' },
      { nombre: 'Nahuel Luciano Alegre', apodo: '', dorsal: 1, pos: 'Arquero', goles: 0, ig: 'luciano10._a', img: 'img/mvp-nahuel.webp' }
    ],
    figuras: [
      { jugador: 'Diego López', torneo: 'F9', fecha: '2026-10-11', texto: 'Excelente partido del delantero, que metió dos golazos. El 10 sigue cumpliendo.', img: 'img/mvp-lopez.webp' },
      { jugador: 'Alan Monzón', torneo: 'F7', fecha: '2026-11-02', texto: 'Entró en los últimos diez minutos y dio vuelta el partido: de perder 1 a 0 a ganar 2 a 1 con gol suyo.', img: 'img/mvp-monzon.webp' },
      { jugador: 'Nahuel Alegre', torneo: 'F7', fecha: '2026-10-20', texto: 'Simplemente imbatible. Voló, atajó y sostuvo al equipo cuando las papas quemaban.', img: 'img/mvp-nahuel.webp' }
    ],
    palmares: [
      { anio: 2024, titulo: 'Campeones 2024', detalle: 'La estrella que llevamos arriba del escudo.' }
    ],
    sponsors: []
  };

  for (const torneo of DEFAULT.torneos) {
    for (const partido of torneo.partidos) {
      const p = DEFAULT.proximo;
      const confirmed = torneo.id === p.torneo && partido.dia + 'T' + partido.hora === p.fecha &&
        [partido.local, partido.visita].includes(US) && [partido.local, partido.visita].includes(p.rival);
      partido.estado = partido.gl !== null ? 'jugado' : confirmed ? 'confirmado' : 'provisional';
      if (confirmed) Object.assign(partido, { cancha: p.cancha, nota: p.nota });
    }
  }

  // Tabla calculada a partir de los resultados cargados
  function tabla(t) {
    const pv = t.puntosVictoria ?? 3, rows = Object.create(null);
    t.equipos.forEach(e => rows[e] = { eq: e, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0, forma: [] });
    t.partidos.slice().sort((a, b) => a.fecha - b.fecha).forEach(m => {
      if (!hasResult(m)) return;
      const L = rows[m.local], V = rows[m.visita]; if (!L || !V) return;
      const gl = +m.gl, gv = +m.gv;
      L.pj++; V.pj++; L.gf += gl; L.gc += gv; V.gf += gv; V.gc += gl;
      if (gl > gv) { L.g++; V.p++; L.pts += pv; L.forma.push('G'); V.forma.push('P'); }
      else if (gl < gv) { V.g++; L.p++; V.pts += pv; V.forma.push('G'); L.forma.push('P'); }
      else { L.e++; V.e++; L.pts++; V.pts++; L.forma.push('E'); V.forma.push('E'); }
    });
    return Object.values(rows).sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf || a.eq.localeCompare(b.eq));
  }

  function hasResult(m) {
    return !['cancelado', 'postergado'].includes(m.estado) && Number.isInteger(m.gl) && Number.isInteger(m.gv);
  }
  window.CEOYJ = { US, DEFAULT, tabla, hasResult };
})();
