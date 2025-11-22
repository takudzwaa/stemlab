import { User, UserRole } from '@/types/user';

// Mock initial users
const MOCK_USERS: User[] = [
    {
        id: '1',
        name: 'Admin User',
        email: 'admin@cut.ac.zw',
        role: 'admin',
        password: 'password123', // In a real app, this would be hashed
        isApproved: true,
    },
    {
        id: '2',
        name: 'John Doe',
        email: 'student@cut.ac.zw',
        role: 'student',
        password: 'password123',
        isApproved: true,
    },
    {
        id: '3',
        name: 'Dr. Smith',
        email: 'lecturer@cut.ac.zw',
        role: 'lecturer',
        password: 'password123',
        isApproved: true,
    },
];

const STORAGE_KEY = 'stemlab_users';
const SESSION_KEY = 'stemlab_current_user';

export const AuthService = {
    getUsers: (): User[] => {
        if (typeof window === 'undefined') return MOCK_USERS;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USERS));
            return MOCK_USERS;
        }
        return JSON.parse(stored);
    },

    register: (user: Omit<User, 'id' | 'isApproved'>): User => {
        const users = AuthService.getUsers();
        const newUser: User = {
            ...user,
            id: Math.random().toString(36).substr(2, 9),
            isApproved: false, // Requires admin approval
        };
        users.push(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return newUser;
    },

    login: (email: string, password: string): User | null => {
        const users = AuthService.getUsers();
        const user = users.find((u) => u.email === email && u.password === password);
        if (user) {
            if (!user.isApproved) {
                throw new Error('Account pending approval');
            }
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            return user;
        }
        return null;
    },

    logout: () => {
        localStorage.removeItem(SESSION_KEY);
    },

    getCurrentUser: (): User | null => {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(SESSION_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    approveUser: (userId: string) => {
        const users = AuthService.getUsers();
        const updatedUsers = users.map(u =>
            u.id === userId ? { ...u, isApproved: true } : u
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    },

    updateUser: (userId: string, updates: Partial<User>) => {
        const users = AuthService.getUsers();
        const updatedUsers = users.map(u =>
            u.id === userId ? { ...u, ...updates } : u
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    }
};
