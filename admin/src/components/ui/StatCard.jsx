const StatCard = ({ label, value, accent = "orange" }) => (
  <div className={`stat-card stat-card--${accent}`}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default StatCard;
