const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, password, name } = JSON.parse(event.body);

    // Simple validation
    if (!email || !password || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email, password, and name are required' })
      };
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Password must be at least 6 characters' })
      };
    }

    // Mock user database - in production, use a real database
    // For demo, we'll just create a new user
    const userId = Date.now().toString();
    
    // Create a simple token (in production, use JWT)
    const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');

    const newUser = {
      uid: userId,
      email: email,
      displayName: name
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        user: newUser
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
