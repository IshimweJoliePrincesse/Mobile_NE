// This context stores searched words so the drawer can show search history across the app.
// These imports provide React Context for sharing history and a reducer for predictable updates.
import "expo-sqlite/localStorage/install";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { normalizeSearchWord } from "../services/dictionaryService";

// This creates the shared history container that screens can read from.
const SearchHistoryContext = createContext(null);

// These action names describe the two changes allowed for history: add a word or clear all words.
const ADD_SEARCH = "ADD_SEARCH";
const CLEAR_HISTORY = "CLEAR_HISTORY";
const MAX_HISTORY_ITEMS = 20;
const HISTORY_STORAGE_KEY = "lexitech.searchHistory";

// This helper reads saved search history from device storage when the app reloads.
function loadSavedHistory() {
  try {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsedHistory = savedHistory ? JSON.parse(savedHistory) : [];

    if (!Array.isArray(parsedHistory)) {
      return { history: [] };
    }

    const cleanedHistory = parsedHistory
      .map((word) => normalizeSearchWord(word))
      .filter(Boolean)
      .filter((word, index, words) => words.indexOf(word) === index)
      .slice(0, MAX_HISTORY_ITEMS);

    return { history: cleanedHistory };
  } catch (_error) {
    return { history: [] };
  }
}

// This helper saves the latest history list so it remains after reloads.
function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (_error) {
    // If storage is unavailable, the app still works with in-memory history for this session.
  }
}

// This reducer is the rulebook for changing search history.
function searchHistoryReducer(state, action) {
  switch (action.type) {
    case ADD_SEARCH: {
      // Normalize keeps history entries lowercase and trimmed, matching API searches.
      const word = normalizeSearchWord(action.payload);

      if (!word) {
        return state;
      }

      // Remove the word first so duplicates are not kept; then place the newest search at the top.
      const filteredHistory = state.history.filter((item) => item !== word);
      return {
        ...state,
        history: [word, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS),
      };
    }

    case CLEAR_HISTORY:
      // Clearing history resets the list to empty.
      return {
        ...state,
        history: [],
      };

    default:
      return state;
  }
}

export function SearchHistoryProvider({ children }) {
  // This state stores all history words and dispatch sends update actions to the reducer.
  const [state, dispatch] = useReducer(searchHistoryReducer, undefined, loadSavedHistory);

  // This effect writes history to device storage each time it changes.
  useEffect(() => {
    saveHistory(state.history);
  }, [state.history]);

  // This helper is used after successful searches to add a word to history.
  const addSearch = (word) => {
    dispatch({ type: ADD_SEARCH, payload: word });
  };

  // This helper is used by the drawer Clear History button.
  const clearHistory = () => {
    dispatch({ type: CLEAR_HISTORY });
  };

  return (
    // This provider makes history, addSearch, and clearHistory available to screens and navigation.
    <SearchHistoryContext.Provider
      value={{
        history: state.history,
        addSearch,
        clearHistory,
      }}
    >
      {children}
    </SearchHistoryContext.Provider>
  );
}

export function useSearchHistory() {
  // This custom hook gives components easy access to the shared search history.
  const context = useContext(SearchHistoryContext);

  if (!context) {
    throw new Error("useSearchHistory must be used within SearchHistoryProvider");
  }

  return context;
}
