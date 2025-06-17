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
    code: number;
}

const AddressSelector = (props: Props) => {
    const { form, setForm, isEditing } = props;
    const [provinces, setProvinces] = useState<AddressInterface[]>([]);
    const [districts, setDistricts] = useState<AddressInterface[]>([]);
    const [wards, setWards] = useState<AddressInterface[]>([]);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get('https://provinces.open-api.vn/api/?depth=1');
                setProvinces(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách tỉnh:', error);
            }
        };

        fetchProvinces();
    },[])

    const handleProvinceChange = async (e:any) => {
        const code = Number(e.target.value);
        const selectedProvince = provinces.find((province:any) => province.code === code);
        console.log('Selected Province:', selectedProvince);
        if (!selectedProvince) return;
        
        const res = await axios.get(`https://provinces.open-api.vn/api/p/${code}?depth=2`);

        setDistricts(res.data.districts);
        setWards([]); // Reset wards when province changes
        setForm({...form, province: {
            name: selectedProvince.name,
            code: selectedProvince.code
        }, district: {
            name: '',
            code: 0
        }, ward: {
            name: '',
            code: 0
        }});
    }

    const handleDistrictChange = async (e:any) => {
        const code = Number(e.target.value);
        const selectedDistrict = districts.find((district:any) => district.code === code);
        if (!selectedDistrict) return;
        const res = await axios.get(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
        setWards(res.data.wards);
        setForm({...form, district: {
            name: selectedDistrict.name,
            code: selectedDistrict.code
        }, ward: {
            name: '',
            code: 0
        }});
    }

    const handleWardChange = (e:any) => {
        const code = Number(e.target.value);
        const selectedWard = wards.find((ward:any) => ward.code === code);
        if (!selectedWard) return;
        setForm({...form, ward: {
            name: selectedWard.name,
            code: selectedWard.code
        }});
    }

  return (
    <div className="address-selector-container">
        <div className="selector-group w-full">
            <SelectComponent
                label="Tỉnh/Thành phố"
                name="province"
                value={String(form.province?.code) || ''}
                onChange={handleProvinceChange}
                options={provinces.map((province:any) => ({
                    label: province.name,
                    value: province.code
                }))}
                required
            />
            <SelectComponent
                label="Quận/Huyện"
                name="district"
                value={String(form.district?.code) || ''}
                onChange={handleDistrictChange}
                options={districts.map((district:any) => ({
                    label: district.name,
                    value: district.code
                }))}
                required
                disabled={!form.province} // Disable if no province selected
            />
            <SelectComponent
                label="Phường/Xã"
                name="ward"
                value={String(form.ward?.code) || ''}
                onChange={handleWardChange}
                options={wards.map((ward:any) => ({
                    label: ward.name,
                    value: ward.code
                }))}
                required
                disabled={!form.district} // Disable if no district selected
            />
        </div>
        <InputComponent
            label="Số nhà/Đường"
            name="street"
            value={form.houseNumber || ''}
            onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
            placeholder="Nhập số nhà hoặc tên đường"
            required
        />
    </div>
  )
}

export default AddressSelector