import { useLanguage } from '@/lib/LanguageContext';
import { translations } from '@/lib/translations';

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const t = translations[language];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-amber-900 bg-white border border-amber-800 rounded-md hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-100 focus:ring-amber-500"
        id="language-menu"
        aria-expanded="true"
        aria-haspopup="true"
      >
        {t.language}
        <svg
          className="w-5 h-5 ml-2 -mr-1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div
        className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="language-menu"
        tabIndex="-1"
      >
        <div className="py-1" role="none">
          <button
            onClick={() => changeLanguage('en')}
            className={`block w-full px-4 py-2 text-sm text-left ${
              language === 'en' ? 'bg-amber-50 text-amber-900' : 'text-amber-900'
            }`}
            role="menuitem"
          >
            {t.english}
          </button>
          <button
            onClick={() => changeLanguage('sq')}
            className={`block w-full px-4 py-2 text-sm text-left ${
              language === 'sq' ? 'bg-amber-50 text-amber-900' : 'text-amber-900'
            }`}
            role="menuitem"
          >
            {t.albanian}
          </button>
        </div>
      </div>
    </div>
  );
} 