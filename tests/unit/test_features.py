import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "ml"))
from src.features import extract_features, features_vector, FEATURE_NAMES


def test_vector_length_matches_names():
    assert len(features_vector("https://example.com")) == len(FEATURE_NAMES)


def test_ip_host_detected():
    assert extract_features("http://192.168.1.1/login")["has_ip_host"] == 1


def test_https_flag():
    assert extract_features("https://example.com")["uses_https"] == 1
    assert extract_features("http://example.com")["uses_https"] == 0


def test_punycode_and_at_symbol():
    f = extract_features("http://xn--pple-43d.com/a@b")
    assert f["has_punycode"] == 1 and f["has_at_symbol"] == 1


def test_handles_empty_and_garbage():
    assert extract_features("")["url_length"] == 0
    extract_features("not a url at all ::::")
