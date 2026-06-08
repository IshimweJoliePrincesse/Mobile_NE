// This service centralizes Dictionary API calls, request validation, and user-friendly error messages.
import { create, isAxiosError } from "axios";

const BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";
const REQUEST_TIMEOUT_MS = 10000;

export const ERROR_MESSAGES = {
  notFound: "Word not found. Please check spelling and try again.",
  network: "No internet connection. Please check your network.",
  timeout: "Request timed out. Please try again.",
  empty: "No data available for this word.",
  generic: "Something went wrong. Please try again.",
};

const api = create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

export function normalizeSearchWord(word) {
  return String(word || "").trim().toLowerCase();
}

export function validateSearchInput(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return "Please enter a word";
  }

  if (!/^[A-Za-z]+$/.test(trimmed)) {
    return "Only alphabetical characters are allowed";
  }

  if (trimmed.length < 2) {
    return "Please enter at least 2 characters";
  }

  if (trimmed.length > 50) {
    return "Please enter no more than 50 characters";
  }

  return "";
}

function createDictionaryError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function getFriendlyErrorMessage(error) {
  if (error?.message && Object.values(ERROR_MESSAGES).includes(error.message)) {
    return error.message;
  }

  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return ERROR_MESSAGES.timeout;
    }

    if (error.response?.status === 404) {
      return ERROR_MESSAGES.notFound;
    }

    if (!error.response) {
      return ERROR_MESSAGES.network;
    }
  }

  return ERROR_MESSAGES.generic;
}

export async function fetchWordDefinition(word) {
  const normalizedWord = normalizeSearchWord(word);

  try {
    const response = await api.get(`/${encodeURIComponent(normalizedWord)}`);
    const data = response?.data;

    if (!Array.isArray(data) || data.length === 0) {
      throw createDictionaryError(ERROR_MESSAGES.empty, response?.status);
    }

    return data;
  } catch (error) {
    throw createDictionaryError(getFriendlyErrorMessage(error), error?.response?.status);
  }
}
