// DOM Elements
const colorPicker = document.getElementById('colorPicker');
const colorCode = document.getElementById('colorCode');
const contrastRatio = document.getElementById('contrastRatio');
const colorFormat = document.getElementById('colorFormat');
const saveColorButton = document.getElementById('saveColor');
const copyColorButton = document.getElementById('copyColor');
const shareColorButton = document.getElementById('shareColor');
const themeToggleButton = document.getElementById('themeToggle');
const colorHistoryContainer = document.getElementById('colorHistory');
const simulateColorBlindnessButton = document.getElementById('simulateColorBlindness');
const imageUpload = document.getElementById('imageUpload');
const dominantColorSpan = document.getElementById('dominantColor');
const colorStart = document.getElementById('colorStart');
const colorEnd = document.getElementById('colorEnd');
const gradientDisplay = document.getElementById('gradientDisplay');

// Color Picker Logic
colorPicker.addEventListener('input', function() {
    const selectedColor = colorPicker.value;
    document.body.style.backgroundColor = selectedColor;
    colorCode.textContent = selectedColor;

    if (colorFormat.value === 'hex') {
        colorCode.textContent = selectedColor;
    } else if (colorFormat.value === 'rgb') {
        colorCode.textContent = hexToRgb(selectedColor);
    } else {
        colorCode.textContent = hexToHsl(selectedColor);
    }

    const contrast = getContrastRatio(selectedColor, '#FFFFFF').toFixed(2);
    contrastRatio.textContent = `Contrast Ratio (White Text): ${contrast}:1`;
});

// Color Format Change
colorFormat.addEventListener('change', function() {
    const selectedColor = colorPicker.value;
    if (colorFormat.value === 'hex') {
        colorCode.textContent = selectedColor;
    } else if (colorFormat.value === 'rgb') {
        colorCode.textContent = hexToRgb(selectedColor);
    } else {
        colorCode.textContent = hexToHsl(selectedColor);
    }
});

// Gradient Picker
function updateGradient() {
    const startColor = colorStart.value;
    const endColor = colorEnd.value;
    const gradient = `linear-gradient(45deg, ${startColor}, ${endColor})`;
    document.body.style.background = gradient;
    gradientDisplay.textContent = gradient;
}

colorStart.addEventListener('input', updateGradient);
colorEnd.addEventListener('input', updateGradient);

// Color History
let colorHistory = JSON.parse(localStorage.getItem('colorHistory')) || [];

function updateColorHistory(color) {
    if (colorHistory.length >= 5) {
        colorHistory.pop();
    }
    colorHistory.unshift(color);
    localStorage.setItem('colorHistory', JSON.stringify(colorHistory));
    displayColorHistory();
}

function displayColorHistory() {
    colorHistoryContainer.innerHTML = '';
    colorHistory.forEach(color => {
        const swatch = document.createElement('div');
        swatch.style.backgroundColor = color;
        swatch.classList.add('preset');
        swatch.addEventListener('click', () => {
            colorPicker.value = color;
            colorCode.textContent = color;
            document.body.style.backgroundColor = color;
        });
        colorHistoryContainer.appendChild(swatch);
    });
}

colorPicker.addEventListener('input', () => {
    updateColorHistory(colorPicker.value);
});
displayColorHistory();

// Save Color
saveColorButton.addEventListener('click', () => {
    const color = colorPicker.value;
    updateColorHistory(color);
});

// Copy Color Code
copyColorButton.addEventListener('click', () => {
    navigator.clipboard.writeText(colorCode.textContent);
    alert('Color code copied to clipboard!');
});

// Share Color
shareColorButton.addEventListener('click', () => {
    const url = `https://yourwebsite.com/?color=${colorCode.textContent}`;
    alert(`Share this URL: ${url}`);
});

// Dark Mode Toggle
themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.container').classList.toggle('dark-mode');
});

// Color Blindness Simulation
simulateColorBlindnessButton.addEventListener('click', () => {
    const color = colorPicker.value;
    const simulatedColor = simulateColorBlindness(color);
    document.body.style.backgroundColor = simulatedColor;
});

// Image Upload and Dominant Color
imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const color = getDominantColor(img);
                dominantColorSpan.textContent = color;
                document.body.style.backgroundColor = color;
            };
        };
        reader.readAsDataURL(file);
    }
});

function getDominantColor(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const pixelData = ctx.getImageData(0, 0, img.width, img.height).data;
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < pixelData.length; i += 4) {
        r += pixelData[i];
        g += pixelData[i + 1];
        b += pixelData[i + 2];
    }
    const pixelCount = pixelData.length / 4;
    r = Math.floor(r / pixelCount);
    g = Math.floor(g / pixelCount);
    b = Math.floor(b / pixelCount);
    return `rgb(${r}, ${g}, ${b})`;
}

// Helper Functions
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
}

function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = (max + min) / 2;
    let s = h;
    let l = h;
    if (max === min) {
        h = 0;
        s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) {
            h = (g - b) / d + (g < b ? 6 : 0);
        } else if (max === g) {
            h = (b - r) / d + 2;
        } else {
            h = (r - g) / d + 4;
        }
        h /= 6;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function getContrastRatio(hex1, hex2) {
    const rgb1 = hexToRgb(hex1).match(/\d+/g).map(Number);
    const rgb2 = hexToRgb(hex2).match(/\d+/g).map(Number);
    const luminance1 = 0.2126 * rgb1[0] + 0.7152 * rgb1[1] + 0.0722 * rgb1[2];
    const luminance2 = 0.2126 * rgb2[0] + 0.7152 * rgb2[1] + 0.0722 * rgb2[2];
    const ratio = luminance1 > luminance2 ?
        (luminance1 + 0.05) / (luminance2 + 0.05) :
        (luminance2 + 0.05) / (luminance1 + 0.05);
    return ratio;
}

function simulateColorBlindness(hex) {
    // Placeholder logic: Apply grayscale filter for simulation
    return `grayscale(${hex})`;  // Simplified version
}
