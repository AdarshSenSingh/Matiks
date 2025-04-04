import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SolutionInputProps {
  onSubmit: (solution: string) => void;
  isActive: boolean;
  sequence: string;
}

const SolutionInput: React.FC<SolutionInputProps> = ({ onSubmit, isActive, sequence }) => {
  const [solution, setSolution] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when game becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!solution.trim()) {
      setError('Please enter a solution');
      return;
    }
    
    // Check if all digits from the sequence are used
    const digits = sequence.split('');
    const solutionDigits = solution.replace(/[^0-9]/g, '').split('');
    
    // Check if all digits are used exactly once
    const allDigitsUsed = digits.every(digit => 
      solutionDigits.filter(d => d === digit).length === 1
    );
    
    if (!allDigitsUsed) {
      setError('Use all six numbers exactly once');
      return;
    }
    
    // Check for valid operators
    const validOperators = ['+', '-', '*', '/', '(', ')'];
    const operators = solution.replace(/[0-9]/g, '').split('');
    const allOperatorsValid = operators.every(op => 
      validOperators.includes(op) || op === ' '
    );
    
    if (!allOperatorsValid) {
      setError('Use only valid operators: +, -, *, /, (, )');
      return;
    }
    
    // Submit solution
    onSubmit(solution);
    setSolution('');
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={solution}
            onChange={(e) => {
              setSolution(e.target.value);
              setError(null);
            }}
            placeholder="Enter your solution (e.g., 1+2*3-4/5+6)"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={!isActive}
          />
          
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute text-red-400 text-sm mt-1"
            >
              {error}
            </motion.p>
          )}
        </div>
        
        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setSolution('')}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
            disabled={!isActive}
          >
            Clear
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-bold"
            disabled={!isActive}
          >
            Submit
          </motion.button>
        </div>
      </form>
      
      {/* Virtual keyboard for mobile */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {['1', '2', '3', '+', '4', '5', '6', '-', '7', '8', '9', '*', '(', '0', ')', '/'].map((key) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-gray-700 rounded-lg text-white font-mono text-lg"
            onClick={() => setSolution(prev => prev + key)}
            disabled={!isActive}
          >
            {key}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SolutionInput;
