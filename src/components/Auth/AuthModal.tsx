import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, LoaderCircle, Mail, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type AuthMode = 'signin' | 'signup' | 'reset' | 'new-password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuest: () => void;
  onAuthenticated: () => void;
}

const friendlyAuthError = (message: string) => {
  if (/invalid login credentials/i.test(message)) return 'That email and password do not match. Try again or create an account.';
  if (/email not confirmed/i.test(message)) return 'Check your inbox and confirm your email before signing in.';
  if (/user already registered/i.test(message)) return 'An account with this email already exists. Sign in instead.';
  if (/password should be at least/i.test(message)) return 'Use a password with at least 8 characters.';
  if (/provider is not enabled|unsupported provider/i.test(message)) return 'Google sign-in is not enabled in your Supabase project yet.';
  return message;
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onGuest, onAuthenticated }) => {
  const { configured, isPasswordRecovery, signIn, signUp, signInWithGoogle, resetPassword, setNewPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (isPasswordRecovery) {
      setMode('new-password');
      setNotice('Choose a new password for your Storicode account.');
      setError('');
    }
  }, [isPasswordRecovery]);

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
  };

  const perform = async (action: () => Promise<void>) => {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      await action();
      onClose();
      onAuthenticated();
    } catch (cause) {
      setError(friendlyAuthError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!configured) return;
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'new-password') {
        if (password !== confirmPassword) {
          setError('Those passwords do not match.');
          return;
        }
        await setNewPassword(password);
        onClose();
        onAuthenticated();
      } else if (mode === 'signup') {
        const result = await signUp(name, email, password);
        if (result.needsEmailConfirmation) {
          setNotice('Your account is ready. Confirm the link we sent to your email, then come back to sign in.');
          setMode('signin');
        } else {
          onClose();
          onAuthenticated();
        }
      } else if (mode === 'signin') {
        await signIn(email, password);
        onClose();
        onAuthenticated();
      } else {
        await resetPassword(email);
        setNotice('Password reset link sent. Check your inbox to choose a new password.');
      }
    } catch (cause) {
      setError(friendlyAuthError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#080611]/85 p-3 backdrop-blur-xl sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}
          onKeyDown={(event) => { if (event.key === 'Escape' && !busy) onClose(); }}
          role="presentation"
        >
          <motion.section
            role="dialog" aria-modal="true" aria-labelledby="auth-title"
            className="relative my-auto grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/15 bg-[#151024] text-[#FFF7ED] shadow-[0_35px_120px_rgba(5,3,20,.8)] md:grid-cols-[.94fr_1.06fr]"
            initial={{ opacity: 0, y: 26, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          >
            <div className="relative hidden min-h-[590px] flex-col justify-between overflow-hidden border-r border-white/10 bg-[#100a20] p-9 md:flex">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,.25),transparent_33%),radial-gradient(circle_at_80%_75%,rgba(94,234,212,.2),transparent_34%),linear-gradient(145deg,#1b1031,#100a20_70%)]" />
              <div className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-fuchsia-200/15 shadow-[0_0_80px_rgba(192,132,252,.15)]" />
              <div className="absolute -right-10 top-32 h-48 w-48 rounded-full border border-cyan-100/15" />
              <div className="absolute bottom-36 left-10 right-0 h-px rotate-[-20deg] bg-gradient-to-r from-transparent via-cyan-100/40 to-transparent" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-fuchsia-200/30 bg-fuchsia-300/10 text-2xl shadow-[0_0_35px_rgba(244,114,182,.25)]">✦</div>
                <div><div className="font-fantasy text-xl font-bold">Storicode</div><div className="font-code text-[9px] uppercase tracking-[.25em] text-cyan-100/60">Arcane Academy</div></div>
              </div>
              <div className="relative z-10 -mt-4">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-100/20 bg-cyan-100/[.06] px-3 py-1.5 font-code text-[9px] uppercase tracking-[.2em] text-cyan-100/80"><Sparkles className="h-3.5 w-3.5" /> Your story starts here</div>
                <h2 className="max-w-sm font-fantasy text-4xl font-bold leading-tight">Every great coder begins with a little magic.</h2>
                <p className="mt-4 max-w-sm text-sm leading-6 text-white/55">Build your character, discover strange new worlds, and turn code into spells that actually do things.</p>
                <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-400/20 to-violet-400/20 text-xl">🐉</div>
                  <div className="flex-1"><div className="text-xs font-semibold">Your progress follows you</div><div className="mt-1 text-[10px] text-white/45">Quests, levels, and discoveries saved to your account</div></div>
                  <div className="flex -space-x-2"><span className="grid h-6 w-6 place-items-center rounded-full border border-[#151024] bg-violet-400/80 text-[10px]">✦</span><span className="grid h-6 w-6 place-items-center rounded-full border border-[#151024] bg-cyan-300/80 text-[10px]">✧</span></div>
                </div>
              </div>
              <div className="relative z-10 flex items-center justify-between font-code text-[9px] uppercase tracking-[.2em] text-white/30"><span>Learn by doing</span><span>✧ ✦ ✧</span><span>Level up</span></div>
            </div>

            <div className="relative p-6 sm:p-9 md:p-11">
              <button type="button" onClick={onClose} aria-label="Close sign in" className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl text-white/45 transition hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
              <div className="mb-7 flex items-center gap-3 md:hidden"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-fuchsia-300/10 text-xl">✦</span><div><div className="font-fantasy text-lg font-bold">Storicode</div><div className="font-code text-[9px] uppercase tracking-[.2em] text-cyan-100/50">Arcane Academy</div></div></div>

              <div className="mb-7">
                <div className="mb-3 font-code text-[9px] uppercase tracking-[.25em] text-cyan-100/60">{mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Recover access' : mode === 'new-password' ? 'Secure your account' : 'Welcome back'}</div>
                <h1 id="auth-title" className="font-fantasy text-3xl font-bold tracking-wide sm:text-4xl">{mode === 'signup' ? 'Join the adventure.' : mode === 'reset' ? 'Find your way back.' : mode === 'new-password' ? 'New spell. New key.' : 'Step back inside.'}</h1>
                <p className="mt-2 text-xs leading-5 text-white/50">{mode === 'signup' ? 'Save your progress and make this world yours.' : mode === 'reset' ? 'We’ll send you a secure link to reset your password.' : mode === 'new-password' ? 'Choose a new password to protect your progress.' : 'Your next quest is waiting.'}</p>
              </div>

              {mode !== 'new-password' && <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/10 bg-black/20 p-1" role="tablist" aria-label="Account action">
                <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => changeMode('signup')} className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${mode === 'signup' ? 'bg-white/10 text-white shadow-sm' : 'text-white/45 hover:text-white/75'}`}>Create account</button>
                <button type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => changeMode('signin')} className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${mode === 'signin' ? 'bg-white/10 text-white shadow-sm' : 'text-white/45 hover:text-white/75'}`}>Sign in</button>
              </div>}

              {mode !== 'new-password' && <button type="button" onClick={() => void perform(signInWithGoogle)} disabled={!configured || busy || mode === 'reset'} className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[.06] px-4 py-3 text-sm font-semibold transition hover:border-white/25 hover:bg-white/[.1] disabled:cursor-not-allowed disabled:opacity-45">
                <svg aria-hidden="true" viewBox="0 0 48 48" className="h-4 w-4"><path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.7h11a9.4 9.4 0 0 1-4.1 6.2v5h6.7c3.9-3.6 6-8.8 6-14.8Z"/><path fill="#FF3D00" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5c-1.8 1.2-4 2-6.8 2-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44Z"/><path fill="#4CAF50" d="M12.8 28c-.4-1.2-.7-2.6-.7-4s.3-2.8.7-4v-5.2H5.9A20 20 0 0 0 4 24c0 3.2.8 6.3 1.9 9l6.9-5Z"/><path fill="#1976D2" d="M24 11.8c3 0 5.6 1 7.7 3l5.8-5.8C34 5.7 29.5 4 24 4A20 20 0 0 0 5.9 14.8l6.9 5C14.4 15.2 18.8 11.8 24 11.8Z"/></svg>
                Continue with Google
              </button>}

              {mode !== 'new-password' && <div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-white/10"/><span className="font-code text-[9px] uppercase tracking-[.18em] text-white/30">or use email</span><div className="h-px flex-1 bg-white/10"/></div>}

              <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3.5">
                {mode === 'signup' && <label className="block space-y-1.5"><span className="text-[10px] font-semibold text-white/65">Apprentice name</span><input autoComplete="name" required maxLength={48} value={name} onChange={(event) => setName(event.target.value)} placeholder="What should we call you?" className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-300/60 focus:ring-2 focus:ring-fuchsia-300/10" /></label>}
                {mode !== 'new-password' && <label className="block space-y-1.5"><span className="text-[10px] font-semibold text-white/65">Email address</span><span className="relative block"><Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"/><input autoComplete="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-200/60 focus:ring-2 focus:ring-cyan-200/10" /></span></label>}
                {mode !== 'reset' && <label className="block space-y-1.5"><span className="flex items-center justify-between text-[10px] font-semibold text-white/65"><span>{mode === 'new-password' ? 'New password' : 'Password'}</span>{mode === 'signin' && <button type="button" onClick={() => changeMode('reset')} className="font-normal text-cyan-100/70 hover:text-cyan-100">Forgot password?</button>}</span><span className="relative block"><KeyRound aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"/><input autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-200/60 focus:ring-2 focus:ring-cyan-200/10"/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((shown) => !shown)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/75">{showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button></span></label>}
                {mode === 'new-password' && <label className="block space-y-1.5"><span className="text-[10px] font-semibold text-white/65">Confirm new password</span><input autoComplete="new-password" required minLength={8} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter it one more time" className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-200/60 focus:ring-2 focus:ring-cyan-200/10" /></label>}

                {error && <div role="alert" className="rounded-xl border border-rose-300/20 bg-rose-300/[.08] px-3 py-2.5 text-xs leading-5 text-rose-100">{error}</div>}
                {notice && <div role="status" className="flex gap-2 rounded-xl border border-emerald-200/20 bg-emerald-200/[.08] px-3 py-2.5 text-xs leading-5 text-emerald-100"><Check className="mt-0.5 h-4 w-4 shrink-0"/>{notice}</div>}
                {!configured && <div className="rounded-xl border border-amber-200/20 bg-amber-200/[.06] px-3 py-2.5 text-[10px] leading-5 text-amber-100/80">Account sign-in is ready to connect. Add your Supabase project URL and publishable key to enable it.</div>}

                <button type="submit" disabled={!configured || busy} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 px-4 py-3.5 text-sm font-bold text-[#170f24] shadow-[0_8px_28px_rgba(167,139,250,.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45">
                  {busy ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <>{mode === 'signup' ? 'Create my account' : mode === 'reset' ? 'Send reset link' : mode === 'new-password' ? 'Save new password' : 'Sign in'}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/></>}
                </button>
                {mode === 'reset' && <button type="button" onClick={() => changeMode('signin')} className="flex w-full items-center justify-center gap-2 py-1 text-xs text-white/50 hover:text-white"><ArrowLeft className="h-3 w-3"/> Back to sign in</button>}
              </form>

              <div className="mt-6 border-t border-white/10 pt-4 text-center"><button type="button" onClick={onGuest} className="text-xs text-white/45 transition hover:text-cyan-100">Just exploring? <span className="font-semibold text-cyan-100/80">Continue as a guest</span></button><p className="mt-3 text-[9px] leading-4 text-white/25">By continuing, you agree to use your powers responsibly. Your account is protected by Supabase Auth.</p></div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
