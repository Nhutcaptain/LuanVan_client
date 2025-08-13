'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import SelectComponent from '@/components/SelectComponent/SelectComponent';
import InputComponent from '@/components/InputComponent/InputComponent';
import { AddressForm } from '@/interface/AddressForm';
import './styles.css';

interface Props {
    form: AddressForm;
    setForm: React.Dispatch<React.SetStateAction<AddressForm>>;
    isEditing?: boolean;
}

interface AddressInterface {
    name: string;
    id: number;
}

const AddressSelector = (props: Props) => {
    const { form, setForm } = props;
    const [provinces, setProvinces] = useState<AddressInterface[]>([]);
    const [districts, setDistricts] = useState<AddressInterface[]>([]);
    const [wards, setWards] = useState<AddressInterface[]>([]);

    // Lấy danh sách tỉnh
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get('https://esgoo.net/api-tinhthanh-new/1/0.htm');
                setProvinces(response.data.data);
                console.log(response.data.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách tỉnh:', error);
            }
        };
        fetchProvinces();
    }, []);

    // Khi chọn tỉnh
    const handleProvinceChange = async (e: any) => {
        const id = Number(e.target.value);
        console.log(id);
        const selectedProvince = provinces.find((province) => Number(province.id) === id);
        console.log("Tỉnh: ",selectedProvince?.name)
        if (!selectedProvince) return;

        try {
            const res = await axios.get(`https://esgoo.net/api-tinhthanh-new/2/${id}.htm`);
            setDistricts(res.data.data);
            console.log(res.data);
            setWards([]);
            setForm({
                ...form,
                province: { name: selectedProvince.name, id: selectedProvince.id },
                district: { name: '', id: 0 },
                ward: { name: '', id: 0 }
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách huyện:', error);
        }
    };

    // Khi chọn huyện
    const handleDistrictChange = async (e: any) => {
        const id = Number(e.target.value);
        const selectedDistrict = districts.find((district) => Number(district.id) === id);
        if (!selectedDistrict) return;
        setForm({
                ...form,
                district: { name: selectedDistrict.name, id: selectedDistrict.id },
                ward: { name: '', id: 0 }
            });

        // try {
        //     const res = await axios.get(`https://esgoo.net/api-tinhthanh-new/3/${id}.htm`);
        //     setWards(res.data.data);
        //     setForm({
        //         ...form,
        //         district: { name: selectedDistrict.name, id: selectedDistrict.id },
        //         ward: { name: '', id: 0 }
        //     });
        // } catch (error) {
        //     console.error('Lỗi khi lấy danh sách xã:', error);
        // }
    };

    // Khi chọn xã
    const handleWardChange = (e: any) => {
        const id = Number(e.target.value);
        const selectedWard = wards.find((ward) => ward.id === id);
        if (!selectedWard) return;
        setForm({
            ...form,
            ward: { name: selectedWard.name, id: selectedWard.id }
        });
    };

    return (
        <div className="address-selector-container">
            <div className="selector-group w-full">
                <SelectComponent
                    label="Tỉnh/Thành phố"
                    name="province"
                    value={String(form.province?.id) || ''}
                    onChange={handleProvinceChange}
                    options={provinces.map((province: any) => ({
                        label: province.name,
                        value: province.id
                    }))}
                    required
                />
                <SelectComponent
                    label="Phường/ Xã"
                    name="district"
                    value={String(form.district?.id) || ''}
                    onChange={handleDistrictChange}
                    options={districts.map((district: any) => ({
                        label: district.name,
                        value: district.id
                    }))}
                    required
                    disabled={!form.province?.id}
                />
                {/* <SelectComponent
                    label="Phường/Xã"
                    name="ward"
                    value={String(form.ward?.id) || ''}
                    onChange={handleWardChange}
                    options={wards.map((ward: any) => ({
                        label: ward.name,
                        value: ward.id
                    }))}
                    required
                    disabled={!form.district?.id}
                /> */}
                <div className="house-number">
                    <InputComponent
                label="Số nhà/Đường"
                name="street"
                value={form.houseNumber || ''}
                onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
                placeholder="Nhập số nhà hoặc tên đường"
                required
            />
                </div>
            </div>
            
        </div>
    );
};

export default AddressSelector;
