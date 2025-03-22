import Image from "next/image";
import "./global.css";
import Header from "@/components/Header";
import OCR from "@/public/OCR";
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
              <MissionIcon className={"mission-icon-hide"} />
              <span className="mission-description">
                We deliver top economic, legal, and political news while helping
                users verify information and identify misinformation in the
                Philippines.
              </span>
              <span className="mission-link">Try our site</span>
            </div>
            <MissionIcon className={"mission-icon"} />
          </div>
          <div className="software-block">
            <div className="software-block-header">
              <span className="software-header">Software</span>
              <span className="software-description">
                We utilize fact-checking algorithms, news APIs, and OCR to
                verify and analyze news. These technologies includes:
              </span>
            </div>
            <div className="software-block-grid">
              <div className="software-item s1">
                <div className="software-left">
                  <span className="software-title ">
                    Optical Character Recognition
                  </span>
                  <span className="learn-more">Learn more</span>
                </div>
                <OCR />
              </div>
              <div className="software-item s2">Fact-Checking API</div>
              <div className="software-item s3">News API</div>
              <div className="software-item s4">
                Natural Language Processing
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
