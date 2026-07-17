/* =====================================================================
   Ícones SVG compartilhados da loja Dailus
   - Mesmo padrão visual do header (stroke, currentColor, viewBox 24).
   - Substituem os emojis usados como "chrome" da UI (categorias, selos,
     títulos de seções, CTA da Dai) para manter consistência.
   - Cor herdada via `currentColor`; tamanho controlado por CSS.
   ===================================================================== */

const svg = (inner) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

export const ICON = {
  // categorias
  lips: svg('<path d="M3 11c2-3 5-3 6.5-1C11 8 13 8 14.5 10c1.5-2 4.5-2 6.5 1-2 4-6 5-9 5s-7-1-9-5z"/><path d="M3 11h18"/>'),
  face: svg('<path d="M12 3.2l5.2 6.1a6.8 6.8 0 1 1-10.4 0z"/>'),
  eye: svg('<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  blush: svg('<circle cx="12" cy="12" r="3"/><circle cx="12" cy="5.5" r="2.5"/><circle cx="12" cy="18.5" r="2.5"/><circle cx="5.5" cy="12" r="2.5"/><circle cx="18.5" cy="12" r="2.5"/>'),
  brow: svg('<path d="M4 20l3.5-1 9-9-2.5-2.5-9 9z"/><path d="M13.5 6.5l2.5 2.5"/><path d="M16.5 4.5l2.5 2.5 1.3-1.3a1.8 1.8 0 0 0-2.5-2.5z"/>'),
  nails: svg('<path d="M9 8h6v11a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/><path d="M10 8V5h4v3"/><path d="M11 5V3h2v2"/>'),
  body: svg('<rect x="7.5" y="9" width="7.5" height="12" rx="2"/><path d="M9.5 9V6h4v3"/><path d="M10.5 6V4h2v2"/><circle cx="18" cy="5" r="1"/><circle cx="20" cy="7" r="1"/><circle cx="18" cy="9" r="1"/>'),

  // selos de confiança
  truck: svg('<path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>'),
  card: svg('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19"/>'),
  lock: svg('<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>'),
  returns: svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),

  // títulos de seções / rails
  star: svg('<path d="M12 3.2l2.6 5.8 6.2.6-4.7 4.1 1.4 6.1L12 16.6 6.5 19.8l1.4-6.1L3.2 9.6l6.2-.6z"/>'),
  flame: svg('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
  heart: svg('<path d="M20.8 5.6a5.4 5.4 0 0 0-7.6 0L12 6.7l-1.2-1.1a5.4 5.4 0 0 0-7.6 7.6l1 1L12 21l7.8-6.8 1-1a5.4 5.4 0 0 0 0-7.6z"/>'),
  sparkles: svg('<path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/><path d="M19 15l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6z"/>'),
  palette: svg('<path d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 1.7-3 2 2 0 0 1 1.7-3H18a3 3 0 0 0 3-3c0-4.4-4-6-9-6z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14.5" cy="7" r="1"/><circle cx="17" cy="11" r="1"/>'),
  pin: svg('<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),

  // badges / rótulos de card
  camera: svg('<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.2"/>'),
  check: svg('<circle cx="12" cy="12" r="9"/><path d="M8.3 12.3l2.5 2.5 4.9-5.4"/>'),

  // Dai (provador / assistente)
  wand: svg('<path d="M4 20L15 9"/><path d="M13 7l4 4"/><path d="M18 3v3M16.5 4.5h3"/><path d="M20 9.5v2M19 10.5h2"/>'),
};
