const express = require('express');
const app = express();
const server = require('./server');
const bodyParser = require('body-parser');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
server(app, '/push/');

app.listen(3000, () => console.log('Example app listening on port 3000!'))