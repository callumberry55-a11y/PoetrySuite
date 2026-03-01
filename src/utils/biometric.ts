const BIOMETRIC_CREDENTIAL_KEY = 'biometric_credential';

export interface BiometricAvailability {
  isAvailable: boolean;
  biometryType?: any;
  error?: string;
}

export async function isBiometricAvailable(): Promise<BiometricAvailability> {
  return {
    isAvailable: false,
    error: 'Biometric authentication is currently disabled'
  };
}

export async function getBiometricTypeName(_type: any): Promise<string> {
  return 'Biometric';
}

export async function authenticateWithBiometric(_reason: string = 'Authenticate to continue'): Promise<boolean> {
  console.warn('Biometric authentication is currently disabled');
  return false;
}

export async function getBiometricPreference(userId: string): Promise<boolean> {
  try {
    const { supabase } = await import('../lib/supabase');
    const { data } = await supabase
      .from('user_preferences')
      .select('biometric_enabled')
      .eq('user_id', userId)
      .maybeSingle();

    return data?.biometric_enabled || false;
  } catch (error) {
    console.error('Error loading biometric preference:', error);
    return false;
  }
}

export async function saveBiometricPreference(userId: string, enabled: boolean): Promise<void> {
  try {
    const { supabase } = await import('../lib/supabase');
    await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        biometric_enabled: enabled,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
  } catch (error) {
    console.error('Error saving biometric preference:', error);
    throw error;
  }
}

export function storeBiometricCredential(userId: string): void {
  try {
    localStorage.setItem(BIOMETRIC_CREDENTIAL_KEY, userId);
  } catch (error) {
    console.error('Error storing biometric credential:', error);
  }
}

export function getBiometricCredential(): string | null {
  try {
    return localStorage.getItem(BIOMETRIC_CREDENTIAL_KEY);
  } catch (error) {
    console.error('Error getting biometric credential:', error);
    return null;
  }
}

export function clearBiometricCredential(): void {
  try {
    localStorage.removeItem(BIOMETRIC_CREDENTIAL_KEY);
  } catch (error) {
    console.error('Error clearing biometric credential:', error);
  }
}

export async function attemptBiometricLogin(): Promise<string | null> {
  const storedUserId = getBiometricCredential();
  if (!storedUserId) {
    return null;
  }

  const isEnabled = await getBiometricPreference(storedUserId);
  if (!isEnabled) {
    return null;
  }

  const availability = await isBiometricAvailable();
  if (!availability.isAvailable) {
    return null;
  }

  const authenticated = await authenticateWithBiometric('Authenticate to unlock Poetry Suite');
  if (authenticated) {
    return storedUserId;
  }

  return null;
}
