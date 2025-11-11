# GitHub Pages Setup Instructions

Follow these steps to deploy your project to GitHub Pages:

## Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Repository name: `history-charts` (or any name you prefer)
3. Description: "Cash Savings History Trellis Charts Visualization"
4. Choose **Public** (required for free GitHub Pages)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/history-charts.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

## Step 4: Access Your Site

After a few minutes, your site will be available at:
```
https://YOUR_USERNAME.github.io/history-charts/
```

GitHub Pages may take a few minutes to build and deploy your site initially.

## Notes

- The `data.csv` file will be available for users to download and upload via the file input
- If you want to auto-load `data.csv` when the page loads, make sure it's in the repository
- Any changes you push to the `main` branch will automatically update your GitHub Pages site

