import { useNavigate } from "react-router-dom";
import PotholeForm from "../components/PotholeForm";

const ReportPothole = () => {
  const navigate = useNavigate();

  const handleSuccess = (createdPothole) => {
    if (createdPothole?._id) {
      navigate(`/potholes/${createdPothole._id}`);
    } else {
      navigate("/my-reports");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Pothole
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload image or video media, specify location coordinates, and submit a road hazard report
        </p>
      </div>

      <PotholeForm onSuccess={handleSuccess} />
    </div>
  );
};

export default ReportPothole;
