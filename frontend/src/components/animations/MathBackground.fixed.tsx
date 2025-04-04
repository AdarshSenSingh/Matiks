import { useEffect, useRef, useState } from 'react';

interface MathSymbol {
  id: number;
  symbol: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  vx: number;
  vy: number;
  vr: number;
}

interface MathBackgroundProps {
  count?: number;
  symbols?: string[];
  minSize?: number;
  maxSize?: number;
  speed?: number;
  className?: string;
  interactive?: boolean;
}

const MathBackgroundFixed = ({
  count = 30,
  symbols = ['+', '-', '×', '÷', '=', '()', '{}', '[]', '∑', '∫', '√', 'π', '∞', '≠', '≈', '≤', '≥'],
  minSize = 12,
  maxSize = 36,
  speed = 0.3,
  className = '',
  interactive = true,
}: MathBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // Use refs for animation state to avoid re-renders
  const symbolsRef = useRef<MathSymbol[]>([]);
  const requestRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize math symbols and canvas
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
    
    // Initialize symbols
    const newSymbols: MathSymbol[] = [];
    for (let i = 0; i < count; i++) {
      newSymbols.push({
        id: i,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        opacity: Math.random() * 0.4 + 0.1,
        rotation: Math.random() * 360,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        vr: (Math.random() - 0.5) * speed * 2,
      });
    }
    
    symbolsRef.current = newSymbols;
    
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
  }, [count, symbols, minSize, maxSize, speed]);
  
  // Animation loop using canvas for better performance
  useEffect(() => {
    if (!contextRef.current) return;
    
    const animate = () => {
      const ctx = contextRef.current;
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Update and draw each symbol
      symbolsRef.current = symbolsRef.current.map(symbol => {
        let { x, y, rotation, vx, vy, vr, symbol: sym, size, opacity } = symbol;
        
        // Update position and rotation
        x += vx;
        y += vy;
        rotation += vr;
        
        // Bounce off walls
        if (x <= 0 || x >= dimensions.width) vx = -vx;
        if (y <= 0 || y >= dimensions.height) vy = -vy;
        
        // Interactive effect - symbols move away from mouse
        if (interactive && isHovering) {
          const dx = x - mousePosition.x;
          const dy = y - mousePosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            vx += (dx / distance) * force * 0.2;
            vy += (dy / distance) * force * 0.2;
            vr += force * 2;
          }
        }
        
        // Apply some friction to prevent symbols from accelerating too much
        vx *= 0.99;
        vy *= 0.99;
        vr *= 0.98;
        
        // Draw the symbol on canvas
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.font = `${size}px monospace`;
        ctx.fillStyle = `rgba(128, 128, 128, ${opacity})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sym, 0, 0);
        ctx.restore();
        
        return {
          ...symbol,
          x: Math.max(0, Math.min(dimensions.width, x)),
          y: Math.max(0, Math.min(dimensions.height, y)),
          rotation: rotation % 360,
          vx,
          vy,
          vr,
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

export default MathBackgroundFixed;
