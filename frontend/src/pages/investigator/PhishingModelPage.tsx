import React, { useState } from 'react';
import { modelApi, PhishingPredictResponse } from '../../services/modelApi';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RiskBadge } from '../../components/ui/Badge';

export const PhishingModelPage: React.FC = () => {
  const [url, setUrl] = useState('https://bit.ly/sbi-kyc-verification-login');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhishingPredictResponse | null>(null);

  const sampleUrls = [
    { label: '🔴 Fake Bank KYC (Phish)', value: 'https://bit.ly/sbi-kyc-verification-login' },
    { label: '🔴 IP Address Hostname', value: 'http://192.168.1.100:8080/secure/update-profile' },
    { label: '🟠 PayPal Spoof Domain', value: 'https://paypal-security-verification.com/login' },
    { label: '🟢 Legitimate Official Portal', value: 'https://www.onlinesbi.sbi/portal/index.html' },
  ];

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const data = await modelApi.predictPhishing(url.trim());
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1DFDD] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-[4px] bg-[#EFF6FC] text-[#0078D4] uppercase tracking-wider">
              AI Model 1
            </span>
            <span className="text-[11px] text-[#605E5C] font-mono">url_model.pkl (22 Features)</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
            Phishing & Malicious URL Classifier
          </h1>
          <p className="text-[13px] text-[#605E5C]">
            Structural & lexical feature extraction with machine learning classification for fraudulent domains and phishing attacks.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 border border-[#E1DFDD] rounded-[6px] shadow-xs">
          <div className="text-right">
            <span className="text-[11px] text-[#605E5C] block">Model Accuracy</span>
            <span className="font-bold text-[16px] text-[#107C10]">96.5%</span>
          </div>
          <div className="h-8 w-[1px] bg-[#E1DFDD]"></div>
          <div className="text-right">
            <span className="text-[11px] text-[#605E5C] block">Feature Vector</span>
            <span className="font-bold text-[16px] text-[#242424]">22 Dims</span>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-[#E1DFDD] rounded-[8px] p-5 shadow-xs flex flex-col gap-4">
        <h2 className="text-[15px] font-bold text-[#242424]">URL Security Inspector</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Enter suspicious URL (e.g. https://example.com/login)..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            />
          </div>
          <Button variant="primary" onClick={handleScan} disabled={loading} className="min-w-[140px]">
            {loading ? 'Evaluating...' : 'Run ML Scan'}
          </Button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F3F2F1]">
          <span className="text-[11px] text-[#605E5C] font-semibold">Test Presets:</span>
          {sampleUrls.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setUrl(sample.value)}
              className="text-[11px] px-2.5 py-1 bg-[#F3F2F1] hover:bg-[#E1DFDD] text-[#242424] rounded-[4px] font-medium transition-colors cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Main Verdict Card */}
          <div
            className={`border rounded-[8px] p-6 shadow-xs ${
              result.is_phishing
                ? 'bg-[#FFF4F4] border-[#FDE7E9]'
                : 'bg-[#F4FFF4] border-[#DFF6DD]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-[28px] font-bold ${
                    result.is_phishing ? 'bg-[#D13438] text-white' : 'bg-[#107C10] text-white'
                  }`}
                >
                  {result.is_phishing ? '!' : '✓'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[20px] font-bold text-[#242424]">
                      {result.is_phishing ? 'PHISHING / MALICIOUS DETECTED' : 'LEGITIMATE / BENIGN URL'}
                    </h3>
                    <RiskBadge risk={result.risk.level} size="md" />
                  </div>
                  <p className="text-[13px] text-[#605E5C] font-mono mt-1 break-all">{result.url}</p>
                </div>
              </div>

              {/* Probability Meter */}
              <div className="bg-white p-4 border border-[#E1DFDD] rounded-[6px] flex items-center gap-6 min-w-[240px] justify-between">
                <div>
                  <span className="text-[11px] text-[#605E5C] uppercase font-bold block">Phishing Risk</span>
                  <span
                    className={`text-[26px] font-bold font-mono ${
                      result.risk.score >= 60 ? 'text-[#D13438]' : result.risk.score >= 30 ? 'text-[#CA5010]' : 'text-[#107C10]'
                    }`}
                  >
                    {result.risk.score}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#605E5C] uppercase font-bold block">Probability</span>
                  <span className="text-[14px] font-mono text-[#242424]">
                    {(result.phishing_probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Reasons / Explanation List */}
            {result.reasons && result.reasons.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[rgba(0,0,0,0.08)]">
                <span className="text-[12px] font-bold text-[#242424] block mb-2">Model Decision Explanations:</span>
                <div className="flex flex-col gap-1.5">
                  {result.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[12px] text-[#444]">
                      <span className="text-[#0078D4] font-bold">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 22 Features Grid */}
          {result.features && (
            <div className="bg-white border border-[#E1DFDD] rounded-[8px] p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[15px] font-bold text-[#242424]">Extracted ML Feature Vector</h3>
                  <p className="text-[12px] text-[#605E5C]">22 numerical attributes parsed from the URL string</p>
                </div>
                <span className="text-[11px] font-mono bg-[#F3F2F1] px-2 py-1 rounded-[4px] text-[#605E5C]">
                  {Object.keys(result.features).length} Features Extracted
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(result.features).map(([key, val]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-[6px] border ${
                      val > 0 && ['IsDomainIP', 'HasAtSymbol', 'IsShortenedURL', 'SuspiciousWordCount'].includes(key)
                        ? 'bg-[#FFF4F4] border-[#FDE7E9]'
                        : 'bg-[#FAFAFA] border-[#E1DFDD]'
                    }`}
                  >
                    <span className="text-[11px] text-[#605E5C] block truncate" title={key}>
                      {key}
                    </span>
                    <span className="text-[16px] font-mono font-bold text-[#242424] mt-0.5 block">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
