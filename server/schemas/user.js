const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true, index: { unique: true },
  },
  email: {
    type: String, required: true, unique: true, index: { unique: true },
  },
  password: String,
  movies: [String],
  movies_length: Number,
  feed: [{movie: String, date: Date}],
  date_registered: { type: Date, default: Date.now },
  friends: [String],
  friends_length: Number,
  friend_requests: [String],
  upvoted_reviews: [{
    movie_id: String,
    reviews: [String],
  }],
  avatar: {
    color: String,
    tilemap: [[Number]],
  },
  reviews: [String],
  reviews_length: Number,
  favorite_movie: String,
  verified: {type: Boolean, default: false}
});

UserSchema.plugin(uniqueValidator);

UserSchema.pre('save', function (next) {
  const user = this;

  if(user.isModified('friends')){
    user.friends_length = user.friends.length;
  }
  if(user.isModified('reviews')){
    user.reviews_length = user.reviews.length;
  }
  if(user.isModified('movies')) {
    user.movies_length = user.movies.length;
  }

  if(user.isModified('feed')) {
    user.feed = [...new Set(user.feed)];
  }

  // hash the password if it has been changed (or created).
  // this way, the password won't be changed when a user changes their email adress.
  if (!user.isModified('password')) {
    return next();
  }
  // salt generator with hashing callback
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    // error catching
    if (err) return next(err);

    // hashing with new salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      // replace the plaintext password with the hashed one
      user.password = hash;
      next();
    });
  });
});


// password verification middleware
UserSchema.methods.verifyPassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);
