import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/api/axios';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';

interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, setAuth, token, logout } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get<UserProfile>('/users/me');
        setProfile(res.data);
        setNickname(res.data.nickname);
      } catch {
        toast.error('프로필을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setError('');

    if (nickname.trim().length < 2 || nickname.trim().length > 20) {
      setError('닉네임은 2~20자 사이여야 합니다.');
      return;
    }

    if (nickname.trim() === profile?.nickname) {
      toast('변경사항이 없습니다.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.patch<UserProfile>(`/users/${profile?.id}`, {
        nickname: nickname.trim(),
      });
      setProfile(res.data);
      if (user && token) {
        setAuth({ ...user, nickname: res.data.nickname }, token);
      }
      toast.success('프로필이 업데이트되었습니다.');
    } catch {
      toast.error('프로필 업데이트에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-lg items-center gap-3 px-4">
          <button
            onClick={() => navigate('/chat')}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
            aria-label="Back to chat"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">설정</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg p-4">
        {/* Profile Section */}
        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/50">
          <h2 className="mb-6 text-base font-semibold text-slate-900">프로필</h2>

          <div className="mb-6 flex items-center gap-4">
            <Avatar
              src={profile?.avatar}
              name={profile?.nickname ?? '?'}
              size="lg"
            />
            <div>
              <p className="text-sm font-medium text-slate-900">
                {profile?.nickname}
              </p>
              <p className="text-xs text-slate-500">{profile?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="이메일"
              value={profile?.email ?? ''}
              disabled
              className="bg-slate-50 text-slate-500"
            />

            <Input
              label="닉네임"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError('');
              }}
              error={error}
              placeholder="닉네임 (2~20자)"
              maxLength={20}
            />

            <Button
              onClick={handleSave}
              loading={saving}
              disabled={!nickname.trim()}
              className="w-full"
            >
              저장
            </Button>
          </div>
        </section>

        {/* Account Section */}
        <section className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/50">
          <h2 className="mb-4 text-base font-semibold text-slate-900">계정</h2>
          <Button variant="danger" onClick={handleLogout} className="w-full">
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </section>
      </main>
    </div>
  );
}
