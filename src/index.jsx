import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize, mergeConfig,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

import { messages as footerMessages } from '@edx/frontend-component-footer';

import { QueryClient, QueryClientProvider } from 'react-query';
import appMessages from './i18n';

import initializeStore from './store';
import './index.scss';
import CourseAuthoringRoutes from './CourseAuthoringRoutes';
import Head from './head/Head';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Set staleTime to 5 minutes
      staleTime: 5 * 60 * 1000,
      // Set cacheTime to 60 minutes
      cacheTime: 60 * 60 * 1000,
      // Set the retry count for queries here
      retry: 1, // Set the retry count for queries here
    },
    mutations: {
      retry: 1, // Set the retry count for mutations here
    },
  },
});

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={initializeStore()}>
      <QueryClientProvider client={queryClient}>
        <Head />
        <Switch>
          <Route
            path="/course/:courseId"
            render={({ match }) => {
            const { params: { courseId } } = match;
            return (
              <CourseAuthoringRoutes courseId={courseId} />
            );
          }}
          />
        </Switch>
      </QueryClientProvider>
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  handlers: {
    config: () => {
      mergeConfig({
        SUPPORT_URL: process.env.SUPPORT_URL || null,
        SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || null,
        LEARNING_BASE_URL: process.env.LEARNING_BASE_URL,
        EXAMS_BASE_URL: process.env.EXAMS_BASE_URL || null,
        CALCULATOR_HELP_URL: process.env.CALCULATOR_HELP_URL || null,
        ENABLE_PROGRESS_GRAPH_SETTINGS: process.env.ENABLE_PROGRESS_GRAPH_SETTINGS || 'false',
        ENABLE_TEAM_TYPE_SETTING: process.env.ENABLE_TEAM_TYPE_SETTING === 'true',
        BBB_LEARN_MORE_URL: process.env.BBB_LEARN_MORE_URL || '',
        AC_INSTANCE_CONFIG_API_URL: process.env.AC_INSTANCE_CONFIG_API_URL,
      }, 'CourseAuthoringConfig');
    },
  },
  messages: [
    appMessages,
    footerMessages,
  ],
  requireAuthenticatedUser: true,
});
