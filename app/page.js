import Image from "next/image";
import "./global.css";
import Header from "@/components/Header";
import OCR from "@/public/OCR";
import MissionIcon from "@/public/MissionIcon";
import LearnIcon from "@/public/LearnIcon";
import FactCheck from "@/public/FactCheck";
import NewsIcon from "@/public/NewsIcon";
import NLP from "@/public/NLP";
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
                  <span className="software-title t1">
                    Optical Character Recognition
                  </span>
                  <span className="learn-more-container">
                    <LearnIcon fill1={"#66E3FF"} fill2={"#191A23"} />
                    <span className="learn-more">Learn more</span>
                  </span>
                </div>
                <OCR />
              </div>
              <div className="software-item s2">
                <div className="software-left">
                  <span className="software-title t2">Fact-Checking API</span>
                  <span className="learn-more-container">
                    <LearnIcon fill1={"#66E3FF"} fill2={"#191A23"} />
                    <span className="learn-more">Learn more</span>
                  </span>
                </div>
                <FactCheck />
              </div>
              <div className="software-item s3">
                <div className="software-left">
                  <span className="software-title t3">News API</span>
                  <span className="learn-more-container">
                    <LearnIcon fill1={"#191A23"} fill2={"#FFFFFF"} />
                    <span className="learn-more">Learn more</span>
                  </span>
                </div>
                <NewsIcon />
              </div>
              <div className="software-item s4">
                <div className="software-left">
                  <span className="software-title t4">
                    Natural Language Processing
                  </span>
                  <span className="learn-more-container">
                    <LearnIcon fill1={"#66E3FF"} fill2={"#191A23"} />
                    <span className="learn-more">Learn more</span>
                  </span>
                </div>
                <NLP />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
