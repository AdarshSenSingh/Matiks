import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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

const ParticleBackground = ({
  count = 50,
  colors = ['#4f46e5', '#7c3aed', '#2563eb', '#0ea5e9', '#0891b2'],
  minSize = 2,
  maxSize = 8,
  speed = 0.5,
  className = '',
  interactive = true,
}: ParticleBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  // Initialize particles
  useEffect(() => {
    if (!containerRef.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    setDimensions({ width, height });
    
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
    
    setParticles(newParticles);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [count, colors, minSize, maxSize, speed]);
  
  // Animation loop
  useEffect(() => {
    if (particles.length === 0) return;
    
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        setParticles(prevParticles => {
          return prevParticles.map(particle => {
            let { x, y, vx, vy } = particle;
            
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
            
            return {
              ...particle,
              x: Math.max(0, Math.min(dimensions.width, x)),
              y: Math.max(0, Math.min(dimensions.height, y)),
              vx,
              vy,
            };
          });
        });
      }
      
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [particles, dimensions, mousePosition, isHovering, interactive]);
  
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
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            x: particle.x,
            y: particle.y,
            filter: 'blur(1px)',
          }}
          animate={{
            x: particle.x,
            y: particle.y,
          }}
          transition={{
            duration: 0.1,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
