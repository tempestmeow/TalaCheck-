import Image from "next/image";
import "./global.css";
import Header from "@/components/Header";
import MissionIcon from "@/public/MissionIcon";
export default function Home() {
  return (
    <>
      <div className="page">
        <Header />
        <div className="body">
          <div className="mission-block">
            <div className="mission-left">
              <span className="mission-text">
                Truth First, Awareness Always, Misinformation Never
              </span>
              <span className="mission-description">
                We deliver top economic, legal, and political news while helping
                users verify information and identify misinformation in the
                Philippines.
              </span>
              <span className="mission-link">Try our site</span>
            </div>
            <MissionIcon />
          </div>
        </div>
        <div className="software-block"></div>
      </div>
    </>
  );
}
