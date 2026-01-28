"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityGuard = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
exports.securityGuard = functions.https.onRequest(async (request, response) => {
    const userInput = request.body.userInput;
    if (!userInput) {
        response.status(400).send('No user input provided.');
        return;
    }
    try {
        // In a real application, you would use a more sophisticated AI model
        // to analyze the user input for threats.
        // For this example, we'll just check for a few keywords.
        const maliciousKeywords = ['<script>', '<iframe>', 'javascript:'];
        const isMalicious = maliciousKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
        if (isMalicious) {
            // If the input is deemed malicious, we can log it and send a response.
            console.log(`Malicious input detected: ${userInput}`);
            await admin.firestore().collection('logs').add({
                userInput,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: 'malicious'
            });
            response.status(403).send('Malicious input detected.');
        }
        else {
            // If the input is clean, we can log it and send a success response.
            await admin.firestore().collection('logs').add({
                userInput,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: 'clean'
            });
            response.status(200).send('Input is clean.');
        }
    }
    catch (error) {
        console.error('Error in security guard:', error);
        response.status(500).send('Internal server error.');
    }
});
//# sourceMappingURL=index.js.map