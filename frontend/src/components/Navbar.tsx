import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Button } from './ui';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigation = [
    { name: 'Home', to: '/' },
    { name: 'Play', to: '/play' },
    { name: 'Leaderboard', to: '/leaderboard' },
  ];

  // Check if a navigation item is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Disclosure as="nav" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-primary-900/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-r from-primary-800 to-primary-900'}`}>
      {({ open }) => (
        <>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <motion.div 
                  className="flex flex-shrink-0 items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link to="/" className="text-2xl font-display font-bold text-white group">
                    <span className="text-accent-400 inline-block group-hover:scale-110 transition-transform duration-300">Hecto</span>
                    <span className="inline-block group-hover:scale-110 transition-transform duration-300 delay-100">Clash</span>
                  </Link>
                </motion.div>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
                    >
                      <Link
                        to={item.to}
                        className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200 ${isActive(item.to) ? 'border-accent-400 text-white' : 'border-transparent text-gray-200 hover:border-accent-300 hover:text-white'}`}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <motion.div 
                className="hidden sm:ml-6 sm:flex sm:items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {user ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-800">
                        <motion.div 
                          className="flex items-center space-x-2 text-white px-3 py-2 rounded-full bg-primary-700/50 hover:bg-primary-700 transition-colors duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="h-8 w-8 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.username}</span>
                        </motion.div>
                      </Menu.Button>
                    </div>
                    <Transition
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-150"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                            >
                              <UserCircleIcon className="h-5 w-5 mr-2 text-gray-500" />
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/settings"
                              className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                            >
                              <Cog6ToothIcon className="h-5 w-5 mr-2 text-gray-500" />
                              Settings
                            </Link>
                          )}
                        </Menu.Item>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className={`${active ? 'bg-gray-100' : ''} flex items-center w-full text-left px-4 py-2 text-sm text-gray-700`}
                            >
                              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-gray-500" />
                              {isLoggingOut ? 'Logging out...' : 'Sign out'}
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex space-x-3">
                    <Link to="/login">
                      <Button 
                        variant="ghost" 
                        className="text-white hover:bg-white/10"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button 
                        variant="accent"
                      >
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>
              
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:bg-primary-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                  >
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </motion.div>
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <motion.div 
              className="space-y-1 px-2 pb-3 pt-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                >
                  <Link
                    to={item.to}
                    className={`block rounded-md px-3 py-2 text-base font-medium ${isActive(item.to) ? 'bg-primary-700 text-white' : 'text-gray-200 hover:bg-primary-700/50 hover:text-white'}`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            <motion.div 
              className="border-t border-primary-700 pb-3 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {user ? (
                <div className="space-y-1 px-2">
                  <div className="flex items-center px-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold mr-3">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-base font-medium text-white">{user.username}</div>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-200 hover:bg-primary-700 hover:text-white"
                  >
                    <UserCircleIcon className="h-5 w-5 mr-2" />
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-200 hover:bg-primary-700 hover:text-white"
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-200 hover:bg-primary-700 hover:text-white"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    {isLoggingOut ? 'Logging out...' : 'Sign out'}
                  </button>
                </div>
              ) : (
                <div className="space-y-1 px-2">
                  <Link
                    to="/login"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-200 hover:bg-primary-700 hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-200 hover:bg-primary-700 hover:text-white"
                  >
                    Register
                  </Link>
                </div>
              )}
            </motion.div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
