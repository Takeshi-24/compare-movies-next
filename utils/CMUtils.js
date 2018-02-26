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

export const moviesAvailable = state =>
  state.getIn(['movies', 'fetching']) || !!state.getIn(['movies', 'list']).size;

export const formatedDate = (dateString, format = 'small') => {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  return format === 'long'
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

export const formatedRunTime = value => {
  const hour = Math.floor(value / 60);
  const mins = value % 60;

  return `${hour > 0 ? `${hour}hr` : ''} ${
    mins > 0 ? `${mins > 0 ? `${mins}min` : ''}` : ''
  }`;
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

export const filterAndSortSearchResults = (searchArrays, movies) => {
  let moviesArray = addMovieType(searchArrays[0].results);
  let tvShowsArray = addTvType(searchArrays[1].results);

  movies = movies ? movies.toJS() : [];

  let combinedArray = mergeUniqMovieArrays(moviesArray, tvShowsArray);

  // Sort results based on popularity
  combinedArray.sort(
    (a, b) => parseFloat(b.popularity) - parseFloat(a.popularity)
  );

  // Remove results already present in selected movies
  return combinedArray.filter((ele, i, self) => {
    return !movies.find(
      movie => movie.id === ele.id && movie.media_type === ele.media_type
    );
  });
};

export const checkIfMovieInList = (movie, movies) =>
  movies.filter(
    m => movie.id === m.get('id') && movie.media_type === m.get('media_type')
  ).size;

export const getInitials = name => {
  const nameSplits = name.split(' ');
  return nameSplits[0][0] + nameSplits[nameSplits.length - 1][0];
};