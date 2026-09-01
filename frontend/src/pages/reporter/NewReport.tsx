import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileUploader } from '../../components/evidence/FileUploader';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { caseApi } from '../../services/caseApi';
import { evidenceApi } from '../../services/evidenceApi';

export const NewReport: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'IMAGE';
  const [activeType, setActiveType] = useState<string>(initialType);

  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setProgressStatus('Creating case record…');
    try {
      const caseTitle = files.length > 1
        ? `${activeType} Multi-Evidence Submission (${files.length} items)`
        : `${activeType} Evidence Submission`;

      const created = await caseApi.createCase(caseTitle, notes);

      if (files.length > 0) {
        setProgressStatus(`Uploading and performing AI OCR & graph correlation across ${files.length} evidence file(s)…`);
        await evidenceApi.uploadFiles(created.id, files);
      } else {
        setProgressStatus('Running AI investigation pipeline on text context…');
        await caseApi.investigate(created.id, {
          extracted_text: [url, message, amount ? `Amount: ₹${amount}` : '', paymentMethod ? `Payment Method: ${paymentMethod}` : '', notes].filter(Boolean).join('\n'),
          entities: [],
          transactions: [],
          qr_codes: []
        });
      }

      navigate(`/investigator/cases/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backend unavailable');
    } finally {
      setSubmitting(false);
      setProgressStatus(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 text-left py-6 px-4">
      <div className="border-b border-[var(--border)] pb-4">
        <h1 className="text-[24px] font-bold text-[var(--text-primary)] font-['Libre_Franklin',sans-serif]">
          Submit Suspicious Evidence
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1">
          Select the type of content you encountered. Upload single or multiple images/documents simultaneously. Sentinel AI will extract all IOCs, correlate transactions, and map entity relationships.
        </p>
      </div>

      {/* Type Selector Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { id: 'IMAGE', label: 'Images', icon: 'collections' },
          { id: 'PDF', label: 'PDF Files', icon: 'picture_as_pdf' },
          { id: 'URL', label: 'Website Link', icon: 'link' },
          { id: 'MESSAGE', label: 'Text Msg', icon: 'chat' },
          { id: 'QR_CODE', label: 'QR Code', icon: 'qr_code_scanner' },
          { id: 'TRANSACTION', label: 'Transaction', icon: 'receipt_long' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveType(tab.id)}
            className={`p-3 rounded-[4px] border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeType === tab.id
                ? 'bg-[var(--info-bg)] border-[var(--primary)] text-[var(--primary)] font-bold shadow-xs'
                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            <span className="text-[12px]">{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-6 flex flex-col gap-6 shadow-xs transition-colors">
        {/* Dynamic Evidence Input Section */}
        {activeType === 'URL' ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-[14px] font-bold text-[var(--text-primary)]">Suspicious URL</h3>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example-suspicious-bank-login.com"
              required
              leftIcon={<span className="material-symbols-outlined text-[18px]">link</span>}
              helperText="Paste the full link exactly as received in SMS, email, or social media."
            />
          </div>
        ) : activeType === 'MESSAGE' ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-[14px] font-bold text-[var(--text-primary)]">Suspicious Message Text</h3>
            <Textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste suspicious WhatsApp, SMS, or email text here..."
              required
              helperText="Include phone numbers, UPI IDs, or instructions sent by the sender."
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[var(--text-primary)]">
                Upload Evidence Files (Multiple Supported)
              </h3>
              {files.length > 0 && (
                <span className="text-[12px] font-semibold text-[var(--primary)] bg-[var(--info-bg)] border border-[var(--info-border)] px-2 py-0.5 rounded">
                  {files.length} file{files.length > 1 ? 's' : ''} ready
                </span>
              )}
            </div>
            <FileUploader
              multiple={true}
              onFilesSelect={(fList) => setFiles(fList)}
              acceptedFormats={activeType === 'PDF' ? '.pdf' : '.png, .jpg, .jpeg, .webp, .pdf, .txt'}
            />
          </div>
        )}

        {/* Optional Context Inputs */}
        <div className="border-t border-[var(--border)] pt-4 flex flex-col gap-4">
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">Additional Context (Optional)</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Approximate Amount (if asked to pay)"
              placeholder="₹ 45,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              label="Payment Method / App Mentioned"
              placeholder="Google Pay / PhonePe / NEFT"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>
          <Textarea
            label="Additional Notes / What happened?"
            rows={2}
            placeholder="E.g. The caller claimed my electricity connection would be disconnected tonight..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Privacy Card */}
        <div className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[4px] p-3 flex items-center gap-2 text-[12px] text-[var(--text-secondary)] transition-colors">
          <span className="material-symbols-outlined text-[var(--primary)] text-[18px]">security</span>
          <span>Your submission is analyzed with privacy-preserving OCR & AI entity correlation and is never shared publicly.</span>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {error ? (
            <p className="text-[12px] text-[var(--danger)] bg-[var(--danger-bg)] border border-[var(--danger-border)] px-3 py-1.5 rounded-[4px]">{error}</p>
          ) : progressStatus ? (
            <p className="text-[12px] text-[var(--primary)] flex items-center gap-1.5 font-medium animate-pulse">
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              {progressStatus}
            </p>
          ) : <div />}

          <div className="flex items-center gap-3 ml-auto">
            <Button variant="secondary" size="md" type="button" onClick={() => navigate('/reporter')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={submitting}
              leftIcon={<span className="material-symbols-outlined text-[16px]">analytics</span>}
            >
              {submitting ? (files.length > 1 ? `Analyzing ${files.length} Evidence Files…` : 'Analyzing…') : 'Analyze Evidence'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
