import { Firestore } from "@google-cloud/firestore";
import { OAuth2Client } from "google-auth-library";

export async function getFirestoreClient(accessToken: string) {
  const projectId = process.env.FIRESTORE_PROJECT_ID || "nuvodo";
  const databaseId = process.env.FIRESTORE_DATABASE_ID || "(default)";

  // Create an OAuth2 client with the user's access token
  const oauth2Client = new OAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  // Initialize Firestore with the user's credentials
  const firestore = new Firestore({
    projectId,
    databaseId,
    // Note: The Firestore SDK normally expects a service account or default credentials.
    // For user-delegated access, we can provide the OAuth2 client or the token directly.
    // In some environments, we might need to use the REST API if the GRPC transport doesn't support it directly.
    // However, google-cloud-node libraries often support passing an auth client.
    authClient: oauth2Client as any,
  });

  return firestore;
}
