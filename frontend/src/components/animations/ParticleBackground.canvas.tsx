import { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  speed?: number;
  className?: string;
  interactive?: boolean;
}

// Define a particle outside of the component to avoid re-renders
interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  opacity: number;
}

const ParticleBackgroundCanvas = ({
  count = 50,
  colors = ['#4f46e5', '#7c3aed', '#2563eb', '#0ea5e9', '#0891b2'],
  minSize = 2,
  maxSize = 8,
  speed = 0.5,
  className = '',
  interactive = true,
}: ParticleBackgroundProps) => {
  // Use refs to avoid state updates during animation
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0, isHovering: false });
  const dimensionsRef = useRef({ width: 0, height: 0 });

  // Initialize canvas and particles
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Set canvas dimensions
    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      dimensionsRef.current = { width: rect.width, height: rect.height };
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, () => {
      const { width, height } = dimensionsRef.current;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        opacity: Math.random() * 0.5 + 0.1,
      };
    });

    // Mouse event handlers
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isHovering: true,
      };
    };

    const handleMouseEnter = () => {
      mouseRef.current.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = dimensionsRef.current;
      const { x: mouseX, y: mouseY, isHovering } = mouseRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off walls
        if (particle.x <= 0 || particle.x >= width) particle.vx = -particle.vx;
        if (particle.y <= 0 || particle.y >= height) particle.vy = -particle.vy;

        // Interactive effect - particles move away from mouse
        if (interactive && isHovering) {
          const dx = particle.x - mouseX;
          const dy = particle.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.vx += (dx / distance) * force * 0.2;
            particle.vy += (dy / distance) * force * 0.2;
          }
        }

        // Apply friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Keep within bounds
        particle.x = Math.max(0, Math.min(width, particle.x));
        particle.y = Math.max(0, Math.min(height, particle.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [count, colors, minSize, maxSize, speed, interactive]); // Dependencies that don't change during animation

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default ParticleBackgroundCanvas;
