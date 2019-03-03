const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
  res.send('Hello World');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
