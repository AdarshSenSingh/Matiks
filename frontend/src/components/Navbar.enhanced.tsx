import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  TrophyIcon,
  HomeIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  BoltIcon,
  FireIcon,
  ChevronDownIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { DarkButton } from "./ui";

const NavbarEnhanced = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Get current path
  const isPublicPage = useMemo(() => {
    const publicPaths = ["/login", "/register"];
    return publicPaths.some((path) => location.pathname.startsWith(path));
  }, [location.pathname]);

  // Debug user object - only on non-public pages
  useEffect(() => {
    if (!isPublicPage) {
      console.log("Auth state in Navbar:", { user, isAuthenticated });
    }
  }, [user, isAuthenticated, isPublicPage]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigation = [
    {
      name: "Home",
      to: "/",
      icon: <HomeIcon className="h-5 w-5" />,
      position: "center",
    },
    {
      name: "Play",
      to: "/play",
      icon: <RocketLaunchIcon className="h-5 w-5" />,
      position: "center",
    },
    {
      name: "Leaderboard",
      to: "/leaderboard",
      icon: <ChartBarIcon className="h-5 w-5" />,
      position: "center",
    },
  ];

  // Check if a navigation item is active
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Disclosure
      as="nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-800"
          : "bg-gradient-to-r from-gray-900 to-gray-950"
      }`}
    >
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
                  <Link
                    to="/"
                    className="text-2xl font-display font-bold text-white group flex items-center"
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, 0, -5, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut",
                        repeatDelay: 5,
                      }}
                      className="mr-2"
                    >
                      <BoltIcon className="h-7 w-7 text-primary-400" />
                    </motion.div>
                    <span className="text-primary-400 inline-block group-hover:scale-110 transition-transform duration-300">
                      Hecto
                    </span>
                    <span className="inline-block group-hover:scale-110 transition-transform duration-300 delay-100">
                      Clash
                    </span>
                  </Link>
                </motion.div>
                <div className="hidden sm:ml-8 sm:flex sm:items-center justify-center flex-1">
                  <div className="flex space-x-8 items-center">
                    {navigation.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
                      >
                        <Link
                          to={item.to}
                          className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                            isActive(item.to)
                              ? "bg-primary-900/50 text-primary-400 border-b-2 border-primary-500"
                              : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                          }`}
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.name}
                          {isActive(item.to) && (
                            <motion.span
                              layoutId="nav-indicator"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <motion.div
                className="hidden sm:ml-6 sm:flex sm:items-center space-x-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {isAuthenticated && (
                  <motion.button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    {isLoggingOut ? "..." : "Sign out"}
                  </motion.button>
                )}
                {isAuthenticated && user ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900">
                        <motion.div
                          className="flex items-center space-x-2 text-white px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-800/90 to-gray-900/90 hover:from-gray-700/90 hover:to-gray-800/90 transition-all duration-200 border border-gray-700/50 shadow-lg backdrop-blur-sm"
                          whileHover={{
                            scale: 1.05,
                            boxShadow: "0 0 15px rgba(79, 70, 229, 0.3)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="relative h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-md border border-primary-400/30"
                            whileHover={{ rotate: 5 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 10,
                            }}
                          >
                            {user.username.charAt(0).toUpperCase()}
                            <motion.div
                              className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-gray-800"
                              animate={{ scale: [1, 1.15, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>
                          <div className="flex items-center">
                            <span className="font-medium text-sm">
                              {user.username}
                            </span>
                            <ChevronDownIcon className="h-4 w-4 ml-1 text-gray-400" />
                          </div>
                        </motion.div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={AnimatePresence}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-150"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-gray-900/95 backdrop-blur-sm py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-800/70 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-800/50 mb-1">
                          <div className="flex items-center mb-2">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-md border border-primary-400/30 mr-3">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {user.username}
                              </div>
                              <div className="text-xs text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-2 bg-gray-800/50 p-2 rounded-md border border-gray-700/50">
                            <div className="flex items-center">
                              <TrophyIcon className="h-3 w-3 mr-1 text-primary-400" />
                              <span>Rating: {user.rating || "0"}</span>
                            </div>
                            <div className="flex items-center">
                              <FireIcon className="h-3 w-3 mr-1 text-orange-400" />
                              <span>Streak: {user.streak || "0"}</span>
                            </div>
                          </div>
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${
                                active ? "bg-gray-800/70" : ""
                              } flex items-center px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors duration-150`}
                            >
                              <UserCircleIcon className="h-5 w-5 mr-3 text-primary-400" />
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/settings"
                              className={`${
                                active ? "bg-gray-800/70" : ""
                              } flex items-center px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors duration-150`}
                            >
                              <Cog6ToothIcon className="h-5 w-5 mr-3 text-primary-400" />
                              Settings
                            </Link>
                          )}
                        </Menu.Item>
                        <div className="border-t border-gray-800/50 my-1 px-2">
                          <div className="text-xs text-gray-500 px-2 py-1 uppercase font-semibold tracking-wider">
                            Account
                          </div>
                        </div>
                        <div className="border-t border-gray-800/50 my-1 px-2">
                          <div className="text-xs text-gray-500 px-2 py-1 uppercase font-semibold tracking-wider">
                            Stats
                          </div>
                        </div>

                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/leaderboard"
                              className={`${
                                active ? "bg-gray-800/70" : ""
                              } flex items-center px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors duration-150`}
                            >
                              <ChartBarIcon className="h-5 w-5 mr-3 text-accent-400" />
                              Leaderboard
                            </Link>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${
                                active ? "bg-gray-800/70" : ""
                              } flex items-center px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors duration-150`}
                            >
                              <ClockIcon className="h-5 w-5 mr-3 text-blue-400" />
                              Game History
                            </Link>
                          )}
                        </Menu.Item>

                        <div className="border-t border-gray-800/50 my-1 px-2">
                          <div className="text-xs text-gray-500 px-2 py-1 uppercase font-semibold tracking-wider">
                            Session
                          </div>
                        </div>

                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className={`${
                                active ? "bg-gray-800/70" : ""
                              } flex items-center w-full text-left px-4 py-2.5 text-sm ${
                                isLoggingOut
                                  ? "text-gray-500"
                                  : "text-gray-300 hover:text-white"
                              } transition-colors duration-150`}
                            >
                              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-red-400" />
                              {isLoggingOut ? "Logging out..." : "Sign out"}
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex space-x-3">
                    <Link to="/login">
                      <DarkButton
                        variant="ghost"
                        className="text-white hover:bg-gray-800"
                      >
                        Login
                      </DarkButton>
                    </Link>
                    <Link to="/register">
                      <DarkButton variant="primary" glow>
                        Register
                      </DarkButton>
                    </Link>
                  </div>
                )}
              </motion.div>

              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <span className="sr-only">Open main menu</span>
                  <motion.div whileTap={{ scale: 0.9 }}>
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
              animate={{ opacity: 1, height: "auto" }}
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
                    className={`flex items-center rounded-md px-3 py-2 text-base font-medium ${
                      isActive(item.to)
                        ? "bg-primary-900/50 text-primary-400 border-l-2 border-primary-500"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              className="border-t border-gray-800 pb-3 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {isAuthenticated && user ? (
                <div className="space-y-1 px-2">
                  <motion.div
                    className="flex items-center px-4 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-lg mb-4 border border-gray-700/50 shadow-md"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold mr-3 shadow-md border border-primary-400/30">
                      {user.username.charAt(0).toUpperCase()}
                      <motion.div
                        className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-gray-800"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-medium text-white">
                        {user.username}
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <div className="flex items-center">
                          <TrophyIcon className="h-3 w-3 mr-1 text-primary-400" />
                          <span>Rating: {user.rating || "0"}</span>
                        </div>
                        <div className="flex items-center">
                          <FireIcon className="h-3 w-3 mr-1 text-orange-400" />
                          <span>Streak: {user.streak || "0"}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  <div className="mb-2 px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Account
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center rounded-md px-3 py-2.5 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-150"
                  >
                    <UserCircleIcon className="h-5 w-5 mr-3 text-primary-400" />
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center rounded-md px-3 py-2.5 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-150"
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-3 text-primary-400" />
                    Settings
                  </Link>

                  <div className="mt-3 mb-2 px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stats
                  </div>

                  <Link
                    to="/leaderboard"
                    className="flex items-center rounded-md px-3 py-2.5 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-150"
                  >
                    <ChartBarIcon className="h-5 w-5 mr-3 text-accent-400" />
                    Leaderboard
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center rounded-md px-3 py-2.5 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-150"
                  >
                    <ClockIcon className="h-5 w-5 mr-3 text-blue-400" />
                    Game History
                  </Link>

                  <div className="mt-3 mb-2 px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Session
                  </div>

                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center w-full text-left rounded-md px-3 py-2.5 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-150"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-red-400" />
                    {isLoggingOut ? "Logging out..." : "Sign out"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-4 flex flex-col">
                  <Link to="/login">
                    <DarkButton
                      variant="ghost"
                      className="w-full justify-center"
                    >
                      Login
                    </DarkButton>
                  </Link>
                  <Link to="/register">
                    <DarkButton
                      variant="primary"
                      className="w-full justify-center"
                      glow
                    >
                      Register
                    </DarkButton>
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

export default NavbarEnhanced;
