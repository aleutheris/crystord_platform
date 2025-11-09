// VS Code Apollo GraphQL extension configuration
// Keeps the language server from trying to load Angular's apollo config TS file
// and provides a single, explicit client config for development.

module.exports = {
  client: {
    service: {
      name: 'crystord',
      url: 'http://localhost:4201/api/graphql',
      skipSSLValidation: true
    },
    includes: ['src/**/*.ts', 'src/**/*.graphql'],
    excludes: ['**/node_modules/**', 'dist/**'],
    tagName: 'gql'
  }
};
