import TalaIcon from "@/public/TalaIcon";
export default function Header() {
  return (
    <div className="header">
      <div className="header-left">
        <TalaIcon />
        <a className="app-title">TalaCheck</a>
      </div>
      <div className="header-right">
        <a className="header-about">About us</a>
        <a className="header-software">Software</a>
        <a className="header-mission">Mission</a>
        <a className="header-contact">Contact us</a>
      </div>
    </div>
  );
}
