export type UserRole = 'admin' | 'student' | 'lecturer';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    password?: string; // Optional for display purposes, required for auth
    isApproved: boolean;
}
