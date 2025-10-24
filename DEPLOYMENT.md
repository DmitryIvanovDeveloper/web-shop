# 🚀 Deployment Guide - Webshops Monorepo

This monorepo contains 3 Next.js applications ready for deployment on Vercel.

## 📦 Projects

1. **web-shop** - Analytics Dashboard with Supabase integration
2. **web-shop-client** - Client-facing web shop
3. **web-shop-payment** - Payment processing application

## 🌐 Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Repository: `Smart-Mobile-Tech-FZCO/webshops-specs`

### Deployment Steps

#### 1. Deploy Web-Shop (Analytics Dashboard)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import `Smart-Mobile-Tech-FZCO/webshops-specs`
4. Configure:
   - **Project Name**: `webshops-analytics`
   - **Framework Preset**: Next.js
   - **Root Directory**: `web-shop`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_USE_SUPABASE_PURCHASE=true
   NEXT_PUBLIC_USE_SUPABASE_REVENUE=false
   ```

6. Click **"Deploy"**

#### 2. Deploy Web-Shop-Client

1. In Vercel Dashboard, click **"Add New Project"**
2. Import `Smart-Mobile-Tech-FZCO/webshops-specs` again
3. Configure:
   - **Project Name**: `webshops-client`
   - **Framework Preset**: Next.js
   - **Root Directory**: `web-shop-client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. Click **"Deploy"**

#### 3. Deploy Web-Shop-Payment

1. In Vercel Dashboard, click **"Add New Project"**
2. Import `Smart-Mobile-Tech-FZCO/webshops-specs` again
3. Configure:
   - **Project Name**: `webshops-payment`
   - **Framework Preset**: Next.js
   - **Root Directory**: `web-shop-payment`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. Click **"Deploy"**

## 🔄 Automatic Deployments

Once set up, Vercel will automatically deploy:
- **Production**: When you push to `main` or `web-scenarios` branch
- **Preview**: For every pull request

## 📝 Environment Variables (for web-shop)

You need to set these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ |
| `NEXT_PUBLIC_USE_SUPABASE_PURCHASE` | Enable Supabase for purchases | ✅ |
| `NEXT_PUBLIC_USE_SUPABASE_REVENUE` | Enable Supabase for revenue | ❌ |

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🎯 Expected Deployment URLs

After deployment, you'll get URLs like:
- **Analytics**: `https://webshops-analytics.vercel.app`
- **Client**: `https://webshops-client.vercel.app`
- **Payment**: `https://webshops-payment.vercel.app`

## 🐛 Troubleshooting

### Build Failed
- Check that `package.json` exists in the root directory
- Verify Node.js version compatibility
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Ensure variables are set in Vercel dashboard
- Redeploy after adding/updating variables
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser

### Supabase Connection Issues
- Verify Supabase URL and key are correct
- Check that Supabase project is active
- Ensure database tables exist (`transaction log`, `products`)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

## 🎉 Success!

Once deployed, visit your analytics dashboard at:
`https://your-project.vercel.app/merchant-admin/analytics/dashboard`

You should see:
- ✅ Purchase Analytics Panel with real Supabase data
- ✅ Recent Purchases Table with real transactions
- ✅ Live data updates from your Supabase database

