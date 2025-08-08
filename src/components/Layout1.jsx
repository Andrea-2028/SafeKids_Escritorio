import "../styles/layout.css";

function Layout({ children }) {
  return (
    <div className="container">
      <div className="blue"></div>
      {children}
    </div>
  );
}

export default Layout;
