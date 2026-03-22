# House Music Fridays — Website

**https://hmfsd.github.io**

Website for House Music Fridays at Air Conditioned Lounge, San Diego. Built with vanilla HTML, CSS, and JavaScript. Hosted on GitHub Pages.

---

## Site Structure

```
index.html          Home — hero video, upcoming event, photo gallery, mixes teaser
events.html         Upcoming + past events with flyer gallery
about.html          HMF description, AC Lounge info, residents, guest DJs, map
residents.html      Resident DJ bio cards
guests.html         Guest DJ cards
photos.html         Photo gallery with lightbox
mixes.html          SoundCloud playlist embed
connect.html        Venue info, social links, Google Maps
404.html            Custom 404 page

css/style.css       All styles
js/nav.js           Sticky nav, hamburger menu, active page
js/gallery.js       Photo/flyer gallery with auto-cycle, arrows, lightbox, swipe
js/main.js          Page initialization, JSON loading, scroll animations

data/events.json    All events (upcoming + past, auto-sorted by date)
data/residents.json Resident DJ bios
data/guests.json    Guest DJ bios
data/photos.json    Photo gallery manifest

assets/img/photos/  Event photos (optimized JPEGs)
assets/img/flyers/  Event flyers (square format)
assets/img/bios/    Resident headshots
assets/img/guests/  Guest DJ headshots
assets/video/       Hero video + poster frame
assets/logos/       HMF and AC Lounge logos
```

---

## How Content Updates Work

All dynamic content is driven by JSON files in the `data/` folder. Edit the JSON, add any new images to `assets/img/`, commit, and push. The site updates within a few minutes.

---

## Adding an Upcoming Event

Edit `data/events.json` and add a new entry to the array:

```json
{
  "title": "House Music Fridays: Artist Name",
  "dateISO": "2026-04-03",
  "date": "Friday, April 3",
  "venue": "Air Conditioned Lounge",
  "facebook": "https://www.facebook.com/events/XXXXXXXXXX/",
  "ra": "https://ra.co/events/XXXXXXX",
  "flyer": "assets/img/flyers/artist_name.jpg"
}
```

**Fields:**
- `title` — Event name as displayed on the site
- `dateISO` — Date in `YYYY-MM-DD` format. Events with a future date show under "Upcoming", past dates automatically move to "Past Events"
- `date` — Human-readable date string
- `venue` — Always "Air Conditioned Lounge"
- `facebook` — Facebook event URL (optional, omit if none)
- `ra` — Resident Advisor event URL (optional, omit if none)
- `flyer` — Path to the flyer image in `assets/img/flyers/`

**Steps:**
1. Optimize the flyer image: `magick flyer.jpg -resize 1200x -quality 82 assets/img/flyers/artist_name.jpg`
2. Add the entry to `data/events.json`
3. `git add data/events.json assets/img/flyers/artist_name.jpg`
4. `git commit -m "Add event: Artist Name"`
5. `git push`

Events automatically transition from "Upcoming" to "Past Events" when their date passes — no manual moving needed.

---

## Adding a Guest DJ

Edit `data/guests.json` and add a new entry:

```json
{
  "name": "DJ Name",
  "credential": "Chicago House DJ Legend",
  "photo": "assets/img/guests/dj_name.jpg",
  "bio": "Short 2-4 sentence bio."
}
```

**Steps:**
1. Optimize the photo: `magick photo.jpg -resize 600x -quality 82 assets/img/guests/dj_name.jpg`
2. Add the entry to `data/guests.json`
3. Commit and push

The `credential` field supports multiple lines separated by ` · ` (e.g. `"Chicago House DJ Legend · Grammy Award Winner"`) — they display stacked.

---

## Adding Photos

Edit `data/photos.json` and add entries:

```json
{ "src": "assets/img/photos/filename.jpg", "alt": "Description of photo" }
```

**Steps:**
1. Optimize: `magick photo.jpg -resize 1200x -quality 82 assets/img/photos/filename.jpg`
2. Add entry to `data/photos.json`
3. Commit and push

---

## Updating Resident Bios

Edit `data/residents.json`. Each resident has:

```json
{
  "name": "Name",
  "role": "Resident",
  "photo": "assets/img/bios/name.jpg",
  "shortBio": "One sentence shown on the card.",
  "fullBio": "Full bio shown when expanded.",
  "discography": ["Track 1 - Label", "Track 2 - Label"]
}
```

The `discography` array is optional.

---

## Changing the SoundCloud Playlist

Edit the `<iframe>` src URL directly in `mixes.html`. Replace the playlist URL in the `src` attribute.

---

## Image Optimization

Before committing images, optimize them to keep the repo small:

```bash
# Photos and flyers (max 1200px wide)
magick input.jpg -resize 1200x -quality 82 output.jpg

# Headshots (max 600px wide)
magick input.jpg -resize 600x -quality 82 output.jpg
```

---

## Local Development

```bash
cd site
python3 -m http.server 8000
# Open http://localhost:8000
```

---

## Custom Domain Setup

To attach a custom domain (e.g. `hmf.airconditionedlounge.com`):

1. Add a DNS CNAME record: `hmf` → `hmfsd.github.io`
2. In GitHub repo Settings → Pages → Custom domain: enter the domain
3. Add a `CNAME` file to the repo root with the domain name
4. Enable "Enforce HTTPS"

---

## Tech Stack

- Vanilla HTML5, CSS3, JavaScript (ES6+)
- GitHub Pages (free static hosting)
- Google Fonts (Inter)
- SoundCloud iframe embed
- No build tools, no frameworks, no dependencies
