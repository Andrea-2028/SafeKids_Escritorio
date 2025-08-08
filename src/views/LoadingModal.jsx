function LoadingModal({ show }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>Cargando datos...</p>
      </div>
    </div>
  );
}

export default LoadingModal;
