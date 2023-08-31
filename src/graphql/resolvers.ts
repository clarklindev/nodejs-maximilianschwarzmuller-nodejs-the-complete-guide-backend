const graphqlResolver = {
  hello: () => {
    return { text: "Hello World!", views:123 };
  }
  // ... other resolvers
};

export default graphqlResolver;