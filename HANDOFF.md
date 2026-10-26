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
| `README.md` | Short description and build command. |

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

**Testing (not done yet):**
- Try it on a real iPhone in Safari and a real Android phone in Chrome.
- Test location three ways: allowed, denied, and denied followed by typing a city.
- Test southern and tropical cities, such as Sydney and Singapore.
- Turn off the connection after the page loads, or use a slow one, and check that the app still works.
- Check that saved settings come back after closing the tab, and that a private window still works with nothing saved.
- Step through every age band to make sure none comes up empty.
- Check dark mode and large text sizes.
- Have 3–5 parents use it for a week.

**Publishing:**
1. Add a short "Not medical advice" line and a privacy note: location is only used to look up weather and nothing is stored on a server.
2. Optional: a custom domain, set in the repo's Pages settings.
3. Optional: make it installable on the home screen and usable offline by adding a web app manifest and a service worker.
4. App stores only if really wanted. You'd wrap the site with Capacitor, and need a $99/year Apple developer account or a one-time $25 Google one. Apple often rejects apps that are mostly a website in a wrapper, and family apps get stricter privacy review. Do the home-screen version first.
5. Optional: a GitHub Actions workflow that runs `node build.mjs` and deploys to Pages on every push. That would also fix the problem of Pages not rebuilding on its own.
