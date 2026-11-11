# KACEA — Korea-Arab Cultural Exchange Association

Landing page for [kacea.kr](https://kacea.kr), in English, 한국어 and العربية (RTL).

- Plain HTML + CSS + a little vanilla JS: no build step, nothing to install.
- Translations live in `assets/js/i18n.js`. The English text in `index.html` is the fallback.
- Language is picked from `?lang=en|ko|ar`, then the saved choice, then the browser language.
- Photos come from Wikimedia Commons. Authors and licenses are listed in `assets/js/credits.js` and shown in the footer under "Photo credits".

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Deploy

The site is hosted on Vercel as a static site. DNS for `kacea.kr` is managed at hosting.kr:
an `A` record for `@` pointing to `76.76.21.21`, and a `CNAME` record for `www` pointing to `cname.vercel-dns.com`.
