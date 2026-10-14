# RMGC Construction Inc.

Portable static website. Requires Node.js 20 or newer for the included tools.
No runtime dependencies, Replit account, database, or server secrets are required.

## Upload to GitHub

Extract the archive and upload the **contents** of `rmgc-website` into the
repository root. `package.json`, `index.html`, `assets`, `admin`, and `content`
should be visible at the top level, not nested inside an extra folder.

## Run locally

```sh
npm ci
npm test
npm start
```

Open http://localhost:3000. Set `PORT` to choose another port.

## Deploy

Connect your GitHub repository to Netlify or Vercel; configuration is included.
For other static hosts use:

- Build command: `npm run build`
- Output/publish directory: `dist`
- Node.js: 20 or newer
- Framework: Other / static

For a Node hosting service, use `npm start` (it respects `PORT`).
For a plain web server, upload the contents of `dist`.
Host at the domain root. GitHub Pages project subpaths such as
`username.github.io/repository/` are not supported without URL changes;
use a custom domain or root-level user/organization Pages site.

## Included content and enquiries

All currently synced project photos, captions and site content are included.
Images in the content file use local deployment paths, not the old repository.
The estimate form submits to `https://formspree.io/f/mrpgnjol`.
The contact email is info@rmgcinc.ca. Formspree controls email delivery;
automatic customer replies are not enabled by this export.

## CMS is configured for rmgc-inc/rmgc-web-3

No configuration-file edits are needed for this repository. The editor uses:

- GitHub repository: https://github.com/rmgc-inc/rmgc-web-3
- Branch: `main`
- Login service: https://rm-general.peterlevin08.workers.dev
- Local photo storage: `assets/uploads`

Upload the contents of this folder to the root of that repository. Keep Vercel
connected to the same repository with `main` as its production branch.
After deployment, open your Vercel website's `/admin/` and sign in with a
GitHub account that has write access to this repository.

The existing login service must remain active. GitHub organization approval or
login-service permissions may be required, especially for a private repository.
Actual sign-in and saving must be tested with the owner's account after deployment.

CMS edits then commit to this repository and trigger a new deployment.
New image uploads are included in that deployment; large uploads should be
optimized for web performance. Edits saved to the OLD repository will not
update the new website. Use the new Vercel website's `/admin/` for future edits.

## Release checks

Run `npm test && npm run build`, then `npm run preview` to check the built site.
Review galleries, mobile navigation and the estimate form after deployment.
No real form enquiry was sent during export verification.
