import "../styles/layout.css";
import "../styles/text.css";

function Layout({ title, children }) {
  return (
    <div className="container">
      <div className="blue2">
        <div className="textblue"><h2 >{title}</h2></div>
      </div>
      {children}
    </div>
  );
}

export default Layout;