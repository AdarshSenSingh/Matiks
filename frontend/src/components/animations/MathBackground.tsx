import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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

const MathBackground = ({
  count = 30,
  symbols = ["+", "-", "×", "÷", "=", "()", "{}", "[]", "∑", "∫", "√", "π", "∞", "≠", "≈", "≤", "≥"],
  minSize = 12,
  maxSize = 36,
  speed = 0.3,
  className = "",
  interactive = true,
}: MathBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const symbolsRef = useRef<MathSymbol[]>([]);

  const [mathSymbols, setMathSymbols] = useState<MathSymbol[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Initialize math symbols
  useEffect(() => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    setDimensions({ width, height });

    const newSymbols: MathSymbol[] = Array.from({ length: count }, (_, i) => ({
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
    }));

    setMathSymbols(newSymbols);
    symbolsRef.current = newSymbols;

    const handleResize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [count, symbols, minSize, maxSize, speed]);

  // Animation loop
  useEffect(() => {
    if (mathSymbols.length === 0) return;

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const updatedSymbols = symbolsRef.current.map((symbol) => {
          let { x, y, rotation, vx, vy, vr } = symbol;

          x += vx;
          y += vy;
          rotation += vr;

          if (x <= 0 || x >= dimensions.width) vx = -vx;
          if (y <= 0 || y >= dimensions.height) vy = -vy;

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

          vx *= 0.99;
          vy *= 0.99;
          vr *= 0.98;

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

        symbolsRef.current = updatedSymbols;
        setMathSymbols(updatedSymbols);
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
  }, [dimensions, mousePosition, isHovering, interactive]);

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
      {mathSymbols.map((symbol) => (
        <motion.div
          key={symbol.id}
          className="absolute font-mono select-none pointer-events-none"
          style={{
            fontSize: `${symbol.size}px`,
            color: "currentColor",
            opacity: symbol.opacity,
            x: symbol.x,
            y: symbol.y,
            rotate: symbol.rotation,
          }}
          animate={{
            x: symbol.x,
            y: symbol.y,
            rotate: symbol.rotation,
          }}
          transition={{
            duration: 0.1,
            ease: "linear",
          }}
        >
          {symbol.symbol}
        </motion.div>
      ))}
    </div>
  );
};

export default MathBackground;
