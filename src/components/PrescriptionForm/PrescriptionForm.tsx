import type { PrescriptionItem } from '../../interface/ExaminationInterface'
import './styles.css'
interface Props {
  item: PrescriptionItem;
  index: number;
  onRemove: () => void;
}

export default function PrescriptionForm(props: Props) {

    const {item, index, onRemove} = props;
  return (
    <div className="prescription-item">
      <span className="prescription-medication">{item.medication}</span>
      <span className="prescription-detail">
        {item.dosage} · {item.frequency} · {item.duration}
      </span>
      <button 
        type="button" 
        onClick={onRemove}
        className="prescription-remove-btn"
      >
        Xóa
      </button>
    </div>
  );
}