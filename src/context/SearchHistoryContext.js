// This context stores searched words, prevents duplicates, limits history, and exposes clear actions.
import React, { createContext, useContext, useReducer } from "react";
import { normalizeSearchWord } from "../services/dictionaryService";

const SearchHistoryContext = createContext(null);

const ADD_SEARCH = "ADD_SEARCH";
const CLEAR_HISTORY = "CLEAR_HISTORY";
const MAX_HISTORY_ITEMS = 20;

function searchHistoryReducer(state, action) {
  switch (action.type) {
    case ADD_SEARCH: {
      const word = normalizeSearchWord(action.payload);

      if (!word) {
        return state;
      }

      const filteredHistory = state.history.filter((item) => item !== word);
      return {
        ...state,
        history: [word, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS),
      };
    }

    case CLEAR_HISTORY:
      return {
        ...state,
        history: [],
      };

    default:
      return state;
  }
}

export function SearchHistoryProvider({ children }) {
  const [state, dispatch] = useReducer(searchHistoryReducer, { history: [] });

  const addSearch = (word) => {
    dispatch({ type: ADD_SEARCH, payload: word });
  };

  const clearHistory = () => {
    dispatch({ type: CLEAR_HISTORY });
  };

  return (
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
  const context = useContext(SearchHistoryContext);

  if (!context) {
    throw new Error("useSearchHistory must be used within SearchHistoryProvider");
  }

  return context;
}
