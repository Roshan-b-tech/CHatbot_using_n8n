import { ApolloClient, InMemoryCache, createHttpLink, split, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { nhost } from './nhost';
import { getAuthHeaders, handleAuthError } from '../utils/auth';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL || 'https://ivbsvrhjpzemziisixvk.hasura.ap-south-1.nhost.run/v1/graphql',
});

const wsLink = new GraphQLWsLink(createClient({
  url: import.meta.env.VITE_HASURA_WEBSOCKET_URL || 'wss://ivbsvrhjpzemziisixvk.hasura.ap-south-1.nhost.run/v1/graphql',
  connectionParams: () => {
    const token = nhost.auth.getAccessToken();
    console.log('WebSocket connection params:', {
      hasToken: !!token,
      isAuthenticated: nhost.auth.isAuthenticated()
    });
    return {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  },
}));

const authLink = setContext(async (_, { headers }) => {
  try {
    console.log('Apollo auth link called:', {
      isAuthenticated: nhost.auth.isAuthenticated(),
      operationName: _.operationName
    });

    // Only try to get auth headers if user is authenticated
    if (nhost.auth.isAuthenticated()) {
      const authHeaders = await getAuthHeaders();
      console.log('Got auth headers for authenticated user');
      return {
        headers: {
          ...headers,
          ...authHeaders,
        },
      };
    }

    // If not authenticated, return headers without authorization
    console.log('No authentication, proceeding without auth headers');
    return {
      headers: {
        ...headers,
        authorization: '',
      },
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return {
      headers: {
        ...headers,
        authorization: '',
      },
    };
  }
});

// Error handling link for authentication errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      console.log('GraphQL error:', {
        message: err.message,
        code: err.extensions?.code,
        operationName: operation.operationName
      });

      if (err.extensions?.code === 'UNAUTHENTICATED' || err.message.includes('invalid-refresh-token')) {
        console.log('Handling authentication error');

        // Only handle auth errors if user is authenticated
        if (nhost.auth.isAuthenticated()) {
          handleAuthError(err).then((refreshed) => {
            if (refreshed) {
              console.log('Successfully refreshed token, retrying operation');
              // Retry the operation with new token
              const oldHeaders = operation.getContext().headers;
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  authorization: `Bearer ${nhost.auth.getAccessToken()}`,
                },
              });
              forward(operation);
            }
          });
        } else {
          console.log('User not authenticated, not handling auth error');
        }
      }
    }
  }

  if (networkError) {
    console.error('Network error:', networkError);
  }
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, splitLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});