// Simple localhost server for Maharashtra Engineering Admission 2026-27
// Runs Next.js on http://localhost:3000 (or PORT env)
// Usage: node server.js  or  npm run server
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Local:  http://localhost:${port}`);
    console.log(`> Home:   http://localhost:${port}/`);
    console.log(`> Colleges: http://localhost:${port}/colleges`);
    console.log(`> Add College (admin login required): http://localhost:${port}/add-college`);
  });
});
