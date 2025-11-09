import { InMemoryCache, ApolloClientOptions } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { HttpLink } from 'apollo-angular/http';

export const GRAPHQL_URI = '/api/graphql';

function getToken(): string | null {
  try {
    return localStorage.getItem('crystordAuthToken');
  } catch {
    return null;
  }
}

export function apolloOptionsFactory(httpLink: HttpLink): ApolloClientOptions<any> {
  const authLink = setContext((_, { headers }) => {
    const token = getToken();
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
  });

  const link = authLink.concat(httpLink.create({ uri: GRAPHQL_URI }));

  return {
    link,
    cache: new InMemoryCache(),
    devtools: { enabled: true }
  } as ApolloClientOptions<any>;
}
