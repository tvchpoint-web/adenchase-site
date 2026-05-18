# adenchaselabs.com — production site

Static site for AdenChase Labs. Three files; no build step required.

## Structure

```
site/
├── index.html              → adenchaselabs.com         (landing page)
├── og-image.png            → adenchaselabs.com/og-image.png  (social share)
└── thank-you/
    └── index.html          → adenchaselabs.com/thank-you (post-purchase)
```

## Stack
- Pure HTML/CSS — no framework, no build step
- IBM Plex Serif/Sans loaded from Google Fonts CDN
- Brand: teal #0F4C5C · amber #F5A742 · cream #FAF7F0

## Editing
Open index.html in any text editor. Save. Re-push to deploy.

## Stripe wiring
Both CTAs link to live $249 Payment Link:
https://buy.stripe.com/3cI14nf381tebp21mzejK08
