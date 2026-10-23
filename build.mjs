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

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Seasonal, weather-aware play ideas matched to your baby's age.">
<meta name="apple-mobile-web-app-title" content="Little Seasons">
<link rel="icon" href="${icon}">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
${src.slice(0, split).trim()}
</head>
<body>
${src.slice(split).trim()}
</body>
</html>
`;

writeFileSync(new URL("./index.html", import.meta.url), html);
console.log("Wrote index.html");
