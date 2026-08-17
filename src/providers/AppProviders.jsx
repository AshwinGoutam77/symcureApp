import React from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {QueryClientProvider} from '@tanstack/react-query';

import store, {persistor} from '../store';
import queryClient from '../queryClient';

const AppProviders = ({children}) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
};

export default AppProviders;
