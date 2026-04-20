import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const getLanguageName = () => {
    switch (i18n.language) {
      case 'ta':
        return '🇮🇳 Tamil';
      case 'hi':
        return '🇮🇳 Hindi';
      default:
        return '🇬🇧 English';
    }
  };

  return (
    <DropdownButton
      id="language-selector"
      title={getLanguageName()}
      variant="outline-secondary"
      size="sm"
      className="language-selector"
    >
      <Dropdown.Item 
        onClick={() => handleLanguageChange('en')}
        active={i18n.language === 'en'}
      >
        🇬🇧 English
      </Dropdown.Item>
      <Dropdown.Item 
        onClick={() => handleLanguageChange('ta')}
        active={i18n.language === 'ta'}
      >
        🇮🇳 Tamil (தமிழ்)
      </Dropdown.Item>
      <Dropdown.Item 
        onClick={() => handleLanguageChange('hi')}
        active={i18n.language === 'hi'}
      >
        🇮🇳 Hindi (हिंदी)
      </Dropdown.Item>
    </DropdownButton>
  );
};

export default LanguageSelector;
