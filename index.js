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

const ctx = $canvas.getContext('2d');

// STATE
let isDrawing = false;
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

    const width = offsetX - startX;
    const height = offsetY - startY;

    ctx.beginPath();
    ctx.rect(startX, startY, width, height);
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

  // para limipiar el boton acitvo actual
  const activeBtn = $('button.active');
  if (activeBtn) activeBtn.classList.remove('active');

  if (mode === MODES.DRAW) {
    $drawBtn.classList.add('active');
    $canvas.style.cursor = 'crosshair';
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 2;
    return;
  }

  if (mode === MODES.RECTANGLE) {
    $rectangleBtn.classList.add('active');
    $canvas.style.cursor = 'nw-resize';
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 2;
    return;
  }

  if (mode === MODES.ERASE) {
    $eraseBtn.classList.add('active');
    $canvas.style.cursor = 'cell';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 10;
    return;
  }

  if (mode === MODES.PICKER) {
    $pickerBtn.classList.add('active');

    const eyeDropper = new window.EyeDropper();

    try {
      const result = await eyeDropper.open();
      const { sRGBHex } = result;
      ctx.strokeStyle = sRGBHex;
      $colorPicker.value = sRGBHex;
      setMode(previewsMode);
    } catch (err) {
      // si ha habido un error o el usuario ha recuperado ningún color
    }

    return;
  }
}

// INIT
setMode(MODES.DRAW);

// Show Picker if browser has support
if (typeof window.EyeDropper !== 'undefined') {
  $pickerBtn.removeAttribute('disabled');
}
