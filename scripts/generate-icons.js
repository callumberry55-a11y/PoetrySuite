const fs = require('fs');
const { createCanvas } = require('canvas');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#3B82F6';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size / 4);
  ctx.fill();
  
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.0625;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const centerX = size / 2;
  const centerY = size / 2;
  
  ctx.beginPath();
  ctx.moveTo(centerX, size * 0.25);
  ctx.quadraticCurveTo(size * 0.35, size * 0.35, size * 0.35, centerY);
  ctx.quadraticCurveTo(size * 0.35, size * 0.65, centerX, size * 0.75);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(centerX, size * 0.25);
  ctx.quadraticCurveTo(size * 0.65, size * 0.35, size * 0.65, centerY);
  ctx.quadraticCurveTo(size * 0.65, size * 0.65, centerX, size * 0.75);
  ctx.stroke();
  
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.047, 0, Math.PI * 2);
  ctx.fill();
  
  return canvas;
}

try {
  const canvas192 = drawIcon(192);
  const canvas512 = drawIcon(512);
  
  fs.writeFileSync('public/icon-192.png', canvas192.toBuffer('image/png'));
  fs.writeFileSync('public/icon-512.png', canvas512.toBuffer('image/png'));
  
  console.log('Icons generated successfully!');
} catch (error) {
  console.error('Canvas not available, creating placeholder icons');
  process.exit(1);
}
