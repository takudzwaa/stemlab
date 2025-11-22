export interface Component {
    id: string;
    name: string;
    category: 'sensor' | 'microcontroller' | 'actuator' | 'other';
    totalQuantity: number;
    availableQuantity: number;
export interface Component {
    id: string;
    name: string;
    category: 'sensor' | 'microcontroller' | 'actuator' | 'other';
    totalQuantity: number;
    availableQuantity: number;
    description: string;
}

export interface LabBooking {
    id: string;
    userId: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'approved' | 'rejected';
    courseCode?: string;
    topic?: string;
    numberOfStudents?: number;
    requirements?: string;
}
