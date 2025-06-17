export interface AddressForm {
    province: {
        name: string;
        code: number;
    };
    district: {
        name: string;
        code: number;
    };
    ward: {
        name: string;
        code: number;
    };
    houseNumber: string;
}