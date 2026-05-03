class ForceCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Force CORS headers on all responses
        response["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "accept, authorization, content-type, x-tenant-id, x-requested-with"
        
        # Handle preflight requests
        if request.method == "OPTIONS":
            response["Access-Control-Max-Age"] = "86400"
            response.status_code = 200
            
        return response