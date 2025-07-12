"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { DoctorInterface } from "@/interface/DoctorInterface";
import { IPatient } from "@/interface/patientInterface";
import { IUser } from "@/interface/usermodel";
import InputComponent from "@/components/InputComponent/InputComponent";
import SelectComponent from "@/components/SelectComponent/SelectComponent";
import "./styles.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import api from "@/lib/axios";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/services/uploadAvatarService";
import UploadImageComponent from "@/components/UploadImage/UploadImageComponent";
import { Department, Specialty } from "@/interface/Department";
import { div, label } from "framer-motion/client";
import Swal from "sweetalert2";

const AccountManagementPage: React.FC = () => {
  const initialPatients: IPatient[] = [
    {
      _id: "p1",
      userId: {
        _id: "u2",
        email: "patient1@example.com",
        password: "",
        fullName: "Nguyễn Văn A",
        role: "patient",
        phone: "0987654321",
        address: {
          province: {
            name: "",
            code: 0,
          },
          district: {
            name: "",
            code: 0,
          },
          ward: {
            name: "",
            code: 0,
          },
          houseNumber: "",
        },

        dateOfBirth: "1990-11-20",
        gender: "male",
        isActive: true,
        avatar: {
          publicId: "",
          url: "",
        },
      },
      medicalHistory: "High blood pressure",
      allergies: "Peanuts",
      medications: "Lisinopril 10mg daily",
    },
  ];

  const [doctors, setDoctors] = useState<DoctorInterface[]>([]);
  const [patients, setPatients] = useState<IPatient[]>(initialPatients);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"doctor" | "patient">("doctor");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCertificate, setCurrentCertificate] = useState("");
  const [currentExperience, setCurrentExperience] = useState("");
  const [showCertificates, setShowCertificates] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  const [doctorForm, setDoctorForm] = useState<
    Omit<DoctorInterface, "_id" | "userId"> & {
      userId: Omit<IUser, "_id" | "createdAt" | "updatedAt" | "password">;
    }
  >({
    userId: {
      email: "",
      fullName: "",
      role: "doctor",
      phone: "",
      address: {
        province: {
          name: "",
          code: 0,
        },
        district: {
          name: "",
          code: 0,
        },
        ward: {
          name: "",
          code: 0,
        },
        houseNumber: "",
      },
      dateOfBirth: "",
      gender: "male",
      isActive: true,
      avatar: {
        publicId: "",
        url: "",
      },
    },
    departmentId: "",
    specialtyId: "",
    specialization: "",
    certificate: [],
    experience: [],
    schedule: {
      date: "",
      time: "",
      shifts: [],
    },
    examinationPrice:0,
  });

  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fectchDoctor = async () => {
      try {
        const res = await api.get("/doctors/getAll");
        if (res.status !== 200) {
          alert("Lỗi khi lấy danh sách bác sĩ");
          return;
        }
        console.log(res.data);
        setDoctors(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bác sĩ");
      }
    };

    fectchDoctor();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/department/getAllDepartment");
        if (res.status === 200) {
          setDepartments(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    if (!doctorForm.departmentId) return;
    const fetchSpecialties = async () => {
      try {
        const res = await api.get(
          `/department/getAllSpecialtyByDepartmentId/${doctorForm.departmentId}`
        );
        if (res.status === 200) {
          console.log(res.data);
          setSpecialties(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSpecialties();
  }, [doctorForm.departmentId]);

  const statusOptions = [
    { label: "Hoạt động", value: "true" },
    { label: "Không hoạt động", value: "false" },
  ];

  const genderOptions = [
    { label: "Nam", value: "male" },
    { label: "Nữ", value: "female" },
    { label: "Khác", value: "other" },
  ];

  const specializationOptions = [
    { label: "Tim mạch", value: "Cardiology" },
    { label: "Thần kinh", value: "Neurology" },
    { label: "Nhi khoa", value: "Pediatrics" },
    { label: "Da liễu", value: "Dermatology" },
  ];

  const handleUserInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("user.")) {
      const fieldName = name.split(".")[1];
      setDoctorForm((prev) => ({
        ...prev,
        userId: {
          ...prev.userId,
          [fieldName]: value,
        },
      }));
    } else if (name.startsWith("address.")) {
      const fieldName = name.split(".")[1];
      setDoctorForm((prev) => ({
        ...prev,
        userId: {
          ...prev.userId,
          address: {
            ...prev.userId.address,
            [fieldName]: value,
          },
        },
      }));
    } else {
      setDoctorForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCreate = async () => {
    if (activeTab !== "doctor") return;
    setIsCreating(true);
    setEditingId(null);

    setDoctorForm({
      userId: {
        email: "",
        fullName: "",
        role: "doctor",
        phone: "",
        address: {
          province: {
            name: "",
            code: 0,
          },
          district: {
            name: "",
            code: 0,
          },
          ward: {
            name: "",
            code: 0,
          },
          houseNumber: "",
        },

        dateOfBirth: "",
        gender: "male",
        isActive: true,
        avatar: {
          publicId: "",
          url: "",
        },
      },
      departmentId: "",
      specialtyId: "",
      specialization: "",
      certificate: [],
      experience: [],
      schedule: {
        date: "",
        time: "",
        shifts: [],
      },
      examinationPrice: 0,
    });
  };

  const handleEdit = (id: string) => {
    if (activeTab === "doctor") {
      const doctor = doctors.find((d) => d._id === id);
      if (doctor) {
        setDoctorForm({
          userId: {
            email: doctor.userId.email,
            fullName: doctor.userId.fullName,
            role: "doctor",
            phone: doctor.userId.phone,
            address: doctor.userId.address,
            dateOfBirth: doctor.userId.dateOfBirth
              ? doctor.userId.dateOfBirth.toString().split("T")[0]
              : "",
            gender: doctor.userId.gender,
            isActive: doctor.userId.isActive,
            avatar: doctor.userId.avatar,
          },
          departmentId: doctor.departmentId,
          specialtyId: doctor.specialtyId,
          specialization: doctor.specialization,
          certificate: doctor.certificate,
          experience: doctor.experience,
          schedule: doctor.schedule,
          examinationPrice: doctor.examinationPrice
        });
        setEditingId(id);
        setIsCreating(false);
      }
    }
    headRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
  };

  const handleSubmit = async () => {
    if (activeTab !== "doctor") return;

    try {
      const uploadData = { ...doctorForm };
      Swal.fire({
        title: isCreating ? "Đang tạo mới bác sĩ" : "Đang cập nhật bác sĩ",
        text: "Vui lòng chờ trong giây lát",
        icon: "info",
        didOpen: () => {
          Swal.showLoading();
        },
      });
      if (avatarFile) {
        if (uploadData.userId.avatar.url !== "") {
          await deleteImageFromCloudinary(uploadData.userId.avatar.publicId);
        }
        const { publicId, url } = await uploadImageToCloudinary(avatarFile);
        uploadData.userId.avatar.publicId = publicId;
        uploadData.userId.avatar.url = url;
      }

      if (isCreating) {
        console.log(doctorForm);

        const res = await api.post("/doctors/create", uploadData);
        if (res.status === 201) {
          Swal.close();
          Swal.fire({
            title: "Đã tạo bác sĩ mới thành công",
            icon: "success",
            timer: 1000,
          });

          setDoctors([...doctors, res.data]);
          setIsCreating(false);
        }
      } else if (editingId) {
        const res = await api.put(`/doctors/update/${editingId}`, uploadData);
        if (res.status === 200) {
          Swal.close();
          Swal.fire({
            title: "Đã cập nhật thông tin bác sĩ thành công",
            icon: "success",
            timer: 1000,
          });
        }
        setDoctors(
          doctors.map((doctor) =>
            doctor._id === editingId ? res.data : doctor
          )
        );
        setEditingId(null);
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: "Email đã tồn tại",
        icon: "error",
        showCloseButton: true,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      if (activeTab === "doctor") {
        setDoctors(doctors.filter((doctor) => doctor._id !== id));
      }
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(
      (doctor) =>
        doctor?.userId?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        doctor?.userId?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        doctor?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [doctors, searchTerm]);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.userId.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      patient.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.medicalHistory &&
        patient.medicalHistory.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCertificate = () => {
    if (currentCertificate.trim()) {
      setDoctorForm((prev) => ({
        ...prev,
        certificate: [...prev.certificate, currentCertificate.trim()],
      }));
      setCurrentCertificate("");
    }
  };

  const handleRemoveCertificate = (index: number) => {
    setDoctorForm((prev) => ({
      ...prev,
      certificate: prev.certificate.filter((_, i) => i !== index),
    }));
  };

  const handleAddExperience = () => {
    if (currentExperience.trim()) {
      setDoctorForm((prev) => ({
        ...prev,
        experience: [...prev.experience, currentExperience.trim()],
      }));
      setCurrentExperience("");
    }
  };

  const handleRemoveExperience = (index: number) => {
    setDoctorForm((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const departmentOptions = departments.map((dep) => ({
    label: dep.name,
    value: dep._id,
  }));

  const specialtyOptions = specialties.map((spe) => ({
    label: spe.name,
    value: spe._id,
  }));

  return (
    <div className="account-management-container">
      <h1 className="page-title">Quản lý tài khoản</h1>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "doctor" ? "active" : ""}`}
          onClick={() => setActiveTab("doctor")}
        >
          Quản lý bác sĩ
        </button>
        <button
          className={`tab-button ${activeTab === "patient" ? "active" : ""}`}
          onClick={() => setActiveTab("patient")}
        >
          Quản lý bệnh nhân
        </button>
      </div>

      <div className="search-and-create">
        <InputComponent
          label="Tìm kiếm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Tìm theo tên, email hoặc ${
            activeTab === "doctor" ? "chuyên khoa" : "tiền sử bệnh"
          }`}
          name="search"
        />
        {activeTab === "doctor" && (
          <button className="create-button" onClick={handleCreate}>
            Thêm bác sĩ mới
          </button>
        )}
      </div>

      {(isCreating || editingId) && activeTab === "doctor" && (
        <div className="account-form">
          <h2 ref={headRef}>
            {isCreating ? "Thêm bác sĩ mới" : "Chỉnh sửa thông tin"}
          </h2>
          <UploadImageComponent
            onFileSelect={(file) => setAvatarFile(file)}
            initialAvatar={doctorForm.userId.avatar.url}
            size={250}
          ></UploadImageComponent>
          <div className="form-grid">
            <InputComponent
              label="Email"
              value={doctorForm.userId.email}
              onChange={handleUserInputChange}
              name="user.email"
              type="email"
              required
            />

            <InputComponent
              label="Mật khẩu"
              value={"Mật khẩu"}
              onChange={handleUserInputChange}
              name="user.password"
              type="password"
              required={isCreating}
            />

            <InputComponent
              label="Họ và tên"
              value={doctorForm.userId.fullName}
              onChange={handleUserInputChange}
              name="user.fullName"
              required
            />

            <InputComponent
              label="Số điện thoại"
              value={doctorForm.userId.phone}
              onChange={handleUserInputChange}
              name="user.phone"
              required
            />

            <InputComponent
              label="Ngày sinh"
              value={
                typeof doctorForm.userId.dateOfBirth === "string"
                  ? doctorForm.userId.dateOfBirth
                  : doctorForm.userId.dateOfBirth
                  ? doctorForm.userId.dateOfBirth.toISOString().split("T")[0]
                  : ""
              }
              onChange={handleUserInputChange}
              name="user.dateOfBirth"
              type="date"
              required
            />

            <SelectComponent
              label="Giới tính"
              value={doctorForm.userId.gender}
              onChange={handleUserInputChange}
              options={genderOptions}
              name="user.gender"
              required
            />
            <SelectComponent
              label="Khoa"
              value={doctorForm.departmentId ?? ""}
              onChange={handleUserInputChange}
              options={departmentOptions}
              name="departmentId"
              required
            />

            <SelectComponent
              label="Chuyên khoa"
              value={doctorForm.specialtyId ?? ""}
              onChange={handleUserInputChange}
              options={specialtyOptions}
              name="specialtyId"
              required
            />

            <SelectComponent
              label="Trạng thái"
              value={doctorForm.userId.isActive.toString()}
              onChange={handleUserInputChange}
              options={statusOptions}
              name="user.isActive"
              required
            />
            <InputComponent
              label="Giá tiền khám ngoài giờ *VNĐ*"
              value={doctorForm.examinationPrice ?? 0}
              onChange={handleUserInputChange}
              name="examinationPrice"
              required
            />
          </div>
          <div className="bottom-form w-full">
            {/* Certificates Section */}
            <div className="form-section">
              <div
                className="section-header"
                onClick={() => setShowCertificates(!showCertificates)}
              >
                <h3>Chứng chỉ</h3>
                <span className="toggle-icon">
                  {showCertificates ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>

              <div
                className={`collapsible-content ${
                  showCertificates ? "certificate_expanded" : ""
                }`}
              >
                <div className="content-wrapper">
                  <div className="multi-input-container">
                    <InputComponent
                      label="Thêm chứng chỉ"
                      value={currentCertificate}
                      onChange={(e) => setCurrentCertificate(e.target.value)}
                      placeholder="Ví dụ: MD - Đại học Y Hà Nội"
                    />
                    <button
                      type="button"
                      className="add-button"
                      onClick={handleAddCertificate}
                    >
                      Thêm
                    </button>
                  </div>
                  <ul className="items-list">
                    {doctorForm.certificate.map((cert, index) => (
                      <li key={index} className="item-with-remove">
                        {cert}
                        <button
                          type="button"
                          className="remove-button"
                          onClick={() => handleRemoveCertificate(index)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Experience Section */}
            <div className="form-section">
              <div
                className="section-header"
                onClick={() => setShowExperience(!showExperience)}
              >
                <h3>Kinh nghiệm</h3>
                <span className="toggle-icon">
                  {showExperience ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>

              <div
                className={`collapsible-content ${
                  showExperience ? "experience_expanded" : ""
                }`}
              >
                <div className="content-wrapper">
                  <div className="multi-input-container">
                    <InputComponent
                      label="Thêm kinh nghiệm"
                      value={currentExperience}
                      onChange={(e) => setCurrentExperience(e.target.value)}
                      placeholder="Ví dụ: Bác sĩ nội trú Bệnh viện Bạch Mai (2010-2015)"
                    />
                    <button
                      type="button"
                      className="add-button"
                      onClick={handleAddExperience}
                    >
                      Thêm
                    </button>
                  </div>
                  <ul className="items-list">
                    {doctorForm.experience.map((exp, index) => (
                      <li key={index} className="item-with-remove">
                        {exp}
                        <button
                          type="button"
                          className="remove-button"
                          onClick={() => handleRemoveExperience(index)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="submit-button" onClick={handleSubmit}>
              {isCreating ? "Tạo mới" : "Cập nhật"}
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      <div className="accounts-table-container">
        <table className="accounts-table">
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              {activeTab === "doctor" && <th>Chuyên khoa</th>}
              {activeTab === "patient" && <th>Tiền sử bệnh</th>}
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === "doctor" ? (
              filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>{doctor.userId.fullName}</td>
                    <td>{doctor.userId.email}</td>
                    <td>{doctor.userId.phone}</td>
                    <td>{doctor.specialization}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          doctor.userId.isActive ? "active" : "inactive"
                        }`}
                      >
                        {doctor.userId.isActive
                          ? "Hoạt động"
                          : "Không hoạt động"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="edit-button"
                        onClick={() => doctor._id && handleEdit(doctor._id)}
                      >
                        Sửa
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => doctor._id && handleDelete(doctor._id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="no-results">
                    Không tìm thấy bác sĩ nào
                  </td>
                </tr>
              )
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.userId.fullName}</td>
                  <td>{patient.userId.email}</td>
                  <td>{patient.userId.phone}</td>
                  <td>{patient.medicalHistory}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        patient.userId.isActive ? "active" : "inactive"
                      }`}
                    >
                      {patient.userId.isActive
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="edit-button"
                      onClick={() => patient._id && handleEdit(patient._id)}
                      disabled
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="no-results">
                  Không tìm thấy bệnh nhân nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountManagementPage;
