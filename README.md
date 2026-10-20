# Print Spooler: Queue Data Structure Demo

An animated web application that shows how a **queue (FIFO)** works, using a shared lab printer.

**Live demo:** `https://YOUR-USERNAME.github.io/queue-print-spooler/`

## Features
- Enqueue jobs at the rear, dequeue and print from the front, with animated cards
- Printer with live page-by-page progress and adjustable speed
- Print all (with pause), peek, and clear
- Load sample jobs button that adds random jobs to the queue (printing is always manual)
- Live statistics, completed list and operation log
- Linked-list queue with O(1) enqueue and dequeue

## Structure
```
queue-print-spooler/
  index.html
  css/style.css
  js/queue.js   (Queue data structure)
  js/app.js     (interface and printer logic)
```

## Run locally
Open `index.html` in a browser.

## Deploy on GitHub Pages
1. Create a public repository named `queue-print-spooler`.
2. Upload the contents of this folder (keep the `css` and `js` folders), then commit.
3. Go to **Settings > Pages**, choose branch `main` and folder `/ (root)`, then **Save**.
4. After about a minute the site is live at the URL above.
