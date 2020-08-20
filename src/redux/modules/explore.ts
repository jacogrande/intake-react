import { typedAction, IFriends, IAvatar } from './user';
import { Dispatch, AnyAction } from 'redux';
import { IMovieData } from './movies';

interface IFeedEntry {
  movie: IMovieData,
  username: string,
  user_id: string,
  avatar: IAvatar
}

interface ExploreState {
  currentUser: IFriends | null;
  filter: string;
  search: string;
  topUsersByMovies: IFriends[] | null;
  topUsersByFriends: IFriends[] | null;
  topUsersByReviews: IFriends[] | null;
  topUsersByDateAddedOldest: IFriends[] | null;
  topUsersByDateAddedNewest: IFriends[] | null;
  searchResults: IFriends[],
  feed: IFeedEntry[] | null
}

type IFilter = "movies" | "friends" | "reviews" | "date_added_oldest" | "date_added_newest"

const initialState: ExploreState = {
  filter: "movies",
  search: "",
  currentUser: null,
  topUsersByFriends: null,
  topUsersByMovies: null,
  topUsersByReviews: null,
  topUsersByDateAddedOldest: null,
  topUsersByDateAddedNewest: null,
  searchResults: [],
  feed: null
};

// setter functions
export const setFilter = (filter: string) => typedAction('explore/SET_FILTER', filter);
export const setCurrentUser = (user: IFriends | null) => typedAction('explore/SET_USER', user);
export const setFeed = (feed: IFeedEntry[]) => typedAction('explore/SET_FEED', feed);


/**
 * Function that loads a user's personalized feed via api call
 */
export const getFeed = () => async (dispatch: Dispatch<AnyAction>) => {
  try {
    const response = await fetch("/api/friends/feed");
    switch(response.status) {
      case 200:
        const data = await response.json();
        return dispatch(setFeed(data));
      default:
        throw new Error('error fetching feed');
    }
  } catch(err) {
    
    console.error(err);
  }
} 

/**
 * Function that gets the top users of the given criteria via api call
 * @param {IFilter} filter The criteria in which to compare users
 */
const getTopUsers = async (filter: IFilter) => {
  const response = await fetch(`/api/friends/getTopUsers/${filter}`);
  switch (response.status) {
    case 200:
      const data = await response.json();
      return data;
    default:
      throw new Error('error getting top users');
  }
}

// top user setters
export const setTopUsersByMovies = (users: IFriends[]) => typedAction('explore/SET_TOP_USERS_BY_MOVIES', users);
export const setTopUsersByFriends = (users: IFriends[]) => typedAction('explore/SET_TOP_USERS_BY_FRIENDS', users);
export const setTopUsersByReviews = (users: IFriends[]) => typedAction('explore/SET_TOP_USERS_BY_REVIEWS', users);
export const setTopUsersByDateAddedOldest = (users: IFriends[]) => typedAction('explore/SET_TOP_USERS_BY_DATE_ADDED_OLDEST', users);
export const setTopUsersByDateAddedNewest = (users: IFriends[]) => typedAction('explore/SET_TOP_USERS_BY_DATE_ADDED_NEWEST', users);

const filterActions = {
  "movies": setTopUsersByMovies,
  "friends": setTopUsersByFriends,
  "reviews": setTopUsersByReviews,
  "date_added_oldest": setTopUsersByDateAddedOldest,
  "date_added_newest": setTopUsersByDateAddedNewest,
}

/**
 * Function that sets the top users of the specified category
 * @param {IFilter} filter which top users array to set
 */
export const setTopUsers = (filter: IFilter) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    const users: IFriends[] = await getTopUsers(filter);
    dispatch(filterActions[filter](users));
  } catch (err) {
    // ***** IMPROVE ERROR HANDLING *****
    console.error(err);
  }
}

/**
 * Function that gets the requested user's public profile data via api call
 * @param {string} id user id
 */
export const loadProfile = (id: string) => {
  return async (dispatch: Dispatch<AnyAction>) => {
    dispatch(setCurrentUser(null));
    const response = await fetch(`/api/friends/${id}`);
    switch (response.status) {
      case 200:
        const data = await response.json();
        dispatch(setCurrentUser(data));
        break;
      default:
        console.log('error fetching profile');
    }
  }
}

// search setters
const setSearchKey = (search: string) => typedAction('explore/SET_SEARCH', search);
const setSearchResults = (users: IFriends[]) => typedAction('explore/SET_SEARCH_RESULTS', users);

/**
 * Function that finds users with similar usernames to the search query via api call
 * @param {string} search username query
 */
export const setSearch = (search: string) => async (dispatch: Dispatch<AnyAction>) => {
  dispatch(setSearchKey(search));
  if (search) {
    const response = await fetch(`/api/friends/search/${search}`);
    switch (response.status) {
      case 200:
        const data = await response.json();
        console.log(data);
        dispatch(setSearchResults(data.users));
        break;
      default:
        console.log("error");
    }
  }

}


type ExploreAction = ReturnType<typeof setCurrentUser |
  typeof setTopUsersByMovies |
  typeof setTopUsersByDateAddedOldest |
  typeof setTopUsersByDateAddedNewest |
  typeof setTopUsersByReviews |
  typeof setTopUsersByFriends |
  typeof setFilter |
  typeof setSearchKey |
  typeof setSearchResults |
  typeof setFeed
>

export function exploreReducer(state = initialState, action: ExploreAction): ExploreState {
  switch (action.type) {
    case "explore/SET_USER":
      state.currentUser = action.payload;
      return { ...state }
    case "explore/SET_TOP_USERS_BY_MOVIES":
      state.topUsersByMovies = action.payload;
      return { ...state }
    case "explore/SET_TOP_USERS_BY_FRIENDS":
      state.topUsersByFriends = action.payload;
      return { ...state };
    case "explore/SET_TOP_USERS_BY_REVIEWS":
      state.topUsersByReviews = action.payload;
      return { ...state };
    case "explore/SET_TOP_USERS_BY_DATE_ADDED_OLDEST":
      state.topUsersByDateAddedOldest = action.payload;
      return { ...state };
    case "explore/SET_TOP_USERS_BY_DATE_ADDED_NEWEST":
      state.topUsersByDateAddedNewest = action.payload;
      return { ...state };
    case "explore/SET_FILTER":
      state.filter = action.payload;
      return { ...state }
    case "explore/SET_SEARCH":
      state.search = action.payload;
      return { ...state }
    case "explore/SET_FEED":
      state.feed = action.payload;
      return {...state}
    case "explore/SET_SEARCH_RESULTS":
      state.searchResults = action.payload;
      return { ...state };
    default:
      return state;
  }
}