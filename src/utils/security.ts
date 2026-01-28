import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Invokes the 'securityGuard' Firebase Cloud Function to perform a real-time
 * security assessment of the user's input.
 *
 * This check analyzes the input for potential threats like XSS attacks.
 *
 * @returns {Promise<boolean>} A boolean indicating whether the input is malicious.
 */
export const runSecurityChecks = async (userInput: string): Promise<boolean> => {
  console.log('Invoking AI Security Guard...');

  try {
    const functions = getFunctions();
    const securityGuard = httpsCallable(functions, 'securityGuard');
    const result = await securityGuard({ userInput });
    const isMalicious = result.data.status === 'malicious';

    if (isMalicious) {
      console.warn(`Security Alert: Malicious input detected: ${userInput}`);
    }

    return isMalicious;

  } catch (err) {
    console.error('An unexpected error occurred during the security check:', err);
    return true; // Default to malicious if an error occurs
  }
};
