# 🎯 Responsive Design Quick Reference Guide

## 📱 Common Tailwind CSS Responsive Patterns

### Text Sizing

```jsx
{/* Headings - Scale from mobile to desktop */}
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">

{/* Body text */}
<p className="text-sm sm:text-base lg:text-lg">

{/* Small text */}
<span className="text-xs sm:text-sm">
```

### Spacing (Padding & Margin)

```jsx
{/* Padding that scales */}
<div className="p-4 sm:p-6 lg:p-8">

{/* Margin bottom */}
<div className="mb-4 sm:mb-6 lg:mb-8">

{/* Gap in flex/grid */}
<div className="gap-4 sm:gap-6 lg:gap-8">
```

### Layout

```jsx
{/* Stack on mobile, horizontal on tablet+ */}
<div className="flex flex-col sm:flex-row">

{/* Single column → Multi-column grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

{/* Full width on mobile, auto on desktop */}
<button className="w-full sm:w-auto">
```

### Visibility

```jsx
{/* Hide on mobile, show on desktop */}
<div className="hidden lg:block">

{/* Show on mobile, hide on desktop */}
<div className="lg:hidden">

{/* Different content for different screens */}
<div className="block sm:hidden">Mobile only</div>
<div className="hidden sm:block">Desktop only</div>
```

### Alignment

```jsx
{/* Center on mobile, left on desktop */}
<div className="text-center sm:text-left">
<div className="justify-center sm:justify-start">

{/* Center on mobile, space-between on desktop */}
<div className="justify-center sm:justify-between">
```

---

## 🎨 Component-Specific Patterns

### Buttons

```jsx
<button
  className="
  w-full sm:w-auto          // Full width on mobile
  px-6 sm:px-8 lg:px-10     // Progressive padding
  py-3 sm:py-3.5            // Responsive height
  text-sm sm:text-base      // Scalable text
  rounded-full              // Consistent corners
"
>
  Click Me
</button>
```

### Cards

```jsx
<div
  className="
  bg-white 
  rounded-2xl 
  shadow-lg 
  p-4 sm:p-5 lg:p-6         // Progressive padding
  hover:shadow-2xl 
  transition-all
"
>
  {/* Card content */}
</div>
```

### Images

```jsx
<img
  src="..."
  alt="..."
  className="
    w-full                   // Always full container width
    h-48 sm:h-56 lg:h-64    // Progressive height
    object-cover            // Maintain aspect ratio
  "
/>
```

### Containers

```jsx
<div
  className="
  container               // Max-width container
  mx-auto                // Center horizontally
  px-4 sm:px-6 lg:px-8  // Responsive horizontal padding
"
>
  {/* Content */}
</div>
```

### Forms

```jsx
<form className="space-y-4 sm:space-y-6">
  <input
    type="text"
    className="
      w-full
      px-4 py-3
      text-sm sm:text-base
      rounded-lg
      border-2
    "
  />

  {/* Stack on mobile, side-by-side on desktop */}
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
    <button>Submit</button>
    <button>Cancel</button>
  </div>
</form>
```

---

## 📏 Breakpoint Reference

| Breakpoint | Min Width | Device Type    | Class Prefix |
| ---------- | --------- | -------------- | ------------ |
| **XS**     | 0px       | Mobile phones  | (default)    |
| **SM**     | 640px     | Large phones   | `sm:`        |
| **MD**     | 768px     | Tablets        | `md:`        |
| **LG**     | 1024px    | Laptops        | `lg:`        |
| **XL**     | 1280px    | Desktops       | `xl:`        |
| **2XL**    | 1536px    | Large displays | `2xl:`       |

---

## ✅ Responsive Design Checklist

### Before Committing:

- [ ] Test on mobile (375px width minimum)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1920px)
- [ ] Check text is readable at all sizes
- [ ] Verify buttons are at least 44px tall
- [ ] Ensure no horizontal scrolling
- [ ] Images load and scale correctly
- [ ] Forms are easy to use on touch devices
- [ ] Navigation works on all screens

### Common Issues to Check:

- [ ] Text not wrapping properly
- [ ] Images stretching or distorting
- [ ] Buttons too small to tap
- [ ] Content overlapping
- [ ] Inconsistent spacing
- [ ] Navbar breaking on mobile
- [ ] Forms cramped on small screens

---

## 🔧 Testing Tools

### Browser DevTools

```
Chrome: F12 → Toggle Device Toolbar (Ctrl+Shift+M)
Firefox: F12 → Responsive Design Mode (Ctrl+Shift+M)
```

### Recommended Test Devices

1. iPhone SE (375px × 667px)
2. iPhone 12/13 (390px × 844px)
3. iPad (768px × 1024px)
4. iPad Pro (1024px × 1366px)
5. Laptop (1366px × 768px)
6. Desktop (1920px × 1080px)

### Using ResponsiveIndicator Component

```jsx
// In App.jsx (development only)
import ResponsiveIndicator from "./components/ResponsiveIndicator";

function App() {
  return (
    <>
      {/* Your app */}
      <ResponsiveIndicator />
    </>
  );
}
```

---

## 💡 Pro Tips

### 1. Mobile-First Approach

Always start with mobile styles, then add larger screen styles:

```jsx
// ✅ Good (mobile-first)
<div className="text-sm sm:text-base lg:text-lg">

// ❌ Avoid (desktop-first)
<div className="text-lg sm:text-base lg:text-sm">
```

### 2. Use Consistent Spacing

Stick to a spacing scale:

```
Small:  4 → 6 → 8
Medium: 8 → 12 → 16
Large:  12 → 16 → 20
```

### 3. Line Clamping for Text

```jsx
{/* Limit text to 2 lines */}
<p className="line-clamp-2">

{/* Limit to 3 lines */}
<p className="line-clamp-3">
```

### 4. Aspect Ratio for Images

```jsx
{
  /* Maintain 16:9 ratio */
}
<div className="aspect-video">
  <img src="..." className="w-full h-full object-cover" />
</div>;

{
  /* Square ratio */
}
<div className="aspect-square">
  <img src="..." className="w-full h-full object-cover" />
</div>;
```

### 5. Touch-Friendly Spacing

```jsx
{
  /* Adequate gap between clickable items */
}
<div className="flex gap-4">
  {" "}
  {/* Minimum 16px */}
  <button>...</button>
  <button>...</button>
</div>;
```

---

## 🚫 Common Mistakes to Avoid

### 1. Fixed Widths

```jsx
// ❌ Bad - breaks on small screens
<div className="w-[600px]">

// ✅ Good - responsive width
<div className="w-full max-w-2xl">
```

### 2. Forgetting Mobile Menu

```jsx
// ❌ Bad - no mobile navigation
<nav className="flex gap-4">

// ✅ Good - hamburger menu on mobile
<nav>
  <div className="hidden lg:flex gap-4">...</div>
  <button className="lg:hidden">☰</button>
</nav>
```

### 3. Tiny Touch Targets

```jsx
// ❌ Bad - too small to tap
<button className="px-2 py-1 text-xs">

// ✅ Good - minimum 44px height
<button className="px-4 py-3 text-base">
```

### 4. Overflow Issues

```jsx
// ❌ Bad - can cause horizontal scroll
<div className="flex gap-4">
  <div className="w-1/3">...</div>
  <div className="w-1/3">...</div>
  <div className="w-1/3">...</div>
</div>

// ✅ Good - wraps on mobile
<div className="flex flex-wrap gap-4">
  <div className="w-full sm:w-1/3">...</div>
  <div className="w-full sm:w-1/3">...</div>
  <div className="w-full sm:w-1/3">...</div>
</div>
```

---

## 📚 Additional Resources

- [Tailwind CSS Docs - Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Web.dev - Responsive Web Design](https://web.dev/responsive-web-design-basics/)
- [MDN - Mobile First](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first)
- [Google - Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

---

**Quick Command Reference:**

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Check for unused CSS
npm run build -- --stats
```

---

**Questions or Issues?**
Refer to [RESPONSIVE_UPDATES_SUMMARY.md](./RESPONSIVE_UPDATES_SUMMARY.md) for detailed implementation notes.

**Last Updated**: December 12, 2025
