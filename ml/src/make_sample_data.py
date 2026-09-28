"""Generates a SYNTHETIC placeholder dataset so the pipeline runs end-to-end.

!! Models trained on this data are NOT meaningful. Replace data/raw/urls.csv with a real,
!! labelled dataset (columns: url,label  where label 1 = phishing/malicious, 0 = benign)
!! e.g. from PhishTank / OpenPhish (phishing) + Tranco top sites (benign), then re-train.
"""
import os
import random
import pandas as pd

random.seed(42)
BENIGN_HOSTS = ["google.com", "github.com", "wikipedia.org", "amazon.com", "stackoverflow.com",
                "nytimes.com", "bbc.co.uk", "youtube.com", "medium.com", "reddit.com", "python.org"]
BENIGN_PATHS = ["", "/", "/about", "/docs/getting-started", "/blog/2024/how-to-cache", "/search?q=redis",
                "/products/item123", "/wiki/URL_shortening", "/questions/12345/mongo-index"]
BAD_WORDS = ["login", "verify", "secure", "account", "update", "paypal", "bank", "signin", "confirm"]
BAD_TLDS = ["xyz", "top", "tk", "click", "work", "ml"]


def rand_str(n):
    return "".join(random.choice("abcdefghijklmnopqrstuvwxyz0123456789") for _ in range(n))


def benign():
    return f"{random.choice(['https', 'https', 'http'])}://{'www.' if random.random() < .5 else ''}" \
           f"{random.choice(BENIGN_HOSTS)}{random.choice(BENIGN_PATHS)}{'/' + rand_str(random.randint(3, 10)) if random.random() < .6 else ''}"


def phishing():
    kind = random.random()
    w1, w2 = random.choice(BAD_WORDS), random.choice(BAD_WORDS)
    if kind < .25:
        host = ".".join(str(random.randint(1, 254)) for _ in range(4))
        return f"http://{host}/{w1}/{rand_str(8)}.php?id={random.randint(1000, 99999)}"
    if kind < .5:
        return f"http://{w1}-{w2}.{rand_str(random.randint(6, 14))}.{random.choice(BAD_TLDS)}/{w2}?session={rand_str(16)}"
    if kind < .75:
        return f"https://{w1}.{random.choice(['paypal', 'amazon', 'google'])}.{rand_str(6)}-{w2}.{random.choice(BAD_TLDS)}/{rand_str(20)}"
    return f"http://xn--{rand_str(8)}.com/{w1}@{rand_str(6)}/{w2}"


if __name__ == "__main__":
    n = 3000
    rows = [(benign(), 0) for _ in range(int(n * .8))] + [(phishing(), 1) for _ in range(int(n * .2))]  # imbalanced on purpose
    df = pd.DataFrame(rows, columns=["url", "label"]).sample(frac=1, random_state=42)
    os.makedirs("data/raw", exist_ok=True)
    df.to_csv("data/raw/urls.csv", index=False)
    print(f"wrote data/raw/urls.csv ({len(df)} rows, SYNTHETIC)")
