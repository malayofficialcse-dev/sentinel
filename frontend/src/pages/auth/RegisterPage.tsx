import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(UserRole.REPORTER);
    navigate('/reporter');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E1DFDD] rounded-[4px] shadow-sm p-8 flex flex-col">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-[4px] bg-[#0078D4] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] fill-1">shield</span>
          </div>
          <span className="text-[20px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif] tracking-tight">
            SENTINEL
          </span>
        </div>

        <h2 className="text-[18px] font-bold text-[#242424] text-center mb-1">
          Create Reporter Account
        </h2>
        <p className="text-[12px] text-[#605E5C] text-center mb-6">
          Submit and track fraud evidence with complete privacy
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2 h-9">
            Create Account
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E1DFDD] text-center text-[12px] text-[#605E5C]">
          <span>Already have an account? </span>
          <Link to="/login" className="text-[#0078D4] font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};
