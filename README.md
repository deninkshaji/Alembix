# Alembix — Deployment Guide

This repository is configured for easy deployment to **Render.com**.

## Deployment Steps

1.  **Push to GitHub**: Push your code to a GitHub repository.
2.  **Connect to Render**:
    - Log in to [Render.com](https://render.com).
    - Click **New +** and select **Blueprint**.
    - Connect your GitHub repository.
    - Render will automatically detect the `render.yaml` file.
3.  **Configure Environment Variables**:
    - During setup, Render will ask for the `GEMINI_API_KEY`.
    - Provide your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4.  **Deploy**: Click **Apply**. Render will build and host your site.

## Manual Configuration (if not using Blueprint)

If you prefer to set it up manually as a **Static Site**:
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**: Add `GEMINI_API_KEY` in the Render Dashboard under the "Environment" tab.

## Local Development

```bash
npm install
npm run dev
```

Ensure you have a `.env` file with your `GEMINI_API_KEY`.
