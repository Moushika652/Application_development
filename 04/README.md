# Basic Node.js Web Server

A small multi-page website served with Node.js and Express. It includes a home page, an about page, a contact page with a demo form, and a custom 404 page.

## Run locally

1. Open a terminal in this folder.
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

Set the `PORT` environment variable to use a different port.

## Pages

| Page | URL |
| --- | --- |
| Home | `/` |
| About | `/about` |
| Contact | `/contact` |

The contact form demonstrates a server-side `POST` route. Messages are validated but not stored or emailed.
