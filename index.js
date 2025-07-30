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

const ctx = $canvas.getContext('2d');

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

function resizeCanvas() {
  const main = document.querySelector('main');
  $canvas.width = main.clientWidth;
  $canvas.height = main.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
