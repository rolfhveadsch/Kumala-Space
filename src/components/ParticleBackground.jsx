import { useEffect, useRef } from 'react';

// New horizontal-style Gemini coordinates based on reference image
const geminiNodes = [
  { id: 0, x: -110, y: -30, size: 2 },
  { id: 1, x: -70, y: -35, size: 2 },
  { id: 2, x: -20, y: -100, size: 3.5 }, // Top head
  { id: 3, x: -40, y: -30, size: 2 },
  { id: 4, x: 20, y: 0, size: 2 },
  { id: 5, x: 70, y: 5, size: 2 },
  { id: 6, x: 120, y: -15, size: 2 },
  { id: 7, x: 80, y: 40, size: 2 },
  { id: 8, x: -120, y: 20, size: 2 },
  { id: 9, x: -110, y: 60, size: 2 },
  { id: 10, x: -80, y: 30, size: 2 },
  { id: 11, x: -30, y: 50, size: 2 },
  { id: 12, x: 10, y: 60, size: 2 },
  { id: 13, x: 60, y: 70, size: 2 },
  { id: 14, x: 45, y: 130, size: 2 },
];

const geminiEdges = [
  [0, 1], [1, 3], [3, 2], [3, 4], [4, 5], [5, 6], [4, 7], // Top Twin
  [3, 10], // Connection between twins
  [8, 10], [9, 10], [10, 11], [11, 12], [12, 13], [11, 14] // Bottom Twin
];

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let constellations = [];
    let bgParticles = [];
    
    let mouse = { x: null, y: null, radius: 150 };

    const handleMouseMove = (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const scaleX = canvas.width / 1200;
      const scaleY = canvas.height / 800;
      const globalScale = Math.max(0.4, Math.min(scaleX, scaleY) * 1.5);

      // Organic, asymmetrical placement to avoid a forced/symmetrical look
      // Just 2 instances with different scales and slight tilts
      const instances = [
        { cx: 0.75, cy: 0.3, scale: 1.2, rotation: -0.15 }, // Larger, top-right
        { cx: 0.2, cy: 0.75, scale: 0.7, rotation: 0.25 },  // Smaller, bottom-left
      ];

      constellations = instances.map(inst => {
        return geminiNodes.map(node => {
          // Apply rotation
          const cosR = Math.cos(inst.rotation);
          const sinR = Math.sin(inst.rotation);
          const nx = (node.x * cosR - node.y * sinR) * inst.scale * globalScale;
          const ny = (node.x * sinR + node.y * cosR) * inst.scale * globalScale;
          
          const baseX = canvas.width * inst.cx + nx;
          const baseY = canvas.height * inst.cy + ny;
          
          return {
            id: node.id,
            baseX, baseY,
            x: baseX, y: baseY,
            size: node.size * (globalScale * 0.5 + 0.5) * inst.scale,
            angle: Math.random() * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.02,
            radius: 2 + Math.random() * 5
          };
        });
      });

      bgParticles = [];
      const numParticles = Math.min(80, Math.floor(window.innerWidth / 20));
      for (let i = 0; i < numParticles; i++) {
        bgParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: (Math.random() - 0.5) * 0.8,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update & Draw Constellations
      let allConstellationParticles = [];
      
      constellations.forEach(cParticles => {
        cParticles.forEach(p => {
          p.angle += p.speed;
          p.x = p.baseX + Math.cos(p.angle) * p.radius;
          p.y = p.baseY + Math.sin(p.angle) * p.radius;

          // Subtle parallax with mouse
          if (mouse.x && mouse.y) {
            const dx = (mouse.x - canvas.width / 2) * 0.02;
            const dy = (mouse.y - canvas.height / 2) * 0.02;
            p.x -= dx;
            p.y -= dy;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
          
          allConstellationParticles.push(p);
        });
        ctx.shadowBlur = 0;

        // Draw Constellation Lines
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        geminiEdges.forEach(([id1, id2]) => {
          const p1 = cParticles.find(p => p.id === id1);
          const p2 = cParticles.find(p => p.id === id2);
          if (p1 && p2) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        });
        ctx.stroke();
      });

      // Update & Draw Background Particles
      const allParticles = [...bgParticles, ...allConstellationParticles];

      for (let i = 0; i < bgParticles.length; i++) {
        let p = bgParticles[i];
        
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();

        // Connect nearby background particles to ALL particles
        for (let j = 0; j < allParticles.length; j++) {
          let p2 = allParticles[j];
          if (p === p2) continue;

          let dx = p.x - p2.x;
          let dy = p.y - p2.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / 100) * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Mouse interaction for bg particles
        if (mouse.x != null && mouse.y != null) {
          let dx = p.x - mouse.x;
          let dy = p.y - mouse.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / mouse.radius) * 0.4})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            
            p.x += dx * 0.01;
            p.y += dy * 0.01;
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', initCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseout', handleMouseLeave);

    initCanvas();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', initCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-80"
    />
  );
};

export default ParticleBackground;
