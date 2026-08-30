# -*- coding: utf-8 -*-
"""
Phishing Website Detection - Feature Extraction Module
Extracts 16 address bar, domain, and content-based features from any URL.
"""

from urllib.parse import urlparse
import ipaddress
import re
from datetime import datetime
import requests
import whois
from bs4 import BeautifulSoup

# Top popular legitimate domains (whitelist / high-reputation)
TOP_POPULAR_DOMAINS = {
    'google.com', 'youtube.com', 'facebook.com', 'baidu.com', 'wikipedia.org',
    'yahoo.com', 'amazon.com', 'twitter.com', 'x.com', 'instagram.com',
    'linkedin.com', 'reddit.com', 'netflix.com', 'microsoft.com', 'apple.com',
    'github.com', 'gitlab.com', 'stackoverflow.com', 'bing.com', 'live.com',
    'office.com', 'pinterest.com', 'whatsapp.com', 'zoom.us', 'spotify.com',
    'adobe.com', 'salesforce.com', 'ebay.com', 'dropbox.com', 'cnn.com',
    'nytimes.com', 'bbc.com', 'theguardian.com', 'forbes.com', 'bloomberg.com',
    'reuters.com', 'imdb.com', 'quora.com', 'medium.com', 'tumblr.com',
    'flickr.com', 'twitch.tv', 'vimeo.com', 'soundcloud.com', 'craigslist.org',
    'alipay.com', 'aliexpress.com', 'taobao.com', 'jd.com', 'tencent.com',
    'weibo.com', 'sina.com.cn', 'sohu.com', 'vk.com', 'yandex.ru',
    'mail.ru', 'ok.ru', 'telegram.org', 'discord.com', 'slack.com',
    'trello.com', 'notion.so', 'figma.com', 'canva.com', 'atlassian.com',
    'jira.com', 'bitbucket.org', 'cloudflare.com', 'aws.amazon.com',
    'azure.microsoft.com', 'cloud.google.com', 'oracle.com', 'ibm.com',
    'cisco.com', 'intel.com', 'nvidia.com', 'amd.com', 'qualcomm.com',
    'dell.com', 'hp.com', 'lenovo.com', 'asus.com', 'acer.com',
    'samsung.com', 'sony.com', 'lg.com', 'panasonic.com', 'huawei.com',
    'xiaomi.com', 'oppo.com', 'vivo.com', 'oneplus.com', 'paypal.com',
    'stripe.com', 'square.com', 'visa.com', 'mastercard.com', 'chase.com',
    'bankofamerica.com', 'wellsfargo.com', 'citi.com', 'capitalone.com',
    'americanexpress.com', 'usbank.com', 'fidelity.com', 'vanguard.com',
    'schwab.com', 'robinhood.com', 'coinbase.com', 'binance.com',
    'kraken.com', 'ftx.com', 'gemini.com', 'bitfinex.com', 'bybit.com',
    'leetcode.com', 'hackerrank.com', 'codeforces.com', 'geeksforgeeks.org',
    'w3schools.com', 'mozilla.org', 'apache.org', 'python.org', 'nodejs.org',
    'rust-lang.org', 'golang.org', 'php.net', 'ruby-lang.org', 'kotlinlang.org',
    'swift.org', 'typescriptlang.org', 'reactjs.org', 'vuejs.org',
    'angular.io', 'nextjs.org', 'tailwindcss.com', 'getbootstrap.com',
    'wordpress.org', 'wordpress.com', 'drupal.org', 'joomla.org',
    'shopify.com', 'wix.com', 'squarespace.com', 'godaddy.com', 'namecheap.com',
    'bluehost.com', 'hostgator.com', 'digitalocean.com', 'linode.com',
    'vultr.com', 'heroku.com', 'vercel.com', 'netlify.com', 'render.com',
    'coursera.org', 'edx.org', 'udemy.com', 'udacity.com', 'khanacademy.org',
    'mit.edu', 'stanford.edu', 'harvard.edu', 'berkeley.edu', 'ox.ac.uk',
    'cam.ac.uk', 'nih.gov', 'cdc.gov', 'who.int', 'un.org', 'nasa.gov',
    'europa.eu', 'gov.uk', 'usa.gov', 'ca.gov', 'weather.com', 'accuweather.com'
}

def is_popular_domain(domain):
    domain = domain.lower()
    if domain.startswith("www."):
        domain = domain[4:]
    if domain in TOP_POPULAR_DOMAINS:
        return True
    parts = domain.split('.')
    if len(parts) >= 2:
        root_domain = '.'.join(parts[-2:])
        if root_domain in TOP_POPULAR_DOMAINS:
            return True
    return False

# 1. IP Address in URL (Have_IP)
def havingIP(url):
    try:
        domain = urlparse(url).netloc.split(':')[0]
        ipaddress.ip_address(domain)
        return 1
    except:
        return 0

# 2. "@" Symbol in URL (Have_At)
def haveAtSign(url):
    return 1 if "@" in url else 0

# 3. Length of URL (URL_Length)
def getLength(url):
    return 0 if len(url) < 54 else 1

# 4. Depth of URL (URL_Depth)
def getDepth(url):
    s = urlparse(url).path.split('/')
    return sum(1 for j in range(len(s)) if len(s[j]) != 0)

# 5. Redirection "//" in URL (Redirection)
def redirection(url):
    pos = url.rfind('//')
    if pos > 6:
        return 1 if pos > 7 else 0
    return 0

# 6. "http/https" in Domain name (https_Domain)
def httpDomain(url):
    domain = urlparse(url).netloc.lower()
    return 1 if 'https' in domain else 0

# 7. Using URL Shortening Services "TinyURL"
shortening_services = (
    r"\b(bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl\.com|tinyurl|"
    r"tr\.im|is\.gd|cli\.gs|yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|"
    r"su\.pr|twurl\.nl|snipurl\.com|short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|"
    r"bkite\.com|snipr\.com|fic\.kr|loopt\.us|doiop\.com|short\.ie|kl\.am|wp\.me|"
    r"rubyurl\.com|om\.ly|to\.ly|bit\.do|lnkd\.in|db\.tt|qr\.ae|adf\.ly|bitly\.com|"
    r"cur\.lv|ity\.im|q\.gs|po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|"
    r"cutt\.us|u\.bb|yourls\.org|prettylinkpro\.com|scrnch\.me|filoops\.info|"
    r"vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|link\.zip\.net)\b"
)
def tinyURL(url):
    domain = urlparse(url).netloc.lower()
    return 1 if re.search(shortening_services, domain) or re.search(shortening_services, url) else 0

# 8. Prefix or Suffix "-" in Domain (Prefix/Suffix)
def prefixSuffix(url):
    return 1 if '-' in urlparse(url).netloc else 0

# 9. DNS Record availability (DNS_Record)
def dnsRecord(domain, whois_res):
    if is_popular_domain(domain):
        return 0
    return 1 if whois_res is None else 0

# 10. Web traffic (Web_Traffic)
def webTraffic(domain):
    if is_popular_domain(domain):
        return 0
    return 1

# 11. Survival time of domain (Domain_Age)
def domainAge(domain, whois_res):
    if is_popular_domain(domain):
        return 0
    if whois_res is None:
        return 1
    try:
        creation_date = whois_res.creation_date
        if isinstance(creation_date, list): creation_date = creation_date[0]
        if isinstance(creation_date, str):
            creation_date = datetime.strptime(str(creation_date)[:10], '%Y-%m-%d')
        if creation_date is None:
            return 1
        age_days = abs((datetime.now() - creation_date).days)
        return 1 if (age_days / 30) < 6 else 0
    except:
        return 1

# 12. End time of domain (Domain_End) 
def domainEnd(domain, whois_res):
    if is_popular_domain(domain):
        return 0
    if whois_res is None:
        return 1
    try:
        expiration_date = whois_res.expiration_date
        if isinstance(expiration_date, list): expiration_date = expiration_date[0]
        if isinstance(expiration_date, str):
            expiration_date = datetime.strptime(str(expiration_date)[:10], '%Y-%m-%d')
        if expiration_date is None:
            return 1
        end_days = abs((expiration_date - datetime.now()).days)
        return 1 if (end_days / 30) < 6 else 0
    except:
        return 1

# 13. IFrame Redirection (iFrame)
def iframe(response):
    if not response or not hasattr(response, "text"):
        return 0
    soup = BeautifulSoup(response.text, 'html.parser')
    for ifr in soup.find_all('iframe'):
        style = ifr.get('style', '').lower()
        width = ifr.get('width', '')
        height = ifr.get('height', '')
        if 'display:none' in style or 'visibility:hidden' in style or width == '0' or height == '0':
            return 1
    return 0

# 14. Status Bar Customization (Mouse_Over)
def mouseOver(response):
    if not response or not hasattr(response, "text"):
        return 0
    return 1 if re.search(r"window\.status\s*=|onmouseover\s*=\s*['\"].*status", response.text, re.I) else 0

# 15. Disabling Right Click (Right_Click)
def rightClick(response):
    if not response or not hasattr(response, "text"):
        return 0
    return 1 if re.search(r"event\.button\s*==\s*2|contextmenu\.preventDefault|oncontextmenu\s*=\s*['\"]return false", response.text, re.I) else 0

# 16. Website Forwarding (Web_Forwards)
def forwarding(response):
    if not response or not hasattr(response, "history"):
        return 0
    return 1 if len(response.history) > 2 else 0

# Function to extract all 16 features for any URL
def featureExtraction(url):
    if not url.startswith(('http://', 'https://')):
        url_full = 'http://' + url
    else:
        url_full = url

    domain = urlparse(url_full).netloc.split(':')[0]

    whois_res = None
    if not is_popular_domain(domain):
        try:
            whois_res = whois.whois(domain)
        except:
            whois_res = None

    try:
        response = requests.get(url_full, timeout=3, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    except:
        response = None

    features = []
    features.append(havingIP(url_full))
    features.append(haveAtSign(url_full))
    features.append(getLength(url_full))
    features.append(getDepth(url_full))
    features.append(redirection(url_full))
    features.append(httpDomain(url_full))
    features.append(tinyURL(url_full))
    features.append(prefixSuffix(url_full))
    features.append(dnsRecord(domain, whois_res))
    features.append(webTraffic(domain))
    features.append(domainAge(domain, whois_res))
    features.append(domainEnd(domain, whois_res))
    features.append(iframe(response))
    features.append(mouseOver(response))
    features.append(rightClick(response))
    features.append(forwarding(response))

    return features

feature_names = [
    'Have_IP', 'Have_At', 'URL_Length', 'URL_Depth', 'Redirection', 
    'https_Domain', 'TinyURL', 'Prefix/Suffix', 'DNS_Record', 'Web_Traffic', 
    'Domain_Age', 'Domain_End', 'iFrame', 'Mouse_Over', 'Right_Click', 'Web_Forwards'
]
