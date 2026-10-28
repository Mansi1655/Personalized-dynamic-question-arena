// Local Storage & Persistence Service for GATE Preparation Platform

import { INITIAL_QUESTIONS } from '../data/authenticQuestions';
import { INITIAL_USER_STATE } from '../data/defaultUser';

const STORAGE_KEYS = {
  QUESTIONS: 'pdqa_questions_v1',
  USER: 'pdqa_user_v1'
};

export const StorageService = {
  getQuestions: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read error for questions:', e);
    }
    return INITIAL_QUESTIONS;
  },

  saveQuestions: (questions) => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch (e) {
      console.warn('Storage write error for questions:', e);
    }
  },

  getUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read error for user:', e);
    }
    return INITIAL_USER_STATE;
  },

  saveUser: (user) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Storage write error for user:', e);
    }
  },

  resetAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
    return {
      questions: INITIAL_QUESTIONS,
      user: INITIAL_USER_STATE
    };
  }
};
