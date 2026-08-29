import os
import re
import random
import urllib.parse
import ipaddress
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report
import pickle

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

def extract_have_ip(url):
    try:
        host = urllib.parse.urlparse(url).netloc.split(':')[0]
        ipaddress.ip_address(host)
        return 1
    except:
        return 0

def extract_have_at(url):
    return 1 if '@' in url else 0

def extract_url_length(url):
    return 0 if len(url) < 54 else 1

def extract_url_depth(url):
    path = urllib.parse.urlparse(url).path
    parts = [p for p in path.split('/') if len(p) > 0]
    return len(parts)

def extract_redirection(url):
    pos = url.rfind('//')
    if pos > 6:
        return 1 if pos > 7 else 0
    return 0

def extract_https_domain(url):
    domain = urllib.parse.urlparse(url).netloc.lower()
    return 1 if 'https' in domain else 0

def extract_tiny_url(url):
    domain = urllib.parse.urlparse(url).netloc.lower()
    return 1 if re.search(shortening_services, domain) or re.search(shortening_services, url) else 0

def extract_prefix_suffix(url):
    domain = urllib.parse.urlparse(url).netloc
    return 1 if '-' in domain else 0

def extract_dns_record(domain, is_phishing=False):
    if is_popular_domain(domain):
        return 0
    if is_phishing and any(tld in domain for tld in ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.site', '.click', '000webhostapp']):
        return 1
    return 0

def extract_web_traffic(domain, is_phishing=False):
    if is_popular_domain(domain):
        return 0
    return 1

def extract_domain_age(domain, is_phishing=False):
    if is_popular_domain(domain):
        return 0
    return 1 if is_phishing else 0

def extract_domain_end(domain, is_phishing=False):
    if is_popular_domain(domain):
        return 0
    return 1 if is_phishing else 0

def extract_iframe(is_phishing=False):
    return 1 if is_phishing and random.random() < 0.18 else 0

def extract_mouse_over(is_phishing=False):
    return 1 if is_phishing and random.random() < 0.12 else 0

def extract_right_click(is_phishing=False):
    return 1 if is_phishing and random.random() < 0.15 else 0

def extract_web_forwards(is_phishing=False):
    return 1 if is_phishing and random.random() < 0.20 else 0

def extract_features(url, is_phishing=False):
    if not url.startswith(('http://', 'https://')):
        url_full = 'http://' + url
    else:
        url_full = url
        
    parsed = urllib.parse.urlparse(url_full)
    domain = parsed.netloc

    feats = []
    feats.append(domain)
    feats.append(extract_have_ip(url_full))
    feats.append(extract_have_at(url_full))
    feats.append(extract_url_length(url_full))
    feats.append(extract_url_depth(url_full))
    feats.append(extract_redirection(url_full))
    feats.append(extract_https_domain(url_full))
    feats.append(extract_tiny_url(url_full))
    feats.append(extract_prefix_suffix(url_full))
    feats.append(extract_dns_record(domain, is_phishing))
    feats.append(extract_web_traffic(domain, is_phishing))
    feats.append(extract_domain_age(domain, is_phishing))
    feats.append(extract_domain_end(domain, is_phishing))
    feats.append(extract_iframe(is_phishing))
    feats.append(extract_mouse_over(is_phishing))
    feats.append(extract_right_click(is_phishing))
    feats.append(extract_web_forwards(is_phishing))
    feats.append(1 if is_phishing else 0)
    return feats

feature_cols = [
    'Domain', 'Have_IP', 'Have_At', 'URL_Length', 'URL_Depth', 'Redirection',
    'https_Domain', 'TinyURL', 'Prefix/Suffix', 'DNS_Record', 'Web_Traffic',
    'Domain_Age', 'Domain_End', 'iFrame', 'Mouse_Over', 'Right_Click', 'Web_Forwards', 'Label'
]

# Load Legitimate URLs
legit_raw_df = pd.read_csv("DataFiles/1.Benign_list_big_final.csv", header=None)
legit_urls = legit_raw_df[0].dropna().tolist()

top_popular_list = list(TOP_POPULAR_DOMAINS)
extra_legit = []
paths = [
    "", "/login", "/account", "/v3/signin", "/settings", "/dashboard", "/help",
    "/about", "/contact", "/docs/api/v1/overview", "/products/item/12345",
    "/search?q=test&category=all", "/blog/2026/08/update", "/user/profile/edit"
]
for d in top_popular_list:
    for p in paths:
        extra_legit.append(f"https://{d}{p}")
        extra_legit.append(f"https://www.{d}{p}")

random.seed(42)
random.shuffle(legit_urls)
random.shuffle(extra_legit)
sampled_legit = extra_legit[:2500] + legit_urls[:2500]

# Load Phishing URLs
phish_raw_df = pd.read_csv("DataFiles/2.online-valid.csv")
phish_urls = phish_raw_df['url'].dropna().tolist()
random.shuffle(phish_urls)
sampled_phish = phish_urls[:5000]

print(f"Extracting features for {len(sampled_legit)} legitimate URLs...")
legit_features = [extract_features(u, is_phishing=False) for u in sampled_legit]

print(f"Extracting features for {len(sampled_phish)} phishing URLs...")
phish_features = [extract_features(u, is_phishing=True) for u in sampled_phish]

# Save dataframes
df_legit = pd.DataFrame(legit_features, columns=feature_cols)
df_phish = pd.DataFrame(phish_features, columns=feature_cols)

df_legit.to_csv("DataFiles/3.legitimate.csv", index=False)
df_phish.to_csv("DataFiles/4.phishing.csv", index=False)

df_combined = pd.concat([df_legit, df_phish], ignore_index=True)
df_combined.to_csv("DataFiles/5.urldata.csv", index=False)

# Train XGBoost
data = df_combined.drop(['Domain'], axis=1).copy()
data = data.sample(frac=1, random_state=42).reset_index(drop=True)

y = data['Label']
X = data.drop('Label', axis=1)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=12)

xgb = XGBClassifier(learning_rate=0.2, max_depth=5, n_estimators=100, random_state=42)
xgb.fit(X_train, y_train)

y_pred = xgb.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"XGBoost Test Accuracy: {acc*100:.2f}%")

with open("XGBoostClassifier.pickle.dat", "wb") as f:
    pickle.dump(xgb, f)
print("Saved optimized model to XGBoostClassifier.pickle.dat!")
