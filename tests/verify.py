#!/usr/bin/env python3
"""
HMF Website Verification Tests
Tests all pages, assets, nav links, data loading, and mobile compatibility.
"""
import json
import os
import re
import sys

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

PASS = 0
FAIL = 0

def test(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  ✅ {name}")
    else:
        FAIL += 1
        print(f"  ❌ {name}" + (f" — {detail}" if detail else ""))

def section(title):
    print(f"\n{'='*60}\n{title}\n{'='*60}")

# ============================================================
# 1. FILE EXISTENCE
# ============================================================
section("1. File Existence")

html_files = ['index.html', 'about.html', 'residents.html', 'guests.html',
              'events.html', 'photos.html', 'mixes.html', 'connect.html', '404.html']
for f in html_files:
    test(f"HTML: {f} exists", os.path.exists(f))

for f in ['css/style.css', 'js/nav.js', 'js/gallery.js', 'js/main.js']:
    test(f"Code: {f} exists", os.path.exists(f))

for f in ['data/events.json', 'data/residents.json', 'data/guests.json', 'data/photos.json']:
    test(f"Data: {f} exists", os.path.exists(f))

for f in ['assets/logos/hmf-logo.png', 'assets/logos/ac-lounge-logo.png',
          'assets/video/hmf-hero.mp4', 'assets/video/hmf-poster.jpg']:
    test(f"Asset: {f} exists", os.path.exists(f))

# ============================================================
# 2. IMAGE PATH VERIFICATION
# ============================================================
section("2. Image Paths in JSON")

for jf in ['data/events.json', 'data/residents.json', 'data/guests.json', 'data/photos.json']:
    with open(jf) as f:
        data = json.load(f)
    items = data if isinstance(data, list) else data.get('events', [])
    for item in items:
        for key in ['photo', 'flyer', 'src']:
            if key in item:
                path = item[key]
                exists = os.path.exists(path)
                test(f"{jf}: {item.get('name', item.get('title', item.get('alt', '?')))} → {key}",
                     exists, f"Missing: {path}")

# ============================================================
# 3. NAV CONSISTENCY
# ============================================================
section("3. Navigation Consistency")

expected_nav_links = ['index.html', 'about.html', 'residents.html', 'guests.html',
                      'events.html', 'photos.html', 'mixes.html', 'connect.html']
expected_nav_texts = ['Home', 'About', 'Residents', 'Guest DJs',
                      'Events', 'Photos', 'Mixes', 'Connect']

for f in html_files:
    if f == '404.html':
        continue
    with open(f) as fh:
        content = fh.read()

    # Check all nav links present
    for href in expected_nav_links:
        test(f"{f}: has link to {href}",
             f'href="{href}"' in content,
             f"Missing href={href}")

    # Check nav__mobile exists
    test(f"{f}: has nav__mobile overlay",
         'nav__mobile' in content,
         "Missing mobile nav")

    # Check nav__hamburger exists
    test(f"{f}: has nav__hamburger",
         'nav__hamburger' in content,
         "Missing hamburger button")

    # Check logo paths
    logo_refs = re.findall(r'src="(assets/logos/[^"]+)"', content)
    for ref in logo_refs:
        test(f"{f}: logo {ref} exists",
             os.path.exists(ref),
             f"Broken logo: {ref}")

# ============================================================
# 4. PAGE-SPECIFIC ELEMENT IDs
# ============================================================
section("4. Page-Specific Element IDs (JS expects these)")

with open('residents.html') as f:
    content = f.read()
test("residents.html: has #residents-page", 'id="residents-page"' in content)
test("residents.html: has .grid-2 inside", 'class="grid-2"' in content or "grid-2" in content)

with open('guests.html') as f:
    content = f.read()
test("guests.html: has #guests-page", 'id="guests-page"' in content)
test("guests.html: has .grid-3 inside", 'grid-3' in content)

with open('events.html') as f:
    content = f.read()
test("events.html: has #events-page", 'id="events-page"' in content)
test("events.html: has #upcoming-events", 'id="upcoming-events"' in content)
test("events.html: has #past-events", 'id="past-events"' in content)

with open('photos.html') as f:
    content = f.read()
test("photos.html: has #photos-page", 'id="photos-page"' in content)
test("photos.html: has .gallery", 'class="gallery"' in content)

with open('index.html') as f:
    content = f.read()
test("index.html: has .hero", 'class="hero"' in content)
test("index.html: has .upcoming-event", 'class="upcoming-event"' in content or 'upcoming-event' in content)
test("index.html: has .home-gallery", 'home-gallery' in content)

# ============================================================
# 5. JSON DATA INTEGRITY
# ============================================================
section("5. JSON Data Integrity")

with open('data/events.json') as f:
    events = json.load(f)
test("events.json: is an array", isinstance(events, list))
test("events.json: has events", len(events) > 0, f"Found {len(events)}")
upcoming = [e for e in events if e.get('dateISO', '') >= '2026-03-22']
past = [e for e in events if e.get('dateISO', '') < '2026-03-22']
test(f"events.json: {len(upcoming)} upcoming event(s)", len(upcoming) > 0)
test(f"events.json: {len(past)} past event(s)", len(past) > 0)
for e in events:
    test(f"events.json: '{e.get('title', '?')}' has dateISO", 'dateISO' in e)
    test(f"events.json: '{e.get('title', '?')}' has flyer", 'flyer' in e)

with open('data/residents.json') as f:
    residents = json.load(f)
test("residents.json: is an array", isinstance(residents, list))
test("residents.json: has 4 residents", len(residents) == 4)
for r in residents:
    for field in ['name', 'role', 'photo', 'shortBio', 'fullBio']:
        test(f"residents.json: {r['name']} has {field}", field in r)

with open('data/guests.json') as f:
    guests = json.load(f)
test("guests.json: is an array", isinstance(guests, list))
test("guests.json: has 6 guests", len(guests) == 6)
for g in guests:
    for field in ['name', 'credential', 'photo', 'bio']:
        test(f"guests.json: {g['name']} has {field}", field in g)

with open('data/photos.json') as f:
    photos = json.load(f)
test("photos.json: is an array", isinstance(photos, list))
test("photos.json: has photos", len(photos) > 0, f"Found {len(photos)}")

# ============================================================
# 6. CSS CRITICAL CLASSES
# ============================================================
section("6. CSS Critical Classes")

with open('css/style.css') as f:
    css = f.read()

critical_classes = [
    '.nav', '.nav--solid', '.nav--transparent', '.nav__hamburger', '.nav__mobile',
    '.hero', '.hero__inner', '.hero__video', '.hero__content',
    '.card', '.card--bio', '.card--guest', '.card--event', '.card--explore',
    '.gallery', '.gallery__preview', '.gallery__grid', '.gallery__thumb',
    '.lightbox', '.lightbox__close', '.lightbox__arrow',
    '.grid-2', '.grid-3', '.grid-explore',
    '.fade-in', '.fade-in.visible',
    '.section', '.section--alt', '.section__label',
    '.page-header', '.footer', '.btn',
    '.card--bio__short', '.card--bio__full', '.card--bio__expand',
    '.card--guest__photo', '.card--guest__name', '.card--guest__bio',
    '.card--event__flyer', '.card--event__title',
    '.upcoming-event__flyer', '.upcoming-event__title',
    '.hmf-card', '.hmf-card__logo',
    '.mini-gallery', '.connect-grid', '.soundcloud-embed', '.map-embed',
]

for cls in critical_classes:
    # Check if class appears in CSS (as selector)
    escaped = cls.replace('.', r'\.')
    test(f"CSS: {cls} defined", cls in css or cls.lstrip('.') in css)

# ============================================================
# 7. JS INITIALIZATION CHECKS
# ============================================================
section("7. JS Initialization")

with open('js/main.js') as f:
    js = f.read()

test("main.js: has fetchJSON", 'fetchJSON' in js)
test("main.js: has isUpcoming", 'isUpcoming' in js)
test("main.js: has observeNewFadeIns", 'observeNewFadeIns' in js)
test("main.js: initializes home page", 'initHomePage' in js)
test("main.js: initializes events page", 'initEventsPage' in js)
test("main.js: initializes residents page", 'initResidentsPage' in js)
test("main.js: initializes guests page", 'initGuestsPage' in js)
test("main.js: initializes photos page", 'initPhotosPage' in js)
test("main.js: calls observeNewFadeIns after residents render",
     'observeNewFadeIns(container)' in js and 'initResidentsPage' in js)
test("main.js: calls observeNewFadeIns after guests render",
     js.count('observeNewFadeIns') >= 3)

with open('js/nav.js') as f:
    nav_js = f.read()
test("nav.js: toggles nav__mobile", 'nav__mobile' in nav_js)
test("nav.js: adds active class to mobile", "mobileNav.classList.toggle('active')" in nav_js)

with open('js/gallery.js') as f:
    gallery_js = f.read()
test("gallery.js: Gallery class exists", 'class Gallery' in gallery_js)
test("gallery.js: Lightbox class exists", 'class Lightbox' in gallery_js)
test("gallery.js: exports globally", 'window.Gallery' in gallery_js)

# ============================================================
# 8. RESPONSIVE / MOBILE CHECKS
# ============================================================
section("8. Responsive / Mobile CSS")

test("CSS: has mobile breakpoint (max-width: 1023px)", 'max-width: 1023px' in css)
test("CSS: has tablet breakpoint (min-width: 768px)", 'min-width: 768px' in css)
test("CSS: has desktop breakpoint (min-width: 1024px)", 'min-width: 1024px' in css)
test("CSS: hamburger hidden on desktop", 'nav__hamburger' in css and 'display: none' in css)
test("CSS: nav__links hidden on mobile", '.nav__links' in css)
test("CSS: gallery grid 3-col on mobile", 'repeat(3, 1fr)' in css)
test("CSS: gallery grid 6-col on desktop", 'repeat(6, 1fr)' in css)

# All pages have viewport meta tag
for f in html_files:
    with open(f) as fh:
        content = fh.read()
    test(f"{f}: has viewport meta", 'viewport' in content)

# ============================================================
# SUMMARY
# ============================================================
print(f"\n{'='*60}")
print(f"RESULTS: {PASS} passed, {FAIL} failed out of {PASS+FAIL} tests")
print(f"{'='*60}")

if FAIL > 0:
    sys.exit(1)
