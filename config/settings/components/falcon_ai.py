"""
Falcon AI Configuration

Central configuration for the Falcon AI engine,
local model inference, knowledge processing,
AI security, and background processing.
"""

# ============================================================
# FALCON AI CORE
# ============================================================

FALCON_AI = {
    "ENABLED": env.bool("FALCON_AI_ENABLED", default=False),

    "VERSION": "v2",

    "NAME": "Falcon AI",

    "DEFAULT_MODEL": env(
        "FALCON_AI_DEFAULT_MODEL",
        default="default"
    ),
}


# ============================================================
# AI REQUEST SETTINGS
# ============================================================

FALCON_AI_REQUEST = {
    "MAX_INPUT_LENGTH": env.int(
        "FALCON_AI_MAX_INPUT_LENGTH",
        default=10000,
    ),

    "MAX_OUTPUT_LENGTH": env.int(
        "FALCON_AI_MAX_OUTPUT_LENGTH",
        default=4000,
    ),

    "REQUEST_TIMEOUT": env.int(
        "FALCON_AI_REQUEST_TIMEOUT",
        default=120,
    ),
}


# ============================================================
# LOCAL MODEL SETTINGS
# ============================================================

FALCON_AI_MODEL = {
    "MODEL_PATH": env(
        "FALCON_AI_MODEL_PATH",
        default="",
    ),

    "DEVICE": env(
        "FALCON_AI_DEVICE",
        default="cpu",
    ),

    "MAX_MEMORY": env(
        "FALCON_AI_MAX_MEMORY",
        default="",
    ),

    "LOAD_ON_STARTUP": env.bool(
        "FALCON_AI_LOAD_ON_STARTUP",
        default=False,
    ),
}


# ============================================================
# INFERENCE SETTINGS
# ============================================================

FALCON_AI_INFERENCE = {
    "ENABLED": env.bool(
        "FALCON_AI_INFERENCE_ENABLED",
        default=True,
    ),

    "MAX_CONCURRENT_REQUESTS": env.int(
        "FALCON_AI_MAX_CONCURRENT_REQUESTS",
        default=5,
    ),

    "QUEUE_ENABLED": env.bool(
        "FALCON_AI_QUEUE_ENABLED",
        default=True,
    ),
}


# ============================================================
# KNOWLEDGE / RETRIEVAL SETTINGS
# ============================================================

FALCON_AI_KNOWLEDGE = {
    "ENABLED": env.bool(
        "FALCON_AI_KNOWLEDGE_ENABLED",
        default=True,
    ),

    "CHUNK_SIZE": env.int(
        "FALCON_AI_CHUNK_SIZE",
        default=1000,
    ),

    "CHUNK_OVERLAP": env.int(
        "FALCON_AI_CHUNK_OVERLAP",
        default=200,
    ),

    "MAX_RETRIEVED_DOCUMENTS": env.int(
        "FALCON_AI_MAX_RETRIEVED_DOCUMENTS",
        default=10,
    ),
}


# ============================================================
# SECURITY
# ============================================================

FALCON_AI_SECURITY = {
    "TENANT_ISOLATION": True,

    "AUDIT_ENABLED": env.bool(
        "FALCON_AI_AUDIT_ENABLED",
        default=True,
    ),

    "STORE_PROMPTS": env.bool(
        "FALCON_AI_STORE_PROMPTS",
        default=True,
    ),

    "STORE_RESPONSES": env.bool(
        "FALCON_AI_STORE_RESPONSES",
        default=True,
    ),
}


# ============================================================
# FEATURE FLAGS
# ============================================================

FALCON_AI_FEATURES = {
    "CHAT": True,
    "KPI_ANALYSIS": True,
    "PERFORMANCE_ANALYSIS": True,
    "PREDICTIONS": False,
    "RECOMMENDATIONS": True,
    "KNOWLEDGE_SEARCH": True,
    "TRAINING": False,
}