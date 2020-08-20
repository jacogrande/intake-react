import { combineReducers } from "redux";
import { userReducer } from "./modules/user";
import { movieReducer } from "./modules/movies";
import { exploreReducer } from "./modules/explore";
import {statsReducer} from "./modules/stats";

// reducer combiner
export const rootReducer = combineReducers({
  user: userReducer,
  movies: movieReducer,
  explore: exploreReducer,
  stats: statsReducer
});

export type RootState = ReturnType<typeof rootReducer>