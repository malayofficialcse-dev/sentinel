import { URL } from 'url';

export function normalizeEntity(type: string, value: string): string {
  const input = value.trim();
  switch (type.toUpperCase()) {
    case 'PHONE': return input.replace(/[^0-9+]/g, '').replace(/^\+91/, '');
    case 'EMAIL': case 'UPI': case 'DOMAIN': return input.toLowerCase();
    case 'URL': try { const url = new URL(input.includes('://') ? input : `https://${input}`); return url.toString().toLowerCase().replace(/\/$/, ''); } catch { return input.toLowerCase(); }
    case 'BANK_ACCOUNT': case 'WALLET': return input.replace(/\s+/g, '').toLowerCase();
    case 'PERSON': return input.toLowerCase().replace(/\s+/g, ' ');
    default: return input.toLowerCase();
  }
}
