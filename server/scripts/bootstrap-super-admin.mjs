import dotenv from "dotenv";
import { getAdminAuth, getFirestoreDb, initializeFirebase } from "../src/config/firebase.js";

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run bootstrap:super-admin --workspace server -- user@example.com");
  process.exit(1);
}

initializeFirebase();

const auth = getAdminAuth();
const db = getFirestoreDb();
const userRecord = await auth.getUserByEmail(email);

await auth.setCustomUserClaims(userRecord.uid, {
  ...(userRecord.customClaims || {}),
  role: "super-admin",
  status: "active"
});

await db.collection("users").doc(userRecord.uid).set(
  {
    email: userRecord.email || email,
    displayName: userRecord.displayName || email.split("@")[0],
    photoURL: userRecord.photoURL || "",
    role: "super-admin",
    status: "active",
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  },
  { merge: true }
);

console.log(`Promoted ${email} to super-admin.`);
