from typing import Optional, Tuple

from .config import settings

try:
    import google.generativeai as genai  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    genai = None  # type: ignore


def is_gemini_configured() -> bool:
    return bool(settings.gemini_api_key) and genai is not None


def generate_gemini_text(prompt: str, model_name: str = "gemini-1.5-flash") -> Tuple[Optional[str], Optional[str]]:
    """Returns (text, error). When not configured, returns (None, reason)."""
    if not is_gemini_configured():
        return None, "Gemini not configured"
    try:
        genai.configure(api_key=settings.gemini_api_key)  # type: ignore
        model = genai.GenerativeModel(model_name)  # type: ignore
        response = model.generate_content(prompt)  # type: ignore
        text = getattr(response, "text", None)
        return text or None, None
    except Exception as exc:  # pragma: no cover
        return None, str(exc)


