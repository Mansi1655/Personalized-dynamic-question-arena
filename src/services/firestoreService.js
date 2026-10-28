// Firestore CRUD Service for GATE Question Bank
// ===============================================
// Handles all database operations: fetch, add, seed, delete questions

import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch
} from 'firebase/firestore';

const QUESTIONS_COLLECTION = 'questions';

/**
 * Fetch all questions from Firestore
 * @returns {Promise<Array>} Array of question objects
 */
export async function getAllQuestions() {
  try {
    const querySnapshot = await getDocs(collection(db, QUESTIONS_COLLECTION));
    const questions = [];
    querySnapshot.forEach((docSnap) => {
      questions.push({ ...docSnap.data(), _firestoreId: docSnap.id });
    });
    return questions;
  } catch (error) {
    console.error('Error fetching questions from Firestore:', error);
    throw error;
  }
}

/**
 * Fetch questions filtered by subject
 * @param {string} subjectId - Subject ID to filter by
 * @returns {Promise<Array>} Filtered questions
 */
export async function getQuestionsBySubject(subjectId) {
  try {
    const q = query(
      collection(db, QUESTIONS_COLLECTION),
      where('subjectId', '==', subjectId)
    );
    const querySnapshot = await getDocs(q);
    const questions = [];
    querySnapshot.forEach((docSnap) => {
      questions.push({ ...docSnap.data(), _firestoreId: docSnap.id });
    });
    return questions;
  } catch (error) {
    console.error('Error fetching questions by subject:', error);
    throw error;
  }
}

/**
 * Add a single question to Firestore
 * @param {Object} question - Question object
 * @returns {Promise<string>} The Firestore document ID
 */
export async function addQuestion(question) {
  try {
    // Use the question's own id as the document ID for deduplication
    const docRef = doc(db, QUESTIONS_COLLECTION, question.id);
    await setDoc(docRef, {
      ...question,
      createdAt: new Date().toISOString(),
      source_type: question.source_type || 'manual'
    });
    return question.id;
  } catch (error) {
    console.error('Error adding question to Firestore:', error);
    throw error;
  }
}

/**
 * Add multiple questions to Firestore in a batch (max 500 per batch)
 * @param {Array} questions - Array of question objects
 * @returns {Promise<number>} Number of questions added
 */
export async function addMultipleQuestions(questions) {
  try {
    let addedCount = 0;
    // Firestore batch writes are limited to 500 operations
    const batchSize = 450;
    
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = questions.slice(i, i + batchSize);
      
      chunk.forEach((question) => {
        const docRef = doc(db, QUESTIONS_COLLECTION, question.id);
        batch.set(docRef, {
          ...question,
          createdAt: question.createdAt || new Date().toISOString(),
          source_type: question.source_type || 'seeded'
        });
      });
      
      await batch.commit();
      addedCount += chunk.length;
    }
    
    return addedCount;
  } catch (error) {
    console.error('Error batch adding questions:', error);
    throw error;
  }
}

/**
 * Delete a question from Firestore
 * @param {string} questionId - The question's id field (used as doc ID)
 */
export async function deleteQuestion(questionId) {
  try {
    await deleteDoc(doc(db, QUESTIONS_COLLECTION, questionId));
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
}

/**
 * Seed Firestore with initial questions from the local question bank
 * Skips questions that already exist (uses question.id as doc ID)
 * @param {Array} initialQuestions - Array of questions to seed
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<number>} Number of new questions seeded
 */
export async function seedQuestionsToFirestore(initialQuestions, onProgress) {
  try {
    // First, get existing question IDs
    const existing = await getAllQuestions();
    const existingIds = new Set(existing.map(q => q.id));
    
    // Filter out already-existing questions
    const newQuestions = initialQuestions.filter(q => !existingIds.has(q.id));
    
    if (newQuestions.length === 0) {
      if (onProgress) onProgress('All questions already exist in Firestore. Nothing to seed.');
      return 0;
    }
    
    if (onProgress) onProgress(`Seeding ${newQuestions.length} new questions to Firestore...`);
    
    const count = await addMultipleQuestions(newQuestions);
    
    if (onProgress) onProgress(`Successfully seeded ${count} questions to Firestore!`);
    return count;
  } catch (error) {
    console.error('Error seeding questions:', error);
    throw error;
  }
}

/**
 * Get count of questions per subject from Firestore
 * @returns {Promise<Object>} { subjectId: count }
 */
export async function getQuestionCountBySubject() {
  try {
    const allQuestions = await getAllQuestions();
    const counts = {};
    allQuestions.forEach(q => {
      counts[q.subjectId] = (counts[q.subjectId] || 0) + 1;
    });
    return counts;
  } catch (error) {
    console.error('Error getting question counts:', error);
    throw error;
  }
}
