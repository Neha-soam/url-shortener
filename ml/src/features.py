"""URL feature extraction. Pure functions, no network access (safe & fast)."""
import math
import re
from urllib.parse import urlparse

SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "rebrand.ly", "cutt.ly"}
SUSPICIOUS_WORDS = ["login", "verify", "secure", "account", "update", "bank", "paypal", "signin",
                    "confirm", "password", "wallet", "free", "bonus", "support"]
SUSPICIOUS_TLDS = {"xyz", "top", "tk", "ml", "ga", "cf", "gq", "click", "work", "zip", "country"}
IP_RE = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")

FEATURE_NAMES = [
    "url_length", "hostname_length", "path_length", "num_dots", "num_hyphens", "num_digits",
    "digit_ratio", "num_special_chars", "num_subdomains", "num_query_params", "has_ip_host",
    "has_at_symbol", "uses_https", "has_punycode", "is_shortener", "suspicious_word_count",
    "suspicious_tld", "hostname_entropy",
]

# Human-readable text for explanations (each maps 1:1 to a real model feature)
FEATURE_DESCRIPTIONS = {
    "url_length": "Unusually long URL",
    "hostname_length": "Unusually long hostname",
    "path_length": "Unusually long path",
    "num_dots": "Many dots in the URL",
    "num_hyphens": "Many hyphens in the URL",
    "num_digits": "Many digits in the URL",
    "digit_ratio": "High proportion of digits",
    "num_special_chars": "Many special characters",
    "num_subdomains": "Excessive subdomain nesting",
    "num_query_params": "Many query parameters",
    "has_ip_host": "Host is a raw IP address",
    "has_at_symbol": "Contains '@' symbol",
    "uses_https": "Does not use HTTPS",
    "has_punycode": "Punycode (possible lookalike/homograph domain)",
    "is_shortener": "Points to another URL shortener",
    "suspicious_word_count": "Contains phishing-style keywords",
    "suspicious_tld": "Suspicious top-level domain",
    "hostname_entropy": "Random-looking hostname",
}


def _entropy(s: str) -> float:
    if not s:
        return 0.0
    probs = [s.count(c) / len(s) for c in set(s)]
    return -sum(p * math.log2(p) for p in probs)


def extract_features(url: str) -> dict:
    url = (url or "").strip()
    parsed = urlparse(url if "://" in url else "http://" + url)
    host = (parsed.hostname or "").lower()
    path = parsed.path or ""
    parts = host.split(".") if host else []
    lower = url.lower()
    digits = sum(c.isdigit() for c in url)

    return {
        "url_length": len(url),
        "hostname_length": len(host),
        "path_length": len(path),
        "num_dots": url.count("."),
        "num_hyphens": url.count("-"),
        "num_digits": digits,
        "digit_ratio": digits / len(url) if url else 0.0,
        "num_special_chars": sum(not c.isalnum() for c in url),
        "num_subdomains": max(len(parts) - 2, 0),
        "num_query_params": len([p for p in parsed.query.split("&") if p]) if parsed.query else 0,
        "has_ip_host": int(bool(IP_RE.match(host))),
        "has_at_symbol": int("@" in url),
        "uses_https": int(parsed.scheme == "https"),
        "has_punycode": int("xn--" in host),
        "is_shortener": int(host in SHORTENERS),
        "suspicious_word_count": sum(w in lower for w in SUSPICIOUS_WORDS),
        "suspicious_tld": int(bool(parts) and parts[-1] in SUSPICIOUS_TLDS),
        "hostname_entropy": _entropy(host),
    }


def features_vector(url: str) -> list:
    f = extract_features(url)
    return [f[n] for n in FEATURE_NAMES]
