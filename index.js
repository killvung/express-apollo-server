const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const expressPlayground = require('graphql-playground-middleware-express').default
const superagent = require('superagent');
const { makeExecutableSchema } = require('graphql-tools');

// Some fake data
const books = [
    {
        title: "Harry Potter and the Sorcerer's stone",
        author: 'J.K. Rowling',
    },
    {
        title: 'Jurassic Park',
        author: 'Michael Crichton',
    },
];

// The GraphQL schema in string form
const typeDefs = `
    type Point {
        lat: Float!
        lng: Float!
    }
  type Route {
    city: String!
    points: [Point]
  }
  type Query {
       books: [Book] 
       routes: [Route]
    }
  type Book { title: String, author: String }
`;

const graphqlEndPoint =
    process.env.ENV === 'production' ?
        'https://flask-base-api.azurewebsites.net' :
        'localhost:5000'

// The resolvers
const resolvers = {
    Query: {
        books: () => books,
        routes: async () => {
            const response = await superagent.get(graphqlEndPoint + '/walk');
            return response.body;
        }
    },
};

// Put together a schema
const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

// Initialize the app
const app = express();

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

// Playground, a visual editor for queries
app.use('/', expressPlayground({ endpoint: '/graphql' }))

const port = process.env.PORT || 3000;
// Start the server
app.listen(port, () => {
    console.log('Listning at port ' + port);
});
