# Deployment Guide - Shanmukha Fashions

This document outlines how to deploy your e-commerce platform live to the web for free using **Render**.

---

## Deploying to Render (Recommended & Free)

Render is a modern cloud hosting platform that supports Python natively and offers a **Free Tier** with persistent disk mounts, making it the perfect home for a lightweight Flask + SQLite application.

### Step 1: Initialize Git and Push to GitHub
1. Open your terminal in the `shanmukha-fashions` folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of full-stack Shanmukha Fashions"
   ```
2. Create a new **Private** or **Public** repository on [GitHub](https://github.com).
3. Link your local project to GitHub and push the code:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Render using blueprint
1. Create a free account on [Render](https://render.com).
2. Click **New +** at the top right and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically parse the `render.yaml` configuration file we generated and create:
   - A **Web Service** running Flask.
   - A **Persistent Disk** (1 GB) mounted at `/data` to store your SQLite database securely so that your catalog additions and customer orders are never lost during redeployments!
5. Click **Approve** on the Render dashboard.

Once deployment finishes, Render will provide a live URL (e.g., `https://shanmukha-fashions.onrender.com`) where both your customer storefront and owner dashboard are instantly accessible!

---

## Alternative: Containerized Deployment (Docker)

If you wish to deploy to Railway, Fly.io, or any VPS, you can use the custom `Dockerfile` we generated:

1. Build the Docker container locally:
   ```bash
   docker build -t shanmukha-fashions .
   ```
2. Run the Docker container:
   ```bash
   docker run -p 5000:5000 shanmukha-fashions
   ```
