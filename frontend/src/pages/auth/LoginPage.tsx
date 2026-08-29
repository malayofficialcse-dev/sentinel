import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('rahul.sharma@sentinel.gov');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.INVESTIGATOR);
  const [portalType, setPortalType] = useState<'investigator' | 'reporter'>('investigator');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (portalType === 'reporter') {
      login(UserRole.REPORTER);
      navigate('/reporter');
    } else {
      login(selectedRole);
      navigate('/investigator');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E1DFDD] rounded-[4px] shadow-sm p-8 flex flex-col">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-[4px] bg-[#0078D4] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] fill-1">shield</span>
          </div>
          <span className="text-[20px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif] tracking-tight">
            SENTINEL
          </span>
        </div>

        <h2 className="text-[18px] font-bold text-[#242424] text-center mb-1">
          Sign in to your account
        </h2>
        <p className="text-[12px] text-[#605E5C] text-center mb-6">
          Enterprise fraud intelligence & investigation platform
        </p>

        {/* Portal Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#F3F2F1] rounded-[4px] mb-6">
          <button
            type="button"
            onClick={() => setPortalType('investigator')}
            className={`py-1.5 text-[12px] font-semibold rounded-[4px] transition-colors cursor-pointer ${
              portalType === 'investigator'
                ? 'bg-white text-[#0078D4] shadow-xs'
                : 'text-[#605E5C] hover:text-[#242424]'
            }`}
          >
            Investigator Portal
          </button>
          <button
            type="button"
            onClick={() => setPortalType('reporter')}
            className={`py-1.5 text-[12px] font-semibold rounded-[4px] transition-colors cursor-pointer ${
              portalType === 'reporter'
                ? 'bg-white text-[#0078D4] shadow-xs'
                : 'text-[#605E5C] hover:text-[#242424]'
            }`}
          >
            Citizen / Reporter
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="user@organization.gov"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          {portalType === 'investigator' && (
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[12px] font-semibold text-[#323130]">Login As Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full h-8 px-3 text-[13px] bg-white text-[#242424] border border-[#E1DFDD] rounded-[4px] focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4]"
              >
                <option value={UserRole.INVESTIGATOR}>Investigator (Full Case Access)</option>
                <option value={UserRole.ANALYST}>Intelligence Analyst</option>
                <option value={UserRole.REVIEWER}>Case Reviewer</option>
                <option value={UserRole.AUDITOR}>Compliance Auditor</option>
                <option value={UserRole.ADMIN}>System Administrator</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between text-[12px]">
            <label className="flex items-center gap-1.5 cursor-pointer text-[#605E5C]">
              <input type="checkbox" defaultChecked className="rounded-[2px] border-[#C8C6C4] text-[#0078D4]" />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-[#0078D4] hover:underline font-medium">Forgot password?</a>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2 h-9">
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E1DFDD] text-center text-[12px] text-[#605E5C]">
          <span>New to Sentinel? </span>
          <Link to="/register" className="text-[#0078D4] font-medium hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  );
};
