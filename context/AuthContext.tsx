
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import firebase from 'firebase/compat/app';
import { auth, db } from '../firebase'; 
import { Role, User } from '../types';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. THE LISTENER: Automatically detects when a user logs in or out
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser: firebase.User | null) => {
      if (currentUser) {
        // User is authenticated. Now fetch their profile data from Firestore Database.
        try {
          const userDocRef = db.collection("users").doc(currentUser.uid);
          const userDocSnap = await userDocRef.get();

          if (userDocSnap.exists) {
            // Profile found in database
            const userData = userDocSnap.data() as User;

            // SELF-HEALING: Enforce Admin role for admin emails if they are stored as Residents
            // This fixes issues where a user signed up as admin but got default Resident role
            if (currentUser.email?.toLowerCase().includes('admin') && userData.role !== Role.Admin) {
                console.log("Auto-correcting Admin role in database...");
                await userDocRef.update({ role: Role.Admin });
                userData.role = Role.Admin;
            }

            setUser(userData);
            console.log("User profile loaded from Firestore:", userData);
          } else {
            // Fallback if auth exists but database doc is missing
            const role = currentUser.email?.toLowerCase().includes('admin') ? Role.Admin : Role.Resident;
            const basicUser: User = {
                id: currentUser.uid,
                name: currentUser.displayName || currentUser.email || 'User',
                role: role,
                avatar: `https://ui-avatars.com/api/?name=${currentUser.email}`,
            };
            
            // Try to create the missing doc
            try {
                 await userDocRef.set(basicUser);
            } catch (e) {
                console.error("Could not auto-create missing user doc", e);
            }
            
            setUser(basicUser);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        // User is logged out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. LOGIN FUNCTION
  const login = async (email: string, pass: string): Promise<void> => {
    const userCredential = await auth.signInWithEmailAndPassword(email, pass);
    
    // Optional: Update a 'lastLogin' field in the database
    try {
        if (userCredential.user) {
            const userRef = db.collection("users").doc(userCredential.user.uid);
            await userRef.update({ lastLogin: firebase.firestore.FieldValue.serverTimestamp() });
        }
    } catch (e) {
        console.log("Could not update lastLogin timestamp (user might not exist in DB yet)");
    }
  };

  // 3. REGISTER FUNCTION (Stores data in Database)
  const register = async (email: string, pass: string, name: string): Promise<void> => {
    // Step A: Create the Login Credentials (Authentication)
    const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
    const firebaseUser = userCredential.user;

    // Step B: Create the User Profile (Firestore Database)
    // This is where we store the name, role, and other details.
    if (firebaseUser) {
        // Logic to auto-assign Admin role if email contains 'admin'
        const role = email.toLowerCase().includes('admin') ? Role.Admin : Role.Resident;

        const newUserProfile: User = {
          id: firebaseUser.uid,
          name: name,
          role: role, 
          avatar: `https://ui-avatars.com/api/?name=${name}`,
        };

        // 'users' is the Collection Name. firebaseUser.uid is the Document ID.
        await db.collection("users").doc(firebaseUser.uid).set(newUserProfile);
        console.log(`User profile created in Firestore 'users' collection with role: ${role}`);
        
        setUser(newUserProfile);
    }
  };

  const logout = async (): Promise<void> => {
    await auth.signOut();
    setUser(null);
  };

  const isAdmin = user?.role === Role.Admin;

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
