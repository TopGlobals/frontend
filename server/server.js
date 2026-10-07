const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({
  cors: true,
  noCors: false
});

// Load routes if routes.json exists
try {
  const routes = require('./routes.json');
  server.use(jsonServer.rewriter(routes));
} catch (e) {
  console.log('No routes.json loaded');
}

server.use(middlewares);
server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
