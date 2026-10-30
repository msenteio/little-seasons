// Builds index.html (the hosted site) from little-seasons.html (the Claude artifact source).
// The artifact viewer adds the document skeleton itself; a normal web host needs it in the file.
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(new URL("./little-seasons.html", import.meta.url), "utf8");
const split = src.indexOf('<div class="wrap"');
if (split === -1) throw new Error('Could not find <div class="wrap"> in little-seasons.html');

const icon = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#d0650f"/>' +
  '<path d="M12 7c-5 0-8 2.7-8 6.5S7 20 12 20s8-2.7 8-6.5S17 7 12 7Z" fill="none" stroke="#fff" stroke-width="1.6"/>' +
  '<path d="M12 7c0-2 1-3.3 2.5-3.8" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>'
);

// Link previews (iMessage, Slack, Facebook, LinkedIn, X…) need absolute URLs.
const site = "https://msenteio.github.io/little-seasons/";
const author = "Michelle Senteio";
const title = "Little Seasons";
const description = "Seasonal, weather-aware play ideas matched to your baby's age.";
const shareImage = site + "images/share-card.png";
const shareAlt = "Little Seasons: play ideas for your baby, matched to their age, the season and the weather. By Michelle Senteio.";
const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: title,
  url: site,
  description,
  image: shareImage,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Any",
  author: { "@type": "Person", name: author },
});

// Lets phones add the site to the home screen as its own app (see sw.js for offline use).
const manifest = {
  id: "./",
  name: title,
  short_name: title,
  description,
  start_url: "./",
  scope: "./",
  display: "standalone",
  background_color: "#f2f0ec",
  theme_color: "#f2f0ec",
  categories: ["lifestyle", "kids", "education"],
  icons: [
    { src: "images/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "images/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "images/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="${description}">
<meta name="author" content="${author}">
<meta name="apple-mobile-web-app-title" content="${title}">
<link rel="canonical" href="${site}">
<link rel="icon" href="${icon}">
<link rel="apple-touch-icon" href="images/apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#f2f0ec" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#171513" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${title}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${site}">
<meta property="og:image" content="${shareImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${shareAlt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${shareImage}">
<meta name="twitter:image:alt" content="${shareAlt}">
<script type="application/ld+json">${jsonLd}</script>
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
${src.slice(0, split).trim()}
</head>
<body>
${src.slice(split).trim()}
<script>if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));</script>
</body>
</html>
`;

writeFileSync(new URL("./index.html", import.meta.url), html);
writeFileSync(new URL("./manifest.webmanifest", import.meta.url), JSON.stringify(manifest, null, 2) + "\n");
console.log("Wrote index.html and manifest.webmanifest");
