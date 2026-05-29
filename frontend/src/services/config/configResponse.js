/**
 * Normalize config API client responses ({ success, data } envelope or raw DRF payload).
 */
export function unwrapConfigEnvelope(response) {
  if (response == null) return null;
  if (typeof response !== 'object') return response;
  if (response.success === true && response.data !== undefined) {
    return response.data;
  }
  return response;
}

export function unwrapConfigList(response) {
  const body = unwrapConfigEnvelope(response);
  if (Array.isArray(body)) return { results: body, count: body.length };
  if (body && Array.isArray(body.results)) {
    return { results: body.results, count: body.count ?? body.results.length };
  }
  return { results: [], count: 0 };
}

export function getConfigErrorMessage(error, fallback = 'Request failed') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string') return error.message;
  return fallback;
}
