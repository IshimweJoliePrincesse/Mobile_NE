# Dictionary App Test Plan

Use this file to manually test the LexiTech Dictionary Mobile App with Expo CLI.

## Start The App

```bash
npx expo start
```

Open the app on Android, iOS, or an emulator using Expo.

## Search Input Validation

These inputs should be accepted as one English word:

| Input | Expected Result |
| --- | --- |
| `a` | Search runs |
| `I` | Search runs |
| `hello` | Search runs |
| `dictionary` | Search runs |
| `mother-in-law` | Search runs |
| `ice-cream` | Search runs |
| `o'clock` | Search runs |
| `can't` | Search runs |
| `rock'n'roll` | Search runs |
| `jack-o'-lantern` | Search runs |
| `naïve` | Search runs |
| `résumé` | Search runs |
| `U.S.A.` | Search runs |

These inputs should be rejected:

| Input | Expected Message |
| --- | --- |
| empty input | `Please enter a word to search.` |
| `good morning` | `Please search for one word, not a sentence.` |
| `this is a sentence` | `Please search for one word, not a sentence.` |
| `hello123` | `Please search for a word instead of numbers.` |
| `123` | `Please search for a word instead of numbers.` |
| `hello!` | `Please search for a word instead of numbers.` |
| `word@home` | `Please search for a word instead of numbers.` |

## API And Result Rendering

| Test | Expected Result |
| --- | --- |
| Search `hello` | Word detail screen opens |
| Search `run` | Multiple meanings are shown |
| Search `ice-cream` | Word fits on the detail page without breaking badly |
| Search `zzzznotaword` | Friendly word-not-found error appears |
| Turn off internet and search | Network error appears |
| Tap Retry after a failed search | Search is attempted again |

## Word Details

Check that the detail page shows:

- The searched word at the top.
- Phonetic spelling when available.
- No-phonetic fallback when unavailable.
- Meaning count.
- Audio count.
- Parts of speech.
- Numbered definitions.
- Example sentences where the API provides them.
- Long definitions inside scrollable cards.

## Audio Pronunciation

| Test | Expected Result |
| --- | --- |
| Search a word with audio, such as `hello` | Audio controls appear |
| Tap Play | Audio starts |
| Tap Pause | Audio pauses and keeps position |
| Tap Play again | Audio continues |
| Tap Stop | Audio stops and resets |
| Search a word without audio | No-audio message appears |
| Multiple pronunciations are available | Separate controls appear for each pronunciation |

## Drawer And Search History

| Test | Expected Result |
| --- | --- |
| Open drawer | `Search` and `Search History` tabs appear |
| Search a word successfully | Word is saved to history |
| Search same word again | Duplicate is not added |
| Open `Search History` tab | Saved words are listed |
| Tap a history word | Fresh API request runs and word details open |
| Tap Clear in history screen | History list clears |
| Reload the app | Previously saved history remains |

## Theme

| Test | Expected Result |
| --- | --- |
| Open drawer and tap theme button | App switches between light and dark mode |
| Dark mode drawer | Text and icons are readable |
| Dark mode search screen | Text and cards remain readable |
| Dark mode word details | Word, definitions, and audio controls remain readable |

## Startup Loading

| Test | Expected Result |
| --- | --- |
| Reload app | Book-opening loading screen appears |
| Wait 5 seconds | Dictionary search screen appears |

## Final Verification Commands

```bash
npm run lint
npx tsc --noEmit
```
