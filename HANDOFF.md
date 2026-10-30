# Little Seasons: project handoff

Written 2026-10-26 for whoever picks this project up next (another Claude account or a person).

## What it is

Little Seasons is a single-page web app that suggests play ideas for babies and toddlers (0–3 years). Ideas are matched to the baby's age, the time of year, local climate and today's weather. Activities cite CDC milestones, AAP guidance (HealthyChildren.org and *Pediatrics* papers), the Harvard Center on the Developing Child, and Montessori practice. All sources are listed in `SOURCES` in the code and shown at the bottom of the page.

- **Live site:** https://msenteio.github.io/little-seasons/ (GitHub Pages, served from `main`, repo root)
- **Repo:** https://github.com/msenteio/little-seasons
- **Local folder:** `/Users/missy/Baby App`
- **Claude artifact version:** https://claude.ai/artifact/SzPcjV8UkBJaohf67RS84f (owned by the original Claude account, last updated 2026-10-24, so it doesn't include the "busy parents" changes). A different Claude account can't update this artifact. To keep publishing as an artifact, either share it with edit access from the original account or publish a new one from `little-seasons.html`.

## Files

| File | What it is |
|---|---|
| `little-seasons.html` | **The source. Edit this one.** It's written as a Claude artifact body (no `<!doctype>`/`<head>`/`<body>`; the artifact viewer adds those). |
| `index.html` | The hosted page, **generated** by `build.mjs`. Don't edit it by hand. |
| `build.mjs` | Wraps the source in a full HTML document (doctype, viewport, meta description, favicon, safe-area padding) and writes `index.html`. It splits the file at `<div class="wrap"`, so keep that element. |
| `images/share-card.png` | The 1200×630 preview image shown when the link is shared or embedded (iMessage, Slack, Facebook, LinkedIn, X). Made from `images/share-card.html`; the re-render command is at the top of that file. |
| `images/apple-touch-icon.png` | 180×180 home-screen icon for iPhone. |
| `images/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Android home-screen icons. The maskable one has a smaller pumpkin so Android can crop it to a circle. |
| `manifest.webmanifest` | **Generated** by `build.mjs`. Name, colors and icons for "Add to Home Screen". |
| `sw.js` | Service worker, so the app opens with no signal once it has been visited. The page loads fresh from the network when it answers within 3 seconds, so updates still reach people. If you add files to `SHELL`, bump `CACHE` (`little-seasons-v1` → `v2`). |
| `README.md` | Short description and build command. |

`build.mjs` also writes the share tags (Open Graph, Twitter card, structured data). They name **Michelle Senteio** as the author and point at the live site's absolute URLs, so the preview image only shows up once it's pushed.

**After every change to the source:**

```bash
node build.mjs
```

Then commit **both** HTML files together. Every commit so far has changed both.

## How the app works (inside `little-seasons.html`)

It's all one file: `<style>`, then markup, then one `<script>`. There's no framework, no dependencies and no build step beyond `build.mjs`. The only external resources are Google Fonts (Bricolage Grotesque and Figtree) and the Open-Meteo APIs.

**Data (top of the script):**
- `SOURCES`: citation keys mapped to a title and URL.
- `OCCASIONS`: halloween, thanksgiving, holidays, valentine, fall, winter, spring, summer, everyday. Each has date `ranges` `[month, day, month, day]`, and the seasons have `south` ranges for the southern hemisphere.
- `DOMAINS`: `body` ("Moving"), `mind` ("Thinking & talking"), `heart` ("Feelings & bonding").
- `MILESTONES`: CDC-style milestones per age band, from 0–3 months up to 2–3 years.
- `ACTIVITIES`: **178 activities**. Fields: `id`, `occ[]`, `min`/`max` age in months (inclusive), `dom[]`, `mins` (minutes needed), `title`, `short`, `need`, `steps[]`, `why`, `safety`, `src[]`.
- `FIT`: per-activity overrides keyed by id: `where` (in/out/either; the default is "in"), `wx` (weather it suits), `needs` (only show in this weather), `req` (`cold` = needs frosty winters, `snow` = needs snowy winters, `warm` = only where winters are mild).

**Screens:** two views in the same page. Home (no hash) shows the greeting, weather, today's idea (steps behind a "How to do it" tap), the "Find an idea" tiles from `homeTiles()`, and milestones. `#ideas` shows the filter rails and the full list. Each tile sets the filters from scratch, including `state.only` (`tried`, `out` or `in`), which has no rail and appears as a removable chip instead. Home always uses the fixed `HOME` filters, so today's idea doesn't change when someone browses. Elements marked `home-only` or `ideas-only` show on one view only.

**Logic:**
- Activity text is written with "she/her". `himHis()` swaps the pronouns when the parent picks "he", and `withName()` puts the baby's name in place of the example name.
- `matches()` filters activities by age, climate, season or occasion, focus area and time available, then ranks them weather-first. Outdoor ideas drop down in bad weather or thunder.
- **Weather:** Open-Meteo forecast for current conditions. `classify()` maps them to sunny/cloudy/rainy/snowy/cold/hot/windy.
- **Climate:** `loadClimate()` pulls last year's daily lows and snowfall from the Open-Meteo archive. About 15 frost days means "cold", 10 cm of snow a year means "snow", and negative latitude means southern hemisphere. If that fails it guesses from latitude.
- **Location:** a typed city (Open-Meteo geocoding) or the browser's geolocation. Thanksgiving only shows for the US (November) and Canada (late September to mid-October).
- **Storage:** only `localStorage` in the viewer's own browser, with keys prefixed `ls:`: `name`, `dob`, `pron`, `tried`, `loc`, `live`. Every read and write is wrapped in try/catch. There's no server, no accounts and no analytics.
- **Units:** °F for US-style locales, °C everywhere else.
- `SANDBOXED`: inside the Claude artifact viewer, outside requests are blocked, so live weather and city search don't work there. The app shows a friendly message and the user can still pick today's weather by hand. They work fine on the live site.

**Page layout, top to bottom:** header with baby name and age → "Add my baby" setup card (name, birth date, she/he) → count of ideas tried → weather bar with location → **today's idea** ("Show me another" shuffles it) → milestones for the baby's age → "More ideas" grid with swipeable filter rows ("Time I have", "Helps with", "Season", "Weather") → sources.

**Design:** colors are CSS variables on `:root` with a dark-mode override. There's one season accent color per screen, and teal, blue and rose mark the body, mind and heart areas. Tap targets are sized for phones.

## History (all commits on 2026-10-23 and 2026-10-24)

1. `e11fd0e` **Add Little Seasons baby activity app**: first version, plus the build script and README.
2. `91892b3` **Adapt activities to local climate and hemisphere**: hides fall-leaf and snow ideas where winters are mild, adds warm-place alternatives, flips seasons south of the equator, and limits Thanksgiving to the US and Canada.
3. `8faa699` **Add 100 more activities**: fills gaps for newborns, Valentine's, spring, summer and Thanksgiving, adds more heart (social-emotional) ideas, and uses the baby's own name in activity text.
4. `a0ee108` **Soften color scheme**: warmer neutrals and easier-to-tell-apart area colors.
5. `527e8c8` **Make the app friendlier for busy parents**: today's idea comes first and filters move under "More ideas", one setup card with a she/he choice, a "Time I have" filter, plainer labels, bigger tap targets, swipeable filters, highlighted safety notes, and a tried-ideas count.

On 2026-10-25, `527e8c8` was pushed and GitHub Pages was confirmed to serve it. **Note:** Pages didn't rebuild on its own after that push. The rebuild had to be started by hand with `gh api -X POST repos/msenteio/little-seasons/pages/builds`. If the site doesn't update after a push, run that.

**Known small issue:** `git push` prints `git: 'credential-' is not a git command`. The push still works. It probably comes from a stray empty `credential.helper` entry in the Git config.

## How Missy works with Claude

This is based on the latest session and the commit history. Earlier sessions aren't visible from here.

- **Plain-language goals, not specs.** Missy describes the result they want ("friendlier for busy parents", "soften the colors", "what are the next steps"). Claude decides how to do it and explains the result in everyday terms, without jargon.
- **Claude does the hands-on work.** That means editing files, rebuilding `index.html`, committing, pushing, and checking that the live site actually updated. Missy approves the outward-facing steps (pushing or publishing) and usually answers with a one-tap reply.
- **Commits:** author "Missy", short title plus bullet points about what changed for the user, ending with a `Co-Authored-By: Claude …` line. Only commit or push when asked.
- **Check before saying it's done.** For example, after a push, confirm the live page matches the local file instead of assuming it does.
- **Content standards:** safety comes first (safe sleep, choking, sun, water and cold-weather notes come from AAP), every idea links to a credible source, and the tone is warm and plain.
- **The app's audience is tired parents on phones.** Keep it phone-first, quick to read, with big buttons and no setup friction. The app should work even if the parent never enters any details: it falls back to an example baby about 7 months old.

## Suggested next steps

**Testing:** done in a browser on 2026-10-30. Every age from 0 to 36 months × every week of the year × six climates × every weather and filter (about 1.5 million combinations) always shows at least 4 ideas. Location allowed, denied, and denied followed by typing a city all work. Sydney, Singapore, Nairobi, Honolulu and Minneapolis behave correctly, and places in the tropics drop autumn, winter and spring in favor of year-round "Warm days". Offline, large text and dark mode were checked too. Still to do:
- Try it on a real iPhone in Safari and a real Android phone in Chrome, including Add to Home Screen. On iPhone, the home-screen app keeps its saved details separately from Safari, so the parent enters the baby's details once more there.
- Have 3–5 parents use it for a week.

**Publishing:**
1. ~~Not-medical-advice and privacy notes~~ (done, at the bottom of the page).
2. Optional: a custom domain, set in the repo's Pages settings.
3. ~~Installable on the home screen and usable offline~~ (done: `manifest.webmanifest` and `sw.js`).
4. App stores only if really wanted. You'd wrap the site with Capacitor, and need a $99/year Apple developer account or a one-time $25 Google one. Apple often rejects apps that are mostly a website in a wrapper, and family apps get stricter privacy review. Do the home-screen version first.
5. Optional: a GitHub Actions workflow that runs `node build.mjs` and deploys to Pages on every push. That would also fix the problem of Pages not rebuilding on its own.
