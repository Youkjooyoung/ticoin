import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Palette, Shield, HelpCircle, LogOut, ChevronRight, Sun, Moon, Monitor, Globe } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore.js';
import { useToastStore } from '../stores/toastStore.js';
import { SUPPORTED_LANGUAGES } from '../i18n/index.js';
import { cn } from '../lib/utils.js';

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { mode, setMode, hydrate } = useThemeStore();
  const toast = useToastStore();

  useEffect(() => { hydrate(); }, [hydrate]);

  const logout = () => {
    if (!window.confirm(t('settings.menu.logoutConfirm'))) return;
    toast.info('로그인/로그아웃 기능은 추후 지원 예정입니다');
  };

  const changeLanguage = (code, label) => {
    i18n.changeLanguage(code);
    localStorage.setItem('ticoin.lang', code);
    toast.success(t('settings.language.changed', { label }));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl font-extrabold">{t('settings.title')}</h1>
        <p className="text-sm text-text-3 mt-1">{t('settings.subtitle')}</p>
      </header>

      {/* Theme */}
      <section>
        <h3 className="text-xs font-bold text-text-3 mb-3 px-1 uppercase tracking-wider">
          {t('settings.section.theme')}
        </h3>
        <div className="glass-card p-2 flex gap-1">
          {['light', 'dark', 'system'].map((id) => {
            const Icon = THEME_ICONS[id];
            const label = t(`settings.theme.${id}`);
            return (
              <button
                key={id}
                onClick={() => { setMode(id); toast.success(t('settings.theme.switched', { mode: label })); }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors',
                  mode === id
                    ? 'bg-brand-soft text-brand-light'
                    : 'text-text-2 hover:bg-[var(--surface-2)]'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Language */}
      <section>
        <h3 className="text-xs font-bold text-text-3 mb-3 px-1 uppercase tracking-wider">
          {t('settings.section.language')}
        </h3>
        <div className="glass-card p-2 flex gap-1">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code, lang.label)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors',
                i18n.language === lang.code
                  ? 'bg-brand-soft text-brand-light'
                  : 'text-text-2 hover:bg-[var(--surface-2)]'
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section>
        <h3 className="text-xs font-bold text-text-3 mb-3 px-1 uppercase tracking-wider">
          {t('settings.section.notifications')}
        </h3>
        <div className="glass-card divide-y divide-[var(--border)]">
          <MenuItem
            icon={Bell}
            color="bg-blue-500/15 text-blue-500"
            label={t('settings.menu.priceAlerts')}
            value={t('settings.menu.priceAlertsDesc')}
          />
          <MenuItem
            icon={Shield}
            color="bg-emerald-500/15 text-emerald-500"
            label={t('settings.menu.privacy')}
            value={t('settings.menu.privacyDesc')}
          />
        </div>
      </section>

      {/* Support */}
      <section>
        <h3 className="text-xs font-bold text-text-3 mb-3 px-1 uppercase tracking-wider">
          {t('settings.section.support')}
        </h3>
        <div className="glass-card divide-y divide-[var(--border)]">
          <MenuItem icon={HelpCircle} color="bg-orange-500/15 text-orange-500" label={t('settings.menu.helpCenter')} />
          <MenuItem icon={Palette} color="bg-purple-500/15 text-purple-500" label={t('settings.menu.appVersion')} value="v0.6.0" noChevron />
        </div>
      </section>

      <button
        onClick={logout}
        className="w-full flex items-center gap-4 p-4 glass-card hover:border-[var(--border-strong)] transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center">
          <LogOut className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-red-500">{t('settings.menu.logout')}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-text-3" />
      </button>

      <p className="text-center text-[11px] text-text-3 pt-4">
        {t('app.version')}
      </p>
    </div>
  );
}

function MenuItem({ icon: Icon, label, value, color, onClick, noChevron }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-[var(--surface-2)] transition-colors text-left"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{label}</p>
        {value && <p className="text-xs text-text-3 mt-0.5">{value}</p>}
      </div>
      {!noChevron && <ChevronRight className="w-5 h-5 text-text-3 flex-shrink-0" />}
    </button>
  );
}
