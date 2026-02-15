# القرآن الكريم - Sakinah Quran PWA

A modern, elegant Progressive Web App for reading and listening to the Noble Quran with a spiritual and contemporary Islamic design.

## ✨ Features

- **Immersive Audio Player**: Dedicated `PlayerPage` with circular visualizations, detailed track info, and playback controls.
- **Mushaf View**: Authentic page-by-page rendering with ayah selection.
- **Comprehensive Tafsir**: Access to multiple Tafsirs (commentaries) including *Tahrir wa Tanwir*, with Arabic script support.
- **Smart Audio Support**: Reliable recitation streaming with automatic fallback mechanisms (resilient to API outages).
- **Global Mini-Player**: Persistent audio controls that follow you across the app.
- **Modern Islamic Design**: Contemporary aesthetics with deep emerald green, soft beige, and solid opaque themes.
- **PWA Support**: Installable as an app on iOS, Android, and Desktop.
- **Dark Mode**: Optimized for comfortable reading in all lighting conditions.
- **Bookmarks & Last Read**: Easily track your progress.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zoubayerBS/sakinah.git
   ```
2. Install dependencies for both frontend and backend:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Quran Foundation credentials:
   ```env
   QURAN_CLIENT_ID=your_id
   QURAN_CLIENT_SECRET=your_secret
   ```

### Development

Start both the Vite development server and the backend proxy:

```bash
npm run dev:all
```

- **Frontend**: `http://localhost:5173`
- **Backend Proxy**: `http://localhost:3001`

## 🏗️ Project Structure

```
quran/
├── server/
│   ├── app.js              # Backend proxy, Tafsir mapping, and audio fallback logic
│   └── index.js            # Server entry point
├── src/
│   ├── context/
│   │   └── AudioContext.jsx # Global playback state management
│   ├── components/
│   │   ├── PlayerHeader.jsx # Dedicated player controls
│   │   ├── PlayerHeader.jsx # Simplified player header
│   │   ├── SurahAudioPlayer.jsx # Interactive circular visualizer
│   │   └── MiniPlayer.jsx   # Persistent global controls
│   ├── pages/
│   │   ├── PlayerPage.jsx   # Renamed from ReadingPage, focus on audio
│   │   ├── MushafPage.jsx   # Textual reading with Tafsir panel
│   │   └── HomePage.jsx     # Surah index and search
│   ├── services/
│   │   └── quran-api.js     # Frontend API client
│   └── styles/
│       └── main.css         # Component-based design system
```

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide icons.
- **Backend**: Express.js (Node.js) used as a secure proxy to handle Quran Foundation API and MP3Quran requests.
- **APIs**: Quran.com V4, MP3Quran, Tahrir wa Tanwir JSON (via GitHub).

## 📄 License

This project is created for educational and spiritual purposes. The Quran text is in the public domain.

---

**May this app help in your journey of reading and understanding the Noble Quran** 📖
