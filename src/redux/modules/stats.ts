import { typedAction} from './user';

export interface IDict {
  [key: string]: number;
}

export type ISortedStat = {
  key: string;
  count: number;
  color?: string
}

export type IRatings = {
  total: number,
  others: ISortedStat[]
}

type StatsState = {
  genres: ISortedStat[] | null,
  contentRatings: ISortedStat[] | null,
  datesAdded: string[] | null,
  releaseDates: string[] | null,
  themes: ISortedStat[] | null,
  ratings: IRatings | null,
}


const initialState: StatsState = {
  genres: null,
  contentRatings: null,
  datesAdded: null,
  releaseDates: null,
  themes: null,
  ratings: null
};

// stat setters
export const setGenres = (genres: ISortedStat[]) => typedAction("stats/SET_GENRES", genres);
export const setContentRatings = (contentRatings: ISortedStat[]) => typedAction("stats/SET_CONTENT_RATINGS", contentRatings);
export const setDatesAdded = (datesAdded: string[]) => typedAction("stats/SET_DATES_ADDED", datesAdded);
export const setReleaseDates = (releaseDates: string[]) => typedAction("stats/SET_RELEASE_DATES", releaseDates);
export const setThemes = (themes: ISortedStat[]) => typedAction("stats/SET_THEMES", themes);
export const setRatings = (ratings: IRatings) => typedAction("stats/SET_RATINGS", ratings);
export const clearStore = () => typedAction("stats/CLEAR_STORE");

type StatsAction = ReturnType<
  typeof setGenres |
  typeof setContentRatings |
  typeof setDatesAdded |
  typeof setReleaseDates |
  typeof setThemes |
  typeof setRatings | 
  typeof clearStore
>

export function statsReducer(state = {...initialState}, action: StatsAction): StatsState {
  switch (action.type) {
    case "stats/SET_GENRES":
      state.genres = action.payload;
      return { ...state }
    case "stats/SET_CONTENT_RATINGS":
      state.contentRatings = action.payload;
      return { ...state }
    case "stats/SET_DATES_ADDED":
      state.datesAdded = action.payload;
      return { ...state }
    case "stats/SET_RELEASE_DATES":
      state.releaseDates = action.payload;
      return { ...state }
    case "stats/SET_THEMES":
      state.themes = action.payload;
      return { ...state }
    case "stats/SET_RATINGS":
      state.ratings = action.payload;
      return { ...state }
    case "stats/CLEAR_STORE":
      return {...initialState};
    default:
      return state;
  }
}