"""Shared WebSocket helpers for accounts consumers."""

from urllib.parse import parse_qs


def get_scope_user(scope):
    user = scope.get('user')
    if user is not None and getattr(user, 'is_authenticated', False):
        return user
    return None


def extract_token_from_scope(scope) -> str:
    query_string = scope.get('query_string', b'')
    if isinstance(query_string, bytes):
        query_string = query_string.decode(errors='ignore')

    if query_string:
        params = parse_qs(query_string)
        token_values = params.get('token') or params.get('access_token') or []
        if token_values:
            return token_values[0]

    headers = scope.get('headers', [])
    for name, value in headers:
        if isinstance(name, bytes):
            name = name.decode(errors='ignore').lower()
        if name == 'authorization' and value:
            if isinstance(value, bytes):
                value = value.decode(errors='ignore')
            if value.lower().startswith('bearer '):
                return value.split(' ', 1)[1]
            if value.lower().startswith('token '):
                return value.split(' ', 1)[1]
            return value.strip()

    return ''
