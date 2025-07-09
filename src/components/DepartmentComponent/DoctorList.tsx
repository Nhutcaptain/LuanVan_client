import { DoctorListInterface } from "@/interface/DoctorInterface";
import { useState } from "react";


interface DoctorListProps {
  doctors: DoctorListInterface[];
  onAddDoctor: (doctorId: string) => void;
  allDoctors: DoctorListInterface[];
}

const DoctorList = ({ doctors, onAddDoctor, allDoctors }: DoctorListProps) => {
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  const availableDoctors = allDoctors.filter(d => 
    !doctors.some(doc => doc._id === d._id)
  );

  return (
    <div>
      {doctors.length === 0 ? (
        <div>No doctors found</div>
      ) : (
        <ul className="list">
          {doctors.map((doctor) => (
            <li key={doctor._id} className="doctor-item">
              {doctor.fullName}
            </li>
          ))}
        </ul>
      )}

      <button 
        className="button button-secondary"
        onClick={() => setShowAddDoctor(true)}
        style={{ marginTop: '10px' }}
      >
        Add Doctor
      </button>

      {showAddDoctor && (
        <div style={{ marginTop: '10px' }}>
          <select
            className="form-input"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            <option value="">Select a doctor</option>
            {availableDoctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>{doctor.fullName}</option>
            ))}
          </select>
          <button 
            className="button button-primary"
            onClick={() => {
              if (selectedDoctorId) {
                onAddDoctor(selectedDoctorId);
                setSelectedDoctorId('');
                setShowAddDoctor(false);
              }
            }}
            style={{ marginLeft: '10px' }}
            disabled={!selectedDoctorId}
          >
            Add
          </button>
          <button 
            className="button button-danger"
            onClick={() => {
              setSelectedDoctorId('');
              setShowAddDoctor(false);
            }}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorList;