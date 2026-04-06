import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES } from './mockData';
import { useQuery } from '@tanstack/react-query';

interface Admin {
  id: number;
  email: string;
  fullName: string;
}

interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const DEFAULT_THEME: ThemeColors = {
  primaryColor: '#722F37',
  secondaryColor: '#D4A017',
  accentColor: '#1a1a2e',
};

interface AppContextType {
  language: string;
  setLanguage: (lang: string) => void;
  user: any | null;
  admin: Admin | null;
  login: () => void;
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  t: (key: string) => string;
  token: string | null;
  themeColors: ThemeColors;
  refreshTheme: () => void;
}

const hexToHsl = (hex: string): string => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const applyThemeColors = (colors: ThemeColors) => {
  const root = document.documentElement;
  root.style.setProperty('--primary', hexToHsl(colors.primaryColor));
  root.style.setProperty('--ring', hexToHsl(colors.primaryColor));
  root.style.setProperty('--chart-1', hexToHsl(colors.primaryColor));
  root.style.setProperty('--secondary', hexToHsl(colors.secondaryColor));
  root.style.setProperty('--chart-2', hexToHsl(colors.secondaryColor));
  root.style.setProperty('--accent', hexToHsl(colors.accentColor));
  root.style.setProperty('--accent-foreground', '0 0% 98%');
  root.style.setProperty('--sidebar-primary', hexToHsl(colors.accentColor));
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [user, setUser] = useState<any | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [themeColors, setThemeColors] = useState<ThemeColors>(DEFAULT_THEME);

  const { data: settings, refetch } = useQuery<any[]>({
    queryKey: ['/api/public/settings'],
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!Array.isArray(settings)) return;

    const primaryColor = settings.find((s: any) => s.key === 'theme.primaryColor')?.value || DEFAULT_THEME.primaryColor;
    const secondaryColor = settings.find((s: any) => s.key === 'theme.secondaryColor')?.value || DEFAULT_THEME.secondaryColor;
    const accentColor = settings.find((s: any) => s.key === 'theme.accentColor')?.value || DEFAULT_THEME.accentColor;

    const colors = { primaryColor, secondaryColor, accentColor };
    setThemeColors(colors);
    applyThemeColors(colors);
  }, [settings]);

  useEffect(() => {
    if (token) {
      const storedAdmin = localStorage.getItem('admin_user');
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      }
    }
  }, [token]);

  const login = () => {
    setUser({ name: 'Fan User', role: 'member' });
  };

  const adminLogin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setAdmin(data.admin);
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  const t = (key: string) => {
    const translations: Record<string, string> = {
      'nav.home': language === 'am' ? 'መነሻ' : 'Home',
      'nav.about': language === 'am' ? 'ስለ እኛ' : 'About',
      'nav.contact': language === 'am' ? 'ያግኙን' : 'Contact',
      'nav.blog': language === 'am' ? 'ብሎግ' : 'News',
      'nav.membership': language === 'am' ? 'አባልነት' : 'Membership',
      'nav.donate': language === 'am' ? 'ድጋፍ' : 'Donate',
      'nav.programs': language === 'am' ? 'ፕሮግራሞች' : 'Programs',
      'nav.team': language === 'am' ? 'ቡድን' : 'Team',
      'nav.partners': language === 'am' ? 'አጋሮች' : 'Partners',
      'hero.title': language === 'am' ? 'የመቻል ቤት' : 'The Home of Mechal FC',
      'hero.subtitle': language === 'am' ? 'መቻል የስፖርት ማህበር ኦፊሴላዊ የደጋፊዎች መድረክ' : 'Official Fan Club Platform of Mechal Sport Club',
      'hero.cta': language === 'am' ? 'አባል ይሁኑ' : 'Join the Club',
      'hero.secondary': language === 'am' ? 'ጨዋታዎችን ይመልከቱ' : 'View Matches',
    };
    return translations[key] || key;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, user, admin, login, adminLogin, logout, t, token, themeColors, refreshTheme: () => { void refetch(); } }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
