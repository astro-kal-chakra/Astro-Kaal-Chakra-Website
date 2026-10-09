/**
 * Phone OTP through Firebase Authentication (website). Firebase sends the SMS and checks the code;
 * the backend then verifies Firebase's ID token (POST /web/auth/firebase) and sets our login cookies.
 *
 * Needs the Firebase web app config (NEXT_PUBLIC_FIREBASE_* in .env.local). Without it the website keeps
 * using the backend OTP. Testing mode (backend FIREBASE_PROD=false): reCAPTCHA is skipped and only the
 * test numbers from the Firebase console work; no SMS is sent.
 */

const CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

/** The website has a Firebase web app configured. */
export const firebaseConfigured = () => Boolean(CONFIG.apiKey && CONFIG.authDomain && CONFIG.projectId && CONFIG.appId);

const RECAPTCHA_ID = "firebase-recaptcha";
let sdk = null;
let verifier = null;
let pending = null; // { phone, confirmation }

/** Loads Firebase only when someone logs in (keeps it out of every page). */
async function load() {
  if (sdk) return sdk;
  const [{ initializeApp, getApps }, authMod] = await Promise.all([import("firebase/app"), import("firebase/auth")]);
  const app = getApps()[0] || initializeApp(CONFIG);
  const auth = authMod.getAuth(app);
  auth.useDeviceLanguage();
  sdk = { auth, ...authMod };
  return sdk;
}

/** Invisible reCAPTCHA (Firebase's bot check before sending an SMS). */
function recaptcha(s) {
  if (verifier) return verifier;
  let el = document.getElementById(RECAPTCHA_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = RECAPTCHA_ID;
    document.body.appendChild(el);
  }
  verifier = new s.RecaptchaVerifier(s.auth, el, { size: "invisible" });
  return verifier;
}

/** Friendly text for Firebase Auth error codes. */
export function firebaseErrorMessage(code) {
  return (
    {
      "auth/invalid-verification-code": "Incorrect OTP. Please try again.",
      "auth/code-expired": "This OTP has expired. Please request a new one.",
      "auth/session-expired": "This OTP has expired. Please request a new one.",
      "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
      "auth/invalid-phone-number": "Enter a valid 10-digit mobile number",
      "auth/quota-exceeded": "OTP limit reached for now. Please try again later.",
      "auth/captcha-check-failed": "Security check failed. Please refresh the page and try again.",
      "auth/network-request-failed": "No internet connection. Please check and try again.",
      "auth/unauthorized-domain": "Login isn't enabled for this website address yet. Please contact support.",
      "auth/operation-not-allowed": "Phone login isn't enabled yet. Please contact support.",
    }[code] || null
  );
}

/** Sends the OTP to +91<phone>. `testing`: Firebase testing mode (console test numbers only). */
export async function sendPhoneCode(phone, { testing }) {
  const s = await load();
  s.auth.settings.appVerificationDisabledForTesting = Boolean(testing);
  try {
    const confirmation = await s.signInWithPhoneNumber(s.auth, `+91${phone}`, recaptcha(s));
    pending = { phone, confirmation };
  } catch (err) {
    // A used / expired reCAPTCHA can't be reused: start a fresh one next time
    verifier?.clear?.();
    verifier = null;
    throw err;
  }
}

/** Checks the code and returns a fresh Firebase ID token for the backend. */
export async function confirmPhoneCode(phone, code) {
  if (!pending || pending.phone !== phone) {
    throw Object.assign(new Error("This OTP has expired. Please request a new one."), { code: "auth/session-expired" });
  }
  const cred = await pending.confirmation.confirm(code);
  return cred.user.getIdToken(true);
}

/** After the backend accepted the token: our cookies are the login, not Firebase's session. */
export async function finishPhoneSignIn() {
  pending = null;
  if (sdk) await sdk.signOut(sdk.auth).catch(() => {});
}
