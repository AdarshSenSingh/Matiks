import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  type?: 'words' | 'chars' | 'lines';
  duration?: number;
  delay?: number;
  staggerChildren?: number;
  className?: string;
  animationType?: 'fade' | 'slide' | 'bounce' | 'wave' | 'glitch';
  once?: boolean;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

const AnimatedText = ({
  text,
  type = 'words',
  duration = 0.5,
  delay = 0,
  staggerChildren = 0.1,
  className = '',
  animationType = 'fade',
  once = true,
  tag = 'div',
}: AnimatedTextProps) => {
  const [elements, setElements] = useState<string[]>([]);

  useEffect(() => {
    if (type === 'chars') {
      setElements(text.split(''));
    } else if (type === 'words') {
      setElements(text.split(' '));
    } else if (type === 'lines') {
      setElements(text.split('\n'));
    }
  }, [text, type]);

  // Animation variants based on animation type
  const getVariants = (): Variants => {
    switch (animationType) {
      case 'slide':
        return {
          hidden: { y: 20, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: {
              duration,
              ease: 'easeOut',
            },
          },
        };
      case 'bounce':
        return {
          hidden: { y: 20, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 10,
              duration,
            },
          },
        };
      case 'wave':
        return {
          hidden: { y: 20, opacity: 0, scale: 0.9 },
          visible: (i) => ({
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
              delay: i * staggerChildren,
              duration,
              type: 'spring',
              stiffness: 200,
            },
          }),
        };
      case 'glitch':
        return {
          hidden: { opacity: 0, x: -5 },
          visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: {
              delay: i * staggerChildren,
              duration: duration * 0.8,
              ease: [0.25, 0.1, 0.25, 1.0],
              opacity: { duration: duration * 0.3 },
            },
          }),
        };
      case 'fade':
      default:
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration,
              ease: 'easeOut',
            },
          },
        };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerChildren,
      },
    },
  };

  const variants = getVariants();

  // Render the appropriate HTML tag
  const Tag = tag;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      variants={containerVariants}
    >
      {elements.map((element, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={variants}
          className="inline-block"
          style={{ marginRight: type === 'words' ? '0.25em' : undefined }}
        >
          {element}
          {type === 'chars' && i !== elements.length - 1 && ''}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default AnimatedText;
