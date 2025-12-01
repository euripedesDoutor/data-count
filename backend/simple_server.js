const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end('Server is working!');
});

server.listen(3000, '127.0.0.1', () => {
    console.log('Simple server running on http://127.0.0.1:3000');
});
