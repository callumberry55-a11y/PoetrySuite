import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

const functions = getFunctions(app);

export const generateTags = httpsCallable(functions, 'generateTags');
