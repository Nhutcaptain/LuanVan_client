'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';
import SearchBar from '@/components/DepartmentComponent/SearchBar';
import DepartmentList from '@/components/DepartmentComponent/DepartmentList';
import SpecialtyList from '@/components/DepartmentComponent/SpecialtyList';
import DoctorList from '@/components/DepartmentComponent/DoctorList';
import DepartmentForm from '@/components/DepartmentComponent/DepartmentForm';
import SpecialtyForm from '@/components/DepartmentComponent/SpecialtyForm';
import { Department, Specialty } from '@/interface/Department';
import { DoctorListInterface } from '@/interface/DoctorInterface';
import api from '@/lib/axios';

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<DoctorListInterface[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showSpecialtyForm, setShowSpecialtyForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'department' | 'specialty'>('department');

  // Fetch data
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/department/getAllDepartment');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    if(!selectedDepartment?._id) return;
    const fetchSpecialties = async () => {
    try {
      const response = await api.get(`/department/getAllSpecialtyByDepartmentId/${selectedDepartment?._id}`);
      setSpecialties(response.data);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  fetchSpecialties();
  },[selectedDepartment?._id])

  useEffect(() => {
    if(!selectedDepartment?._id) return;
    fetchDoctors();
  },[selectedDepartment?._id])

  

  const fetchDoctors = async () => {
    try {
      const response = await api.get(`/department/getAll/${selectedDepartment?._id}`);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  // Department handlers
  const handleCreateDepartment = async (department: Omit<Department, '_id'>) => {
    try {
      const response = await axios.post('/api/departments', department);
      setDepartments([...departments, response.data]);
      setShowDepartmentForm(false);
    } catch (error) {
      console.error('Error creating department:', error);
    }
  };

  const handleUpdateDepartment = async (department: Department) => {
    try {
      const response = await axios.put(`/api/departments/${department._id}`, department);
      setDepartments(departments.map(d => d._id === department._id ? response.data : d));
      setEditingDepartment(null);
      setShowDepartmentForm(false);
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await axios.delete(`/api/departments/${id}`);
      setDepartments(departments.filter(d => d._id !== id));
      if (selectedDepartment?._id === id) {
        setSelectedDepartment(null);
      }
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  // Specialty handlers
  const handleCreateSpecialty = async (specialty: Omit<Specialty, '_id'>) => {
    try {
      const response = await api.post('/department/createSpecialty',specialty);
      setSpecialties([...specialties, response.data]);
      setShowSpecialtyForm(false);
    } catch (error) {
      console.error('Error creating specialty:', error);
    }
  };

  const handleUpdateSpecialty = async (specialty: Specialty) => {
    try {
      const response = await axios.put(`/api/specialties/${specialty._id}`, specialty);
      setSpecialties(specialties.map(s => s._id === specialty._id ? response.data : s));
      setEditingSpecialty(null);
      setShowSpecialtyForm(false);
    } catch (error) {
      console.error('Error updating specialty:', error);
    }
  };

  const handleDeleteSpecialty = async (id: string) => {
    try {
      await axios.delete(`/api/specialties/${id}`);
      setSpecialties(specialties.filter(s => s._id !== id));
      if (selectedSpecialty?._id === id) {
        setSelectedSpecialty(null);
      }
    } catch (error) {
      console.error('Error deleting specialty:', error);
    }
  };

  // Doctor handlers
  const handleAddDoctorToDepartment = async (doctorId: string, departmentId: string) => {
    try {
      await axios.post('/api/doctors/assign', { doctorId, departmentId });
      fetchDoctors();
    } catch (error) {
      console.error('Error adding doctor to department:', error);
    }
  };

  const handleAddDoctorToSpecialty = async (doctorId: string, specialtyId: string) => {
    try {
      await axios.post('/api/doctors/assign', { doctorId, specialtyId });
      fetchDoctors();
    } catch (error) {
      console.error('Error adding doctor to specialty:', error);
    }
  };

  // Filter data based on search term
  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSpecialties = specialties.filter(specialty =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Department Management</h1>
        <div>
          <button 
            className="button button-primary" 
            onClick={() => {
              setEditingDepartment(null);
              setShowDepartmentForm(true);
            }}
          >
            Thêm khoa
          </button>
          <button 
            className="button button-secondary" 
            onClick={() => {
              setEditingSpecialty(null);
              setShowSpecialtyForm(true);
            }}
            style={{ marginLeft: '10px' }}
          >
            Thêm Chuyên Khoa
          </button>
        </div>
      </div>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="grid">
        <div className="section">
          <div className="section-title">
            DANH SÁCH KHOA
            <div style={{ float: 'right' }}>
              <button 
                className={`button button-small ${viewMode === 'department' ? 'button-primary' : 'button-secondary'}`}
                onClick={() => setViewMode('department')}
              >
                Danh sách Bác sĩ
              </button>
            </div>
          </div>
          <DepartmentList
            departments={filteredDepartments}
            onSelect={setSelectedDepartment}
            onEdit={(department) => {
              setEditingDepartment(department);
              setShowDepartmentForm(true);
            }}
            onDelete={handleDeleteDepartment}
            selectedId={selectedDepartment?._id}
          />
        </div>

        <div className="section">
          <div className="section-title">
            CHUYÊN KHOA
            {selectedDepartment && (
              <span> ({selectedDepartment.name})</span>
            )}
            <div style={{ float: 'right' }}>
              <button 
                className={`button button-small ${viewMode === 'specialty' ? 'button-primary' : 'button-secondary'}`}
                onClick={() => setViewMode('specialty')}
              >
                Danh sách Bác sĩ
              </button>
            </div>
          </div>
          <SpecialtyList
            specialties={filteredSpecialties
            }
            onSelect={setSelectedSpecialty}
            onEdit={(specialty) => {
              setEditingSpecialty(specialty);
              setShowSpecialtyForm(true);
            }}
            onDelete={handleDeleteSpecialty}
            selectedId={selectedSpecialty?._id}
          />
        </div>
      </div>

      <div className="section">
        <div className="section-title">
          {viewMode === 'department' 
            ? selectedDepartment 
              ? `Doctors in ${selectedDepartment.name}`
              : 'Select a department to view doctors'
            : selectedSpecialty
              ? `Doctors in ${selectedSpecialty.name}`
              : 'Select a specialty to view doctors'
          }
        </div>
        <DoctorList
          doctors={doctors}
          onAddDoctor={
            viewMode === 'department'
              ? (doctorId) => selectedDepartment && handleAddDoctorToDepartment(doctorId, selectedDepartment._id)
              : (doctorId) => selectedSpecialty && handleAddDoctorToSpecialty(doctorId, selectedSpecialty._id)
          }
          allDoctors={doctors}
        />
      </div>

      {showDepartmentForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingDepartment ? 'Edit Department' : 'Create Department'}
              </h2>
              <button className="modal-close" onClick={() => setShowDepartmentForm(false)}>
                &times;
              </button>
            </div>
            <DepartmentForm
              department={editingDepartment}
              onSubmit={(department) => {
                if (editingDepartment) {
                  void handleUpdateDepartment(department as Department);
                } else {
                  void handleCreateDepartment(department as Omit<Department, '_id'>);
                }
              }}
              onCancel={() => setShowDepartmentForm(false)}
            />
          </div>
        </div>
      )}

      {showSpecialtyForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingSpecialty ? 'Edit Specialty' : 'Create Specialty'}
              </h2>
              <button className="modal-close" onClick={() => setShowSpecialtyForm(false)}>
                &times;
              </button>
            </div>
            <SpecialtyForm
              specialty={editingSpecialty}
              departments={departments}
              onSubmit={editingSpecialty 
                ? (specialty) => { void handleUpdateSpecialty(specialty as Specialty); }
                : (specialty) => { void handleCreateSpecialty(specialty as Omit<Specialty, '_id'>); }
              }
              onCancel={() => setShowSpecialtyForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagementPage;