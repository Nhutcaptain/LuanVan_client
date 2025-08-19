"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import "./styles.css";
import api from "@/lib/axios";
import Swal from "sweetalert2";

interface Service {
  _id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  notes: string[];
  usageCount: number;
}

interface Department {
  _id: string;
  name: string;
}

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<"asc" | "desc" | "">("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState<Omit<Service, '_id' | 'usageCount'> & { _id?: string, usageCount?: number }>({
    name: "",
    type: "procedure",
    price: 0,
    description: "",
    notes: [],
  });
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/service/getAll');
        setServices(res.data);
        setFilteredServices(res.data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch services");
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    let result = [...services];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== "all") {
      result = result.filter(service => service.type === typeFilter);
    }

    // Sort by price
    if (priceFilter === "asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (priceFilter === "desc") {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredServices(result);
  }, [searchTerm, priceFilter, typeFilter, services]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) return;

    try {
      await api.delete(`/service/delete/${id}`);
      setServices(services.filter(service => service._id !== id));
    } catch (err) {
      setError("Xóa dịch vụ thất bại");
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      title: 'Đang tạo dịch vụ',
      icon: 'info',
      showLoaderOnConfirm: true,
    });
    try {
      const res = await api.post('/service/create', newService);
      setServices([...services, res.data]);
      setShowAddForm(false);
      setNewService({
        name: "",
        type: "procedure",
        price: 0,
        description: "",
        notes: [],
      });
    } catch (err) {
      setError("Thêm dịch vụ thất bại");
    } finally {
      Swal.close();
      Swal.fire({
        title: 'Thêm dịch vụ thành công',
        icon: 'success',
        timer: 1000,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewService({
      ...newService,
      [name]: name === "price" ? Number(value) : value,
    });
  };

  const handleShowDepartments = async (serviceId: string) => {
    setCurrentServiceId(serviceId);
    setIsLoadingDepartments(true);
    setShowDepartmentModal(true);
    
    try {
      // Replace with your actual API endpoint to get departments using the service
      const res = await api.get(`/service/${serviceId}/departments`);
      setDepartments(res.data);
    } catch (err) {
      setError("Failed to fetch departments");
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const handleCancel = () => {
    setNewService({
        name: '',
        type: 'procedure',
        notes: [],
        description: '',
        price: 0,

    });
    setIsEdit(false);
    setShowAddForm(false);
  }

  const handleEdit = (id: string) => {
    setShowAddForm(true);
    const editService = services.find((s) => s._id === id);
    if (editService) {
      const { _id, usageCount, ...rest } = editService;
      setNewService({ ...rest, _id, usageCount });
    }
    setIsEdit(true);
  }

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="service-management">
      <h1>Quản lý Dịch vụ Y tế</h1>
      
      <div className="controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button">🔍</button>
        </div>

        <div className="filters-service">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tất cả loại</option>
            <option value="procedure">Chuyên khoa</option>
            <option value="test">Xét nghiệm</option>
            <option value="vaccination">Tiêm chủng</option>
            <option value="other">Khác</option>
          </select>

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as "asc" | "desc" | "")}
          >
            <option value="">Sắp xếp giá</option>
            <option value="asc">Giá tăng dần</option>
            <option value="desc">Giá giảm dần</option>
          </select>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="add-button-service"
        >
          {showAddForm ? 'Hủy Thêm' : 'Thêm Dịch vụ Mới'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-service-form">
          <h2>Thêm Dịch vụ Mới</h2>
          <form onSubmit={handleAddService}>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Tên dịch vụ</label>
                <input
                  type="text"
                  name="name"
                  value={newService.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Loại dịch vụ</label>
                <select
                  name="type"
                  value={newService.type}
                  onChange={handleInputChange}
                >
                  <option value="procedure">Thủ thuật</option>
                  <option value="test">Xét nghiệm</option>
                  <option value="vaccination">Tiêm chủng</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label>Giá (VND)</label>
                <input
                  type="number"
                  name="price"
                  value={newService.price}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <input
                  type="text"
                  name="notes"
                  value={newService.notes}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={newService.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                {isEdit ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ'}
              </button>
              <button type="submit" className="cancel-button" onClick={handleCancel}>
                Huỷ
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="service-list">
        {filteredServices.length === 0 ? (
          <p>Không tìm thấy dịch vụ nào.</p>
        ) : (
          filteredServices.map((service) => (
            <div key={service._id} className="service-card">
              <div className="service-header">
                <h3>{service.name}</h3>
                <span className={`service-type ${service.type}`}>
                  {getTypeLabel(service.type)}
                </span>
              </div>
              <p className="service-price">{service.price.toLocaleString()} VND</p>
              <p className="service-description">{service.description}</p>
              
              <div className="service-usage">
                <span>Số lần sử dụng: {service.usageCount}</span>
                <button 
                  onClick={() => handleShowDepartments(service._id)} 
                  className="view-departments"
                >
                  Xem chuyên khoa sử dụng
                </button>
              </div>

              <div className="service-actions">
                <button className="edit-button" onClick={() => handleEdit(service._id)}>
                    Sửa
                </button>
                <button
                  onClick={() => handleDelete(service._id)}
                  className="delete-button"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom Modal for Departments */}
      {showDepartmentModal && (
        <div className="custom-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chuyên khoa sử dụng dịch vụ</h3>
              <button 
                onClick={() => setShowDepartmentModal(false)}
                className="modal-close"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {isLoadingDepartments ? (
                <div className="loading">Đang tải...</div>
              ) : departments.length === 0 ? (
                <p>Không có chuyên khoa nào sử dụng dịch vụ này.</p>
              ) : (
                <ul className="department-list">
                  {departments.map(dept => (
                    <li key={dept._id}>{dept.name}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowDepartmentModal(false)}
                className="modal-button"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "procedure":
      return "Chuyên khoa";
    case "test":
      return "Xét nghiệm";
    case "vaccination":
      return "Tiêm chủng";
    default:
      return "Khác";
  }
}