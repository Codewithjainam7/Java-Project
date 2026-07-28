import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

interface LoginPageProps {
  onLogin: (displayName: string, email: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('jane.doe@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Jane Doe');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(name || 'Jane Doe', email || 'jane.doe@example.com');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      {/* Wordmark above card */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-[#FFE066] border-4 border-black px-4 py-2 shadow-[6px_6px_0_#111111] mb-3">
          <Sparkles className="w-7 h-7 stroke-[2.5]" />
          <h1 className="font-heading text-2xl md:text-3xl font-black uppercase text-black tracking-tight">
            LIFE-ADMIN COPILOT
          </h1>
        </div>
        <p className="font-heading font-bold text-xs uppercase tracking-widest text-black bg-white px-3 py-1 border-2 border-black inline-block shadow-[2px_2px_0_#111111]">
          PERSONAL ADMIN ASSISTANT • NEUBRUTALISM EDITION
        </p>
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-[400px] nb-card p-6 md:p-8 bg-white">
        <div className="border-b-3 border-black pb-4 mb-6">
          <h2 className="font-heading text-xl font-black uppercase text-black">
            {isSignUp ? 'CREATE YOUR ACCOUNT' : 'SIGN IN TO COPILOT'}
          </h2>
          <p className="text-xs font-semibold text-gray-600 mt-1">
            {isSignUp
              ? 'Enter details to start managing life admin'
              : 'Welcome back! Sign in to access your copilot'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block font-heading text-xs font-black uppercase mb-1 text-black">
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="nb-input text-sm"
              />
            </div>
          )}

          <div>
            <label className="block font-heading text-xs font-black uppercase mb-1 text-black">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="nb-input text-sm pl-10"
              />
              <Mail className="w-4 h-4 text-black absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block font-heading text-xs font-black uppercase mb-1 text-black">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="nb-input text-sm pl-10"
              />
              <Lock className="w-4 h-4 text-black absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="nb-btn w-full py-3">
              <span>{isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t-3 border-black text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-heading text-xs font-black uppercase tracking-wide text-black underline hover:bg-[#FFE066] p-1 transition-all"
          >
            {isSignUp
              ? 'ALREADY HAVE AN ACCOUNT? SIGN IN'
              : 'NEED AN ACCOUNT? CREATE ONE HERE'}
          </button>
        </div>
      </div>
    </div>
  );
};
