import { Service } from '@/interface/ServiceInterface';
import React, { useState, useMemo, useEffect } from 'react';

interface ServiceModalProps {
    services: Service[];
    onAddServices: (serviceIds: string[]) => void;
    onClose: () => void;
    serviceSelected?: string[],
}

const ServiceModal: React.FC<ServiceModalProps> = ({ services, onAddServices, onClose, serviceSelected }) => {
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('');

    useEffect(() => {
        if(!serviceSelected) return;
        setSelectedServices(serviceSelected);
    },[serviceSelected])

    const serviceTypeLabels = {
        procedure: 'Chuyên khoa',
        test: 'Xét nghiệm',
        vaccination: 'Tiêm chủng',
        other: 'Khác',
    };

    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                service.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = !filterType || service.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [services, searchTerm, filterType]);

    const handleSelectService = (serviceId: string) => {
        if (selectedServices.includes(serviceId)) {
            setSelectedServices(selectedServices.filter(id => id !== serviceId));
        } else {
            setSelectedServices([...selectedServices, serviceId]);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedServices(filteredServices.map(s => s._id));
        } else {
            setSelectedServices([]);
        }
    };

    const handleAddServices = () => {
        if (selectedServices.length > 0) {
            onAddServices(selectedServices);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content large">
                <div className="modal-header">
                    <h3>Thêm dịch vụ cho chuyên khoa</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="service-modal-filters">
                    <div className="filter-group">
                        <input
                            type="text"
                            placeholder="Tìm kiếm dịch vụ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filter-group">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Tất cả loại dịch vụ</option>
                            <option value="procedure">Chuyên khoa</option>
                            <option value="test">Xét nghiệm</option>
                            <option value="vaccination">Tiêm chủng</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>
                </div>

                <div className="service-list-container">
                    <div className="service-list-header">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={selectedServices.length === filteredServices.length && filteredServices.length > 0}
                                onChange={handleSelectAll}
                            />
                            Chọn tất cả ({filteredServices.length})
                        </label>
                        <span className="selected-count">
                            Đã chọn: {selectedServices.length}
                        </span>
                    </div>

                    <div className="service-list">
                        {filteredServices.map(service => (
                            <div
                                key={service._id}
                                className={`service-item ${selectedServices.includes(service._id) ? 'selected' : ''}`}
                                onClick={() => handleSelectService(service._id)}
                            >
                                <div className="service-item-header">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedServices.includes(service._id)}
                                            onChange={() => handleSelectService(service._id)}
                                        />
                                        <span className="service-name">{service.name}</span>
                                    </label>
                                    <span className={`service-type ${service.type === 'procedure' ? 'procedure' : 
                                        service.type === 'test' ? 'test' : 'vaccination'
                                    }`}>
                                        {serviceTypeLabels[service.type as keyof typeof serviceTypeLabels] ?? serviceTypeLabels.other}
                                    </span>
                                </div>
                                <div className="service-item-body">
                                    <p className="service-description">{service.description}</p>
                                    <div className="service-meta">
                                        <span className="service-price">{formatPrice(service.price)}</span>
                                        <span className="service-usage">Sử dụng: {service.usageCount} lần</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredServices.length === 0 && (
                        <div className="empty-state">
                            Không tìm thấy dịch vụ nào phù hợp
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Hủy
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleAddServices}
                        disabled={selectedServices.length === 0}
                    >
                        Thêm {selectedServices.length} dịch vụ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceModal;