import TalaIcon from "@/public/TalaIcon";
export default function Header() {
  return (
    <div className="header">
      <div className="header-left">
        <TalaIcon />
        <a className="app-title">TalaCheck</a>
      </div>
      <div className="header-right"></div>
    </div>
  );
}
