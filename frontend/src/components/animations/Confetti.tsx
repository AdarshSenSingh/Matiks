import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  spread?: number;
  colors?: string[];
}

const Confetti = ({
  active,
  duration = 3000,
  particleCount = 100,
  spread = 70,
  colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
}: ConfettiProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiInstanceRef = useRef<confetti.CreateTypes | null>(null);

  useEffect(() => {
    // Create confetti instance
    if (canvasRef.current && !confettiInstanceRef.current) {
      confettiInstanceRef.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });
    }

    // Fire confetti when active
    if (active && confettiInstanceRef.current) {
      const end = Date.now() + duration;

      const interval = setInterval(() => {
        const timeLeft = end - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        // Reduce particle count as time runs out
        const remainingTime = timeLeft / duration;
        const currentParticleCount = Math.floor(particleCount * remainingTime);

        confettiInstanceRef.current?.({
          particleCount: currentParticleCount,
          spread: spread,
          origin: { y: 0.6, x: Math.random() },
          colors: colors,
          disableForReducedMotion: true,
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [active, duration, particleCount, spread, colors]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default Confetti;
