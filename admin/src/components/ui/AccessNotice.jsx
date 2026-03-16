const AccessNotice = ({ title = "Read only access", message }) => (
  <div className="access-notice">
    <strong>{title}</strong>
    <p>{message}</p>
  </div>
);

export default AccessNotice;
