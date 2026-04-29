import environment from './environment';
import apiConfig from './api.config';
import websocketConfig from './websocket.config';
import appConfig from './app.config';
const config = {
    env: environment,
    api: apiConfig,
    websocket: websocketConfig,
    app: appConfig,
};
export default config;