import { Dispatch, AnyAction } from 'redux';
import { IMovieData } from './movies';

// overload typing functions to enforce action types
export function typedAction<T extends string>(type: T): { type: T };
export function typedAction<T extends string, P extends any>(type: T, payload: P): { type: T, payload: P };
export function typedAction(type: string, payload?: any) {
  return { type, payload }
}

export interface IAvatar {
  color: string, 
  tilemap: number[][]
}

export interface IFriends {
  avatar: IAvatar,
  username: string,
  movies: IMovieData[],
  friends: string[],
  favorite_movie: IMovieData,
  reviews: string[],
  date_registered: string[]
  _id: string
}

type UserState = {
  username: string | null;
  avatar: IAvatar | null,
  reviews: string[] | null,
  upvoted_reviews: {movie_id: string, reviews:[]} | null
  friends: IFriends[],
  friend_requests: IFriends[],
  favorite_movie: IMovieData | null,
  guest: boolean | null,
  _id: string | null
}

const initialState: UserState = { username: null, upvoted_reviews: null, avatar: null, reviews: null, friends: [], friend_requests: [], favorite_movie: null, guest: null, _id: null};

// login actions
export const login = (data: UserState) => typedAction('user/LOGIN', data);
const allowGuest = () => typedAction('user/LOGIN_GUEST');
export const logout = () => typedAction('user/LOGOUT');

// add friend action
export const addFriend = (data: IFriends) => typedAction('user/ADD_FRIEND', data);

/**
 * Function that checks for a user on the current session via api call
 */
export const checkSessionLogin = () => {
  console.log('logging in');
  return async (dispatch: Dispatch<AnyAction>) => {
    const response = await fetch("/api/user/checkSession");
    const data = await response.json();
    if (data.username) {
      dispatch(login(data));
    } else {
      dispatch(allowGuest());
    }
  }
}

type UserAction = ReturnType<typeof login | typeof logout | typeof addFriend | typeof allowGuest>

export function userReducer(state = {...initialState}, action: UserAction): UserState {
  switch (action.type) {
    case "user/LOGIN":
      return {... action.payload, guest:false}
    case "user/LOGOUT":
      const refreshedState = {...initialState}
      refreshedState.guest = true;
      return refreshedState;
    case "user/LOGIN_GUEST":
      state.guest = true;
      return {...state}
    case "user/ADD_FRIEND":
      state.friends = state.friends.concat([action.payload]);
      let newRequests = state.friend_requests ? [...state.friend_requests] : [];
      const index = newRequests.indexOf(action.payload);
      newRequests.splice(index, 1);
      state.friend_requests = newRequests;
      return {...state}
    default:
      return state;
  }
}