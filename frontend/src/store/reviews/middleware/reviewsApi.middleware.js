// src/store/reviews/middleware/reviewsApi.middleware.js
import { reviewsApiClient } from '../../../services/reviews';

export const reviewsApiMiddleware = (store) => (next) => async (action) => {
  if (!action.meta?.api) {
    return next(action);
  }
  
  const { url, method, data, onSuccess, onError, onFinally } = action.meta.api;
  
  try {
    store.dispatch({ type: `${action.type}_PENDING` });
    
    let response;
    switch (method?.toLowerCase()) {
      case 'get':
        response = await reviewsApiClient.get(url);
        break;
      case 'post':
        response = await reviewsApiClient.post(url, data);
        break;
      case 'put':
        response = await reviewsApiClient.put(url, data);
        break;
      case 'patch':
        response = await reviewsApiClient.patch(url, data);
        break;
      case 'delete':
        response = await reviewsApiClient.delete(url);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    const payload = response.data;
    store.dispatch({ type: `${action.type}_FULFILLED`, payload });
    if (onSuccess) {
      store.dispatch({ type: onSuccess, payload });
    }
  } catch (error) {
    const payload = error.response?.data || error.message;
    store.dispatch({ type: `${action.type}_REJECTED`, payload });
    if (onError) {
      store.dispatch({ type: onError, payload });
    }
  } finally {
    if (onFinally) {
      store.dispatch({ type: onFinally });
    }
    store.dispatch({ type: `${action.type}_FINALLY` });
  }
};