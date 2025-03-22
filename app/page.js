"use client";

import React from "react";
import { useState } from "react";
import Image from "next/image";
import "./global.css";
import Header from "@/components/Header";
import OCR from "@/public/OCR";
import MissionIcon from "@/public/MissionIcon";
import LearnIcon from "@/public/LearnIcon";
import FactCheck from "@/public/FactCheck";
import NewsIcon from "@/public/NewsIcon";
import NLP from "@/public/NLP";
import AddIcon from "@/public/AddIcon";
import SubtractIcon from "@/public/SubtractIcon";
export default function Home() {
  const [problemToggle1, setProblemToggle1] = useState(false);
  const [problemToggle2, setProblemToggle2] = useState(false);
  const [problemToggle3, setProblemToggle3] = useState(false);

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
          <div className="problem-block">
            <div className="problem-header">
              <span className="problem-title">Key Issues</span>
              <span className="problem-description">
                The Need for Media Literacy
              </span>
            </div>
            <div className="problem-list">
              <div className="problem-item">
                <div
                  className={
                    !problemToggle1
                      ? "problem-top"
                      : "problem-top problem-toggled"
                  }
                >
                  <div className="problem-left">
                    <span className="problem-number">1</span>
                    <span className="problem-point">
                      Fake News & Polarization
                    </span>
                  </div>
                  <div className="problem-toggle">
                    <div className="problem-toggle">
                      {problemToggle1 ? (
                        <SubtractIcon
                          problemToggle={problemToggle1}
                          setProblemToggle={setProblemToggle1}
                        />
                      ) : (
                        <AddIcon
                          problemToggle={problemToggle1}
                          setProblemToggle={setProblemToggle1}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {problemToggle1 && (
                  <div className="problem-bottom">
                    Fake news spreads false or misleading information, deepening
                    political divides. It fuels distrust, reinforces biases, and
                    manipulates public perception through social media
                    algorithms and disinformation campaigns.
                  </div>
                )}
              </div>
              <div className="problem-item">
                <div
                  className={
                    !problemToggle2
                      ? "problem-top"
                      : "problem-top problem-toggled"
                  }
                >
                  <div className="problem-left">
                    <span className="problem-number">2</span>
                    <span className="problem-point">Impact on Democracy</span>
                  </div>
                  <div className="problem-toggle">
                    <div className="problem-toggle">
                      {problemToggle2 ? (
                        <SubtractIcon
                          problemToggle={problemToggle2}
                          setProblemToggle={setProblemToggle2}
                        />
                      ) : (
                        <AddIcon
                          problemToggle={problemToggle2}
                          setProblemToggle={setProblemToggle2}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {problemToggle2 && (
                  <div className="problem-bottom">
                    Fake news spreads false or misleading information, deepening
                    political divides. It fuels distrust, reinforces biases, and
                    manipulates public perception through social media
                    algorithms and disinformation campaigns.
                  </div>
                )}
              </div>
              <div className="problem-item">
                <div
                  className={
                    !problemToggle3
                      ? "problem-top"
                      : "problem-top problem-toggled"
                  }
                >
                  <div className="problem-left">
                    <span className="problem-number">3</span>
                    <span className="problem-point">
                      Media Influence & Bias
                    </span>
                  </div>
                  <div className="problem-toggle">
                    <div className="problem-toggle">
                      {problemToggle3 ? (
                        <SubtractIcon
                          problemToggle={problemToggle3}
                          setProblemToggle={setProblemToggle3}
                        />
                      ) : (
                        <AddIcon
                          problemToggle={problemToggle3}
                          setProblemToggle={setProblemToggle3}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {problemToggle3 && (
                  <div className="problem-bottom">
                    Fake news spreads false or misleading information, deepening
                    political divides. It fuels distrust, reinforces biases, and
                    manipulates public perception through social media
                    algorithms and disinformation campaigns.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
