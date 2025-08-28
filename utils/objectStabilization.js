/**
 * Object Stabilization Utilities
 * 
 * Provides controlled object deep cloning and stabilization to prevent
 * JavaScript timing issues and object reference problems that can cause
 * zero values in exam submissions.
 * 
 * This replaces the accidental object stabilization that was happening
 * through debug logging JSON.parse(JSON.stringify()) operations.
 */

/**
 * Stabilize an object by creating a deep clone
 * This breaks object references and prevents timing-related mutations
 */
export function stabilizeObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  try {
    // Use JSON serialization for deep cloning (same as debug logging did)
    // This is intentional to maintain the same stabilization behavior
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn('Object stabilization failed, returning original:', error);
    return obj;
  }
}

/**
 * Stabilize progressive data before submission processing
 * Critical for maintaining data integrity during the submission pipeline
 */
export function stabilizeProgressiveData(progressiveData) {
  return stabilizeObject(progressiveData);
}

/**
 * Stabilize evaluation results to prevent mutation during updates
 */
export function stabilizeEvaluationResult(evaluationResult) {
  return stabilizeObject(evaluationResult);
}

/**
 * Stabilize answers object to prevent reference issues
 */
export function stabilizeAnswers(answers) {
  return stabilizeObject(answers);
}

/**
 * Stabilize progressive results state
 */
export function stabilizeProgressiveResults(progressiveResults) {
  return stabilizeObject(progressiveResults);
}

/**
 * Stabilize transform data to prevent data loss during conversions
 */
export function stabilizeTransformData(data) {
  return stabilizeObject(data);
}

/**
 * Multiple stabilization - stabilize several objects at once
 * Returns an array of stabilized objects in the same order
 */
export function stabilizeMultiple(...objects) {
  return objects.map(obj => stabilizeObject(obj));
}