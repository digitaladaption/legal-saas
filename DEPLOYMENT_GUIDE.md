# Production Deployment Guide

This guide provides instructions for deploying your Next.js application to a production environment like Hetzner. The most common cause of deployment issues, where the application fails to load styles or data, is missing environment variables.

## 1. Required Environment Variables

Your application requires the following environment variables to be set in your production environment:

| Variable Name                   | Description                                         | Where to Find It                                                                          |
| ------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | The unique URL for your Supabase project.           | Supabase Dashboard > Project Settings > API > Project URL                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The public "anonymous" key for your project.        | Supabase Dashboard > Project Settings > API > Project API Keys > `anon` `public` key      |
| `SUPABASE_SERVICE_ROLE_KEY`     | The secret "service role" key for admin tasks.      | Supabase Dashboard > Project Settings > API > Project API Keys > `service_role` `secret` key |

**IMPORTANT:**
- The variables prefixed with `NEXT_PUBLIC_` are safe to be exposed to the browser.
- `SUPABASE_SERVICE_ROLE_KEY` is a **secret** and must **never** be exposed in your client-side code.

## 2. Building the Application for Production

Unlike in development (`next dev`), you must first build your application and then start it.

```bash
# 1. Build the application
npm run build

# 2. Start the production server
npm run start
```

## 3. How to Set Environment Variables

You need to make the variables from step 1 available to the `npm run start` process. Here are a few common ways to do this on a server like one from Hetzner.

### Option A: Using a `.env.local` File (Simple but less common for production)

You can create a `.env.local` file in the root of your project on the server, just like you have locally.

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Then, run the start command. Next.js will automatically load these variables.

### Option B: Using Shell Variables (Direct & Simple)

You can set the variables directly in the terminal session before starting the application.

```bash
# Set the variables
export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
export SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Start the application
npm run start
```
**Note:** These variables will only be set for the current terminal session. If the server reboots, you will need to set them again. For a permanent solution, you can add the `export` commands to your shell's profile script (e.g., `~/.bashrc` or `~/.zshrc`).

### Option C: Using a Process Manager (PM2 - Recommended)

If you are using a process manager like PM2 to keep your application running, you can define the environment variables in an `ecosystem.config.js` file.

Create a file named `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'law-firm-dashboard',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SUPABASE_URL: 'your_supabase_url',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_supabase_anon_key',
        SUPABASE_SERVICE_ROLE_KEY: 'your_supabase_service_role_key',
      },
    },
  ],
};
```
Then start your app with PM2:
```bash
pm2 start ecosystem.config.js
```

### Option D: Using Docker

If you are deploying with Docker, you should pass the environment variables to the container during startup.

**Method 1: Using `-e` flags**
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key \
  your_image_name
```

**Method 2: Using `docker-compose` and an environment file**

Create a file named `production.env` (and add it to `.gitignore`):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Then, reference it in your `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - ./production.env
```

After setting the environment variables using the method that matches your setup, restart your application. The styling and functionality should now appear correctly. 