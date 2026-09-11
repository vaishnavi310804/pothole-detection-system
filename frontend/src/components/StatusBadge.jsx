const StatusBadge = ({ value, type = "status" }) => {
  let styleClasses = "bg-slate-700 text-slate-200 border-slate-600";

  if (type === "status") {
    switch (value) {
      case "Reported":
        styleClasses = "bg-amber-500/10 text-amber-600 border-amber-500/30";
        break;
      case "Acknowledged":
        styleClasses = "bg-blue-500/10 text-blue-600 border-blue-500/30";
        break;
      case "In Progress":
        styleClasses = "bg-purple-500/10 text-purple-600 border-purple-500/30";
        break;
      case "Resolved":
        styleClasses = "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
        break;
      default:
        break;
    }
  } else if (type === "severity") {
    switch (value) {
      case "Low":
        styleClasses = "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
        break;
      case "Medium":
        styleClasses = "bg-amber-500/10 text-amber-600 border-amber-500/30";
        break;
      case "High":
        styleClasses = "bg-rose-500/10 text-rose-600 border-rose-500/30";
        break;
      default:
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {value || "N/A"}
    </span>
  );
};

export default StatusBadge;
