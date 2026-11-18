import { createContext, useCallback, useContext, useMemo, useState } from "react";

const STORAGE_KEYS = {
  users: "hsc_users",
  session: "hsc_session",
};

const AuthContext = createContext();

function readStorageJSON(key, fallback = []) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorageJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    console.error(`Failed to write local demo data for "${key}".`);
    return false;
  }
}

function getStoredUsers() {
  return readStorageJSON(STORAGE_KEYS.users, []);
}

function readInitialSession() {
  const savedSession = readStorageJSON(STORAGE_KEYS.session, null);
  if (!savedSession?.user) return null;

  const users = getStoredUsers();
  const account = users.find(
    (entry) =>
      entry.uid === savedSession.user.uid ||
      entry.email === savedSession.user.email,
  );
  const sourceUser = { ...account, ...savedSession.user };
  const role = account?.role || savedSession.role || sourceUser.role || "customer";
  const applicationStatus =
    account?.applicationStatus ??
    savedSession.applicationStatus ??
    sourceUser.applicationStatus ??
    null;
  const accountStatus =
    account?.accountStatus || savedSession.user.accountStatus || "active";

  return {
    user: {
      uid: sourceUser.uid,
      name: sourceUser.name || sourceUser.displayName || "Customer",
      email: sourceUser.email,
      displayName: sourceUser.displayName || sourceUser.name || "Customer",
      photoURL: sourceUser.photoURL || null,
      role,
      applicationStatus,
      providerData: sourceUser.providerData || null,
      accountStatus,
    },
    role,
    applicationStatus,
    accountStatus,
  };
}

export function AuthProvider({ children }) {
  const [initialSession] = useState(readInitialSession);
  const [user, setUser] = useState(initialSession?.user ?? null);
  const [role, setRole] = useState(initialSession?.role ?? null);
  const [applicationStatus, setApplicationStatus] = useState(
    initialSession?.applicationStatus ?? null,
  );

  const persistSession = useCallback((nextUser, nextRole, nextApplicationStatus) => {
    const role = nextRole || nextUser.role || "customer";
    const applicationStatus =
      nextApplicationStatus ?? nextUser.applicationStatus ?? null;
    const normalizedUser = {
      uid: nextUser.uid,
      name: nextUser.name || "Customer",
      email: nextUser.email,
      displayName: nextUser.name || nextUser.displayName || "Customer",
      photoURL: nextUser.photoURL || null,
      role,
      applicationStatus,
      providerData: nextUser.providerData || null,
      accountStatus: nextUser.accountStatus || "active",
    };

    const session = {
      user: normalizedUser,
      role,
      applicationStatus,
    };

    if (!writeStorageJSON(STORAGE_KEYS.session, session)) return false;
    setUser(normalizedUser);
    setRole(session.role);
    setApplicationStatus(session.applicationStatus);
    return true;
  }, []);

  const signUp = useCallback(({ name, email, password }) => {
    const trimmedEmail = String(email || "").trim().toLowerCase();
    const trimmedName = String(name || "").trim();

    if (!trimmedEmail || !trimmedName || String(password || "").length < 8) {
      return {
        success: false,
        message: "Please provide a valid name, email, and a password with at least 8 characters.",
      };
    }

    const users = getStoredUsers();
    const existing = users.find((entry) => entry.email.toLowerCase() === trimmedEmail);

    if (existing) {
      return {
        success: false,
        message: "An account with this email already exists. Please sign in instead.",
      };
    }

    const nextUser = {
      uid: `local-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      password,
      displayName: trimmedName,
      role: "customer",
      applicationStatus: null,
      providerData: null,
      accountStatus: "active",
      createdAt: new Date().toISOString(),
    };

    users.push(nextUser);
    if (!writeStorageJSON(STORAGE_KEYS.users, users)) {
      return {
        success: false,
        message: "We could not save your account in this browser. Check available storage and try again.",
      };
    }

    if (!persistSession(nextUser, "customer", null)) {
      return {
        success: false,
        message: "Your account was saved, but this browser could not save the sign-in session. Please sign in.",
      };
    }
    return { success: true, user: nextUser };
  }, [persistSession]);

  const signIn = useCallback(({ email, password }) => {
    const trimmedEmail = String(email || "").trim().toLowerCase();
    const trimmedPassword = String(password || "");

    const users = getStoredUsers();
    const match = users.find(
      (entry) => entry.email.toLowerCase() === trimmedEmail && entry.password === trimmedPassword,
    );

    if (!match) {
      return {
        success: false,
        message: "We could not find a matching account with that email and password.",
      };
    }

    if (match.accountStatus === "suspended") {
      return {
        success: false,
        message: "This account is suspended. Please contact support.",
      };
    }

    if (!persistSession(match, match.role || "customer", match.applicationStatus || null)) {
      return {
        success: false,
        message: "We could not save your sign-in session in this browser. Check available storage and try again.",
      };
    }
    return { success: true, user: match };
  }, [persistSession]);

  const updateUserProfile = useCallback((nextRole, updates = {}) => {
    const users = getStoredUsers();
    const activeUser = user || readStorageJSON(STORAGE_KEYS.session, null)?.user;

    if (!activeUser) {
      return false;
    }

    const index = users.findIndex((entry) => entry.email === activeUser.email);

    if (index === -1) {
      return false;
    }

    const updatedUser = {
      ...users[index],
      ...updates,
      role: nextRole || users[index].role || "customer",
      applicationStatus:
        "applicationStatus" in updates
          ? updates.applicationStatus
          : users[index].applicationStatus ?? null,
      providerData:
        "providerData" in updates
          ? updates.providerData
          : users[index].providerData ?? null,
    };

    users[index] = updatedUser;
    if (!writeStorageJSON(STORAGE_KEYS.users, users)) return false;
    if (!persistSession(updatedUser, updatedUser.role || "customer", updatedUser.applicationStatus || null)) {
      return false;
    }
    return true;
  }, [persistSession, user]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.session);
    setUser(null);
    setRole(null);
    setApplicationStatus(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      applicationStatus,
      signUp,
      signIn,
      logout,
      updateUserProfile,
    }),
    [user, role, applicationStatus, signUp, signIn, logout, updateUserProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The provider and its context hook intentionally share this module.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
