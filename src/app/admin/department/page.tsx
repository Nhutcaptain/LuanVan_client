"use client";
import React, { useState, useEffect } from "react";
import "./styles.css";
import { Department, Specialty } from "@/interface/Department";
import { Service } from "@/interface/ServiceInterface";
import DepartmentList from "@/components/DepartmentComponent/DepartmentList";
import SpecialtyList from "@/components/DepartmentComponent/SpecialtyList";
import DoctorList from "@/components/DepartmentComponent/DoctorList";
import DepartmentForm from "@/components/DepartmentComponent/DepartmentForm";
import SpecialtyForm from "@/components/DepartmentComponent/SpecialtyForm";
import ServiceModal from "@/components/DepartmentComponent/ServiceModal";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

interface Doctor {
  _id: string;
  userId: {
    fullName: string;
    email: string;
    phone: string;
  };
  name: string;
  specialtyId: string;
  departmentId: string;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeTab, setActiveTab] = useState<
    "departments" | "specialties" | "doctors"
  >("departments");
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showSpecialtyForm, setShowSpecialtyForm] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(
    null
  );
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState("");
  const [isMultipleSelectedSpecialty, setIsMultipleSelectedSpecialty] =
    useState(false);

  // Mock data - replace with API calls
  useEffect(() => {
    // Mock departments
    fetchDepartments();

    // Mock services
    fetchServices();

    // Mock doctors
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/department/getAllDepartment");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get("/service/getAll");
      setServices(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lấy thông tin dịch vụ");
    }
  };

  useEffect(() => {
    if (!selectedDepartment) return;
    const fetchSpecialties = async () => {
      try {
        const res = await api.get(
          `/department/getAllSpecialtyByDepartmentId/${selectedDepartment}`
        );
        if (res.status === 200) {
          setSpecialties(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchSpecialties();
  }, [selectedDepartment]);

  useEffect(() => {
    if (isMultipleSelectedSpecialty) return;
    if (!selectedDepartment) return;
    const fetchDoctors = async () => {
      try {
        const res = await api.get(
          `/doctors/getByDepartment/${selectedDepartment}`
        );
        if (res.status === 200) {
          setDoctors(res.data);
        }
      } catch (error: any) {
        if (error.response.status === 404) {
          toast.error("Không có bác sĩ nào của khoa này");
        }
      }
    };
    fetchDoctors();
  }, [selectedDepartment]);

  const handleAddDepartment = (department: Omit<Department, "_id">) => {
    const newDepartment: Department = {
      ...department,
      _id: Date.now().toString(),
    };
    setDepartments([...departments, newDepartment]);
    setShowDepartmentForm(false);
  };

  const handleUpdateDepartment = (
    department: Department | Omit<Department, "_id">
  ) => {
    if ("_id" in department) {
      setDepartments(
        departments.map((d) =>
          d._id === department._id ? (department as Department) : d
        )
      );
    }
    setEditingDepartment(null);
    setShowDepartmentForm(false);
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter((d) => d._id !== id));
    setSpecialties(specialties.filter((s) => s.departmentId !== id));
  };

  const handleAddSpecialty = (specialty: Omit<Specialty, "_id">) => {
    const newSpecialty: Specialty = {
      ...specialty,
      _id: Date.now().toString(),
    };
    setSpecialties([...specialties, newSpecialty]);
    setShowSpecialtyForm(false);
  };

  const handleUpdateSpecialty = (
    specialty: Specialty | Omit<Specialty, "_id">
  ) => {
    if ("_id" in specialty) {
      setSpecialties(
        specialties.map((s) =>
          s._id === specialty._id ? (specialty as Specialty) : s
        )
      );
    }
    setEditingSpecialty(null);
    setShowSpecialtyForm(false);
  };

  const handleDeleteSpecialty = (id: string) => {
    setSpecialties(specialties.filter((s) => s._id !== id));
  };

  const handleAddServicesToSpecialties = async (serviceIds: string[]) => {
    Swal.fire({
      title: "Đang thêm dịch vụ cho chuyên khoa",
      icon: "info",
      showLoaderOnConfirm: true,
    });
    const updatedSpecialties = await Promise.all(
      specialties.map(async (specialty) => {
        if (selectedSpecialties.includes(specialty._id)) {
          const newServiceIds = [
            ...new Set([...specialty.serviceIds, ...serviceIds]),
          ];

          try {
            const res = await api.put(
              `/department/updateSpecialty/${specialty._id}`,
              {
                serviceIds: newServiceIds,
              }
            );
            if (res.status === 200) {
              Swal.close();
              Swal.fire({
                title: "Đã thêm dịch vụ thành công",
                icon: "success",
                timer: 1500,
              });
            }
          } catch (error: any) {
            Swal.close();
            Swal.fire({
              title: "Lỗi rồi",
              text: `${error.response}`,
              icon: "error",
              showCloseButton: true,
            });
            console.error(`Lỗi cập nhật specialty ${specialty._id}:`, error);
          }
          return { ...specialty, serviceIds: newServiceIds };
        }
        return specialty;
      })
    );

    setSpecialties(updatedSpecialties);
    setShowServiceModal(false);
    setSelectedSpecialties([]);
  };

  const handleAddServiceToDepartment = async (serviceIds: string[]) => {
    // Kiểm tra nếu không có chuyên khoa được chọn
    if (!selectedDepartment) {
      await Swal.fire({
        title: "Thao tác cần thiết",
        text: "Bạn phải chọn chuyên khoa trước khi thêm dịch vụ",
        icon: "warning",
        confirmButtonText: "Đã hiểu",
      });
      return;
    }

    // Kiểm tra chuyên khoa có tồn tại không
    const departmentToUpdate = departments.find(
      (dept) => dept._id === selectedDepartment
    );
    if (!departmentToUpdate) {
      await Swal.fire({
        title: "Lỗi",
        text: "Không tìm thấy chuyên khoa được chọn",
        icon: "error",
        confirmButtonText: "Đóng",
      });
      return;
    }

    // Kiểm tra nếu không có dịch vụ nào được chọn
    if (!serviceIds || serviceIds.length === 0) {
      await Swal.fire({
        title: "Thao tác cần thiết",
        text: "Bạn chưa chọn dịch vụ nào để thêm",
        icon: "warning",
        confirmButtonText: "Đã hiểu",
      });
      return;
    }

    // Hiển thị thông báo đang xử lý
    Swal.fire({
      title: "Đang xử lý...",
      html: "Vui lòng chờ trong giây lát",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Tạo danh sách serviceIds mới (loại bỏ trùng lặp)
      const existingServiceIds = departmentToUpdate.serviceIds || [];
      const uniqueServiceIds = [
        ...new Set([...existingServiceIds, ...serviceIds]),
      ];

      // Gọi API cập nhật
      const res = await api.put(
        `/department/updateDepartment/${selectedDepartment}`,
        {
          serviceIds: uniqueServiceIds,
        }
      );

      // Đóng thông báo đang xử lý
      Swal.close();

      // Kiểm tra kết quả trả về
      if (res.status === 200) {
        // Cập nhật state departments
        setDepartments(
          departments.map((dept) =>
            dept._id === selectedDepartment ? res.data : dept
          )
        );

        // Thông báo thành công
        await Swal.fire({
          title: "Thành công",
          text: "Đã thêm dịch vụ vào chuyên khoa thành công",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(`HTTP status ${res.status}`);
      }
    } catch (error: any) {
      // Đóng thông báo đang xử lý
      Swal.close();

      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = "Đã xảy ra lỗi khi thêm dịch vụ";
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }

      await Swal.fire({
        title: "Lỗi",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Đã hiểu",
      });

      console.error(
        `Lỗi khi cập nhật chuyên khoa ${selectedDepartment}:`,
        error
      );
    } finally {
      // Đóng modal và reset selectedDepartment
      setShowServiceModal(false);
      setSelectedDepartment("");
    }
  };

  const handleDepartmentSelect = (id: string) => {
    setSelectedDepartment(id);
    // setActiveTab('specialties');
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSpecialties = specialties.filter((spec) => {
    const matchesSearch =
      spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec?.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec?.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      !selectedDepartment || spec.departmentId === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.userId.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.userId.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      !selectedDepartment || doc.departmentId === selectedDepartment;
    const matchesSpecialty =
      !selectedSpecialty || doc.specialtyId === selectedSpecialty;
    return matchesSearch && matchesDepartment && matchesSpecialty;
  });

  return (
    <div className="department-management">
      <div className="header">
        <h1>Quản lý Khoa và Chuyên khoa</h1>
        <div className="tabs">
          <button
            className={`d-tab ${activeTab === "departments" ? "active" : ""}`}
            onClick={() => setActiveTab("departments")}
          >
            Khoa
          </button>
          <button
            className={`d-tab ${activeTab === "specialties" ? "active" : ""}`}
            onClick={() => setActiveTab("specialties")}
          >
            Chuyên khoa
          </button>
          <button
            className={`d-tab ${activeTab === "doctors" ? "active" : ""}`}
            onClick={() => setActiveTab("doctors")}
          >
            Bác sĩ
          </button>
        </div>
      </div>

      <div className="content">
        <div className="toolbar">
          <div className="search-boxs">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === "specialties" && (
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">Tất cả khoa</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          )}

          {activeTab === "doctors" && (
            <>
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedSpecialty("");
                }}
              >
                <option value="">Tất cả khoa</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                <option value="">Tất cả chuyên khoa</option>
                {specialties
                  .filter(
                    (spec) =>
                      !selectedDepartment ||
                      spec.departmentId === selectedDepartment
                  )
                  .map((spec) => (
                    <option key={spec._id} value={spec._id}>
                      {spec.name}
                    </option>
                  ))}
              </select>
            </>
          )}

          <div className="actions">
            {activeTab === "departments" && (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowDepartmentForm(true)}
                >
                  Thêm khoa
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowServiceModal(true)}
                  disabled={!selectedDepartment}
                >
                  Thêm dịch vụ ({selectedSpecialties.length})
                </button>
              </>
            )}
            {activeTab === "specialties" && (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowSpecialtyForm(true)}
                >
                  Thêm chuyên khoa
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowServiceModal(true)}
                  disabled={selectedSpecialties.length === 0}
                >
                  Thêm dịch vụ ({selectedSpecialties.length})
                </button>
              </>
            )}
          </div>
        </div>

        {activeTab === "departments" && (
          <DepartmentList
            departments={filteredDepartments}
            onSelected={handleDepartmentSelect}
            onEdit={(dept) => {
              setEditingDepartment(dept);
              setShowDepartmentForm(true);
            }}
            onDelete={handleDeleteDepartment}
          />
        )}

        {activeTab === "specialties" && (
          <SpecialtyList
            specialties={filteredSpecialties}
            departments={departments}
            isMultipleSelected={isMultipleSelectedSpecialty}
            services={services}
            onSelectedSpecialty={setSelectedSpecialtyId}
            selectedSpecialties={selectedSpecialties}
            onSelectionChange={setSelectedSpecialties}
            onEdit={(spec) => {
              setEditingSpecialty(spec);
              setShowSpecialtyForm(true);
            }}
            onDelete={handleDeleteSpecialty}
          />
        )}

        {activeTab === "doctors" && (
          <DoctorList
            doctors={filteredDoctors}
            departments={departments}
            specialties={specialties}
          />
        )}
      </div>

      {showDepartmentForm && (
        <DepartmentForm
          department={editingDepartment}
          onSave={
            editingDepartment ? handleUpdateDepartment : handleAddDepartment
          }
          onCancel={() => {
            setShowDepartmentForm(false);
            setEditingDepartment(null);
          }}
        />
      )}

      {showSpecialtyForm && (
        <SpecialtyForm
          specialty={editingSpecialty}
          departments={departments}
          onSave={editingSpecialty ? handleUpdateSpecialty : handleAddSpecialty}
          onCancel={() => {
            setShowSpecialtyForm(false);
            setEditingSpecialty(null);
          }}
        />
      )}

      {showServiceModal && (
        // <ServiceModal
        //   serviceSelected={specialties
        //     .filter((s) => selectedDepartment.includes(s._id))
        //     .flatMap((s) => s.serviceIds)}
        //   services={services}
        //   onAddServices={handleAddServiceToDepartment}
        //   onClose={() => setShowServiceModal(false)}
        // />
        <ServiceModal
          serviceSelected={
            departments
              .find((s) => s._id === selectedDepartment)
              ?.serviceIds?.map((svc: any) => svc._id) || []
          }
          services={services}
          onAddServices={handleAddServiceToDepartment}
          onClose={() => setShowServiceModal(false)}
        />
      )}
    </div>
  );
};

export default DepartmentManagement;
