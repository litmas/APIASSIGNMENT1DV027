const mongoose = require('mongoose');
const dotenv = require('dotenv');
const faker = require('faker');

const Movie = require('../models/movieModel');
const Actor = require('../models/actorModel');
const Rating = require('../models/ratingModel');
const User = require('../models/userModel');

dotenv.config({ path: `${__dirname}/../../.env` });

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('DB connection successful!'));

// Helper functions for data generation
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomElements = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Data pools for generating consistent data
const genres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
];

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Sarah',
  'Thomas', 'Karen', 'Charles', 'Nancy', 'Christopher', 'Lisa', 'Daniel', 'Betty',
  'Matthew', 'Margaret', 'Anthony', 'Sandra', 'Mark', 'Ashley', 'Donald', 'Kimberly',
  'Steven', 'Emily', 'Paul', 'Donna', 'Andrew', 'Michelle', 'Joshua', 'Carol'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const reviewTemplates = [
  'This movie was absolutely {adjective}! {comment}',
  '{adjective} film with {adjective} performances. {comment}',
  'I was {adjective} by this movie. {comment}',
  'A {adjective} cinematic experience. {comment}',
  '{adjective} storytelling and {adjective} visuals. {comment}'
];

const adjectives = [
  'amazing', 'brilliant', captivating', 'compelling', 'dazzling', 'engaging',
  'exceptional', 'exhilarating', 'fantastic', 'gripping', 'impressive', 'incredible',
  'magnificent', 'masterful', 'memorable', 'mesmerizing', 'outstanding', 'remarkable',
  'spectacular', 'splendid', 'superb', 'thrilling', 'wonderful'
];

const comments = [
  'The direction was top-notch.', 'The cinematography was stunning.', 
  'The score complemented the visuals perfectly.', 'The pacing kept me engaged throughout.',
  'The character development was exceptional.', 'The plot twists were unexpected yet satisfying.',
  'The emotional depth resonated with me.', 'The visual effects were groundbreaking.',
  'The dialogue was sharp and witty.', 'The performances were award-worthy.'
];

/**
 * A function to delete all data from the Movie, Actor, Rating, and User collections in the database.
 * @async
 * @function deleteData
 * @returns {void}
 */
const deleteData = async () => {
  try {
    await Movie.deleteMany();
    await Actor.deleteMany();
    await Rating.deleteMany();
    await User.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
};

/**
 * Generates a realistic movie title by combining words from different pools
 */
const generateMovieTitle = () => {
  const prefixes = ['The', 'A', 'Beyond', 'Inside', 'Eternal', 'Last', 'First', 'Secret'];
  const nouns = ['Dream', 'Night', 'Day', 'Time', 'Life', 'Love', 'War', 'Peace', 'Journey', 'Destiny'];
  const suffixes = ['Returns', 'Begins', 'Rises', 'Falls', 'Awakens', 'Ends', 'Continues', 'Reborn'];
  
  if (Math.random() > 0.7) {
    return `${getRandomElement(prefixes)} ${getRandomElement(nouns)}`;
  } else if (Math.random() > 0.5) {
    return `${getRandomElement(nouns)} ${getRandomElement(suffixes)}`;
  } else {
    return `${getRandomElement(prefixes)} ${getRandomElement(nouns)} ${getRandomElement(suffixes)}`;
  }
};

/**
 * Generates a realistic movie description
 */
const generateDescription = (title, genre) => {
  const templates = [
    `A ${getRandomElement(['young', 'brilliant', 'retired', 'reluctant'])} ${getRandomElement(['detective', 'scientist', 'agent', 'explorer'])} must ${getRandomElement(['save the world', 'solve a mystery', 'find the truth', 'face their past'])} in this ${genre.toLowerCase()} masterpiece.`,
    `When ${getRandomElement(['a mysterious event', 'an ancient prophecy', 'a shocking discovery', 'a terrible tragedy')} occurs, ${getRandomElement(['a group of friends', 'an unlikely hero', 'a determined team', 'a family')} must ${getRandomElement(['fight for survival', 'uncover the secret', 'journey to a distant land', 'make a difficult choice')}.`,
    `Set in ${getRandomElement(['a dystopian future', 'a magical realm', 'a small town', 'a bustling city')}, this ${genre.toLowerCase()} film explores themes of ${getRandomElement(['love', 'betrayal', 'redemption', 'courage', 'sacrifice'])} through the eyes of ${getRandomElement(['a troubled protagonist', 'an ordinary person', 'a legendary figure', 'a misunderstood outcast'])}.`
  ];
  
  return getRandomElement(templates);
};

/**
 * Generates a realistic review
 */
const generateReview = () => {
  const template = getRandomElement(reviewTemplates);
  const adj1 = getRandomElement(adjectives);
  const adj2 = getRandomElement(adjectives);
  const comment = getRandomElement(comments);
  
  return template
    .replace(/{adjective}/g, () => getRandomElement(adjectives))
    .replace(/{comment}/, comment);
};

/**
 * Imports sample data into the database including users, movies, actors, and ratings.
 * This function creates multiple users, movies, assigns actors to movies, and adds ratings for the movies.
 * @returns {Promise<void>} A Promise that resolves when the data import is completed successfully or rejects with an error.
 */
const importData = async () => {
  try {
    console.log('Starting data generation...');
    
    // Create 100 users
    const users = [];
    for (let i = 0; i < 100; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      
      users.push({
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        password: 'test1234',
        passwordConfirm: 'test1234',
      });
    }
    
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);
    
    // Create 200 movies
    const movies = [];
    for (let i = 0; i < 200; i++) {
      const genre = getRandomElement(genres);
      const title = generateMovieTitle();
      
      movies.push({
        title: title,
        releaseYear: getRandomInt(1980, 2023),
        genre: genre,
        description: generateDescription(title, genre),
      });
    }
    
    const createdMovies = await Movie.create(movies);
    console.log(`${createdMovies.length} movies created`);
    
    // Create 300 actors
    const actors = [];
    for (let i = 0; i < 300; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      
      // Each actor appears in 1-5 random movies
      const movieCount = getRandomInt(1, 5);
      const moviesPlayed = getRandomElements(createdMovies, movieCount).map(movie => movie._id);
      
      actors.push({
        name: `${firstName} ${lastName}`,
        moviesPlayed: moviesPlayed,
      });
    }
    
    const createdActors = await Actor.create(actors);
    console.log(`${createdActors.length} actors created`);
    
    // Create 400 ratings (4 per movie on average)
    const ratings = [];
    for (let i = 0; i < 400; i++) {
      const movie = getRandomElement(createdMovies);
      const user = getRandomElement(createdUsers);
      
      ratings.push({
        movie: movie._id,
        user: user._id,
        value: getRandomInt(1, 10),
        review: generateReview(),
      });
    }
    
    await Rating.create(ratings);
    console.log(`${ratings.length} ratings created`);
    
    console.log('Data successfully imported!');
  } catch (err) {
    console.log(err);
  }
};

/**
 * A function that seeds the database by deleting existing data, importing new data, and exiting the process.
 * @returns {Promise<void>} - A promise that resolves when the database has been seeded successfully
 */
const seedDB = async () => {
  await deleteData();
  await importData();
  process.exit();
};

seedDB();
