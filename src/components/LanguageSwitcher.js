'use client';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, changeLanguage, translations } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const selectLanguage = (lang) => {
    changeLanguage(lang);
    setDropdownOpen(false);
  };
  
  // Language display names
  const languages = {
    en: {
      name: translations.english,
      flag: '🇬🇧'
    },
    sq: {
      name: translations.albanian,
      flag: '🇦🇱'
    }
  };
  
  // Current language display
  const currentLanguage = languages[language];
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-1 px-2 py-1 rounded text-amber-900 hover:bg-amber-100"
        onClick={toggleDropdown}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <span className="mr-1">{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.name}</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                className={`w-full text-left px-4 py-2 text-sm ${
                  language === code 
                    ? 'bg-amber-100 text-amber-900' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                role="menuitem"
                onClick={() => selectLanguage(code)}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 