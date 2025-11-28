import { User, UserRole } from '@/types/user';
import { auth, db } from '@/lib/firebase';
import { removeUndefined } from '@/lib/utils';

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    where
} from 'firebase/firestore';

const STORAGE_KEY = 'stemlab_current_user';

export const AuthService = {
    getUsers: async (): Promise<User[]> => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    },

    register: async (userData: Omit<User, 'id' | 'isApproved'>): Promise<User> => {
        try {
            if (!userData.password) {
                throw new Error("Password is required");
            }
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const firebaseUser = userCredential.user;

            const newUser: User = {
                ...userData,
                id: firebaseUser.uid,
                isApproved: false, // Requires admin approval
            };

            // Store additional user details in Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), removeUndefined(newUser));


            return newUser;
        } catch (error) {
            console.error("Error registering user:", error);
            throw error;
        }
    },

    login: async (email: string, password: string): Promise<User | null> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Fetch user details from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

            if (userDoc.exists()) {
                const user = { id: userDoc.id, ...userDoc.data() } as User;

                if (!user.isApproved) {
                    await signOut(auth);
                    throw new Error('Account pending approval');
                }

                // Cache user in local storage for sync access if needed (though async is better)
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
                }

                return user;
            }
            return null;
        } catch (error) {
            console.error("Error logging in:", error);
            throw error;
        }
    },

    logout: async () => {
        await signOut(auth);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    },

    getCurrentUser: (): User | null => {
        // This is a synchronous fallback using localStorage.
        // Ideally, components should use an AuthContext that listens to onAuthStateChanged.
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    approveUser: async (userId: string) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { isApproved: true });
        } catch (error) {
            console.error("Error approving user:", error);
        }
    },

    updateUser: async (userId: string, updates: Partial<User>) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, removeUndefined(updates));

        } catch (error) {
            console.error("Error updating user:", error);
        }
    }
};
