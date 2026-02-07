# القرآن الكريم - Quran PWA

A modern, elegant Progressive Web App for reading the Noble Quran with a spiritual and contemporary Islamic design.

## ✨ Features

- **Modern Islamic Design**: Contemporary aesthetics with deep emerald green, soft beige, and subtle gold accents
- **Dark Mode by Default**: Calming dark theme with smooth light mode toggle
- **Elegant Typography**: Optimized Arabic fonts for comfortable Quran reading
- **Responsive Design**: Mobile-first approach with seamless tablet and desktop support
- **Smooth Animations**: Subtle, non-intrusive transitions and micro-interactions
- **PWA Support**: Install as an app, works offline
- **Search Functionality**: Quickly find surahs by name or transliteration
- **Clean Reading Experience**: Distraction-free verse display with generous spacing

## 🎨 Design Philosophy

- **Calm & Spiritual**: Creating an atmosphere conducive to reflection and serenity
- **Respectful**: Dignified treatment of the sacred text
- **Premium**: State-of-the-art design that feels timeless
- **Accessible**: Easy one-handed navigation on mobile

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📱 Installing as PWA

1. Open the app in your browser
2. Look for the "Install" or "Add to Home Screen" option
3. Follow the prompts to install
4. Launch from your home screen like a native app

## 🏗️ Project Structure

```
quran/
├── index.html              # Main HTML file
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies and scripts
├── src/
│   ├── main.js             # Application entry point
│   ├── styles/
│   │   ├── design-system.css   # Design tokens and variables
│   │   ├── main.css           # Global styles
│   │   └── enhancements.css   # Additional styles
│   ├── components/
│   │   ├── SurahCard.js       # Surah card component
│   │   ├── VerseView.js       # Verse display component
│   │   ├── NavigationBar.js   # Bottom navigation
│   │   ├── ThemeToggle.js     # Light/dark mode toggle
│   │   └── ReadingHeader.js   # Reading page header
│   ├── pages/
│   │   ├── HomePage.js        # Surah list page
│   │   └── ReadingPage.js     # Verse reading page
│   ├── utils/
│   │   └── animations.js      # Animation utilities
│   └── data/
│       └── quran-data.js      # Quran data and helper functions
└── dist/                   # Production build (generated)
```

## 🎨 Color Palette

### Dark Mode (Default)
- Primary: Deep Emerald Green (#047857)
- Secondary: Subtle Gold (#d4af37)
- Background: Dark Navy (#0f1419)
- Text: Ivory White (#f5f5f0)

### Light Mode
- Primary: Deep Emerald Green (#047857)
- Secondary: Subtle Gold (#d4af37)
- Background: Off White (#fafaf9)
- Text: Dark Navy (#1a1f26)

## 🔧 Customization

### Adding More Surahs

Edit `src/data/quran-data.js` to add complete surah data. The current implementation includes sample data for demonstration.

### Changing Fonts

Modify the `--font-arabic` variable in `src/styles/design-system.css` to use a different Arabic font.

### Adjusting Colors

All colors are defined as CSS custom properties in `src/styles/design-system.css`. Modify these to customize the theme.

## 📝 Data Source

The current implementation uses sample data for demonstration. For a complete Quran, consider integrating:
- [Quran.com API](https://api.quran.com)
- [AlQuran Cloud API](https://alquran.cloud/api)
- Local JSON files with complete Quran data

## 🌟 Future Enhancements

- Audio recitation
- Translations in multiple languages
- Tafsir (commentary)
- Bookmarks and favorites
- Reading progress tracking
- Advanced search
- Verse sharing

## 📄 License

This project is created for educational and spiritual purposes. The Quran text is in the public domain.

## 🤲 Credits

- Design inspired by Islamic geometric patterns and calligraphy
- Fonts: Amiri Quran, Scheherazade New, Inter
- Icons: Feather Icons style

---

**May this app help in your journey of reading and understanding the Noble Quran** 📖
