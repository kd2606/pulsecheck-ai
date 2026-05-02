exports.handler = async (event, context) => {
  // This is a mock function for family members
  // In production, you'd connect to a real database
  return {
    statusCode: 200,
    body: JSON.stringify({
      people: [
        {
          id: "default-user",
          name: "User",
          relationship: "Self",
          createdAt: new Date().toISOString()
        }
      ]
    })
  };
};
