import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

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
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col justify-center items-center p-4 relative transition-colors overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,120,212,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,124,16,0.08),_transparent_30%)]" />

      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <ThemeToggle />
        <Link
          to="/"
          className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-5xl flex items-center justify-center gap-8">
        <div className="login-scene hidden md:flex flex-1 items-center justify-center">
          <div className="human-stage">
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <div className="human-card">
              <div className="human-figure">
                <div className="human-head" />
                <div className="human-body" />
                <div className="human-arm arm-left" />
                <div className="human-arm arm-right" />
                <div className="human-leg leg-left" />
                <div className="human-leg leg-right" />
              </div>
            </div>
            <div className="floating-card card-one">
              <span className="material-symbols-outlined fill-1">verified_user</span>
              <span>Trusted</span>
            </div>
            <div className="floating-card card-two">
              <span className="material-symbols-outlined fill-1">insights</span>
              <span>Live AI</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-[18px] shadow-[0_12px_40px_rgba(15,23,42,0.08)] p-8 flex flex-col transition-colors">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-[10px] bg-[var(--primary)] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px] fill-1">shield</span>
            </div>
            <span className="text-[20px] font-bold text-[var(--text-primary)] font-['Libre_Franklin',sans-serif] tracking-tight">
              SENTINEL
            </span>
          </div>

          <h2 className="text-[18px] font-bold text-[var(--text-primary)] text-center mb-1">
            Sign in to your account
          </h2>
          <p className="text-[12px] text-[var(--text-secondary)] text-center mb-6">
            Enterprise fraud intelligence & investigation platform
          </p>

          <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[8px] mb-6">
            <button
              type="button"
              onClick={() => setPortalType('investigator')}
              className={`py-1.5 text-[12px] font-semibold rounded-[6px] transition-colors cursor-pointer ${
                portalType === 'investigator'
                  ? 'bg-[var(--surface)] text-[var(--primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Investigator Portal
            </button>
            <button
              type="button"
              onClick={() => setPortalType('reporter')}
              className={`py-1.5 text-[12px] font-semibold rounded-[6px] transition-colors cursor-pointer ${
                portalType === 'reporter'
                  ? 'bg-[var(--surface)] text-[var(--primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                <label className="text-[12px] font-semibold text-[var(--text-body)]">Login As Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full h-8 px-3 text-[13px] bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-[4px] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                >
                  <option value={UserRole.INVESTIGATOR} className="bg-[var(--surface)] text-[var(--text-primary)]">Investigator (Full Case Access)</option>
                  <option value={UserRole.ANALYST} className="bg-[var(--surface)] text-[var(--text-primary)]">Intelligence Analyst</option>
                  <option value={UserRole.REVIEWER} className="bg-[var(--surface)] text-[var(--text-primary)]">Case Reviewer</option>
                  <option value={UserRole.AUDITOR} className="bg-[var(--surface)] text-[var(--text-primary)]">Compliance Auditor</option>
                  <option value={UserRole.ADMIN} className="bg-[var(--surface)] text-[var(--text-primary)]">System Administrator</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between text-[12px]">
              <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-secondary)]">
                <input type="checkbox" defaultChecked className="rounded-[2px] border-[var(--border-strong)] text-[var(--primary)]" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-[var(--primary)] hover:underline font-medium">Forgot password?</a>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2 h-9">
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[var(--border)] text-center text-[12px] text-[var(--text-secondary)]">
            <span>New to Sentinel? </span>
            <Link to="/register" className="text-[var(--primary)] font-medium hover:underline">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
