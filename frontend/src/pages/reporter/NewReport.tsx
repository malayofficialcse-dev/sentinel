import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileUploader } from '../../components/evidence/FileUploader';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

export const NewReport: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'IMAGE';
  const [activeType, setActiveType] = useState<string>(initialType);

  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to live progress analysis page with simulated state
    navigate('/report/progress', {
      state: {
        type: activeType,
        url,
        message,
        amount,
        paymentMethod,
        fileName: file?.name,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 text-left">
      <div className="border-b border-[#E1DFDD] pb-4">
        <h1 className="text-[24px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
          Submit Suspicious Evidence
        </h1>
        <p className="text-[14px] text-[#605E5C] mt-1">
          Select the type of suspicious content you encountered. Sentinel AI will extract entities and assess risks.
        </p>
      </div>

      {/* Type Selector Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { id: 'IMAGE', label: 'Image', icon: 'image' },
          { id: 'PDF', label: 'PDF File', icon: 'picture_as_pdf' },
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
                ? 'bg-[#EFF6FC] border-[#0078D4] text-[#0078D4] font-bold shadow-xs'
                : 'bg-white border-[#E1DFDD] text-[#605E5C] hover:bg-[#FAFAFA] hover:text-[#242424]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            <span className="text-[12px]">{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E1DFDD] rounded-[4px] p-6 flex flex-col gap-6 shadow-xs">
        {/* Dynamic Evidence Input Section */}
        {activeType === 'URL' ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-[14px] font-bold text-[#242424]">Suspicious URL</h3>
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
            <h3 className="text-[14px] font-bold text-[#242424]">Suspicious Message Text</h3>
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
            <h3 className="text-[14px] font-bold text-[#242424]">Upload Evidence File</h3>
            <FileUploader
              onFileSelect={(f) => setFile(f)}
              acceptedFormats={activeType === 'PDF' ? '.pdf' : '.png, .jpg, .jpeg, .png'}
            />
          </div>
        )}

        {/* Optional Context Inputs */}
        <div className="border-t border-[#E1DFDD] pt-4 flex flex-col gap-4">
          <span className="text-[13px] font-semibold text-[#242424]">Additional Context (Optional)</span>
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
        <div className="bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] p-3 flex items-center gap-2 text-[12px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[#0078D4] text-[18px]">security</span>
          <span>Your submission is analyzed with privacy-preserving NLP and is never shared publicly.</span>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" size="md" type="button" onClick={() => navigate('/reporter')}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" leftIcon={<span className="material-symbols-outlined text-[16px]">analytics</span>}>
            Analyze Evidence
          </Button>
        </div>
      </form>
    </div>
  );
};
