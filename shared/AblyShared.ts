// Create the client
const Ably = require('ably');
const ably = new Ably.Realtime('uD5hig.Umu1Uw:MXpW0HpG6YsRJMDGzeTaNErUGQUTFgO7t7DxJQRtk3E');

// Connect to Ably
ably.connection.on('connected', () => {
  console.log('Connected to Ably Ably Shared!');
});


// Get the channel to connect to
const channel = ably.channels.get('quickstart');

// Subscribe to the channel TEST
channel.subscribe('greeting', (message) => {
  console.log(`Received a greeting message in realtime: ${message.data}`);
});

// Publish a message TEST
export async function Publish() {
    channel.publish('greeting', 'message');
}

export async function PublishNotification(ToChannel: string, message: string) {
  // Publish a message
  channel.publish(ToChannel, message);
}
// Register connection close callback
/*ably.connection.on('closed', () => {
  console.log('Closed the connection to Ably SHARED.');
});

// wait 2s to receive all messages and then shut down
setTimeout(() => {
  // Close the connection
  ably.connection.close();
}, 2000);*/

