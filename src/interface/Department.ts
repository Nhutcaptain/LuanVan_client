
export interface Department {
    _id: string;
    name: string;
    description: string;
    serviceIds: string[];
}

export interface Specialty {
    _id: string;
    departmentId: string;
    name: string;
    description: string;
    code: string;
    serviceIds: string[];
}