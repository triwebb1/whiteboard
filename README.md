# whiteboard

## About

This is a node.js project for a multi-user interactive whiteboard web application.  This project includes a web server powered by diet.js, websockets powered by socket.io, and a whiteboard powered by paper.js.

## How to use

1. Clone this repro
2. cd into the whiteboard directory
3. `npm install`
4. `node index.js`

This will launch the server on `http://localhost:8000`, and the node console will confirm the listening socket.

Use a modern browser to open `http://localhost:8000/` and view all active whiteboards, updates every 2 seconds.

To create a board or join an existing board simply navigate to `http://localhost:8000/board/[board_name]`.  The entire page will be a whiteboard on which your cursor will automatically draw.  Your drawings will be shared with all other users connected to your board.  Every connection to a board will be assigned a random hex color to draw with.

## Testing

This project users mocha, selenium-webdriver, and socket.io-client to perform end-to-end testing.  To launch the tests just run `npm test` from the whiteboard directory while the `node index.js` is running.