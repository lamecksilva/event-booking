const bcrypt = require('bcryptjs');

const Event = require('../../models/Event');
const User = require('../../models/User');

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
        createdEvents: events.bind(this, user._doc.createdEvents)
      };
    })
    .catch(err => {
      throw err;
    });
};

module.exports = {
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
        createdEvent = {
          ...result._doc,
          creator: user.bind(this, result._doc.creator)
        };
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
};
