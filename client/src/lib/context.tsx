import React, { createContext, useContext, useState } from 'react';
import { LANGUAGES } from './mockData';

interface AppContextType {
  language: string;
  setLanguage: (lang: string) => void;
  user: any | null;
  login: () => void;
  logout: () => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [user, setUser] = useState<any | null>(null);

  const login = () => {
    setUser({ name: 'Fan User', role: 'member' });
  };

  const logout = () => {
    setUser(null);
  };

  // Simple mock translation function
  const t = (key: string) => {
    // In a real app, this would look up keys in translation files
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
    <AppContext.Provider value={{ language, setLanguage, user, login, logout, t }}>
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
