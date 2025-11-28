export interface Component {
    id: string;
    name: string;
    category: 'sensor' | 'microcontroller' | 'actuator' | 'other' | 'Labs' | 'Labs equipment' | 'Projects components';
    totalQuantity: number;
    availableQuantity: number;
    description: string;
    subcategory?: 'sensor' | 'microcontroller' | 'actuator';
}

export interface LabBooking {
    id: string;
    userId: string;
    userName?: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'approved' | 'rejected';
    courseCode?: string;
    topic?: string;
    numberOfStudents?: number;
    requirements?: string;
    purpose?: string;
    components?: { componentId: string; componentName: string; quantity: number }[];
}
