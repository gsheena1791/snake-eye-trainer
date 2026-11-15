# Snake-Eye Duel Links Trainer — Fresh Project

This is a clean static web app for GitHub Pages. It is designed to be easy to upload and edit.

## Files to upload

Upload **everything in this folder** to the root of your new GitHub repository:

- `index.html` — page structure
- `styles.css` — visual design
- `data.js` — replay events, lessons, and quiz questions
- `app.js` — app behavior
- `manifest.webmanifest` — installable-app metadata
- `sw.js` — offline cache
- `icon.svg` — app icon

Do not upload the ZIP itself as the website. Extract it first, then upload the files inside the `snake-eye-trainer` folder.

## Publish with GitHub Pages

1. Create a new repository on GitHub. For example: `snake-eye-trainer`.
2. Open the repository and choose **Add file → Upload files**.
3. Upload all seven files listed above (plus this README).
4. Scroll down and click **Commit changes**.
5. Open **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select branch `main` and folder `/ (root)`, then click **Save**.
8. Wait for GitHub Pages to publish. The URL will appear in Settings → Pages.

## Add it to your iPhone home screen

1. Open the published HTTPS URL in Safari.
2. Tap the Share icon.
3. Choose **Add to Home Screen**.
4. Confirm with **Add**.

## What this first version does

- Shows the 17-step Dark Magician replay timeline from the uploaded move log.
- Filters the replay by turn.
- Explains what each recorded step sets up next.
- Separates creator commentary from replay-visible actions.
- Includes five knowledge-check questions based on the replay.
- Saves your own notes in the browser on that device.
- Includes a basic offline cache and installable web-app metadata.

## Important limitations

This first clean version is a **replay study trainer**, not yet an opening-hand combo solver or a full Duel Links rules engine. The uploaded move log contains detailed step-by-step commentary for the Dark Magician duel, but does not provide equivalent detail for the Horus, Stardust, and Predaplant duels. It also does not include a verified current deck list or a complete card-by-card combo database. Therefore this project does not invent opening-hand lines or claim to calculate the best move for arbitrary hands.

The source log says some on-screen text was unreadable and timestamps are approximate. The app preserves the source's distinctions between visible replay details and creator commentary.

## Updating the app

When you change files and upload them to GitHub, update the cache name in `sw.js` (for example, `snake-eye-trainer-fresh-v2`) so installed copies fetch the new files.
