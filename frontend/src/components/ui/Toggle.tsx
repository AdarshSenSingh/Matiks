import React, { useState } from 'react';
import { Switch } from '@headlessui/react';
import { motion } from 'framer-motion';

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, className = 'bg-primary-600' }) => {
  return (
    <Switch
      checked={enabled}
      onChange={onChange}
      className={`${
        enabled ? className : 'bg-gray-300'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
    >
      <span className="sr-only">Toggle mode</span>
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white`}
      />
    </Switch>
  );
};

export default Toggle;
