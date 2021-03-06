import Router from 'next/router';
import { getMoviesFromPath } from './UrlUtils';

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'June',
  'July',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

const enUSFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const randomColorPart = () => Math.round(Math.random() * 255);

export const formatedDate = (dateString, format = 'small') => {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  return format === 'iso8601'
    ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    : format === 'long'
    ? `${monthNames[date.getMonth()]}, ${date.getDate()} ${date.getFullYear()}`
    : `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatedCurrency = value => {
  if (value < 1) return false;

  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(0)} B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(0)} M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)} K`;
  }

  return enUSFormat.format(value);
};

export const formatedRunTime = (value, format = 'long') => {
  const hour = Math.floor(value / 60);
  const mins = value % 60;
  const isLong = format === 'long';

  return `${hour > 0 ? `${hour}${isLong ? 'hr' : 'H'}` : ''}${
    isLong ? ' ' : ''
  }${mins > 0 ? `${mins > 0 ? `${mins}${isLong ? 'min' : 'M'}` : ''}` : ''}`;
};

export const randomColorHex = () =>
  `rgba(${randomColorPart()}, ${randomColorPart()}, ${randomColorPart()}, .35)`;

export const mergeUniqMovieArrays = (array1, array2) => {
  let combinedArray = [...array1, ...array2];

  return combinedArray.filter(
    (movie, i, self) =>
      self.findIndex(
        m => m.id === movie.id && m.media_type === movie.media_type
      ) === i
  );
};

export const addMovieType = movies => {
  movies.forEach(arr => (arr.media_type = 'movie'));
  return movies;
};

export const addTvType = tvShows => {
  tvShows.forEach(arr => (arr.media_type = 'tv'));
  return tvShows;
};

export const filterAndSortSearchResults = (
  searchArrays,
  path = Router.asPath
) => {
  const movies = getMoviesFromPath(path);
  let moviesArray = addMovieType(searchArrays[0].results);
  let tvShowsArray = addTvType(searchArrays[1].results);
  let combinedArray = mergeUniqMovieArrays(moviesArray, tvShowsArray);

  // Sort results based on popularity
  combinedArray.sort(
    (a, b) => parseFloat(b.popularity) - parseFloat(a.popularity)
  );

  // Remove results already present in selected movies
  return combinedArray.filter(
    c =>
      !movies.find(
        m => parseInt(m.id, 10) === c.id && m.media_type === c.media_type
      )
  );
};

export const checkIfMovieInList = (movie, movies) =>
  !!movies.find(
    m =>
      parseInt(movie.id, 10) === m.get('id') &&
      movie.media_type === m.get('media_type')
  );

export const getInitials = name => {
  const nameSplits = name.split(' ');
  return nameSplits[0][0] + nameSplits[nameSplits.length - 1][0];
};

export const getMovieRatingByType = (ratings, source) => {
  if (!ratings) {
    return false;
  }
  let filteredRating = ratings.find(rating => rating.Source === source);
  return filteredRating ? filteredRating.Value.split('/')[0] : false;
};

export const getAggregateRating = movie => {
  const imdbRating = getMovieRatingByType(
    movie.ratings,
    'Internet Movie Database'
  );
  const tomatoRating = getMovieRatingByType(movie.ratings, 'Rotten Tomatoes');
  const metacriticRating = getMovieRatingByType(movie.ratings, 'Metacritic');

  let totalRatingFor10 = 0,
    totalRatingCount = 0;

  if (movie.vote_average) {
    totalRatingFor10 += parseFloat(movie.vote_average, 10);
    totalRatingCount++;
  }
  if (imdbRating) {
    totalRatingFor10 += parseFloat(imdbRating, 10);
    totalRatingCount++;
  }
  if (tomatoRating) {
    totalRatingFor10 += parseFloat(tomatoRating, 10) / 10;
    totalRatingCount++;
  }
  if (metacriticRating) {
    totalRatingFor10 += parseFloat(metacriticRating, 10) / 10;
    totalRatingCount++;
  }
  return (Math.round((totalRatingFor10 / totalRatingCount) * 10) / 10).toFixed(
    1
  );
};

export const getAggregateRatingCount = movie => {
  if (!movie.ratings) {
    return parseInt(movie.vote_count, 10);
  }

  const imdbRating = movie.ratings.find(
    r => r.Source === 'Internet Movie Database'
  );
  const imdbRatingCount = parseInt(imdbRating ? imdbRating.imdbVotes : 0, 10);
  return imdbRatingCount + parseInt(movie.vote_count, 10);
};
