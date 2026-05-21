"""Shared WebSocket helpers for accounts consumers."""


def get_scope_user(scope):
    user = scope.get('user')
    if user is not None and getattr(user, 'is_authenticated', False):
        return user
    return None


def extract_token_from_scope(scope) -> str:
    query_string = scope.get('query_string', b'')
    if isinstance(query_string, bytes):
        query_string = query_string.decode()
    if not query_string:
        return ''
    if 'token=' in query_string:
        for part in query_string.split('&'):
            if part.startswith('token='):
                return part.split('=', 1)[1]
    return query_string.strip()
