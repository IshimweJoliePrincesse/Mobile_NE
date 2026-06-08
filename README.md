# LexiTech Dictionary Mobile App

This is a React Native Expo dictionary app for LexiTech Solutions Ltd. It lets users search English words, view meanings and examples, listen to available pronunciations, and reopen previous searches from drawer history.

## Main Features

- Search one valid English word at a time.
- Fetch definitions from the Free Dictionary API with `axios`.
- Show word, phonetic text, parts of speech, definitions, and examples.
- Support multiple audio pronunciations, including UK, US, and AU labels when the API provides them.
- Provide Play, Pause, and Stop controls for audio playback.
- Store successful searches in drawer history and prevent duplicates.
- Handle empty input, multiple words, numbers, symbols, not-found responses, network errors, timeouts, malformed responses, and no-data states.
- Support light and dark mode with a polished mobile UI.
- Show a five-second book-opening loading screen before the dictionary appears.

## Run The App

```bash
npm install
npx expo start
```

Use the Expo CLI QR code to test on a mobile device or emulator.

## Useful Commands

```bash
npm run lint
npx tsc --noEmit
```

## Project Structure

```text
src/
  app/
    _layout.tsx              # Expo Router root wrapper
    index.tsx                # App providers and startup book loading screen
  components/
    AudioPlayer.js           # Pronunciation playback controls
    DefinitionCard.js        # Meaning and definition card
    ErrorMessage.js          # Friendly error and retry UI
    LoadingSpinner.js        # Loading feedback UI
  context/
    SearchHistoryContext.js  # Search history state and duplicate prevention
    ThemeContext.js          # Light and dark theme state
  navigation/
    DrawerNavigator.js       # Drawer navigation and search history menu
  screens/
    BookOpeningScreen.js     # Five-second startup animation
    SearchScreen.js          # Search input, validation, API request, autocomplete
    WordDetailScreen.js      # Word result, phonetics, audio, meanings
  services/
    dictionaryService.js     # Axios API client, validation, and error mapping
```

See `PROJECT_DESIGN.md` for the data flow diagram, architecture diagram, endpoint, pages, validation rules, and activity coverage.
