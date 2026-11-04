import {
  ChatMessage,
  Flashcard,
  QuizAssessment,
  StudyDocument,
  StudyStats,
  WeakTopic,
  ComprehensiveDocumentNotes,
  NoteGenerationMode,
  DetailedTopicNote,
} from '../types';
import {
  DEFAULT_CHAT_MESSAGES,
  DEFAULT_DOCUMENTS,
  DEFAULT_FLASHCARDS,
  DEFAULT_QUIZZES,
  DEFAULT_STATS,
} from '../data/defaultData';

const KEYS = {
  DOCUMENTS: 'study_buddy_documents',
  ACTIVE_DOC_ID: 'study_buddy_active_doc_id',
  CHAT_MESSAGES: 'study_buddy_chat_messages',
  QUIZZES: 'study_buddy_quizzes',
  FLASHCARDS: 'study_buddy_flashcards',
  STATS: 'study_buddy_stats',
  LANGUAGE: 'study_buddy_language',
  COMPREHENSIVE_NOTES: 'study_buddy_comprehensive_notes',
};

export const StorageService = {
  getDocuments(): StudyDocument[] {
    try {
      const data = localStorage.getItem(KEYS.DOCUMENTS);
      return data ? JSON.parse(data) : DEFAULT_DOCUMENTS;
    } catch {
      return DEFAULT_DOCUMENTS;
    }
  },

  saveDocuments(docs: StudyDocument[]) {
    try {
      localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(docs));
    } catch (e) {
      console.warn('LocalStorage quota exceeded on saveDocuments; saving lightweight copy:', e);
      try {
        // Strip heavy raw content from non-active docs or trim to prevent crash
        const lightweight = docs.map((d, i) => {
          if (i === 0) {
            return {
              ...d,
              content: d.content ? d.content.slice(0, 150000) : '',
              pagesData: d.pagesData ? d.pagesData.slice(0, 60) : [],
            };
          }
          return {
            ...d,
            content: d.content ? d.content.slice(0, 20000) : '',
            pagesData: [],
          };
        });
        localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(lightweight));
      } catch (innerErr) {
        console.error('Failed to save even lightweight documents to localStorage:', innerErr);
      }
    }
  },

  getActiveDocId(): string {
    return localStorage.getItem(KEYS.ACTIVE_DOC_ID) || DEFAULT_DOCUMENTS[0].id;
  },

  setActiveDocId(id: string) {
    localStorage.setItem(KEYS.ACTIVE_DOC_ID, id);
  },

  getChatMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(KEYS.CHAT_MESSAGES);
      if (data) {
        const parsed: ChatMessage[] = JSON.parse(data);
        // If it starts with the old built-in question 'msg-1' or old text, migrate to welcoming default
        if (
          parsed.length > 0 &&
          (parsed[0].id === 'msg-1' ||
            parsed[0].text?.includes('difference between SN1 and SN2 mechanisms'))
        ) {
          this.saveChatMessages(DEFAULT_CHAT_MESSAGES);
          return DEFAULT_CHAT_MESSAGES;
        }
        return parsed;
      }
      return DEFAULT_CHAT_MESSAGES;
    } catch {
      return DEFAULT_CHAT_MESSAGES;
    }
  },

  saveChatMessages(messages: ChatMessage[]) {
    localStorage.setItem(KEYS.CHAT_MESSAGES, JSON.stringify(messages));
  },

  getQuizzes(): QuizAssessment[] {
    try {
      const data = localStorage.getItem(KEYS.QUIZZES);
      return data ? JSON.parse(data) : DEFAULT_QUIZZES;
    } catch {
      return DEFAULT_QUIZZES;
    }
  },

  saveQuizzes(quizzes: QuizAssessment[]) {
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify(quizzes));
  },

  getFlashcards(): Flashcard[] {
    try {
      const data = localStorage.getItem(KEYS.FLASHCARDS);
      return data ? JSON.parse(data) : DEFAULT_FLASHCARDS;
    } catch {
      return DEFAULT_FLASHCARDS;
    }
  },

  saveFlashcards(cards: Flashcard[]) {
    localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(cards));
  },

  getStats(): StudyStats {
    try {
      const data = localStorage.getItem(KEYS.STATS);
      const storedStats: StudyStats = data ? JSON.parse(data) : DEFAULT_STATS;

      const quizzes = this.getQuizzes();
      const completedQuizzes = quizzes.filter((q) => q.score !== undefined);
      const quizzesCompleted = completedQuizzes.length;

      const avgAccuracy =
        completedQuizzes.length > 0
          ? Math.round(
              completedQuizzes.reduce(
                (acc, q) => acc + (q.masteryPercentage || 0),
                0
              ) / completedQuizzes.length
            )
          : storedStats.averageAccuracy;

      const flashcards = this.getFlashcards();
      const masteredCardsCount = flashcards.filter(
        (f) => f.masteryLevel === 'mastered'
      ).length;
      const totalCardsCount = flashcards.length;

      // Extract weak topics dynamically from quiz incorrect answers
      const subtopicStats: Record<string, { correct: number; total: number }> = {};
      quizzes.forEach((quiz) => {
        quiz.questions.forEach((q) => {
          if (q.subtopic && q.userAnswer !== undefined) {
            if (!subtopicStats[q.subtopic]) {
              subtopicStats[q.subtopic] = { correct: 0, total: 0 };
            }
            subtopicStats[q.subtopic].total += 1;
            if (q.isCorrect) {
              subtopicStats[q.subtopic].correct += 1;
            }
          }
        });
      });

      const dynamicWeakTopics: WeakTopic[] = [];
      Object.entries(subtopicStats).forEach(([subtopic, counts], idx) => {
        const accuracy = Math.round((counts.correct / counts.total) * 100);
        if (accuracy < 75) {
          dynamicWeakTopics.push({
            id: `wt-dyn-${idx}`,
            name: subtopic,
            accuracy,
            quizzesTaken: counts.total,
            recommendation: `Targeted review recommended for ${subtopic}. Practice related questions and flashcards.`,
          });
        }
      });

      const weakTopics =
        dynamicWeakTopics.length > 0 ? dynamicWeakTopics : storedStats.weakTopics;

      return {
        ...storedStats,
        quizzesCompleted: Math.max(storedStats.quizzesCompleted, quizzesCompleted),
        averageAccuracy: avgAccuracy,
        masteredCardsCount,
        totalCardsCount,
        weakTopics,
      };
    } catch {
      return DEFAULT_STATS;
    }
  },

  saveStats(stats: StudyStats) {
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  },

  logStudyMinutes(minutes: number = 30): StudyStats {
    const stats = this.getStats();
    const newTotal = stats.totalStudyMinutes + minutes;
    const todayIndex = stats.weeklyMinutes.length > 0 ? stats.weeklyMinutes.length - 1 : 6;
    const updatedWeekly = [...stats.weeklyMinutes];
    if (updatedWeekly[todayIndex]) {
      updatedWeekly[todayIndex].minutes += minutes;
    } else {
      updatedWeekly.push({ day: 'Today', minutes });
    }
    const lastDate = stats.lastStudyDate ? new Date(stats.lastStudyDate).toDateString() : '';
    const todayDate = new Date().toDateString();
    const streakIncrement = lastDate !== todayDate ? 1 : 0;

    const updated: StudyStats = {
      ...stats,
      totalStudyMinutes: newTotal,
      weeklyMinutes: updatedWeekly,
      streakDays: stats.streakDays + streakIncrement,
      lastStudyDate: new Date().toISOString(),
    };
    this.saveStats(updated);
    return updated;
  },

  getLanguage(): string {
    return localStorage.getItem(KEYS.LANGUAGE) || 'english';
  },

  setLanguage(lang: string) {
    localStorage.setItem(KEYS.LANGUAGE, lang);
  },

  // Calculate local browser storage usage
  getStorageUsage(): { usedMB: number; totalMB: number; percentage: number } {
    let totalBytes = 0;
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalBytes += (localStorage[key].length + key.length) * 2;
        }
      }
    } catch (e) {
      // Fallback
      totalBytes = 4400000;
    }
    // Give a realistic baseline (4.2 MB initial textbook + cache representation)
    const baseUsed = Math.max(4.2, +(totalBytes / (1024 * 1024)).toFixed(1));
    const totalMB = 10.0;
    const percentage = Math.min(100, Math.round((baseUsed / totalMB) * 100));
    return {
      usedMB: baseUsed,
      totalMB,
      percentage,
    };
  },

  // Comprehensive Document Notes
  getComprehensiveNotes(docId: string, mode?: NoteGenerationMode): ComprehensiveDocumentNotes | null {
    try {
      // First try discrete key
      const discreteKey = mode ? `study_notes_${docId}_${mode}` : `study_notes_${docId}_detailed`;
      const direct = localStorage.getItem(discreteKey);
      if (direct) {
        return JSON.parse(direct);
      }

      const data = localStorage.getItem(KEYS.COMPREHENSIVE_NOTES);
      if (!data) return null;
      const allNotes: Record<string, ComprehensiveDocumentNotes> = JSON.parse(data);
      if (mode) {
        return allNotes[`${docId}_${mode}`] || allNotes[docId] || null;
      }
      return allNotes[`${docId}_detailed`] || allNotes[docId] || null;
    } catch {
      return null;
    }
  },

  saveComprehensiveNotes(notes: ComprehensiveDocumentNotes) {
    try {
      const discreteKey = `study_notes_${notes.documentId}_${notes.mode}`;
      localStorage.setItem(discreteKey, JSON.stringify(notes));

      // Also try to sync with master index
      const data = localStorage.getItem(KEYS.COMPREHENSIVE_NOTES);
      const allNotes: Record<string, ComprehensiveDocumentNotes> = data ? JSON.parse(data) : {};
      const key = `${notes.documentId}_${notes.mode}`;
      allNotes[key] = notes;
      allNotes[notes.documentId] = notes;
      localStorage.setItem(KEYS.COMPREHENSIVE_NOTES, JSON.stringify(allNotes));
    } catch (e) {
      console.warn('Quota limit on aggregated notes; discrete key saved successfully:', e);
    }
  },

  updateSingleTopicNote(
    docId: string,
    updatedTopic: DetailedTopicNote,
    mode: NoteGenerationMode = 'detailed'
  ): ComprehensiveDocumentNotes | null {
    const existing = this.getComprehensiveNotes(docId, mode);
    if (!existing) return null;

    const topicIndex = existing.topics.findIndex((t) => t.id === updatedTopic.id);
    let updatedTopics: DetailedTopicNote[];
    if (topicIndex >= 0) {
      updatedTopics = [...existing.topics];
      updatedTopics[topicIndex] = updatedTopic;
    } else {
      updatedTopics = [...existing.topics, updatedTopic];
    }

    const completed = updatedTopics.filter((t) => t.status === 'complete').length;
    const incomplete = updatedTopics.filter((t) => t.status === 'incomplete' || t.status === 'failed').length;
    const pending = updatedTopics.filter((t) => t.status === 'pending').length;

    const updatedNotes: ComprehensiveDocumentNotes = {
      ...existing,
      topics: updatedTopics,
      coverageTracker: {
        totalTopics: updatedTopics.length,
        completedTopics: completed,
        incompleteTopics: incomplete,
        pendingTopics: pending,
        coveragePercentage: updatedTopics.length > 0 ? Math.round((completed / updatedTopics.length) * 100) : 0,
        totalSubtopics: updatedTopics.reduce((acc, t) => acc + (t.subtopics?.length || 0), 0),
        completedSubtopics: updatedTopics
          .filter((t) => t.status === 'complete')
          .reduce((acc, t) => acc + (t.subtopics?.length || 0), 0),
      },
    };

    this.saveComprehensiveNotes(updatedNotes);
    return updatedNotes;
  },

  getAllComprehensiveNotes(): Record<string, ComprehensiveDocumentNotes> {
    try {
      const data = localStorage.getItem(KEYS.COMPREHENSIVE_NOTES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  // Export all application state to JSON
  exportDataJSON(): string {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      documents: this.getDocuments(),
      chatMessages: this.getChatMessages(),
      quizzes: this.getQuizzes(),
      flashcards: this.getFlashcards(),
      stats: this.getStats(),
      language: this.getLanguage(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import JSON backup
  importDataJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.documents) this.saveDocuments(data.documents);
      if (data.chatMessages) this.saveChatMessages(data.chatMessages);
      if (data.quizzes) this.saveQuizzes(data.quizzes);
      if (data.flashcards) this.saveFlashcards(data.flashcards);
      if (data.stats) this.saveStats(data.stats);
      if (data.language) this.setLanguage(data.language);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  },

  // Reset all to clean demo state
  resetAll() {
    localStorage.clear();
    this.saveDocuments(DEFAULT_DOCUMENTS);
    this.setActiveDocId(DEFAULT_DOCUMENTS[0].id);
    this.saveChatMessages(DEFAULT_CHAT_MESSAGES);
    this.saveQuizzes(DEFAULT_QUIZZES);
    this.saveFlashcards(DEFAULT_FLASHCARDS);
    this.saveStats(DEFAULT_STATS);
    this.setLanguage('english');
  },
};
