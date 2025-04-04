import { useEffect, useRef, memo } from 'react';

interface MathBackgroundProps {
  count?: number;
  symbols?: string[];
  minSize?: number;
  maxSize?: number;
  speed?: number;
  className?: string;
  color?: string;
  size?: number;
}

// Define a math symbol outside of the component to avoid re-renders
interface MathSymbol {
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

const MathBackgroundStatic = memo(({
  count = 30,
  symbols = ['+', '-', '×', '÷', '=', '()', '{}', '[]', '∑', '∫', '√', 'π', '∞', '≠', '≈', '≤', '≥'],
  minSize = 12,
  maxSize = 36,
  speed = 0.3,
  className = '',
  color = 'rgba(128, 128, 128, 0.5)',
  size = 24,
}: MathBackgroundProps) => {
  // Use refs to avoid state updates during animation
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const symbolsRef = useRef<MathSymbol[]>([]);
  const animationRef = useRef<number>();
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const isInitializedRef = useRef(false);

  // Initialize canvas and symbols
  useEffect(() => {
    // Skip re-initialization if already done
    if (isInitializedRef.current) return;
    
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

    // Initialize symbols
    symbolsRef.current = Array.from({ length: count }, () => {
      const { width, height } = dimensionsRef.current;
      return {
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        opacity: Math.random() * 0.4 + 0.1,
        rotation: Math.random() * 360,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        vr: (Math.random() - 0.5) * speed * 2,
      };
    });

    // Animation loop
    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = dimensionsRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update and draw symbols
      symbolsRef.current.forEach((symbol) => {
        // Update position and rotation
        symbol.x += symbol.vx;
        symbol.y += symbol.vy;
        symbol.rotation += symbol.vr;

        // Bounce off walls
        if (symbol.x <= 0 || symbol.x >= width) symbol.vx = -symbol.vx;
        if (symbol.y <= 0 || symbol.y >= height) symbol.vy = -symbol.vy;

        // Apply friction
        symbol.vx *= 0.99;
        symbol.vy *= 0.99;
        symbol.vr *= 0.98;

        // Keep within bounds
        symbol.x = Math.max(0, Math.min(width, symbol.x));
        symbol.y = Math.max(0, Math.min(height, symbol.y));
        symbol.rotation = symbol.rotation % 360;

        // Draw symbol
        ctx.save();
        ctx.translate(symbol.x, symbol.y);
        ctx.rotate((symbol.rotation * Math.PI) / 180);
        ctx.font = `${symbol.size}px monospace`;
        ctx.fillStyle = color || `rgba(128, 128, 128, ${symbol.opacity})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol.symbol, 0, 0);
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    isInitializedRef.current = true;

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array to ensure it only runs once

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
});

MathBackgroundStatic.displayName = 'MathBackgroundStatic';

export default MathBackgroundStatic;
