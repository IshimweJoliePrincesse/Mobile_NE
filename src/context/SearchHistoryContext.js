// This context stores searched words so the drawer can show search history across the app.
// These imports provide React Context for sharing history and a reducer for predictable updates.
import React, { createContext, useContext, useReducer } from "react";
import { normalizeSearchWord } from "../services/dictionaryService";

// This creates the shared history container that screens can read from.
const SearchHistoryContext = createContext(null);

// These action names describe the two changes allowed for history: add a word or clear all words.
const ADD_SEARCH = "ADD_SEARCH";
const CLEAR_HISTORY = "CLEAR_HISTORY";
const MAX_HISTORY_ITEMS = 20;

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
  const [state, dispatch] = useReducer(searchHistoryReducer, { history: [] });

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
