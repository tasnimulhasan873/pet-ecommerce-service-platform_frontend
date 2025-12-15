import React from "react";

/**
 * Responsive Breakpoint Indicator
 *
 * A development utility component that displays the current Tailwind CSS breakpoint
 * in the bottom-right corner of the screen. This helps developers test responsive
 * designs across different screen sizes.
 *
 * Usage:
 * 1. Import in App.jsx or main layout
 * 2. Remove or comment out in production
 *
 * Breakpoints displayed:
 * - XS: < 640px (Extra Small / Mobile)
 * - SM: >= 640px (Small / Large Mobile)
 * - MD: >= 768px (Medium / Tablet)
 * - LG: >= 1024px (Large / Small Desktop)
 * - XL: >= 1280px (Extra Large / Desktop)
 * - 2XL: >= 1536px (2X Large / Large Desktop)
 */
const ResponsiveIndicator = () => {
  // Only show in development environment
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      {/* Container with semi-transparent background */}
      <div className="bg-black/80 text-white px-3 py-2 rounded-lg shadow-lg font-mono text-xs sm:text-sm">
        {/* Breakpoint indicators - Only one will be visible at a time */}

        {/* Extra Small - Mobile (< 640px) */}
        <div className="sm:hidden flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-bold">XS</span>
          <span className="text-gray-300">(&lt; 640px)</span>
        </div>

        {/* Small - Large Mobile (>= 640px) */}
        <div className="hidden sm:block md:hidden flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="font-bold">SM</span>
          <span className="text-gray-300">(≥ 640px)</span>
        </div>

        {/* Medium - Tablet (>= 768px) */}
        <div className="hidden md:block lg:hidden flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-bold">MD</span>
          <span className="text-gray-300">(≥ 768px)</span>
        </div>

        {/* Large - Small Desktop (>= 1024px) */}
        <div className="hidden lg:block xl:hidden flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="font-bold">LG</span>
          <span className="text-gray-300">(≥ 1024px)</span>
        </div>

        {/* Extra Large - Desktop (>= 1280px) */}
        <div className="hidden xl:block 2xl:hidden flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="font-bold">XL</span>
          <span className="text-gray-300">(≥ 1280px)</span>
        </div>

        {/* 2X Large - Large Desktop (>= 1536px) */}
        <div className="hidden 2xl:block flex items-center gap-2">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
          <span className="font-bold">2XL</span>
          <span className="text-gray-300">(≥ 1536px)</span>
        </div>
      </div>

      {/* Screen dimensions display */}
      <div className="bg-black/80 text-white px-3 py-1 rounded-lg shadow-lg font-mono text-xs mt-2">
        <span className="text-gray-400">Screen:</span>{" "}
        <span className="font-bold text-green-400" id="screen-width">
          {typeof window !== "undefined" ? window.innerWidth : "---"}
        </span>
        <span className="text-gray-400"> × </span>
        <span className="font-bold text-green-400" id="screen-height">
          {typeof window !== "undefined" ? window.innerHeight : "---"}
        </span>
        <span className="text-gray-400">px</span>
      </div>
    </div>
  );
};

export default ResponsiveIndicator;

/**
 * HOW TO USE:
 *
 * 1. Import in your App.jsx:
 *
 *    import ResponsiveIndicator from './components/ResponsiveIndicator';
 *
 * 2. Add to your render:
 *
 *    function App() {
 *      return (
 *        <div>
 *          {Your app content}
 *          <ResponsiveIndicator />
 *        </div>
 *      );
 *    }
 *
 * 3. Test responsiveness:
 *    - Resize browser window
 *    - Use Chrome DevTools device toolbar
 *    - Check indicator changes color and shows current breakpoint
 *
 * 4. Remove before production deployment:
 *    - Comment out <ResponsiveIndicator />
 *    - Or component automatically hides in production
 */
