# from urllib.parse import urlparse


# class URLService:

#     async def analyze(
#         self,
#         url: str
#     ) -> dict:

#         parsed = urlparse(url)

#         indicators = []

#         if parsed.scheme not in {
#             "http",
#             "https"
#         }:

#             indicators.append({
#                 "type": "INVALID_URL",
#                 "severity": "MEDIUM",
#                 "confidence": 0.95
#             })

#         return {
#             "url": url,
#             "domain": parsed.hostname,
#             "indicators": indicators
#         }





import re
import ipaddress
from urllib.parse import urlparse


def is_ip_address(hostname: str) -> int:

    if not hostname:
        return 0

    try:
        ipaddress.ip_address(hostname)
        return 1

    except ValueError:
        return 0


def count_subdomains(hostname: str) -> int:

    if not hostname:
        return 0

    parts = hostname.split(".")

    if len(parts) <= 2:
        return 0

    return len(parts) - 2


def extract_url_features(url: str) -> dict:

    original_url = url.strip()

    # Add scheme if user enters example.com
    if not re.match(
        r"^[a-zA-Z][a-zA-Z0-9+.-]*://",
        original_url
    ):
        url_for_parse = "http://" + original_url
    else:
        url_for_parse = original_url

    parsed = urlparse(url_for_parse)

    hostname = parsed.hostname or ""

    path = parsed.path or ""

    query = parsed.query or ""

    fragment = parsed.fragment or ""

    # -------------------------
    # URL FEATURES
    # -------------------------

    url_length = len(original_url)

    domain_length = len(hostname)

    letters_in_url = sum(
        character.isalpha()
        for character in original_url
    )

    digits_in_url = sum(
        character.isdigit()
        for character in original_url
    )

    equals_count = original_url.count("=")

    question_count = original_url.count("?")

    ampersand_count = original_url.count("&")

    special_characters = set(
        "@!#$%^*()_+-=[]{}|;:',<>"
    )

    other_special_characters = sum(
        character in special_characters
        for character in original_url
    )

    domain_letters = sum(
        character.isalpha()
        for character in hostname
    )

    domain_digits = sum(
        character.isdigit()
        for character in hostname
    )

    path_length = len(path)

    is_https = int(
        parsed.scheme.lower() == "https"
    )

    domain_is_ip = is_ip_address(hostname)

    number_of_subdomains = count_subdomains(
        hostname
    )

    # -------------------------
    # PORT
    # -------------------------

    try:
        has_port = int(
            parsed.port is not None
        )
    except ValueError:
        has_port = 0

    # -------------------------
    # URL SHORTENERS
    # -------------------------

    shortening_domains = {
        "bit.ly",
        "tinyurl.com",
        "t.co",
        "goo.gl",
        "ow.ly",
        "is.gd",
        "buff.ly",
        "cutt.ly",
        "shorturl.at"
    }

    is_shortened_url = int(
        hostname.lower()
        in shortening_domains
    )

    # -------------------------
    # SUSPICIOUS WORDS
    # -------------------------

    suspicious_words = [
        "login",
        "verify",
        "verification",
        "secure",
        "account",
        "update",
        "confirm",
        "password",
        "signin",
        "bank",
        "paypal",
        "wallet",
        "recover",
        "authentication"
    ]

    url_lower = original_url.lower()

    suspicious_word_count = sum(
        word in url_lower
        for word in suspicious_words
    )

    # -------------------------
    # OTHER FEATURES
    # -------------------------

    has_at_symbol = int(
        "@" in original_url
    )

    hyphen_count = original_url.count("-")

    dot_count = original_url.count(".")

    # -------------------------
    # FINAL FEATURE DICTIONARY
    # -------------------------

    features = {

        "URLLength":
            url_length,

        "DomainLength":
            domain_length,

        "IsDomainIP":
            domain_is_ip,

        "NoOfSubDomain":
            number_of_subdomains,

        "NoOfLettersInURL":
            letters_in_url,

        "NoOfDigitsInURL":
            digits_in_url,

        "NoOfEqualsInURL":
            equals_count,

        "NoOfQMarkInURL":
            question_count,

        "NoOfAmpersandInURL":
            ampersand_count,

        "NoOfOtherSpecialCharsInURL":
            other_special_characters,

        "NoOfLettersInDomain":
            domain_letters,

        "NoOfDigitsInDomain":
            domain_digits,

        "PathLength":
            path_length,

        "IsHTTPS":
            is_https,

        "HasPort":
            has_port,

        "IsShortenedURL":
            is_shortened_url,

        "SuspiciousWordCount":
            suspicious_word_count,

        "HasAtSymbol":
            has_at_symbol,

        "HyphenCount":
            hyphen_count,

        "DotCount":
            dot_count,

        "QueryLength":
            len(query),

        "FragmentLength":
            len(fragment),
    }

    return features