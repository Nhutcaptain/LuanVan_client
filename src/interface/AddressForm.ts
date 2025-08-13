export interface AddressForm {
    province: {
        name: string;
        id: number;
    };
    district: {
        name: string;
        id: number;
    };
    ward: {
        name: string;
        id: number;
    };
    houseNumber: string;
}