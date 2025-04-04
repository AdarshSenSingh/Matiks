import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollReveal } from "./animations";
import {
  ChatBubbleLeftRightIcon,
  RocketLaunchIcon,
  TrophyIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Discord",
      icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
      href: "#",
    },
    {
      name: "Twitter",
      icon: <RocketLaunchIcon className="h-5 w-5" />,
      href: "#",
    },
    { name: "GitHub", icon: <UserGroupIcon className="h-5 w-5" />, href: "#" },
  ];

  const quickLinks = [
    { name: "Home", to: "/" },
    { name: "Play Now", to: "/play" },
    { name: "Leaderboard", to: "/leaderboard" },
  ];

  const learnLinks = [
    {
      name: "How to Play",
      to: "/learn",
      icon: <BookOpenIcon className="h-4 w-4" />,
    },
    {
      name: "Strategies",
      to: "/strategies",
      icon: <TrophyIcon className="h-4 w-4" />,
    },
    {
      name: "FAQ",
      to: "/faq",
      icon: <QuestionMarkCircleIcon className="h-4 w-4" />,
    },
  ];

  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto relative overflow-hidden border-t border-gray-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary-800/20 blur-xl"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary-500/10 blur-xl"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <ScrollReveal className="md:col-span-4" threshold={0.1} direction="up">
            <div>
              <Link to="/" className="inline-block group">
                <h3 className="text-2xl font-display font-bold mb-4">
                  <motion.span
                    className="text-primary-400 inline-block"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Hecto
                  </motion.span>
                  <motion.span
                    className="inline-block text-white"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                  >
                    Clash
                  </motion.span>
                </h3>
              </Link>
              <p className="text-gray-400 text-sm max-w-md">
                The ultimate real-time competitive mental math game based on the
                Hectoc format. Challenge your friends, improve your skills, and
                climb the leaderboard!
              </p>

              <div className="mt-6 flex space-x-4">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full text-primary-400 transition-colors duration-200"
                    whileHover={{ y: -3 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    {link.icon}
                    <span className="sr-only">{link.name}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal
            className="md:col-span-2"
            threshold={0.1}
            direction="up"
            delay={0.1}
          >
            <h4 className="text-lg font-semibold mb-4 text-primary-400">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <motion.li
                  key={link.name}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center"
                  >
                    <span className="bg-primary-900/50 h-1 w-4 rounded-full mr-2"></span>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal
            className="md:col-span-3"
            threshold={0.1}
            direction="up"
            delay={0.2}
          >
            <h4 className="text-lg font-semibold mb-4 text-primary-400">
              Learn
            </h4>
            <ul className="space-y-3">
              {learnLinks.map((link) => (
                <motion.li
                  key={link.name}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2 text-primary-400">{link.icon}</span>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal
            className="md:col-span-3"
            threshold={0.1}
            direction="up"
            delay={0.3}
          >
            <h4 className="text-lg font-semibold mb-4 text-primary-400">
              Newsletter
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to our newsletter to get updates on new features and
              tournaments.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-gray-800/50 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-400 w-full"
              />
              <motion.button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-r-md transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </form>
          </ScrollReveal>
        </div>

        <motion.div
          className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>&copy; {currentYear} HectoClash. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
