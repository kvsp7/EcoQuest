// 🍁 High-Performance Canvas Falling Leaves Animation Engine

export function initFallingLeaves() {
  const canvas = document.getElementById('falling-leaves-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Leaf configuration
  const maxLeaves = 25;
  const leaves = [];
  
  // Available leaf colors (shades of forest green, gold, autumn orange, amber)
  const leafColors = [
    'rgba(76, 175, 80, 0.65)',   // Green
    'rgba(46, 125, 50, 0.65)',    // Forest Green
    'rgba(139, 195, 74, 0.65)',   // Lime Green
    'rgba(255, 193, 7, 0.65)',    // Gold
    'rgba(255, 152, 0, 0.65)',    // Autumn Orange
    'rgba(230, 81, 0, 0.6)',      // Dark Orange
  ];

  class Leaf {
    constructor() {
      this.reset();
      // Randomize initial vertical position so they don't all start at once
      this.y = Math.random() * canvas.height;
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -20;
      this.size = Math.random() * 12 + 8; // Size between 8 and 20px
      this.speedY = Math.random() * 1.2 + 0.6; // Downward fall speed
      this.speedX = Math.random() * 1.0 - 0.5; // Wind sway
      this.color = leafColors[Math.floor(Math.random() * leafColors.length)];
      this.angle = Math.random() * 360;
      this.spinSpeed = Math.random() * 2 - 1; // Rotation speed
      this.swayAmplitude = Math.random() * 20 + 10; // Sway width
      this.swaySpeed = Math.random() * 0.02 + 0.01; // Sway cycle speed
      this.swayTime = Math.random() * 100;
    }

    update() {
      this.y += this.speedY;
      
      // Update sway math
      this.swayTime += this.swaySpeed;
      this.x += this.speedX + Math.sin(this.swayTime) * 0.4;
      
      // Update rotation
      this.angle += this.spinSpeed;

      // Reset when falling offscreen
      if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.angle * Math.PI) / 180);
      
      ctx.fillStyle = this.color;
      ctx.beginPath();
      
      // Draw organic leaf vector path
      // Drawing leaf using bezier curves: start at center, curve left to tip, curve back right to base
      ctx.moveTo(0, -this.size / 2);
      ctx.quadraticCurveTo(-this.size / 2, 0, 0, this.size / 2);
      ctx.quadraticCurveTo(this.size / 2, 0, 0, -this.size / 2);
      ctx.fill();

      // Draw subtle stem/vein
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -this.size / 2);
      ctx.lineTo(0, this.size / 2);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Populate leaf pool
  for (let i = 0; i < maxLeaves; i++) {
    leaves.push(new Leaf());
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw & update leaves
    for (let i = 0; i < leaves.length; i++) {
      leaves[i].update();
      leaves[i].draw();
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();

  // Return clean-up handler
  return () => {
    window.removeEventListener('resize', resizeCanvas);
    cancelAnimationFrame(animationFrameId);
  };
}
