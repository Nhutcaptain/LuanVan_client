import { uploadImageToCloudinary } from '@/services/uploadAvatarService';
import React, { useEffect, useState } from 'react'
import './styles.css'

interface UploadImageData {
    publicId: string;
    url: string;
}

interface Props {
    initialAvatar?: string;
    onFileSelect: (file: File) => void;
    size?: number; // Thêm prop để tuỳ chỉnh kích thước
    onChange?: () => void;
}

const UploadImageComponent = (props: Props) => {
    const { initialAvatar, onFileSelect, size = 200, onChange } = props;
    const [preview, setPreview] = useState(initialAvatar || '');

    useEffect(() => {
        if(!initialAvatar) return;
        setPreview(initialAvatar);
    },[initialAvatar])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Tạo preview
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                setPreview(reader.result.toString());
            }
        };
        reader.readAsDataURL(file);

       
        
        // Truyền file ra component cha
        onFileSelect(file);
        if(onChange) {
            onChange();
        }
    };

    return (
        <div className="avatar-upload">
            <label>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />
                {(preview)? (
                    <img 
                        src={preview} 
                        alt="Preview" 
                        className="avatar-preview"
                        style={{ 
                            width: `${size}px`, 
                            height: `${size}px`,
                            objectFit: 'cover'
                        }}
                    />
                ) : (
                    <div 
                        className="avatar-placeholder"
                        style={{ 
                            width: `${size}px`, 
                            height: `${size}px` 
                        }}
                    >
                        <span>+</span>
                    </div>
                )}
            </label>
        </div>
    )
}

export default UploadImageComponent;