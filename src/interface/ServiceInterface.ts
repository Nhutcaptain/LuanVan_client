export interface Service {
    _id: string;
    name: string;
    type: string;
    price: number;
    description: string;
    notes: string[];
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}