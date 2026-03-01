import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import { app } from './firebase';

let functions: Functions | null = null;

if (app) {
  functions = getFunctions(app);
}

export const generateTags = functions ? httpsCallable(functions, 'generateTags') : null;
