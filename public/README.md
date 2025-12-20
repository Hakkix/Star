# Public Assets

This directory contains static assets served at the root of your application.

## Files to Add

- `favicon.ico` - Browser tab icon
- `logo.png` - App logo/icon
- `apple-touch-icon.png` - iOS home screen icon
- `robots.txt` - Search engine instructions
- `manifest.json` - PWA manifest (if adding PWA features)

## Usage

Files in this folder are served at the root path. For example:
- `/public/favicon.ico` → `https://yourdomain.com/favicon.ico`
- `/public/logo.png` → `https://yourdomain.com/logo.png`

Reference in code:
```tsx
<Image src="/logo.png" alt="Logo" />
```

## Notes

- Do not commit large assets (> 1MB) to Git
- Optimize images before adding
- Use SVG for icons when possible
