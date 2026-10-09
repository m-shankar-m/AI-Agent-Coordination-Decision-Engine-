import React, { useState } from 'react';
import { Shield, Lock, UserPlus, LogIn } from 'lucide-react';
import { RBACRole } from '../types/banking.js';

interface AuthScreenProps {
  onLogin: (role: RBACRole, email: string, name: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !fullName)) {
      setError('Please fill out all required fields.');
      return;
    }
    
    const finalRole: RBACRole = email === 'admin@aegis.com' ? 'ADMIN' : 'USER';
    const finalName = isSignUp ? fullName : (email === 'admin@aegis.com' ? 'System Admin' : email.split('@')[0]);
    onLogin(finalRole, email, finalName);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">AEGIS BANK</h2>
          <p className="text-sm text-center text-slate-500 mb-8">
            {isSignUp ? 'Create a New Account' : 'AI Decision Engine - Sign In'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. John Doe"
                  required={isSignUp}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="email@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md transition flex items-center justify-center space-x-2 mt-6"
            >
              {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            </button>
          </form>
          
          <div className="mt-6 text-sm text-center">
            {isSignUp ? (
              <p className="text-slate-600">
                Already have an account?{' '}
                <button type="button" onClick={() => setIsSignUp(false)} className="text-indigo-600 hover:underline font-semibold">Sign In</button>
              </p>
            ) : (
              <p className="text-slate-600">
                Don't have an account?{' '}
                <button type="button" onClick={() => setIsSignUp(true)} className="text-indigo-600 hover:underline font-semibold">Create Account</button>
              </p>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-center text-slate-400">
          </div>
        </div>
      </div>
    </div>
  );
};
