# Google Analytics Setup for Production

## Current Status
✅ Code is deployed with Google Analytics integration
✅ Environment variable added to Vercel
⏳ Redeployment in progress...

## Steps to Enable Google Analytics on Production

### Option 1: Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Find and click on your **cyberstats-platform** project
3. Click **Settings** in the top navigation
4. Click **Environment Variables** in the left sidebar
5. Click **Add New**
6. Enter:
   - **Key**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value**: `G-DHC3WDR2CS`
   - **Environments**: Check ✓ **Production** (and **Preview** if you want)
7. Click **Save**
8. Go to **Deployments** tab
9. Find the latest deployment and click the **⋮** menu
10. Click **Redeploy**

### Option 2: Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Add environment variable
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production

# When prompted, enter: G-DHC3WDR2CS

# Redeploy
vercel --prod
```

## Verify It's Working

After redeployment completes (takes 2-3 minutes):

1. Visit https://cybersecstatistics.com
2. Open Chrome DevTools (F12)
3. Go to **Network** tab
4. Reload the page
5. Filter by "gtag" or "google"
6. You should see requests to:
   - `https://www.googletagmanager.com/gtag/js?id=G-DHC3WDR2CS`
   - Analytics event tracking calls

## Check in Google Analytics

1. Go to https://analytics.google.com/
2. Select your property
3. Go to **Reports** → **Realtime**
4. Open your site in another tab
5. You should see activity within 30 seconds

## Your Measurement ID
```
G-DHC3WDR2CS
```

## Troubleshooting

If it still doesn't work:
1. Check that the environment variable is set to **Production** environment
2. Make sure you redeployed AFTER adding the variable
3. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for any errors
