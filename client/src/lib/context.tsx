import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES } from './mockData';

interface Admin {
  id: number;
  email: string;
  fullName: string;
}

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [user, setUser] = useState<any | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));

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
      'hero.title': language === 'am' ? 'የአፄዎቹ ቤት' : 'The Home of The Emperors',
      'hero.subtitle': language === 'am' ? 'ፋሲል ከነማ የስፖርት ክለብ ኦፊሴላዊ የደጋፊዎች መድረክ' : 'Official Fan Club Platform of Fasil Kenema Sport Club',
      'hero.cta': language === 'am' ? 'አባል ይሁኑ' : 'Join the Club',
      'hero.secondary': language === 'am' ? 'ጨዋታዎችን ይመልከቱ' : 'View Matches',
    };
    return translations[key] || key;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, user, admin, login, adminLogin, logout, t, token }}>
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
