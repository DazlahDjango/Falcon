import { request, upload, setupAxiosInterceptors } from '../../api/accountsClient';
import { apiClient as accountsApiClient } from '../../api/accountsClient';

export { accountsApiClient, request, upload, setupAxiosInterceptors };
export default accountsApiClient;