# Found It: Campus Lost & Found

A student-powered lost and found web app. Students report lost or found belongings, search everything that has been reported, and reconnect items with their owners.

Built for the LaunchPad Hackathon with plain HTML, CSS and JavaScript, and [Supabase](https://supabase.com) for login and the database.

![Home page](screenshots/home.png)

## Features

- **Sign up and log in** with Supabase Auth, plus a personal dashboard.
- **Report a lost item** or **a found item** with name, category, description, date, location and an optional image link.
- **Search** from the home page by name, category or campus location. Reported items are shown as cards, and if nothing matches you see **Not reported**.
- **Find My Item** button that scrolls straight to the search box.
- **View All Items** page that lists every lost and found report, with All / Lost / Found filters.
- **Explore Campus Locations**: click Library, Lecture Halls, Computer Labs, Cafeteria, Parking Area or Common Areas to see what was reported there.

## Screenshots

| Search results | Not reported |
|---|---|
| ![Search results](screenshots/search-results.png) | ![Not reported](screenshots/not-reported.png) |

![Campus locations](screenshots/locations.png)

![All items](screenshots/all-items.png)

*Screenshots use sample data.*

## Project structure

```
index.html            Home page (hero, search, locations)
all-items.html        All reported items with filters
lost-items.html       Report and list lost items
found-items.html      Report and list found items
report-item.html      Choose lost or found
login.html            Log in
signup.html           Sign up
dashboard.html        User dashboard
style.css             Main styles
css/                  Page styles (auth, lost, report, all-items)
js/                   Page scripts (search, locations, all-items, lost, found, auth, dashboard)
js/supabaseClient.js  Supabase connection
js/database/          SQL for the database tables
screenshots/          Images used in this README
```

## Getting started

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run these two files, in this order:
   - `js/database/profiles.sql`
   - `js/database/items.sql`
3. Go to **Project Settings, then API**, copy the **Project URL** and the **publishable (anon) key**, and put them in `js/supabaseClient.js`:

```js
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-PUBLISHABLE-KEY";
```

### 2. Run the site

The site uses JavaScript modules, so it must be served over HTTP. Opening `index.html` by double-clicking will not work.

```
python -m http.server 8000
```

Then open <http://localhost:8000>. Or use the **Live Server** extension in VS Code.

### 3. Try it

1. Sign up and log in.
2. Report a lost item on **Lost Items**.
3. Go to the home page, click **Find My Item**, and search for it.

## Tech stack

HTML, CSS, JavaScript (ES modules), Supabase (Auth and Postgres).
