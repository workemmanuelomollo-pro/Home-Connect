import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";

const STORAGE_KEYS = {
  users: "hsc_users",
};

const AuthContext = createContext();

function readStoredUsers() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.users);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function cacheUser(profile) {
  const users = readStoredUsers();
  const safeProfile = {
    uid: profile.uid,
    name: profile.name,
    email: profile.email,
    emailVerified: profile.emailVerified,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    role: profile.role,
    applicationStatus: profile.applicationStatus,
    providerData: profile.providerData,
    accountStatus: profile.accountStatus,
  };
  const index = users.findIndex(
    (entry) =>
      entry.uid === profile.uid ||
      entry.email?.toLowerCase() === profile.email?.toLowerCase(),
  );

  if (index === -1) {
    users.push(safeProfile);
  } else {
    users[index] = { ...users[index], ...safeProfile };
    delete users[index].password;
  }

  window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function normalizeProfile(firebaseUser, data = {}) {
  const name =
    data.name ||
    data.displayName ||
    firebaseUser.displayName ||
    firebaseUser.email?.split("@")[0] ||
    "Customer";
  return {
    uid: firebaseUser.uid,
    name,
    email: firebaseUser.email,
    emailVerified: firebaseUser.emailVerified === true,
    displayName: data.displayName || firebaseUser.displayName || name,
    photoURL: data.photoURL || firebaseUser.photoURL || null,
    role: data.role || "customer",
    applicationStatus: data.applicationStatus ?? null,
    providerData: data.providerData || null,
    accountStatus: data.accountStatus || "active",
  };
}

async function ensureUserDocument(firebaseUser, initialData = {}) {
  const userRef = doc(db, "users", firebaseUser.uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) return snapshot.data();

  const profile = normalizeProfile(firebaseUser, initialData);
  if (!["customer", "provider"].includes(profile.role)) {
    profile.role = "customer";
  }
  if (![null, "pending"].includes(profile.applicationStatus)) {
    profile.applicationStatus = "pending";
  }
  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return profile;
}

function getAuthErrorMessage(error) {
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in instead.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "We could not find a matching account with that email and password.";
    case "auth/weak-password":
      return "Choose a password with at least 8 characters.";
    case "auth/network-request-failed":
      return "Could not reach Firebase. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "Enable this sign-in method in Firebase Authentication and try again.";
    case "permission-denied":
      return "Firebase denied access. Check the Firestore security rules for this account.";
    case "auth/popup-blocked":
      return "Allow pop-up windows for this site to use Google sign-in.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    default:
      return "Authentication failed. Please try again.";
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const applyProfile = useCallback((firebaseUser, profileData) => {
    const cachedProfile = readStoredUsers().find(
      (entry) =>
        entry.uid === firebaseUser.uid ||
        entry.email?.toLowerCase() === firebaseUser.email?.toLowerCase(),
    );
    const mergedData = { ...profileData };
    if (cachedProfile?.providerData?.portfolio && !profileData?.providerData?.portfolio) {
      mergedData.providerData = {
        ...profileData?.providerData,
        portfolio: cachedProfile.providerData.portfolio,
      };
    }
    const normalizedUser = normalizeProfile(firebaseUser, mergedData);
    cacheUser(normalizedUser);
    setUser(normalizedUser);
    setRole(normalizedUser.role);
    setApplicationStatus(normalizedUser.applicationStatus);
    setAuthError("");
    return normalizedUser;
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setApplicationStatus(null);
        setAuthError("");
        setAuthLoading(false);
        return;
      }

      try {
        const profile = await ensureUserDocument(firebaseUser);
        applyProfile(firebaseUser, profile);
      } catch (error) {
        console.error("Failed to load the signed-in user's profile:", error);
        setUser(normalizeProfile(firebaseUser));
        setRole("customer");
        setApplicationStatus(null);
        setAuthError("Could not load your account profile from Firestore.");
      } finally {
        setAuthLoading(false);
      }
    });
  }, [applyProfile]);

  const signUp = useCallback(async ({ name, email, password }) => {
    const trimmedEmail = String(email || "").trim().toLowerCase();
    const trimmedName = String(name || "").trim();

    if (!trimmedEmail || !trimmedName || String(password || "").length < 8) {
      return {
        success: false,
        message:
          "Please provide a valid name, and a password with at least 8 characters.",
      };
    }

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        String(password),
      );
      await updateProfile(credential.user, { displayName: trimmedName });
      const profile = normalizeProfile(credential.user, {
        name: trimmedName,
        role: "customer",
        applicationStatus: null,
        accountStatus: "active",
      });
      await setDoc(doc(db, "users", credential.user.uid), {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      applyProfile(credential.user, profile);
      return { success: true, user: profile };
    } catch (error) {
      console.error("Failed to create account:", error);
      return { success: false, message: getAuthErrorMessage(error) };
    }
  }, [applyProfile]);

  const signIn = useCallback(async ({ email, password }) => {
    const trimmedEmail = String(email || "").trim().toLowerCase();
    try {
      let credential;
      let legacyProfile;
      try {
        credential = await signInWithEmailAndPassword(
          auth,
          trimmedEmail,
          String(password || ""),
        );
      } catch (error) {
        const legacyAccount = readStoredUsers().find(
          (entry) =>
            entry.email?.toLowerCase() === trimmedEmail &&
            entry.password === String(password || ""),
        );
        if (legacyAccount?.accountStatus === "suspended") {
            return {
              success: false,
              message: "This account is suspended. Please contact support.",
            };
        }
        if (
          !legacyAccount ||
          !["auth/user-not-found", "auth/invalid-credential"].includes(error?.code)
        ) {
          throw error;
        }

        credential = await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          String(password || ""),
        );
        if (legacyAccount.name) {
          await updateProfile(credential.user, { displayName: legacyAccount.name });
        }
        legacyProfile = legacyAccount;
      }

      const profile = await ensureUserDocument(credential.user, legacyProfile);
      if (profile.accountStatus === "suspended") {
        await firebaseSignOut(auth);
        return {
          success: false,
          message: "This account is suspended. Please contact support.",
        };
      }
      const signedInUser = applyProfile(credential.user, profile);
      return { success: true, user: signedInUser };
    } catch (error) {
      console.error("Failed to sign in:", error);
      return { success: false, message: getAuthErrorMessage(error) };
    }
  }, [applyProfile]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const profile = await ensureUserDocument(credential.user);
      if (profile.accountStatus === "suspended") {
        await firebaseSignOut(auth);
        return {
          success: false,
          message: "This account is suspended. Please contact support.",
        };
      }
      const signedInUser = applyProfile(credential.user, profile);
      return { success: true, user: signedInUser };
    } catch (error) {
      console.error("Failed to sign in with Google:", error);
      return { success: false, message: getAuthErrorMessage(error) };
    }
  }, [applyProfile]);

  const updateUserProfile = useCallback(async (nextRole, updates = {}) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return false;

    try {
      const remoteUpdates = { ...updates, updatedAt: serverTimestamp() };
      if (updates.providerData) {
        const providerData = { ...updates.providerData };
        delete providerData.portfolio;
        remoteUpdates.providerData = providerData;
      }
      if (nextRole) remoteUpdates.role = nextRole;

      await updateDoc(doc(db, "users", firebaseUser.uid), remoteUpdates);
      const existing = user || normalizeProfile(firebaseUser);
      applyProfile(firebaseUser, {
        ...existing,
        ...updates,
        role: nextRole || updates.role || existing.role,
      });
      return true;
    } catch (error) {
      console.error("Failed to update user profile:", error);
      return false;
    }
  }, [applyProfile, user]);

  const refreshUserProfile = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return false;

    try {
      const snapshot = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!snapshot.exists()) {
        throw new Error("The signed-in user's Firestore profile does not exist.");
      }
      applyProfile(firebaseUser, snapshot.data());
      return true;
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
      return false;
    }
  }, [applyProfile]);

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Failed to sign out:", error);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      applicationStatus,
      authLoading,
      authError,
      signUp,
      signIn,
      signInWithGoogle,
      logout,
      updateUserProfile,
      refreshUserProfile,
    }),
    [
      user,
      role,
      applicationStatus,
      authLoading,
      authError,
      signUp,
      signIn,
      signInWithGoogle,
      logout,
      updateUserProfile,
      refreshUserProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The provider and its context hook intentionally share this module.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
