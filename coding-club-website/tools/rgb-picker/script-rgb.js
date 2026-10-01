// Slider DOM References
const redSlider = document.getElementById('redSlider');
const greenSlider = document.getElementById('greenSlider');
const blueSlider = document.getElementById('blueSlider');
const alphaSlider = document.getElementById('alphaSlider');

// Value Badge DOM References
const redVal = document.getElementById('redVal');
const greenVal = document.getElementById('greenVal');
const blueVal = document.getElementById('blueVal');
const alphaVal = document.getElementById('alphaVal');

// Readout DOM References
const readoutHex = document.getElementById('readoutHex');
const readoutTuple = document.getElementById('readoutTuple');
const readoutNorm = document.getElementById('readoutNorm');
const pythonCode = document.getElementById('pythonCode');

// Preview DOM References
const colorPreview = document.getElementById('colorPreview');
const previewText = document.getElementById('previewText');
const shapeButtons = document.querySelectorAll('.shape-btn');
const presetSwatches = document.querySelectorAll('.preset-swatch');

// Helper: Convert integer (0-255) to 2-digit HEX string
function componentToHex(c) {
  const hex = c.toString(16).toUpperCase();
  return hex.length === 1 ? '0' + hex : hex;
}

function updateColor() {
  const r = parseInt(redSlider.value, 10);
  const g = parseInt(greenSlider.value, 10);
  const b = parseInt(blueSlider.value, 10);
  const a = parseInt(alphaSlider.value, 10);

  const alphaDecimal = (a / 255).toFixed(2);
  const alphaPercent = Math.round((a / 255) * 100);

  // Update Slider Badges
  redVal.textContent = r;
  greenVal.textContent = g;
  blueVal.textContent = b;
  alphaVal.textContent = `${a} (${alphaPercent}%)`;

  // Update Visual Preview Element
  const currentShape = document.querySelector('.shape-btn.active').dataset.shape;
  
  if (currentShape === 'text') {
    previewText.style.color = `rgba(${r}, ${g}, ${b}, ${alphaDecimal})`;
    colorPreview.style.backgroundColor = 'transparent';
  } else {
    colorPreview.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${alphaDecimal})`;
  }

  // Calculate HEX Code
  const hexString = `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
  readoutHex.textContent = a < 255 ? `${hexString}${componentToHex(a)}` : hexString;

  // Calculate Tuple
  readoutTuple.textContent = `(${r}, ${g}, ${b}, ${a})`;

  // Calculate Normalized RGB values (useful for shaders or game physics engines)
  const normR = (r / 255).toFixed(2);
  const normG = (g / 255).toFixed(2);
  const normB = (b / 255).toFixed(2);
  readoutNorm.textContent = `(${normR}, ${normG}, ${normB})`;

  // Update Pygame Code Generator Output
  if (pythonCode) {
    if (a === 255) {
      pythonCode.textContent = `# Pygame RGB tuple\nCOLOR = (${r}, ${g}, ${b})\nscreen.fill(COLOR)`;
    } else {
      pythonCode.textContent = `# Pygame RGBA surface with alpha\nsurface = pygame.Surface((100, 100), pygame.SRCALPHA)\nsurface.fill((${r}, ${g}, ${b}, ${a}))`;
    }
  }
}

// Handle Shape Selector Buttons (Square, Circle, Text)
shapeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    shapeButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const shape = btn.dataset.shape;
    colorPreview.className = `color-preview ${shape}`;

    if (shape === 'text') {
      previewText.style.display = 'block';
    } else {
      previewText.style.display = 'none';
    }

    updateColor();
  });
});

// Handle Preset Swatches
presetSwatches.forEach((swatch) => {
  swatch.addEventListener('click', () => {
    redSlider.value = swatch.dataset.r;
    greenSlider.value = swatch.dataset.g;
    blueSlider.value = swatch.dataset.b;
    alphaSlider.value = swatch.dataset.a;
    updateColor();
  });
});

// Attach Input Listeners to Sliders
redSlider.addEventListener('input', updateColor);
greenSlider.addEventListener('input', updateColor);
blueSlider.addEventListener('input', updateColor);
alphaSlider.addEventListener('input', updateColor);

// Initial Render
updateColor();