import { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  opacity: number;
}

interface ParticleBackgroundProps {
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  speed?: number;
  className?: string;
  interactive?: boolean;
}

const ParticleBackgroundFixed = ({
  count = 50,
  colors = ['#4f46e5', '#7c3aed', '#2563eb', '#0ea5e9', '#0891b2'],
  minSize = 2,
  maxSize = 8,
  speed = 0.5,
  className = '',
  interactive = true,
}: ParticleBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // Use refs for animation state to avoid re-renders
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize particles and canvas
  useEffect(() => {
    if (!containerRef.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    setDimensions({ width, height });
    
    // Initialize canvas
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      contextRef.current = canvasRef.current.getContext('2d');
    }
    
    // Initialize particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
    
    particlesRef.current = newParticles;
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      
      // Update canvas dimensions
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [count, colors, minSize, maxSize, speed]);
  
  // Animation loop using canvas for better performance
  useEffect(() => {
    if (!contextRef.current) return;
    
    const animate = () => {
      const ctx = contextRef.current;
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Update and draw each particle
      particlesRef.current = particlesRef.current.map(particle => {
        let { x, y, vx, vy, size, color, opacity } = particle;
        
        // Update position
        x += vx;
        y += vy;
        
        // Bounce off walls
        if (x <= 0 || x >= dimensions.width) vx = -vx;
        if (y <= 0 || y >= dimensions.height) vy = -vy;
        
        // Interactive effect - particles move away from mouse
        if (interactive && isHovering) {
          const dx = x - mousePosition.x;
          const dy = y - mousePosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            vx += (dx / distance) * force * 0.2;
            vy += (dy / distance) * force * 0.2;
          }
        }
        
        // Apply some friction to prevent particles from accelerating too much
        vx *= 0.99;
        vy *= 0.99;
        
        // Draw the particle on canvas
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
        
        return {
          ...particle,
          x: Math.max(0, Math.min(dimensions.width, x)),
          y: Math.max(0, Math.min(dimensions.height, y)),
          vx,
          vy,
        };
      });
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [dimensions, mousePosition, isHovering, interactive]);
  
  // Mouse interaction handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !interactive) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };
  
  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

export default ParticleBackgroundFixed;
