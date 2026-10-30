# Jhon Marvin S. Ibanez — Digital Portfolio

```
index.html
css/style.css
js/script.js
assets/
  favicon.svg
  profile.jpg   <-- current profile photo
```

## Run locally in VS Code
1. Open this folder in VS Code (File > Open Folder).
2. Install the "Live Server" extension, right-click `index.html`, choose "Open with Live Server".
   (Double-clicking `index.html` also works.)

To replace your profile picture, use `assets/profile.jpg` or update the image `src` in `index.html`. The project screenshots are in `assets/projects/`; the Capstone and client project previews already use their screenshot files. Replace an image while keeping its filename, or update the corresponding image `src` in `index.html`.

## Deploy to Vercel

This is a static HTML/CSS/JavaScript site; it has no package install or build step. The included `vercel.json` serves the project root and enables clean URLs.

### Import from GitHub
1. Push this entire project folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Set the Root Directory to the folder containing `index.html` (leave it blank if `index.html` is at the repository root). Set the framework preset to **Other**. The `vercel.json` already sets no build/install command and serves `.` as the output directory.
4. Deploy. Keep `index.html`, `css/`, `js/`, `assets/`, and `vercel.json` at the repository root.

### Deploy with the Vercel CLI
From this folder, run `vercel` and follow the prompts. Run `vercel --prod` when you are ready to publish the production deployment.

GSAP and ScrollTrigger are loaded from jsDelivr for optional image/timeline effects. If the CDN is unavailable, the site still has its CSS and IntersectionObserver animations.

## Deploy to Hostinger with FileZilla
1. In Hostinger hPanel, open Files > FTP Accounts and note the host, username, and port.
2. In FileZilla, connect with those details.
3. On the remote side, open `public_html/`.
4. Upload `index.html`, `css/`, `js/`, and `assets/` into `public_html/` (keep the folder structure).
5. Visit your domain and hard-refresh (Ctrl+F5).

## Adding things later
- Project link: add `<a class="btn btn-ghost" href="REAL_URL">View Project</a>` inside `.project-body` only when a real URL exists.
- Resume: add a PDF to `assets/` and a Download Resume button only when the file exists.
- Social links: add them in the Contact section only with real profile URLs.
