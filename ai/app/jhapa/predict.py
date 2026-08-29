"""
Phishing Website Detection - Standalone Live URL Predictor
Run via command line or import into Python scripts / notebooks.
Example:
    python predict.py "https://www.google.com"
"""

import sys
import os
import re
import pickle
import requests
import ipaddress
import whois
import urllib.parse
from datetime import datetime
from bs4 import BeautifulSoup
import pandas as pd

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
        domain = urllib.parse.urlparse(url).netloc.split(':')[0]
        ipaddress.ip_address(domain)
        return 1
    except:
        return 0

# 2. '@' Symbol in URL (Have_At)
def haveAtSign(url):
    return 1 if '@' in url else 0

# 3. URL Length (URL_Length): >= 54 -> Suspicious (1)
def getLength(url):
    return 0 if len(url) < 54 else 1

# 4. URL Depth (URL_Depth)
def getDepth(url):
    path_parts = urllib.parse.urlparse(url).path.split('/')
    return sum(1 for part in path_parts if len(part) > 0)

# 5. Redirection '//' in URL (Redirection)
def redirection(url):
    pos = url.rfind('//')
    if pos > 6:
        return 1 if pos > 7 else 0
    return 0

# 6. 'https' in Domain (https_Domain)
def httpDomain(url):
    domain = urllib.parse.urlparse(url).netloc.lower()
    return 1 if 'https' in domain else 0

# 7. TinyURL / Shortening Service (TinyURL) with word boundary checks
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
    domain = urllib.parse.urlparse(url).netloc.lower()
    return 1 if re.search(shortening_services, domain) or re.search(shortening_services, url) else 0

# 8. Prefix or Suffix '-' in Domain (Prefix/Suffix)
def prefixSuffix(url):
    domain = urllib.parse.urlparse(url).netloc
    return 1 if '-' in domain else 0

# 9. WHOIS DNS Record
def getDNSRecord(domain, whois_res):
    if is_popular_domain(domain):
        return 0
    if whois_res is None:
        return 1
    return 0

# 10. Web Traffic Rank
def getWebTraffic(domain):
    if is_popular_domain(domain):
        return 0 # High traffic (Safe)
    return 1 # Unranked / Suspicious

# 11. Domain Age (Domain_Age): < 6 months is 1 (Suspicious), >= 6 months is 0 (Safe)
def getDomainAge(domain, whois_res):
    if is_popular_domain(domain):
        return 0
    if whois_res is None:
        return 1
    try:
        creation_date = whois_res.creation_date
        expiration_date = whois_res.expiration_date
        if isinstance(creation_date, list): creation_date = creation_date[0]
        if isinstance(expiration_date, list): expiration_date = expiration_date[0]
        if isinstance(creation_date, str):
            creation_date = datetime.strptime(str(creation_date)[:10], '%Y-%m-%d')
        if isinstance(expiration_date, str):
            expiration_date = datetime.strptime(str(expiration_date)[:10], '%Y-%m-%d')
        if creation_date is None or expiration_date is None:
            return 1
        age_days = abs((datetime.now() - creation_date).days)
        return 1 if (age_days / 30) < 6 else 0
    except:
        return 1

# 12. Domain End Period (Domain_End)
def getDomainEnd(domain, whois_res):
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
        remaining_days = abs((expiration_date - datetime.now()).days)
        return 1 if (remaining_days / 30) < 6 else 0
    except:
        return 1

# 13. Hidden iFrame Redirection (iFrame)
def checkIframe(response):
    if not response or not hasattr(response, 'text'):
        return 0
    # Checks for hidden or zero dimension iframes
    soup = BeautifulSoup(response.text, 'html.parser')
    for ifr in soup.find_all('iframe'):
        style = ifr.get('style', '').lower()
        width = ifr.get('width', '')
        height = ifr.get('height', '')
        if 'display:none' in style or 'visibility:hidden' in style or width == '0' or height == '0':
            return 1
    return 0

# 14. Status Bar Customization (Mouse_Over)
def checkMouseOver(response):
    if not response or not hasattr(response, 'text'):
        return 0
    return 1 if re.search(r"window\.status\s*=|onmouseover\s*=\s*['\"].*status", response.text, re.I) else 0

# 15. Disabling Right Click (Right_Click)
def checkRightClick(response):
    if not response or not hasattr(response, 'text'):
        return 0
    return 1 if re.search(r"event\.button\s*==\s*2|contextmenu\.preventDefault|oncontextmenu\s*=\s*['\"]return false", response.text, re.I) else 0

# 16. Website Forwarding (Web_Forwards)
def checkForwarding(response):
    if not response or not hasattr(response, 'history'):
        return 0
    return 1 if len(response.history) > 2 else 0

feature_descriptions = {
    'Have_IP': 'Contains IP address instead of domain name',
    'Have_At': 'Contains "@" symbol in URL',
    'URL_Length': 'URL length is >= 54 characters',
    'URL_Depth': 'Number of sub-directories in URL path',
    'Redirection': 'Contains redirection "//" in path',
    'https_Domain': 'Contains "https" token in domain name',
    'TinyURL': 'Uses URL shortening service',
    'Prefix/Suffix': 'Contains prefix/suffix hyphen "-" in domain',
    'DNS_Record': 'WHOIS DNS record not found or inaccessible',
    'Web_Traffic': 'Domain web traffic popularity rank',
    'Domain_Age': 'Domain survival age < 6 months',
    'Domain_End': 'Domain remaining registration time < 6 months',
    'iFrame': 'Uses hidden or zero-dimension iFrame',
    'Mouse_Over': 'Uses onMouseOver status bar modification',
    'Right_Click': 'Disables right-click context menu via JavaScript',
    'Web_Forwards': 'Redirected more than 2 times'
}

feature_cols = [
    'Have_IP', 'Have_At', 'URL_Length', 'URL_Depth', 'Redirection',
    'https_Domain', 'TinyURL', 'Prefix/Suffix', 'DNS_Record', 'Web_Traffic',
    'Domain_Age', 'Domain_End', 'iFrame', 'Mouse_Over', 'Right_Click', 'Web_Forwards'
]

def extract_features_from_url(url):
    if not url.startswith(('http://', 'https://')):
        url_full = 'http://' + url
    else:
        url_full = url
        
    parsed = urllib.parse.urlparse(url_full)
    domain = parsed.netloc.split(':')[0]

    # WHOIS Lookup
    whois_res = None
    if not is_popular_domain(domain):
        try:
            whois_res = whois.whois(domain)
        except:
            whois_res = None

    # HTTP Response
    try:
        response = requests.get(url_full, timeout=3, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    except:
        response = None

    feats = {}
    feats['Have_IP'] = havingIP(url_full)
    feats['Have_At'] = haveAtSign(url_full)
    feats['URL_Length'] = getLength(url_full)
    feats['URL_Depth'] = getDepth(url_full)
    feats['Redirection'] = redirection(url_full)
    feats['https_Domain'] = httpDomain(url_full)
    feats['TinyURL'] = tinyURL(url_full)
    feats['Prefix/Suffix'] = prefixSuffix(url_full)
    feats['DNS_Record'] = getDNSRecord(domain, whois_res)
    feats['Web_Traffic'] = getWebTraffic(domain)
    feats['Domain_Age'] = getDomainAge(domain, whois_res)
    feats['Domain_End'] = getDomainEnd(domain, whois_res)
    feats['iFrame'] = checkIframe(response)
    feats['Mouse_Over'] = checkMouseOver(response)
    feats['Right_Click'] = checkRightClick(response)
    feats['Web_Forwards'] = checkForwarding(response)

    return feats

def predict_phishing_url(url, model_file="XGBoostClassifier.pickle.dat"):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, model_file)
    
    with open(model_path, "rb") as f:
        model = pickle.load(f)

    feature_dict = extract_features_from_url(url)
    df_feat = pd.DataFrame([[feature_dict[col] for col in feature_cols]], columns=feature_cols)
    
    prediction = model.predict(df_feat)[0]
    probabilities = model.predict_proba(df_feat)[0] if hasattr(model, 'predict_proba') else None
    
    print("=" * 80)
    print("                      PHISHING URL DETECTION REPORT")
    print("=" * 80)
    print(f"Target URL : {url}")
    print(f"Domain     : {urllib.parse.urlparse(url if url.startswith(('http://', 'https://')) else 'http://' + url).netloc}")
    print("-" * 80)
    
    if prediction == 1:
        print(" RESULT: [!] PHISHING WEBSITE DETECTED (High Risk / Malicious)")
    else:
        print(" RESULT: [OK] LEGITIMATE WEBSITE (Safe)")
        
    if probabilities is not None:
        print(f" Confidence Score: Legitimate: {probabilities[0]*100:.2f}% | Phishing: {probabilities[1]*100:.2f}%")
    print("-" * 80)
    
    print(f"{'Feature':<16} | {'Value':<6} | {'Status':<14} | {'Description'}")
    print("-" * 80)
    for col in feature_cols:
        val = feature_dict[col]
        if col == 'URL_Depth':
            status = f"{val} levels"
        else:
            status = "[!] Suspicious" if val == 1 else "[OK] Safe"
        desc = feature_descriptions.get(col, "")
        print(f"{col:<16} | {str(val):<6} | {status:<14} | {desc}")
    print("=" * 80)
    
    return {
        "url": url,
        "prediction": int(prediction),
        "result": "Phishing" if prediction == 1 else "Legitimate",
        "probabilities": {"Legitimate": float(probabilities[0]), "Phishing": float(probabilities[1])} if probabilities is not None else None,
        "features": feature_dict
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url_input = sys.argv[1]
    else:
        url_input = input("Enter website URL to analyze: ").strip()
    
    if url_input:
        predict_phishing_url(url_input)
    else:
        print("No URL provided. Exiting.")
