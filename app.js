const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/Event');
const User = require('./models/User');

const app = express();

app.use(bodyParser.json());

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event.creator)
        };
      });
    })
    .catch(err => {
      throw err;
    });
};

const user = userId => {
  return User.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createEvents)
      };
    })
    .catch(err => {
      throw err;
    });
};

app.use(
  '/graphql',
  // Creating graphql middleware
  graphqlHttp({
    // Building the schema
    // OBS: Types with ! not are nullable
    schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
      creator: User!
    }

    type User {
      _id: ID!
      email: String!
      password: String
      createdEvents: [Event!]
    }

    input UserInput {
      email: String!
      password: String!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
    // Mutations are endpoints for insert, alter data in a DB
    // Query are querys (only read)
    rootValue: {
      // in rootValue are the functions declared in Schema
      events: () => {
        // Return all Events
        return (
          Event.find()
            // .populate('creator')
            .then(events => {
              return events.map(event => {
                return {
                  ...event._doc,
                  creator: user.bind(this, event._doc.creator)
                };
              });
            })
            .catch(err => {
              throw err;
            })
        );
      },
      createEvent: args => {
        // Creating new event, with the fields in the mutation
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          // Temporary static creator ID
          creator: '5c7d613d14a40a0025ee1104'
        });

        let createdEvent;

        return event
          .save()
          .then(result => {
            createdEvent = { ...result._doc };
            return User.findById('5c7d613d14a40a0025ee1104');
          })
          .then(user => {
            if (!user) {
              throw new Error('User not found.');
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then(result => {
            return createdEvent;
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      createUser: args => {
        User.findOne({ email: args.userInput.email })
          .then(user => {
            if (user) {
              throw new Error('User exists already');
            }

            return bcrypt.hash(args.userInput.password, 12);
          })
          .then(hashedPassword => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword
            });

            return user.save();
          })
          .then(result => {
            return { ...result._doc, password: null };
          })
          .catch(err => {
            throw err;
          });
      }
    },
    graphiql: true
  })
);

mongoose
  .connect('mongodb://db:27017/event-booking', { useNewUrlParser: true })
  .then(response => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server Running on port ${PORT}`));
