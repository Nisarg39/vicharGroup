"use server";
import { connectDB } from "../../config/mongoose";
import mongoose from "mongoose";
import { retryAutoSave } from "../../utils/retryHandler";

// Temporary storage for exam progress (in production, use Redis)
const examProgressStore = new Map();

/**
 * Auto-save exam progress with retry logic
 * This is called every 30 seconds from the client
 */
export async function autoSaveExamProgress(progressData) {
  return await retryAutoSave(saveExamProgressInternal, progressData);
}

// Internal function that does the actual save
async function saveExamProgressInternal(progressData) {
  try {
    const {
      examId,
      studentId,
      answers,
      currentQuestionIndex,
      markedQuestions,
      visitedQuestions,
      timeLeft,
      lastSaved
    } = progressData;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(examId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid exam or student ID"
      };
    }

    // Create unique key for this exam session
    const progressKey = `${examId}_${studentId}`;
    
    // Store progress in memory (in production, use Redis or database)
    examProgressStore.set(progressKey, {
      ...progressData,
      lastSaved: new Date().toISOString(),
      serverTimestamp: Date.now()
    });

    // Optional: Also save critical data to database for recovery
    // This would be a lightweight save, not a full submission
    if (Object.keys(answers).length > 0) {
      await connectDB();
      
      // You could create a separate ExamProgress collection for this
      // For now, we're just using in-memory storage
      
      console.log(`✅ Auto-saved progress for student ${studentId} in exam ${examId}`);
    }

    return {
      success: true,
      message: "Progress saved",
      savedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("Error in auto-save:", error);
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Recover exam progress if client loses connection
 */
export async function recoverExamProgress(examId, studentId) {
  try {
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(examId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid exam or student ID",
        progress: null
      };
    }

    const progressKey = `${examId}_${studentId}`;
    const savedProgress = examProgressStore.get(progressKey);

    if (!savedProgress) {
      return {
        success: false,
        message: "No saved progress found",
        progress: null
      };
    }

    // Check if progress is not too old (e.g., within last hour)
    const savedTime = new Date(savedProgress.lastSaved).getTime();
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (now - savedTime > oneHour) {
      // Progress is too old, might be from a previous attempt
      examProgressStore.delete(progressKey);
      return {
        success: false,
        message: "Saved progress expired",
        progress: null
      };
    }

    return {
      success: true,
      message: "Progress recovered",
      progress: savedProgress
    };

  } catch (error) {
    console.error("Error recovering progress:", error);
    return {
      success: false,
      message: "Error recovering progress",
      progress: null
    };
  }
}

/**
 * Clear saved progress after successful submission
 */
export async function clearExamProgress(examId, studentId) {
  try {
    const progressKey = `${examId}_${studentId}`;
    examProgressStore.delete(progressKey);
    
    return {
      success: true,
      message: "Progress cleared"
    };
  } catch (error) {
    console.error("Error clearing progress:", error);
    return {
      success: false,
      message: "Error clearing progress"
    };
  }
}

/**
 * Get status of auto-save system (for monitoring)
 */
export async function getAutoSaveStatus() {
  return {
    activeSession: examProgressStore.size,
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
    status: "operational"
  };
}