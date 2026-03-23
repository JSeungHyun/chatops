import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, MessageSquare, User } from 'lucide-react';
import api from '@/api/axios';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/stores/authStore';

type Mode = 'login' | 'register';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  email: string;
  nickname: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  email?: string;
  nickname?: string;
  password?: string;
  confirmPassword?: string;
}

function validateLogin(form: LoginForm): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.password || form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  return errors;
}

function validateRegister(form: RegisterForm): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.nickname || form.nickname.length < 2 || form.nickname.length > 20) {
    errors.nickname = 'Nickname must be 2–20 characters.';
  }
  if (!form.password || form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    emailRef.current?.focus();
  }, [mode]);

  function switchMode(next: Mode) {
    setMode(next);
    setApiError('');
    setFieldErrors({});
  }

  async function quickLogin(email: string) {
    setApiError('');
    setLoading(true);
    try {
      const res = await api.post<{ accessToken: string; user: { id: string; email: string; nickname: string } }>(
        '/auth/login',
        { email, password: 'test1234' },
      );
      setAuth(res.data.user, res.data.accessToken);
      navigate('/chat', { replace: true });
    } catch {
      setApiError('Quick login failed. Make sure the account exists with password test1234.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setApiError('');
    const errors = validateLogin(loginForm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await api.post<{ accessToken: string; user: { id: string; email: string; nickname: string } }>(
        '/auth/login',
        { email: loginForm.email, password: loginForm.password },
      );
      setAuth(res.data.user, res.data.accessToken);
      navigate('/chat', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed. Please check your credentials.';
      setApiError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setApiError('');
    const errors = validateRegister(registerForm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await api.post('/auth/register', {
        email: registerForm.email,
        nickname: registerForm.nickname,
        password: registerForm.password,
      });
      // After register, automatically log in
      const loginRes = await api.post<{ accessToken: string; user: { id: string; email: string; nickname: string } }>(
        '/auth/login',
        { email: registerForm.email, password: registerForm.password },
      );
      setAuth(loginRes.data.user, loginRes.data.accessToken);
      navigate('/chat', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      setApiError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / title */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-md">
            <MessageSquare size={28} strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">ChatOps</h1>
          <p className="text-sm text-slate-500">Real-time chat for your team</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200/60">
          {/* Tab switcher */}
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Create account
            </button>
          </div>

          {/* Login form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} noValidate className="space-y-4">
              <Input
                ref={emailRef}
                label="Email"
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                error={fieldErrors.email}
                icon={<Mail size={16} />}
              />
              <Input
                label="Password"
                id="login-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                error={fieldErrors.password}
                icon={<Lock size={16} />}
              />

              {apiError && (
                <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{apiError}</p>
              )}

              <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
                Sign in
              </Button>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="mb-2 text-center text-xs text-slate-400">Quick Login</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => quickLogin('admin@admin.com')}
                    className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => quickLogin('test@test.com')}
                    className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
                  >
                    Test
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => quickLogin('otheruser@test.com')}
                    className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
                  >
                    Other
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Register form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} noValidate className="space-y-4">
              <Input
                ref={emailRef}
                label="Email"
                id="register-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                error={fieldErrors.email}
                icon={<Mail size={16} />}
              />
              <Input
                label="Nickname"
                id="register-nickname"
                type="text"
                placeholder="Your display name"
                autoComplete="username"
                value={registerForm.nickname}
                onChange={(e) => setRegisterForm({ ...registerForm, nickname: e.target.value })}
                error={fieldErrors.nickname}
                icon={<User size={16} />}
              />
              <Input
                label="Password"
                id="register-password"
                type="password"
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                error={fieldErrors.password}
                icon={<Lock size={16} />}
              />
              <Input
                label="Confirm password"
                id="register-confirm-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={registerForm.confirmPassword}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, confirmPassword: e.target.value })
                }
                error={fieldErrors.confirmPassword}
                icon={<Lock size={16} />}
              />

              {apiError && (
                <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{apiError}</p>
              )}

              <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
                Create account
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} ChatOps. All rights reserved.
        </p>
      </div>
    </div>
  );
}
