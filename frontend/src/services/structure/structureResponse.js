/**
 * Normalize list responses from BaseStructureService / axios interceptor:
 * { success, data: { results, count, next, previous } } or plain DRF page objects.
 */
export function normalizeStructureResultsArray(response) {
  return normalizeStructureListPage(response).results;
}

export function normalizeStructureListPage(response) {
  const raw =
    response && typeof response === 'object' && response.data !== undefined && !Array.isArray(response.data)
      ? response.data
      : response;
  if (Array.isArray(raw)) {
    return { results: raw, count: raw.length, next: null, previous: null };
  }
  const results = raw?.results ?? raw?.members;
  return {
    results: Array.isArray(results) ? results : [],
    count: raw?.count ?? (Array.isArray(raw?.members) ? raw.members.length : undefined),
    next: raw?.next ?? null,
    previous: raw?.previous ?? null,
  };
}

/** Single-record endpoints: unwrap { success, data: entity } to entity. */
export function normalizeStructureEntity(response) {
  if (response == null) return undefined;
  if (typeof response === 'object' && 'data' in response && response.data !== undefined) {
    return response.data;
  }
  return response;
}
