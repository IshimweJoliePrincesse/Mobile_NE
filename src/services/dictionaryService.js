// This service is the only place that talks to the Dictionary API. It also validates words and converts technical errors into friendly messages.
// These imports bring in Axios helpers for making HTTP requests and recognizing Axios errors.
import { create, isAxiosError } from "axios";

// This is the API endpoint base and the maximum time the app waits before showing a timeout message.
const BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";
const REQUEST_TIMEOUT_MS = 10000;

// These are the exact error messages shown to users in the app.
export const ERROR_MESSAGES = {
  notFound: "Word not found. Please check spelling and try again.",
  network: "No internet connection. Please check your network.",
  timeout: "Request timed out. Please try again.",
  empty: "No data available for this word.",
  generic: "Something went wrong. Please try again.",
};

// These are the exact validation messages shown under the search box.
export const VALIDATION_MESSAGES = {
  empty: "Please enter a word to search.",
  multipleWords: "Please search for one word, not a sentence.",
  numbers: "Please search for a word instead of numbers.",
  symbols: "Please search for a word instead of numbers.",
  tooShort: "Please enter at least 2 characters",
  tooLong: "Please enter no more than 50 characters",
};

// This Axios client is configured once so every request uses the same base URL and timeout.
const api = create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

// This helper prepares words for API requests by trimming spaces and using lowercase.
export function normalizeSearchWord(word) {
  return String(word || "").trim().toLowerCase();
}

// This helper checks the search input before the app contacts the API.
export function validateSearchInput(value) {
  const trimmed = String(value || "").trim();

  // Empty searches are not allowed.
  if (!trimmed) {
    return VALIDATION_MESSAGES.empty;
  }

  // The dictionary search is for one word only, not a sentence or phrase.
  if (/\s+/.test(trimmed)) {
    return VALIDATION_MESSAGES.multipleWords;
  }

  // Searches containing numbers are rejected before contacting the API.
  if (/\d/.test(trimmed)) {
    return VALIDATION_MESSAGES.numbers;
  }

  // Searches containing symbols are rejected before contacting the API.
  if (/[^A-Za-z]/.test(trimmed)) {
    return VALIDATION_MESSAGES.symbols;
  }

  // Very short words are rejected by the assignment rules.
  if (trimmed.length < 2) {
    return VALIDATION_MESSAGES.tooShort;
  }

  // Very long searches are rejected to prevent unreasonable API requests.
  if (trimmed.length > 50) {
    return VALIDATION_MESSAGES.tooLong;
  }

  return "";
}

// This helper creates a standard error object that carries the message and optional HTTP status.
function createDictionaryError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// This helper turns Axios/network errors into messages normal users can understand.
export function getFriendlyErrorMessage(error) {
  // If the error already has one of our friendly or validation messages, use it directly.
  if (
    error?.message &&
    (Object.values(ERROR_MESSAGES).includes(error.message) ||
      Object.values(VALIDATION_MESSAGES).includes(error.message))
  ) {
    return error.message;
  }

  if (isAxiosError(error)) {
    // Axios uses ECONNABORTED for timeout errors.
    if (error.code === "ECONNABORTED") {
      return ERROR_MESSAGES.timeout;
    }

    // The Dictionary API returns 404 when a word cannot be found.
    if (error.response?.status === 404) {
      return ERROR_MESSAGES.notFound;
    }

    // If there is no response at all, the user is probably offline or the network failed.
    if (!error.response) {
      return ERROR_MESSAGES.network;
    }
  }

  return ERROR_MESSAGES.generic;
}

// This function fetches one word from the Dictionary API and returns the API data.
export async function fetchWordDefinition(word) {
  // The API word must be trimmed and lowercase before being requested.
  const normalizedWord = normalizeSearchWord(word);
  const validationMessage = validateSearchInput(normalizedWord);

  try {
    // Service-level validation protects every API request, including searches started outside the main input.
    if (validationMessage) {
      throw createDictionaryError(validationMessage);
    }

    // This sends the GET request to /{word}, such as /hello.
    const response = await api.get(`/${encodeURIComponent(normalizedWord)}`);
    const data = response?.data;

    // A successful request must still contain an array with at least one result.
    if (!Array.isArray(data) || data.length === 0) {
      throw createDictionaryError(ERROR_MESSAGES.empty, response?.status);
    }

    return data;
  } catch (error) {
    // Every failure is re-thrown as a friendly Dictionary error for the screens to display.
    throw createDictionaryError(getFriendlyErrorMessage(error), error?.response?.status);
  }
}
