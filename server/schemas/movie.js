const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const MovieSchema = new mongoose.Schema({
  title: String,
  year: String,
  rated: String,
  genres: [String],
  director: [String],
  director_gender: { type: String, default: 'n/a' },
  writer_gender: { type: String, default: 'n/a' },
  writer: [String],
  plot: String,
  ratings: [{
    entertainment_rating: { type: Number, default: 0 },
    plot_rating: { type: Number, default: 0 },
    style_rating: { type: Number, default: 0 },
    bias_rating: { type: Number, default: 0 },
    total_rating: { type: Number, default: 0 },
    user_id: String,
  }],
  ratings_length: Number,
  total_rating_average: Number,
  entertainment_rating_average: Number,
  plot_rating_average: Number,
  style_rating_average: Number,
  bias_rating_average: Number,
  themes: [{
    themes: [String],
    user_id: String,
  }],
  runtime: String,
  poster: String,
  date_added: [{
    date: { type: String, default: Date.now().toString() },
    user_id: String,
  }],
  reviews: [{
    review: String,
    user_id: String,
    username: String,
    date_added: { type: String, default: Date.now().toString() },
    upvotes: { type: Number, default: 0 },
    upvoted_by: [String],
  }],
});

MovieSchema.pre("save", function(next) {
  const movie = this;

  try {
    if(movie.isModified("ratings")){
      movie.ratings_length = movie.ratings.length;
      if(movie.ratings_length > 0){
        let [total, entertainment, plot, style, bias] = [0, 0, 0, 0, 0];
        for(i = 0; i < movie.ratings_length; i++){
          total+=movie.ratings[i].total_rating;
          entertainment+=movie.ratings[i].entertainment_rating;
          plot+=movie.ratings[i].plot_rating;
          style+=movie.ratings[i].style_rating;
          bias+=movie.ratings[i].bias_rating;
        }
        movie.total_rating_average = total/movie.ratings_length;
        movie.entertainment_rating_average = entertainment/movie.ratings_length;
        movie.plot_rating_average = plot/movie.ratings_length;
        movie.style_rating_average = style/movie.ratings_length;
        movie.bias_rating_average = bias/movie.ratings_length;
      }
    }
  } catch(err){
    console.error(err);
    return next();
  }

  return next();

})

module.exports = mongoose.model('Movie', MovieSchema);
