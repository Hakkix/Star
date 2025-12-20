# Deployment Guide - Star AR Map

## Deploying to Vercel

Star is optimized for deployment on Vercel's platform. Follow these steps:

### Prerequisites

- GitHub account connected to Vercel
- Node.js 18.17.0 or higher installed locally

### Quick Deploy

#### Option 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Configure Build Settings** (Auto-configured)
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

#### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow prompts** to link your project

### Environment Variables

Star doesn't require any environment variables for core functionality. If you add analytics or other services:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add variables as needed (use `NEXT_PUBLIC_` prefix for client-side)

### Custom Domain (Optional)

1. Go to your Vercel project
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

**Important**: HTTPS is required for device sensor access. Vercel provides HTTPS automatically for all deployments.

### Build Configuration

The project includes:
- `vercel.json` - Vercel-specific settings
- `next.config.mjs` - Next.js configuration
- `package.json` - Dependencies and scripts

No additional configuration needed for standard deployment.

### Performance Optimization

Vercel automatically provides:
- Global CDN distribution
- Edge caching
- Image optimization
- Automatic HTTPS
- Serverless functions (if needed)

### Post-Deployment Checklist

- [ ] Test on mobile device (sensors only work on real devices)
- [ ] Verify HTTPS is enabled
- [ ] Test GPS permission prompt
- [ ] Test device orientation permission (iOS)
- [ ] Check performance with Lighthouse
- [ ] Verify stars and planets render correctly

### Troubleshooting

**Build Fails**
- Check Node.js version (must be ≥18.17.0)
- Verify all dependencies in `package.json`
- Check build logs in Vercel dashboard

**Sensors Don't Work**
- Ensure deployment is HTTPS (Vercel default)
- Test on physical mobile device (not simulator)
- Check browser compatibility (iOS Safari, Chrome)

**Slow Performance**
- Check bundle size in build output
- Verify `stars.json` isn't too large (keep under 1MB)
- Use Vercel Analytics to identify bottlenecks

### Monitoring

Consider adding:
- Vercel Analytics (built-in, enable in dashboard)
- Sentry for error tracking
- Web Vitals monitoring

### Continuous Deployment

Vercel automatically deploys:
- **Production**: Commits to `main` branch
- **Preview**: Pull requests and other branches

Each deployment gets a unique URL for testing.

### Cost

Star on Vercel:
- **Hobby Plan**: Free (includes HTTPS, CDN, unlimited deployments)
- **Pro Plan**: $20/month (for commercial use, better analytics)

Static/client-side app = minimal bandwidth/compute costs.

### Advanced Configuration

**Custom Headers** (already configured in `vercel.json`):
- Security headers (XSS, CSP, etc.)
- Sensor permissions policy

**Edge Functions**: Not needed for Star (all client-side)

**ISR/SSR**: Disabled (Three.js requires client-side rendering)

---

## Alternative Deployment Platforms

While optimized for Vercel, Star can deploy to:

### Netlify
```bash
npm run build
# Deploy the .next folder
```

### Cloudflare Pages
- Requires adapter (not recommended, use Vercel)

### Self-Hosted
```bash
npm run build
npm run start
```
- Requires Node.js server
- Configure reverse proxy (nginx/Apache)
- Obtain SSL certificate (Let's Encrypt)

---

**Recommended**: Use Vercel for best experience and zero configuration.
