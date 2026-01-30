const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  try {
    const store = getStore('chat-data');
    
    switch (event.httpMethod) {
      case 'GET':
        // Get messages for a room
        const { roomId } = event.queryStringParameters;
        const messages = await store.get(roomId, { type: 'json' }) || [];
        return {
          statusCode: 200,
          body: JSON.stringify(messages)
        };
        
      case 'POST':
        // Add a new message
        const { roomId: postRoomId, message } = JSON.parse(event.body);
        const existingMessages = await store.get(postRoomId, { type: 'json' }) || [];
        existingMessages.push({
          ...message,
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
        });
        
        await store.setJSON(postRoomId, existingMessages);
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true })
        };
        
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
