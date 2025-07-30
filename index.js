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
const $colorPicker = $('#color-picker');
const $clearBtn = $('#clearBtn');
const $drawBtn = $('#drawBtn');
const $eraseBtn = $('#eraseBtn');
const $rectangleBtn = $('#rectangleBtn');
const $pickerBtn = $('#pickerBtn');
const $ellipseBtn = $('#ellipseBtn');

const ctx = $canvas.getContext('2d', { willReadFrequently: true });

// STATE
let isDrawing = false;
let isShiftPressed = false;
let startX, startY;
let lastX = 0;
let lastY = 0;
let mode = MODES.DRAW;
let imageData;

// EVENTS
$canvas.addEventListener('mousedown', startDrawing);
$canvas.addEventListener('mousemove', draw);
$canvas.addEventListener('mouseup', stopDrawing);
$canvas.addEventListener('mouseleave', stopDrawing);

$colorPicker.addEventListener('change', handleChangeColor);
$clearBtn.addEventListener('click', clearCanvas);

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUP);

$ellipseBtn.addEventListener('click', () => {
  setMode(MODES.ELLIPSE);
});

$pickerBtn.addEventListener('click', () => {
  setMode(MODES.PICKER);
});

$eraseBtn.addEventListener('click', () => {
  setMode(MODES.ERASE);
});

$rectangleBtn.addEventListener('click', () => {
  setMode(MODES.RECTANGLE);
});

$drawBtn.addEventListener('click', () => {
  setMode(MODES.DRAW);
});

// METHODS
function startDrawing(event) {
  isDrawing = true;

  const { offsetX, offsetY } = event;

  // Guardar las coordenadas iniciales
  [startX, startY] = [lastX, lastY] = [offsetX, offsetY];

  imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
}

function draw(event) {
  if (!isDrawing) return;

  const { offsetX, offsetY } = event;

  if (mode === MODES.DRAW || mode === MODES.ERASE) {
    // Comerzar un trazado
    ctx.beginPath();

    // Mover el trazado a las coordenadas actuales
    ctx.moveTo(lastX, lastY);

    // Dibujar una línea entre coordenadas actuales y las nuevas
    ctx.lineTo(offsetX, offsetY);

    ctx.stroke();

    // Actualizar las últimas coordenadas utilizada
    [lastX, lastY] = [offsetX, offsetY];

    return;
  }

  if (mode === MODES.RECTANGLE) {
    ctx.putImageData(imageData, 0, 0);

    let width = offsetX - startX;
    let height = offsetY - startY;

    if (isShiftPressed) {
      const sideLength = Math.max(Math.abs(width), Math.abs(height));

      width = width > 0 ? sideLength : -sideLength;
      height = height > 0 ? sideLength : -sideLength;
    }

    ctx.beginPath();
    ctx.rect(startX, startY, width, height);
    ctx.stroke();

    return;
  }

  if (mode === MODES.ELLIPSE) {
    ctx.putImageData(imageData, 0, 0);

    let width = offsetX - startX;
    let height = offsetY - startY;

    // Si shift está presionado, elipse será un circulo
    if (isShiftPressed) {
      const radius = Math.max(Math.abs(width), Math.abs(height));
      width = width > 0 ? radius : -radius;
      height = height > 0 ? radius : -radius;
    }

    ctx.beginPath();
    ctx.ellipse(startX + width / 2, startY + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, 2 * Math.PI);
    ctx.stroke();

    return;
  }
}

function stopDrawing(event) {
  isDrawing = false;
}

function handleChangeColor() {
  const { value } = $colorPicker;
  ctx.strokeStyle = value;
}

function clearCanvas() {
  ctx.clearRect(0, 0, $canvas.width, $canvas.height);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, $canvas.width, $canvas.height);
}

async function setMode(newMode) {
  let previewsMode = mode;
  mode = newMode;

  // Limpiar el botón activo actual
  const activeBtn = $('button.active');
  if (activeBtn) activeBtn.classList.remove('active');

  // Cambiar el botón activo y el cursor según el modo
  switch (mode) {
    case MODES.DRAW:
      $drawBtn.classList.add('active');
      $canvas.style.cursor = 'crosshair';
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 2;
      break;
    case MODES.RECTANGLE:
      $rectangleBtn.classList.add('active');
      $canvas.style.cursor = 'nw-resize';
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 2;
      break;
    case MODES.ELLIPSE:
      $ellipseBtn.classList.add('active');
      $canvas.style.cursor = 'crosshair';
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 2;
      break;
    case MODES.ERASE:
      $eraseBtn.classList.add('active');
      $canvas.style.cursor = 'cell';
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 10;
      break;
    case MODES.PICKER:
      $pickerBtn.classList.add('active');
      if (typeof window.EyeDropper !== 'undefined') {
        const eyeDropper = new window.EyeDropper();
        try {
          const result = await eyeDropper.open();
          const { sRGBHex } = result;
          ctx.strokeStyle = sRGBHex;
          $colorPicker.value = sRGBHex;
          setMode(previewsMode);
        } catch (err) {}
      }
      break;
  }
}

function handleKeyDown({ key }) {
  isShiftPressed = key === 'Shift';
}

function handleKeyUP({ key }) {
  if (key === 'Shift') isShiftPressed = false;
}

// INIT
setMode(MODES.DRAW);

// Show Picker if browser has support
if (typeof window.EyeDropper !== 'undefined') {
  $pickerBtn.removeAttribute('disabled');
}

// Funcionalidades del header

/* 
File
*/
const fileBtn = document.getElementById('fileBtn');
const fileMenu = document.getElementById('fileMenu');

fileBtn.addEventListener('click', () => {
  fileMenu.style.display = fileMenu.style.display === 'block' ? 'none' : 'block';
});

// Funciones del menú File
function newCanvas() {
  ctx.clearRect(0, 0, $canvas.width, $canvas.height);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, $canvas.width, $canvas.height);
}

function saveCanvas() {
  const link = document.createElement('a');
  link.download = 'mi_dibujo.png';
  link.href = $canvas.toDataURL('image/png');
  link.click();
}

document.getElementById('newFileBtn').addEventListener('click', newCanvas);
document.getElementById('saveFileBtn').addEventListener('click', saveCanvas);

// Inicializa con lienzo blanco
window.addEventListener('load', newCanvas);

/*  
Edit
*/
const editBtn = document.getElementById('editBtn');
const editMenu = document.getElementById('editMenu');
const clearBtnEdit = document.getElementById('clearBtn-Edit');

// Mostrar/Ocultar menú
editBtn.addEventListener('click', () => {
  editMenu.style.display = editMenu.style.display === 'block' ? 'none' : 'block';
});

// Historial de acciones
let undoStack = [];
let redoStack = [];

function saveState() {
  undoStack.push($canvas.toDataURL());
  redoStack = []; // Limpiar redo al dibujar algo nuevo
}

// Llamar a saveState cuando el usuario dibuje
$canvas.addEventListener('mousedown', () => saveState());

// Función Undo
function undo() {
  if (undoStack.length > 0) {
    redoStack.push($canvas.toDataURL());
    let lastState = undoStack.pop();
    restoreCanvas(lastState);
  }
}

// Función Redo
function redo() {
  if (redoStack.length > 0) {
    undoStack.push($canvas.toDataURL());
    let nextState = redoStack.pop();
    restoreCanvas(nextState);
  }
}

// Función para restaurar imagen en el canvas
function restoreCanvas(state) {
  let img = new Image();
  img.src = state;
  img.onload = () => {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    ctx.drawImage(img, 0, 0);
  };
}

// Función Clear All
clearBtnEdit.addEventListener('click', clearCanvas);

// Eventos botones
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);

/*  
View
*/
const viewBtn = document.getElementById('viewBtn');
const viewMenu = document.getElementById('viewMenu');

// Mostrar/Ocultar menú
viewBtn.addEventListener('click', () => {
  viewMenu.style.display = viewMenu.style.display === 'block' ? 'none' : 'block';
});

// ---------------------
// 1. Toggle Grid
// ---------------------
let showGrid = false;

// Referencia al overlay del grid
const gridOverlay = document.getElementById('gridOverlay');

// Alternar visibilidad del grid
document.getElementById('toggleGridBtn').addEventListener('click', () => {
  showGrid = !showGrid;
  gridOverlay.style.display = showGrid ? 'block' : 'none';
});

// ---------------------
// 2. Zoom
// ---------------------
let zoomLevel = 1;

function applyZoom() {
  const main = document.querySelector('main');

  $canvas.style.transform = `scale(${zoomLevel})`;
  gridOverlay.style.transform = `scale(${zoomLevel})`;

  $canvas.style.transformOrigin = '0 0';
  gridOverlay.style.transformOrigin = '0 0';

  main.style.overflow = 'auto';
}

document.getElementById('zoomInBtn').addEventListener('click', () => {
  zoomLevel += 0.1;
  applyZoom();
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
  zoomLevel = Math.max(0.2, zoomLevel - 0.1);
  applyZoom();
});

// ---------------------
// 3. Fullscreen
// ---------------------
document.getElementById('fullscreenBtn').addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (event) => {
  if (!viewBtn.contains(event.target) && !viewMenu.contains(event.target)) {
    viewMenu.style.display = 'none';
  }
});

function resizeCanvas() {
  const main = document.querySelector('main');
  const width = main.clientWidth;
  const height = main.clientHeight;

  // Ajustar el tamaño del canvas
  $canvas.width = width;
  $canvas.height = height;

  // Ajustar el tamaño del overlay igual al canvas
  const gridOverlay = document.getElementById('gridOverlay');
  gridOverlay.style.width = width + 'px';
  gridOverlay.style.height = height + 'px';

  // Mantener fondo blanco en el canvas
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* 
  Image
*/
const imageBtn = document.getElementById('imageBtn');
const imageMenu = document.getElementById('imageMenu');
// Mostrar/Ocultar menú
imageBtn.addEventListener('click', () => {
  imageMenu.style.display = imageMenu.style.display === 'block' ? 'none' : 'block';
});

// Funciones de edición
function invertColors() {
  const imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]; // R
    data[i + 1] = 255 - data[i + 1]; // G
    data[i + 2] = 255 - data[i + 2]; // B
  }

  ctx.putImageData(imageData, 0, 0);
}
function grayscale() {
  const imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = data[i + 1] = data[i + 2] = avg;
  }

  ctx.putImageData(imageData, 0, 0);
}
function flipHorizontal() {
  const imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  tempCanvas.width = $canvas.width;
  tempCanvas.height = $canvas.height;

  tempCtx.putImageData(imageData, 0, 0);
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(tempCanvas, -$canvas.width, 0);
  ctx.restore();
}
function flipVertical() {
  const imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  tempCanvas.width = $canvas.width;
  tempCanvas.height = $canvas.height;

  tempCtx.putImageData(imageData, 0, 0);
  ctx.save();
  ctx.scale(1, -1);
  ctx.drawImage(tempCanvas, 0, -$canvas.height);
  ctx.restore();
}

// Eventos de botones
document.getElementById('invertBtn').addEventListener('click', invertColors);
document.getElementById('grayscaleBtn').addEventListener('click', grayscale);
document.getElementById('flipHBtn').addEventListener('click', flipHorizontal);
document.getElementById('flipVBtn').addEventListener('click', flipVertical);

/* 
OCULTAR MENUS SI DA CLICK FUERA
*/
window.addEventListener('click', (event) => {
  if (!fileBtn.contains(event.target) && !fileMenu.contains(event.target)) fileMenu.style.display = 'none';
  if (!editBtn.contains(event.target) && !editMenu.contains(event.target)) editMenu.style.display = 'none';
  if (!imageBtn.contains(event.target) && !imageMenu.contains(event.target)) imageMenu.style.display = 'none';
});
