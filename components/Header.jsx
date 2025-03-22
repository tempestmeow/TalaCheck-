import TalaIcon from "@/public/TalaIcon";
export default function Header({ handleScroll }) {
  return (
    <div className="header">
      <div className="header-left">
        <TalaIcon />
        <a className="app-title">TalaCheck</a>
      </div>
      <div className="header-right">
        <a
          className="header-software header-item"
          onClick={() => handleScroll(".software-block")}
        >
          Software
        </a>
        <a className="header-mission header-item">Mission</a>
        <a
          className="header-about header-item"
          onClick={() => handleScroll(".problem-block")}
        >
          About
        </a>
        <a
          className="header-contact header-item"
          onClick={() => handleScroll(".contact-block")}
        >
          Contact us
        </a>
      </div>
    </div>
  );
}
