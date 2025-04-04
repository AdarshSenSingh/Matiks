import { ReactNode, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltFactor?: number;
  glareEnabled?: boolean;
  glareMaxOpacity?: number;
  perspective?: number;
  scale?: number;
  transitionSpeed?: number;
  resetOnLeave?: boolean;
}

const TiltCard = ({
  children,
  className = '',
  tiltFactor = 15,
  glareEnabled = true,
  glareMaxOpacity = 0.2,
  perspective = 1000,
  scale = 1.05,
  transitionSpeed = 0.2,
  resetOnLeave = true,
}: TiltCardProps) => {
  const [tiltPosition, setTiltPosition] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate tilt based on mouse position relative to card center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Normalize values (-1 to 1)
    const normalizedX = mouseX / (rect.width / 2);
    const normalizedY = mouseY / (rect.height / 2);
    
    // Calculate tilt angles
    const tiltX = normalizedY * tiltFactor;
    const tiltY = -normalizedX * tiltFactor;
    
    // Update tilt position
    setTiltPosition({ x: tiltX, y: tiltY });
    
    // Update glare position (0-100%)
    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePosition({ x: glareX, y: glareY });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (resetOnLeave) {
      setTiltPosition({ x: 0, y: 0 });
      setGlarePosition({ x: 50, y: 50 });
    }
    setIsHovering(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateX: tiltPosition.x,
        rotateY: tiltPosition.y,
        scale: isHovering ? scale : 1,
      }}
      transition={{
        duration: transitionSpeed,
        ease: 'easeOut',
      }}
    >
      {children}
      
      {/* Glare effect */}
      {glareEnabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${isHovering ? glareMaxOpacity : 0}), transparent)`,
            mixBlendMode: 'overlay',
          }}
          animate={{
            opacity: isHovering ? 1 : 0,
          }}
          transition={{
            duration: transitionSpeed,
          }}
        />
      )}
    </motion.div>
  );
};

export default TiltCard;
