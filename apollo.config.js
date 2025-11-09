module.exports = {
  client: {
    service: {
      name: 'crystord',
      url: 'http://crystord:5665/api/graphql',
      skipSSLValidation: true
    },
    includes: ['src/**/*.ts', 'src/**/*.graphql'],
    excludes: ['**/node_modules/**', 'dist/**'],
    tagName: 'gql'
  }
};
