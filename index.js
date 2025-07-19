// CONSTANTS
const MODES = {
  DRAW: 'draw',
  ERASE: 'erase',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  PICKER: 'picker',
};

// UTILITIES
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ELEMENTS
const $canvas = $('#canvas');

const ctx = $canvas.getContext('2d');

// STATE
let isDrawing = false;
let startX, startY;
let lastX = 0;
let lastY = 0;
let mode = MODES.DRAW;

// EVENTS
$canvas.addEventListener('mousedown', startDrawing);
$canvas.addEventListener('mousemove', draw);
$canvas.addEventListener('mouseup', stopDrawing);
$canvas.addEventListener('mouseleave', stopDrawing);

// METHODS
function startDrawing(event) {
  isDrawing = true;

  const { offsetX, offsetY } = event;

  // Guardar las coordenadas iniciales
  [startX, startY] = [lastX, lastY] = [offsetX, offsetY];
}

function draw(event) {
  if (!isDrawing) return;

  const { offsetX, offsetY } = event;

  // Comerzar un trazado
  ctx.beginPath();

  // Mover el trazado a las coordenadas actuales
  ctx.moveTo(lastX, lastY);

  // Dibujar una línea entre coordenadas actuales y las nuevas
  ctx.lineTo(offsetX, offsetY);

  ctx.stroke();

  // Actualizar las últimas coordenadas
  [lastX, lastY] = [offsetX, offsetY];
}

function stopDrawing(event) {
  isDrawing = false;
}
