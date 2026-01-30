const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // For demo purposes, we'll use a simple authentication
    // In production, you'd use a proper authentication service
    // or integrate with Supabase Auth
    
    // Simple validation
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    // Mock user database - in production, use a real database
    const users = [
      {
        id: '1',
        email: 'demo@studentchat.com',
        password: 'demo123',
        name: 'Demo User'
      }
    ];

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    // Create a simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        user: {
          uid: user.id,
          email: user.email,
          displayName: user.name
        }
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
