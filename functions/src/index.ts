import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleAuth } from "google-auth-library";
import { DiscussServiceClient } from "@google-ai/generativelanguage";

admin.initializeApp();

const MODEL_NAME = "models/chat-bison-001";
const API_KEY = process.env.PALM_API_KEY;

const client = new DiscussServiceClient({
    authClient: new GoogleAuth().fromAPIKey(API_KEY!),
});

export const generateTags = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "The function must be called by an authenticated user."
        );
    }

    const { poemContent } = data;

    if (!poemContent) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The function must be called with one arguments \"poemContent\" containing the poem content to process."
        );
    }

    try {
        const result = await client.generateMessage({
            model: MODEL_NAME, // Required.
            temperature: 0.25, // Optional.
            candidateCount: 1, // Optional.
            topK: 40, // Optional.
            topP: 0.95, // Optional.
            prompt: {
                // optional, preamble context for the conversation
                context: "You are a poetic assistant, skilled in analyzing poems and extracting their core themes. Your task is to generate a list of 3-5 relevant tags for a given poem. These tags should be concise, descriptive, and capture the essence of the poem's subject matter, mood, and style. Return the tags as a comma-separated list.",
                // Required. The user's prompt to start the conversation.
                messages: [{ content: poemContent }],
            },
        });

        const content = result[0]?.candidates?.[0]?.content;

        if (content) {
            const tags = content
                .split(",")
                .map((tag: string) => tag.trim())
                .filter((tag: string) => tag !== ""); //remove any empty tags

            return { tags };
        } else {
            console.warn("No tags were generated for the provided poem content.");
            return { tags: [] };
        }
    } catch (error) {
        console.error("Error generating tags:", error);
        throw new functions.https.HttpsError("internal", "Unable to generate tags.");
    }
});


export const securityGuard = functions.https.onRequest(async (request, response) => {
  const userInput = request.body.userInput;

  if (!userInput) {
    response.status(400).send("No user input provided.");
    return;
  }

  try {
    const maliciousKeywords = ["<script>", "<iframe>", "javascript:"];
    const isMalicious = maliciousKeywords.some(keyword => userInput.toLowerCase().includes(keyword));

    if (isMalicious) {
      console.log(`Malicious input detected: ${userInput}`);
      await admin.firestore().collection("logs").add({
        userInput,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: "malicious",
      });
      response.status(403).send("Malicious input detected.");
    } else {
      await admin.firestore().collection("logs").add({
        userInput,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: "clean",
      });
      response.status(200).send("Input is clean.");
    }
  } catch (error) {
    console.error("Error in security guard:", error);
    response.status(500).send("Internal server error.");
  }
});

export const deleteAccount = functions.https.onCall(async (_, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called by an authenticated user."
    );
  }
  const uid = context.auth.uid;
  try {
    await admin.auth().deleteUser(uid);
  } catch (error) {
    console.error(`Error deleting user: ${uid}`, error);
    throw new functions.https.HttpsError("internal", "Unable to delete user.");
  }
});