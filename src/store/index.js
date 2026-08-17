import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore, combineReducers} from '@reduxjs/toolkit';

import {persistStore, persistReducer} from 'redux-persist';

import authReducer from './authSlice';
import profileReducer from './profileSlice';

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: [
    'accessToken',
    'refreshToken',
    'tokenType',
    'expiresInSeconds',
    'user',
    'profileStatus',
    'isAuthenticated',
  ],
};

const profilePersistConfig = {
  key: 'profile',
  storage: AsyncStorage,
  whitelist: [
    'profiles',
    'primaryProfile',
    'activeProfile',
    'activePatientAccountId',
    'onboarding',
  ],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),

  profile: persistReducer(profilePersistConfig, profileReducer),
});

const store = configureStore({
  reducer: rootReducer,

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export default store;
