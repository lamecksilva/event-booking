require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

// Creating an express object app
const app = express();

app.use(bodyParser.json());

app.use(
  '/graphql',
  // Creating graphql middleware
  graphqlHttp({
    // Building the schema
    // OBS: Types with ! not are nullable
    schema: graphQlSchema,
    // Mutations are endpoints for insert, alter data in a DB
    // Query are querys (only read)
    rootValue: graphQlResolvers,
    graphiql: true
  })
);

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(response => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server Running on port ${PORT}`));
