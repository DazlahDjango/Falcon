export const reconnect = async (client) => {
    if (client.reconnectAttempts >= client.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        client.isConnecting = false;
        return;
    } 
    const delay = client.reconnectDelay * Math.pow(2, client.reconnectAttempts);
    console.log(`Reconnecting in ${delay}ms... (attempt ${client.reconnectAttempts + 1}/${client.maxReconnectAttempts})`);
    await sleep(delay);
    client.reconnectAttempts++;
    try {
        await client.connect();
    } catch (error) {
        console.error('Reconnection failed:', error);
        reconnect(client);
    }
};
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const calculateBackoff = (attempt, baseDelay = 1000, maxDelay = 30000) => {
    const delay = baseDelay * Math.pow(2, attempt);
    return Math.min(delay, maxDelay);
};

export const resetReconnection = (client) => {
    client.reconnectAttempts = 0;
    client.reconnectDelay = 1000;
};

export const setReconnectionStrategy = (client, strategy) => {
    if (strategy.maxAttempts) client.maxReconnectAttempts = strategy.maxAttempts;
    if (strategy.baseDelay) client.reconnectDelay = strategy.baseDelay;
};