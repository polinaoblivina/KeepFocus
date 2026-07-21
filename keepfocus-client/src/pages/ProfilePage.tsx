import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getProfile, updateProfile, changePassword, uploadAvatar, deleteAvatar } from '../api/profile';
import { getErrorMessage } from '../api/client';
import ThemeToggle from '../components/ui/ThemeToggle';

const inputClass = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
const cardClass = 'bg-surface rounded-2xl shadow-sm border border-gray-200 p-8';
const errorClass = 'bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm';
const successClass = 'bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-5 text-sm';
const buttonClass = 'py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors text-sm';

export default function ProfilePage() {
    const user = useAuthStore(state => state.user);
    const updateUser = useAuthStore(state => state.updateUser);

    const [name, setName] = useState('');
    const [nameLoading, setNameLoading] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);
    const [nameSuccess, setNameSuccess] = useState(false);

    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    useEffect(() => {
        getProfile()
            .then(profile => {
                updateUser({ name: profile.name, avatarUrl: profile.avatarUrl });
                setName(profile.name || '');
            })
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleNameSubmit(e: React.FormEvent) {
        e.preventDefault();
        setNameError(null);
        setNameSuccess(false);
        setNameLoading(true);
        try {
            const profile = await updateProfile(name.trim());
            updateUser({ name: profile.name });
            setNameSuccess(true);
        } catch (err) {
            setNameError(getErrorMessage(err));
        } finally {
            setNameLoading(false);
        }
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        setAvatarError(null);

        if (!file.type.startsWith('image/')) {
            setAvatarError('Выберите файл изображения');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setAvatarError('Изображение слишком большое (макс. 5 МБ)');
            return;
        }

        setAvatarLoading(true);
        try {
            const avatarUrl = await uploadAvatar(file);
            updateUser({ avatarUrl });
        } catch (err) {
            setAvatarError(getErrorMessage(err));
        } finally {
            setAvatarLoading(false);
        }
    }

    async function handleDeleteAvatar() {
        setAvatarError(null);
        setAvatarLoading(true);
        try {
            await deleteAvatar();
            updateUser({ avatarUrl: null });
        } catch (err) {
            setAvatarError(getErrorMessage(err));
        } finally {
            setAvatarLoading(false);
        }
    }

    async function handlePasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(false);

        if (newPassword !== confirmPassword) {
            setPasswordError('Пароли не совпадают');
            return;
        }

        setPasswordLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordSuccess(true);
        } catch (err) {
            setPasswordError(getErrorMessage(err));
        } finally {
            setPasswordLoading(false);
        }
    }

    const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-surface border-b border-gray-200 px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/boards" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-lg font-semibold text-gray-900">Профиль</h1>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">

                <div className={cardClass}>
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Фото профиля</h2>
                    {avatarError && <div className={errorClass}>{avatarError}</div>}
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-medium overflow-hidden flex-shrink-0">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                initial
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={avatarLoading}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {avatarLoading ? 'Загрузка...' : 'Изменить фото'}
                            </button>
                            {user?.avatarUrl && (
                                <button
                                    onClick={handleDeleteAvatar}
                                    disabled={avatarLoading}
                                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                                >
                                    Удалить фото
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <UserIcon size={17} />
                        Основная информация
                    </h2>
                    {nameError && <div className={errorClass}>{nameError}</div>}
                    {nameSuccess && <div className={successClass}>Сохранено</div>}
                    <form onSubmit={handleNameSubmit} className="space-y-4">
                        <div>
                            <label className={labelClass}>Email</label>
                            <input type="email" value={user?.email || ''} disabled className={`${inputClass} bg-gray-50 text-gray-500`} />
                        </div>
                        <div>
                            <label className={labelClass}>Имя</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => { setName(e.target.value); setNameSuccess(false); }}
                                placeholder="Ваше имя"
                                maxLength={100}
                                className={inputClass}
                            />
                        </div>
                        <button type="submit" disabled={nameLoading} className={buttonClass}>
                            {nameLoading ? 'Сохраняем...' : 'Сохранить'}
                        </button>
                    </form>
                </div>

                <div className={cardClass}>
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Смена пароля</h2>
                    {passwordError && <div className={errorClass}>{passwordError}</div>}
                    {passwordSuccess && <div className={successClass}>Пароль изменён</div>}
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className={labelClass}>Текущий пароль</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                required
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Новый пароль</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Минимум 8 символов"
                                required
                                minLength={8}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Подтвердите новый пароль</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                className={inputClass}
                            />
                        </div>
                        <button type="submit" disabled={passwordLoading} className={buttonClass}>
                            {passwordLoading ? 'Меняем...' : 'Сменить пароль'}
                        </button>
                    </form>
                </div>

            </main>
        </div>
    );
}
