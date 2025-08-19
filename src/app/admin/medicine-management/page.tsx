'use client'
import { useState, useEffect } from 'react';
import './styles.css';
import api from '@/lib/axios';

interface Medicine {
  _id?: string;
  name: string;
  stock: number;
  unit: string;
  importDate?: string;
  expireDate?: string;
  warningThreshold?: number;
  price?: number;
  description?: string;
}

const MedicineManagement = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [formData, setFormData] = useState<Medicine>({
    name: '',
    stock: 0,
    unit: 'viên',
    importDate: new Date().toISOString().split('T')[0], // Default to today
    expireDate: '',
    warningThreshold: 10,
    price: 0,
    description: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockCount, setLowStockCount] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    updateCounts();
  }, [medicines]);

  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/medicine/getAll');
      setMedicines(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setIsLoading(false);
    }
  };

  const updateCounts = () => {
    const today = new Date();
    const warningDate = new Date();
    warningDate.setDate(today.getDate() + 30); // 30 days from now

    let lowStock = 0;
    let expiring = 0;

    medicines.forEach(med => {
      // Count low stock items
      if (med.warningThreshold && med.stock <= med.warningThreshold) {
        lowStock++;
      }

      // Count expiring items
      if (med.expireDate) {
        const expireDate = new Date(med.expireDate);
        if (expireDate <= warningDate) {
          expiring++;
        }
      }
    });

    setLowStockCount(lowStock);
    setExpiringCount(expiring);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'stock' || name === 'warningThreshold' || name === 'price' 
        ? Number(value) 
        : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/medicine/update/${editingId}`, formData);
        if(res.status === 200) {
            setMedicines(prev => 
                prev.map(med => (med._id === res.data._id ? res.data : med))
            )
        }
      } else {
        await api.post('/medicine/create', formData);
      }
      resetForm();
      fetchMedicines();
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      stock: 0,
      unit: 'viên',
      importDate: new Date().toISOString().split('T')[0],
      expireDate: '',
      warningThreshold: 10,
      price: 0,
      description: ''
    });
    setEditingId(null);
  };

  const handleEdit = (medicine: Medicine) => {
    setFormData({
      name: medicine.name,
      stock: 0,
      unit: medicine.unit,
      importDate: medicine.importDate || new Date().toISOString().split('T')[0],
      expireDate: medicine.expireDate || '',
      warningThreshold: medicine.warningThreshold || 10,
      price: medicine.price || 0,
      description: medicine.description || ''
    });
    setEditingId(medicine._id || null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thuốc này?')) {
      try {
        await api.delete(`/medicine/delete/${id}`);
        fetchMedicines();
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  const filteredMedicines = () => {
    const today = new Date();
    const warningDate = new Date();
    warningDate.setDate(today.getDate() + 30); // 30 days from now

    let result = medicines;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(med => 
        med.name.toLowerCase().includes(term) ||
        (med.description && med.description.toLowerCase().includes(term))
      );
    }

    // Apply tab filter
    switch (activeTab) {
      case 'lowStock':
        return result.filter(med => med.warningThreshold && med.stock <= med.warningThreshold);
      case 'expiring':
        return result.filter(med => 
          med.expireDate && new Date(med.expireDate) <= warningDate
        );
      default:
        return result;
    }
  };

  return (
    <div className="medicine-container">
      <h1 className="header">Quản lý Kho Thuốc</h1>
      
      <div className="medicine-content">
        {/* Form */}
        <div className="form-section-medicine">
          <h2>{editingId ? 'Cập nhật Thuốc' : 'Thêm Thuốc Mới'}</h2>
          <form onSubmit={handleSubmit} className="medicine-form">
            <div className="form-group-medicine">
              <label>Tên thuốc:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row-medicine">
              <div className="form-group-medicine">
                <label>Số lượng nhập thêm:</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group-medicine">
                <label>Đơn vị:</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                >
                  <option value="viên">Viên</option>
                  <option value="bịt">Bịt</option>
                  <option value="ống">Ống</option>
                </select>
              </div>
            </div>

            <div className="form-row-medicine">
              <div className="form-group-medicine">
                <label>Ngày nhập kho:</label>
                <input
                  type="date"
                  name="importDate"
                  value={formData.importDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group-medicine">
                <label>Ngày hết hạn:</label>
                <input
                  type="date"
                  name="expireDate"
                  value={formData.expireDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row-medicine">
              <div className="form-group-medicine">
                <label>Ngưỡng cảnh báo:</label>
                <input
                  type="number"
                  name="warningThreshold"
                  value={formData.warningThreshold}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              <div className="form-group-medicine">
                <label>Giá (VNĐ):</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.001"
                />
              </div>
            </div>

            <div className="form-group-medicine">
              <label>Mô tả:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="form-actions-medicine">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Cập nhật' : 'Thêm'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="list-section-medicine">
          <div className="list-header">
            <div className="tabs">
              <button 
                className={`tab-medicine ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Tất cả
              </button>
              <button 
                className={`tab-medicine ${activeTab === 'lowStock' ? 'active' : ''}`}
                onClick={() => setActiveTab('lowStock')}
              >
                Sắp hết
                {lowStockCount > 0 && <span className="count-badge">{lowStockCount}</span>}
              </button>
              <button 
                className={`tab-medicine ${activeTab === 'expiring' ? 'active' : ''}`}
                onClick={() => setActiveTab('expiring')}
              >
                Sắp hết hạn
                {expiringCount > 0 && <span className="count-badge">{expiringCount}</span>}
              </button>
            </div>
            
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm thuốc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          {isLoading ? (
            <p>Đang tải...</p>
          ) : (
            <div className="medicine-list-container">
              <div className="medicine-list">
                {filteredMedicines().length === 0 ? (
                  <p className="no-data">Không có dữ liệu</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Tên thuốc</th>
                        <th>Số lượng</th>
                        <th>Đơn vị</th>
                        <th>Ngày nhập</th>
                        <th>Hạn sử dụng</th>
                        <th>Giá</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedicines().map((medicine) => {
                        const isLowStock = medicine.warningThreshold && medicine.stock <= medicine.warningThreshold;
                        const today = new Date();
                        const expireDate = medicine.expireDate ? new Date(medicine.expireDate) : null;
                        const isExpiring = expireDate && expireDate <= new Date(today.setDate(today.getDate() + 30));
                        
                        return (
                          <tr 
                            key={medicine._id}
                            className={`${isLowStock ? 'low-stock' : ''} ${isExpiring ? 'expiring' : ''}`}
                          >
                            <td>
                              <strong>{medicine.name}</strong>
                              {medicine.description && <div className="description">{medicine.description}</div>}
                            </td>
                            <td>{medicine.stock}</td>
                            <td>{medicine.unit}</td>
                            <td>
                              {medicine.importDate 
                                ? new Date(medicine.importDate).toLocaleDateString("vi-VN") 
                                : 'N/A'}
                            </td>
                            <td>
                              {medicine.expireDate 
                                ? new Date(medicine.expireDate).toLocaleDateString("vi-VN") 
                                : 'N/A'}
                              {isExpiring && <span className="warning-icon">⚠️</span>}
                            </td>
                            <td>{medicine.price ? medicine.price.toLocaleString() : 'N/A'} VNĐ</td>
                            <td>
                              <button 
                                onClick={() => handleEdit(medicine)}
                                className="btn btn-edit"
                              >
                                Cập nhật
                              </button>
                              {/* <button 
                                onClick={() => handleDelete(medicine._id!)}
                                className="btn btn-delete"
                              >
                                Xóa
                              </button> */}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineManagement;