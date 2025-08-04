module.exports = {
  rest: {
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
  },
  responses: {
    privateAttributes: [],
  },
  populateMaxDepth: 10, // Allow deep population up to 10 levels
};