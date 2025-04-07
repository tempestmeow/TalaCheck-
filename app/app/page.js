"use client";

import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import "../global.css";

const TRUSTED_SOURCES = [
  {
    name: "RAPPLER",
    url: "https://www.rappler.com/philippines/elections/certificate-candidacy-filing-highlights-day-2-senator-party-list-october-2024/",
  },
  {
    name: "PHILSTAR",
    url: "https://www.philstar.com/lifestyle/food-and-leisure/2024/10/02/2389641/unli-pares-congress-diwata-files-coc-vendors-partylist-4th-nominee?fbclid=IwY2xjawJbVjxleHRuA2FlbQIxMAABHSIjOlzrW4-eTX5JmRAUVUOt09xcaTwPlVnYzgMZbJ2-ce0aZy0GDmRprQ_aem_l7RAm6vI-RDdLzivdARAmw",
  },
  {
    name: "ABS-CBN",
    url: "https://www.abs-cbn.com/news/nation/2025/3/10/security-presence-around-rodrigo-duterte-s-hong-kong-hotel-amid-icc-warrant-concerns-1726?fbclid=IwY2xjawJMUgNleHRuA2FlbQIxMAABHc9KEgt_07eXMU__XAw-mH2JHO5TzaMYcbgFMQa-F6Vhwtmu_ruqknrfpQ_aem_LoWzk3-L1mOZ-JonzhqYsQ",
  },
  {
    name: "RAPPLER",
    url: "https://www.rappler.com/philippines/bato-dela-rosa-plea-escudero-do-not-surrender-icc-arrest-out/?fbclid=IwY2xjawJMU2FleHRuA2FlbQIxMAABHQgQ-Eg0zS8r56QAKYQ5k2v7bNIb1tCUcdT75vtqzLQ57jawwmsPhnLqQg_aem_UQgJu7CBH8BjiyiFbtVjwg",
  },
  {
    name: "ABS-CBN",
    url: "https://www.abs-cbn.com/entertainment/2024/10/2/-unli-rice-at-batasan-pares-sensation-diwata-seeks-congressional-seat-1451",
  },
  {
    name: "DailyTribue",
    url: "https://tribune.net.ph/2024/10/02/diwata-cooks-up-change-files-coc",
  },
  {
    name: "RAPPLER",
    url: "https://www.rappler.com/philippines/mindanao/comelec-orders-misamis-oriental-governor-peter-unabia-explain-hate-speech-sexist-joke/",
  },
  {
    name: "INQUIRER",
    url: "https://www.inquirer.net/435327/moros-decry-racist-slur-by-governor/",
  },
  {
    name: "PHILSTAR",
    url: "https://www.philstar.com/nation/2025/04/07/2434153/barmm-calls-out-misamis-governor-over-discriminatory-remarks-against-muslims",
  },
];

const SOURCE_CACHE = {};

export default function FactCheckerPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [cleanedText, setCleanedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [factChecking, setFactChecking] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState("");
  const [factCheckResult, setFactCheckResult] = useState(null);
  const [sources, setSources] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setImage(file);
    setOcrText("");
    setCleanedText("");
    setSummary("");
    setFactCheckResult(null);
    setSources([]);
    setError(null);
    setProgress(0);
  };

  const preprocessImage = async (imgUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imgUrl;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const histGray = new Array(256).fill(0);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
          histGray[gray]++;
        }

        let threshold = 128;
        let sumTotal = 0;
        let weightB = 0,
          weightF = 0;
        let sumB = 0;
        let varMax = 0;

        for (let i = 0; i < 256; i++) {
          sumTotal += i * histGray[i];
        }

        for (let t = 0; t < 256; t++) {
          weightB += histGray[t];
          if (weightB === 0) continue;

          weightF = data.length / 4 - weightB;
          if (weightF === 0) break;

          sumB += t * histGray[t];

          const meanB = sumB / weightB;
          const meanF = (sumTotal - sumB) / weightF;

          const varBetween =
            weightB * weightF * (meanB - meanF) * (meanB - meanF);

          if (varBetween > varMax) {
            varMax = varBetween;
            threshold = t;
          }
        }

        for (let i = 0; i < data.length; i += 4) {
          const val = data[i] < threshold ? 0 : 255;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
    });
  };

  const cleanOCRText = (text) => {
    if (!text) return "";

    let cleaned = text.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

    cleaned = cleaned
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"')
      .replace(/[–—]/g, "-")
      .replace(/(\d),(\d)/g, "$1.$2")
      .replace(/(\w)\.(\w)/g, "$1 $2")
      .replace(/\s+/g, " ");

    cleaned = cleaned
      .replace(
        /([.!?])\s*([a-z])/g,
        (_, punctuation, letter) => `${punctuation} ${letter.toUpperCase()}`
      )
      .replace(/\bi\b/g, "I");

    cleaned = cleaned
      .replace(/\.{2,}/g, ".")
      .replace(/\?\./g, "?")
      .replace(/!\./g, "!");

    cleaned = cleaned.trim();

    return cleaned;
  };

  const processImage = async () => {
    if (!image) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const preprocessed = await preprocessImage(preview);

      Tesseract.recognize(preprocessed, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(parseInt(m.progress * 100));
          }
        },
        tessedit_char_whitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!'\"()-",
        tessedit_pageseg_mode: 6,
        tessedit_ocr_engine_mode: 3,
        tessjs_create_hocr: false,
        tessjs_create_tsv: false,
        preserve_interword_spaces: 1,
      })
        .then(({ data: { text } }) => {
          const extractedText = text || "No text found in the image";
          setOcrText(extractedText);

          const cleanedResult = cleanOCRText(extractedText);
          setCleanedText(cleanedResult);

          setLoading(false);
        })
        .catch((err) => {
          console.error("Tesseract error:", err);
          setError(
            "Failed to process image: " + (err.message || "Unknown error")
          );
          setLoading(false);
        });
    } catch (err) {
      console.error("Error during OCR processing:", err);
      setError(err.message || "Failed to process image");
      setLoading(false);
    }
  };

  const summarizeText = async (text) => {
    if (!text || text.trim() === "") {
      setError("No text to summarize");
      return null;
    }

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || "hf_dummy_key"
            }`,
          },
          body: JSON.stringify({
            inputs: text,
            parameters: {
              max_length: 100,
              min_length: 30,
              do_sample: false,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      return result[0]?.summary_text || text.split(".")[0];
    } catch (error) {
      console.error("Error summarizing text:", error);
      setError(`Failed to summarize text: ${error.message}`);
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      return sentences.slice(0, 2).join(" ");
    }
  };

  const extractContentFromHTML = (htmlText, url) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");

      const title =
        doc.querySelector("title")?.textContent ||
        doc.querySelector("h1")?.textContent ||
        "";

      const metaDescription =
        doc
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "";
      const metaKeywords =
        doc.querySelector('meta[name="keywords"]')?.getAttribute("content") ||
        "";

      const articleTitle =
        doc.querySelector("article h1")?.textContent ||
        doc.querySelector(".article-title")?.textContent ||
        doc.querySelector(".headline")?.textContent ||
        "";

      let jsonLdData = "";
      const jsonLdScripts = doc.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      if (jsonLdScripts.length > 0) {
        try {
          for (const script of jsonLdScripts) {
            const parsedData = JSON.parse(script.textContent);
            if (
              parsedData["@type"] === "NewsArticle" ||
              parsedData["@type"] === "Article"
            ) {
              jsonLdData =
                parsedData.articleBody || parsedData.description || "";
              break;
            }
          }
        } catch (e) {
          console.warn("Error parsing JSON-LD:", e);
        }
      }

      const contentSelectors = [
        "article",
        '[role="main"]',
        ".article-body",
        ".article-content",
        ".story-body",
        ".news-article",
        ".entry-content",
        "main",
        "#content",
        ".content",
      ];

      let mainContent = null;
      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          mainContent = element;
          break;
        }
      }

      if (!mainContent) {
        mainContent = doc.body;
      }

      const paragraphs = Array.from(mainContent.querySelectorAll("p")).map(
        (p) => p.textContent.trim()
      );

      const headings = Array.from(
        mainContent.querySelectorAll("h1, h2, h3, h4")
      ).map((h) => h.textContent.trim());

      const listItems = Array.from(mainContent.querySelectorAll("li")).map(
        (li) => li.textContent.trim()
      );

      const specialContentElements = Array.from(
        mainContent.querySelectorAll(".article-text, .story-text, .news-text")
      ).map((el) => el.textContent.trim());

      const excludeSelectors = [
        "nav",
        "footer",
        ".sidebar",
        ".comments",
        ".ad",
        ".advertisement",
        ".related-content",
        ".recommendations",
        ".social-share",
      ];

      for (const selector of excludeSelectors) {
        const elements = mainContent.querySelectorAll(selector);
        elements.forEach((el) => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      }

      let extractedContent = [
        title,
        articleTitle,
        metaDescription,
        jsonLdData,
        ...headings,
        ...paragraphs,
        ...specialContentElements,
        ...listItems,
        metaKeywords,
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      const errorPatterns = [
        "page not found",
        "404",
        "error",
        "not available",
        "doesn't exist",
        "could not be found",
        "no longer available",
      ];

      const hasErrorMessage = errorPatterns.some((pattern) =>
        extractedContent.toLowerCase().includes(pattern)
      );

      if (hasErrorMessage && extractedContent.length < 500) {
        console.warn("Extracted content appears to be an error page");
        const urlKeywords = url
          .toLowerCase()
          .replace(/https?:\/\/[^\/]+\//, "")
          .replace(/[^a-z0-9]/g, " ")
          .split(/\s+/)
          .filter((word) => word.length > 3);

        if (urlKeywords.length > 0) {
          return {
            text: urlKeywords.join(" "),
            title: `Keywords from ${new URL(url).hostname}`,
            url: url,
            isErrorPage: true,
          };
        }

        return null;
      }

      console.log("Extracted Text:", extractedContent);
      return {
        text: extractedContent.toLowerCase(),
        title: title || articleTitle || new URL(url).hostname,
        url: url,
        isErrorPage: false,
      };
    } catch (error) {
      console.error("Error extracting content from HTML:", error);
      return null;
    }
  };

  const extractNamedEntities = (text) => {
    if (!text || text.length < 5) return [];

    const entitiesMap = new Map();

    const properNounRegex = /(?<![.!?]\s)[A-Z][a-z]{2,}/g;
    let match;
    while ((match = properNounRegex.exec(text)) !== null) {
      const entity = match[0];
      const count = entitiesMap.get(entity)?.count || 0;
      entitiesMap.set(entity, {
        count: count + 1,
        position: match.index,
        type: "properNoun",
      });
    }

    const properNameRegex = /[A-Z][a-z]+ (?:[A-Z][a-z]+ ){0,3}[A-Z][a-z]+/g;
    while ((match = properNameRegex.exec(text)) !== null) {
      const entity = match[0];
      const count = entitiesMap.get(entity)?.count || 0;
      entitiesMap.set(entity, {
        count: count + 1,
        position: match.index,
        type: "properName",
        words: entity.split(" ").length,
      });
    }

    const acronymRegex = /\b[A-Z]{2,}\b/g;
    while ((match = acronymRegex.exec(text)) !== null) {
      const entity = match[0];
      const count = entitiesMap.get(entity)?.count || 0;
      entitiesMap.set(entity, {
        count: count + 1,
        position: match.index,
        type: "acronym",
      });
    }

    const entitiesArray = Array.from(entitiesMap, ([entity, data]) => ({
      entity,
      ...data,
    }));

    entitiesArray.forEach((item) => {
      let score = item.count * 2;

      if (item.type === "properName") {
        score += item.words * 3;
      }

      if (item.type === "acronym") {
        score += 5;
      }

      if (item.position < text.length * 0.3) {
        score += 3;
      }

      item.score = score;
    });

    entitiesArray.sort((a, b) => b.score - a.score);

    const commonWords = [
      "The",
      "This",
      "That",
      "These",
      "Those",
      "They",
      "Their",
      "And",
      "But",
      "For",
      "Not",
      "How",
      "Why",
      "When",
      "What",
    ];

    return entitiesArray
      .filter(
        (item) => item.entity.length > 2 && !commonWords.includes(item.entity)
      )
      .slice(0, 10)
      .map((item) => ({
        text: item.entity,
        score: item.score,
        type: item.type,
      }));
  };

  const extractKeywords = (text) => {
    if (!text) return [];

    const normalized = text.toLowerCase().replace(/[^\w\s]/g, " ");

    const words = normalized.split(/\s+/).filter((word) => word.length > 3);

    const stopWords = [
      "the",
      "and",
      "this",
      "that",
      "with",
      "for",
      "from",
      "have",
      "has",
      "been",
      "were",
      "they",
      "their",
      "what",
      "when",
      "where",
      "which",
      "there",
      "will",
      "would",
      "could",
      "should",
      "about",
      "then",
      "than",
      "them",
      "these",
      "those",
      "some",
      "such",
      "very",
      "just",
      "more",
      "most",
      "other",
      "others",
      "another",
      "after",
      "before",
      "being",
      "between",
      "both",
      "during",
      "each",
      "even",
      "ever",
      "every",
    ];

    const filteredWords = words.filter((word) => !stopWords.includes(word));

    const wordFrequency = {};
    filteredWords.forEach((word) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    const sortedWords = Object.keys(wordFrequency).sort(
      (a, b) => wordFrequency[b] - wordFrequency[a]
    );

    return [...new Set(sortedWords)].slice(0, 15);
  };

  const fetchSourceContent = async (url) => {
    if (url in SOURCE_CACHE) {
      console.log(`Using cached content for ${url}`);
      return SOURCE_CACHE[url];
    }

    try {
      console.log(`Fetching content from ${url}`);

      const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`,
        url,
      ];

      let text = null;
      let response = null;

      for (const proxyUrl of proxies) {
        try {
          response = await fetch(proxyUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            signal: AbortSignal.timeout(5000),
          });

          if (response.ok) {
            text = await response.text();
            break;
          }
        } catch (err) {
          console.warn(`Proxy ${proxyUrl} failed: ${err.message}`);
          continue;
        }
      }

      if (!text) {
        console.error("Failed to fetch content from all proxies");

        const urlParts = url.split("/").filter(Boolean);
        const lastPart = urlParts[urlParts.length - 1].replace(/-/g, " ");

        if (lastPart && lastPart.length > 10) {
          SOURCE_CACHE[url] = {
            text: lastPart.toLowerCase(),
            title: `Content from URL: ${lastPart}`,
            url: url,
            isErrorPage: true,
          };
          return SOURCE_CACHE[url];
        }

        return null;
      }

      const extractedContent = extractContentFromHTML(text, url);

      if (!extractedContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        const basicText = doc.body.textContent
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
        SOURCE_CACHE[url] = {
          text: basicText,
          title: doc.title || new URL(url).hostname,
          url: url,
          isErrorPage:
            basicText.includes("not found") || basicText.includes("404"),
        };
      } else {
        SOURCE_CACHE[url] = extractedContent;
      }

      return SOURCE_CACHE[url];
    } catch (error) {
      console.error(`Error accessing ${url}:`, error);

      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        if (pathParts.length > 0) {
          const lastPart = pathParts[pathParts.length - 1].replace(/-/g, " ");
          if (lastPart.length > 5) {
            return {
              text: lastPart.toLowerCase(),
              title: `From URL: ${urlObj.hostname}`,
              url: url,
              isErrorPage: true,
            };
          }
        }
      } catch (e) {
        console.error("Failed to extract info from URL:", e);
      }

      return null;
    }
  };

  const isSourceRelevantToTopic = (sourceContent, mainText) => {
    if (!sourceContent || !sourceContent.text || !mainText) {
      return false;
    }

    const mainEntities = extractNamedEntities(mainText);

    if (mainEntities.length === 0) {
      return false;
    }

    const coreSubjects = mainEntities.slice(0, 3);

    const sourceTextLower = sourceContent.text.toLowerCase();

    let primarySubjectMatched = false;
    let matchedSubjectsCount = 0;
    let totalMatchScore = 0;

    for (const subject of coreSubjects) {
      const subjectText = subject.text;
      const subjectTextLower = subjectText.toLowerCase();

      if (
        sourceContent.text.includes(subjectText) ||
        sourceTextLower.includes(subjectTextLower)
      ) {
        matchedSubjectsCount++;
        totalMatchScore += subject.score;

        if (subject === coreSubjects[0]) {
          primarySubjectMatched = true;
        }
        continue;
      }

      if (subjectText.includes(" ")) {
        const subjectWords = subjectText.split(" ");
        let wordMatchCount = 0;

        for (const word of subjectWords) {
          if (word.length > 3 && sourceTextLower.includes(word.toLowerCase())) {
            wordMatchCount++;
          }
        }

        if (wordMatchCount >= Math.ceil(subjectWords.length * 0.75)) {
          matchedSubjectsCount++;
          totalMatchScore +=
            subject.score * (wordMatchCount / subjectWords.length);

          if (subject === coreSubjects[0]) {
            primarySubjectMatched = true;
          }
        }
      }
    }

    return (
      primarySubjectMatched ||
      matchedSubjectsCount >= 2 ||
      totalMatchScore > coreSubjects[0].score * 1.5
    );
  };

  const factCheck = async (mainText, sourcesContent) => {
    try {
      const mainEntities = extractNamedEntities(mainText);

      const relevantSources = sourcesContent.filter((source) =>
        isSourceRelevantToTopic(source, mainText)
      );

      if (relevantSources.length === 0) {
        return {
          sources: sourcesContent.map((source) => ({
            ...source,
            isRelevant: false,
            reason: "No subject match",
          })),
          verdict: "unknown",
          confidence: 0,
          message:
            "No sources containing the main subjects of the text were found.",
          entities: mainEntities,
        };
      }

      const promises = relevantSources
        .filter((source) => source !== null)
        .map(async (source) => {
          try {
            const subjectMatchDetails = analyzeSubjectOverlap(
              source,
              mainEntities
            );

            const comparisonText = createFocusedComparisonPrompt(
              source,
              mainText,
              subjectMatchDetails
            );

            const response = await fetch(
              "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${
                    process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY ||
                    "hf_dummy_key"
                  }`,
                },
                body: JSON.stringify({
                  inputs: comparisonText,
                  parameters: {
                    candidate_labels: [
                      "entailment",
                      "contradiction",
                      "neutral",
                    ],
                  },
                }),
              }
            );

            if (!response.ok) {
              throw new Error(`Hugging Face API error: ${response.status}`);
            }

            const result = await response.json();

            const entailmentScore =
              result.scores[result.labels.indexOf("entailment")] || 0;
            const contradictionScore =
              result.scores[result.labels.indexOf("contradiction")] || 0;
            const neutralScore =
              result.scores[result.labels.indexOf("neutral")] || 0;

            const adjustedScores = adjustConfidenceBasedOnSubjects(
              entailmentScore,
              contradictionScore,
              neutralScore,
              subjectMatchDetails
            );

            let verdict = determineVerdict(adjustedScores);

            return {
              ...source,
              ...adjustedScores,
              verdict,
              subjectMatchDetails,
              isRelevant: true,
            };
          } catch (error) {
            console.error(`Error checking source ${source.url}:`, error);
            return {
              ...source,
              entailmentScore: 0,
              contradictionScore: 0,
              neutralScore: 1,
              verdict: "unknown",
              error: error.message,
              isRelevant: true,
            };
          }
        });

      const results = await Promise.all(promises);

      const nonRelevantSources = sourcesContent
        .filter((source) => !isSourceRelevantToTopic(source, mainText))
        .map((source) => ({
          ...source,
          entailmentScore: 0,
          contradictionScore: 0,
          neutralScore: 0,
          verdict: "unknown",
          isRelevant: false,
          reason: "Source does not mention the main subjects",
        }));

      const allResults = [...results, ...nonRelevantSources];

      const verdictResult = calculateWeightedVerdict(results, mainEntities);

      return {
        sources: allResults,
        ...verdictResult,
        entities: mainEntities,
      };
    } catch (error) {
      console.error("Error during fact checking:", error);
      setError(`Failed to check facts: ${error.message}`);
      throw error;
    }
  };

  const analyzeSubjectOverlap = (source, entities) => {
    if (!source || !source.text || !entities || entities.length === 0) {
      return {
        matchCount: 0,
        matchScore: 0,
        primaryMatch: false,
        matchedEntities: [],
      };
    }

    const sourceTextLower = source.text.toLowerCase();
    let matchCount = 0;
    let matchScore = 0;
    let primaryMatch = false;
    const matchedEntities = [];

    entities.forEach((entity, index) => {
      const entityText = entity.text;
      const entityTextLower = entityText.toLowerCase();

      if (
        source.text.includes(entityText) ||
        sourceTextLower.includes(entityTextLower)
      ) {
        matchCount++;
        matchScore += entity.score;
        matchedEntities.push(entityText);

        if (index === 0) {
          primaryMatch = true;
        }
      } else if (entityText.includes(" ")) {
        const words = entityText.split(" ");
        let wordMatches = 0;

        words.forEach((word) => {
          if (word.length > 3 && sourceTextLower.includes(word.toLowerCase())) {
            wordMatches++;
          }
        });

        if (wordMatches >= Math.ceil(words.length * 0.75)) {
          matchCount += wordMatches / words.length;
          matchScore += entity.score * (wordMatches / words.length);
          matchedEntities.push(
            entityText + ` (${wordMatches}/${words.length} words)`
          );

          if (index === 0) {
            primaryMatch = wordMatches / words.length > 0.8;
          }
        }
      }
    });

    return {
      matchCount,
      matchScore,
      primaryMatch,
      matchedEntities,
    };
  };
  const createFocusedComparisonPrompt = (
    source,
    mainText,
    subjectMatchDetails
  ) => {
    if (subjectMatchDetails.matchedEntities.length > 0) {
      const matchedSubjectsText =
        subjectMatchDetails.matchedEntities.join(", ");
      return `Source information about ${matchedSubjectsText}: ${source.text}\n\nClaim about ${matchedSubjectsText} to verify: ${mainText}`;
    }

    return `Source information: ${source.text}\n\nClaim to verify: ${mainText}`;
  };

  const adjustConfidenceBasedOnSubjects = (
    entailment,
    contradiction,
    neutral,
    subjectDetails
  ) => {
    let adjustedEntailment = entailment;
    let adjustedContradiction = contradiction;
    let adjustedNeutral = neutral;

    if (subjectDetails.primaryMatch) {
      adjustedEntailment = Math.min(1, entailment * 1.3);
      adjustedContradiction = Math.min(1, contradiction * 1.3);
      adjustedNeutral = Math.max(0, neutral * 0.7);
    }

    if (subjectDetails.matchCount >= 3) {
      adjustedEntailment = Math.min(1, adjustedEntailment * 1.2);
      adjustedContradiction = Math.min(1, adjustedContradiction * 1.2);
      adjustedNeutral = Math.max(0, adjustedNeutral * 0.6);
    }

    if (
      subjectDetails.matchCount < 2 &&
      subjectDetails.matchedEntities.length > 0
    ) {
      adjustedEntailment *= 0.8;
      adjustedContradiction *= 0.8;
      adjustedNeutral = Math.min(1, adjustedNeutral * 1.3);
    }

    return {
      entailmentScore: adjustedEntailment,
      contradictionScore: adjustedContradiction,
      neutralScore: adjustedNeutral,
    };
  };

  const determineVerdict = (scores) => {
    const { entailmentScore, contradictionScore, neutralScore } = scores;

    if (
      entailmentScore > contradictionScore &&
      entailmentScore > neutralScore &&
      entailmentScore > 0.6
    ) {
      return "factual";
    }

    if (
      contradictionScore > entailmentScore &&
      contradictionScore > neutralScore &&
      contradictionScore > 0.6
    ) {
      return "not factual";
    }

    return "neutral";
  };

  const calculateWeightedVerdict = (results, entities) => {
    if (!results || results.length === 0) {
      return {
        verdict: "unknown",
        confidence: 0,
        reason: "No relevant sources to analyze",
      };
    }

    let factualWeight = 0;
    let notFactualWeight = 0;
    let neutralWeight = 0;

    results.forEach((result) => {
      const subjectWeight =
        (result.subjectMatchDetails?.primaryMatch ? 2 : 1) *
        (1 + (result.subjectMatchDetails?.matchCount || 0) / 5);

      if (result.verdict === "factual") {
        factualWeight += result.entailmentScore * subjectWeight;
      } else if (result.verdict === "not factual") {
        notFactualWeight += result.contradictionScore * subjectWeight;
      } else {
        neutralWeight += result.neutralScore * subjectWeight;
      }
    });

    const totalWeight = factualWeight + notFactualWeight + neutralWeight;

    const maxWeight = Math.max(factualWeight, notFactualWeight, neutralWeight);
    let verdict;

    if (maxWeight === factualWeight && factualWeight > neutralWeight * 1.5) {
      verdict = "factual";
    } else if (
      maxWeight === notFactualWeight &&
      notFactualWeight > neutralWeight * 1.5
    ) {
      verdict = "not factual";
    } else {
      verdict = "neutral";
    }

    const confidence = totalWeight > 0 ? maxWeight / totalWeight : 0;

    return {
      verdict,
      confidence,
      weightDetails: {
        factual: factualWeight,
        notFactual: notFactualWeight,
        neutral: neutralWeight,
      },
    };
  };

  const runFactCheck = async () => {
    if (!cleanedText) {
      setError("Please extract text from an image first");
      return;
    }

    setFactChecking(true);
    setError(null);

    try {
      const summarized = await summarizeText(cleanedText);
      if (!summarized) {
        throw new Error("Failed to summarize the text");
      }
      setSummary(summarized);

      const sourcesContentPromises = TRUSTED_SOURCES.map((source) =>
        fetchSourceContent(source.url)
      );
      const sourcesContent = await Promise.all(sourcesContentPromises);
      const validSources = sourcesContent.filter((s) => s !== null);
      setSources(validSources);

      if (validSources.length === 0) {
        throw new Error("Could not fetch content from any sources");
      }

      const result = await factCheck(summarized, validSources);
      setFactCheckResult(result);
    } catch (error) {
      console.error("Error in fact checking process:", error);
      setError(error.message || "Failed to complete fact checking");
    } finally {
      setFactChecking(false);
    }
  };

  return (
    <div className="fact-checker-container">
      <h1 className="page-title fade-in">TalaCheck</h1>

      <div className="upload-card slide-up">
        <div className="section">
          <h2 className="section-title">
            Upload Image (This is still a prototype)
          </h2>
          <div className="action-row">
            <label className="button-primary" htmlFor="image-upload">
              Select Image
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden-input"
            />
            <button
              onClick={processImage}
              disabled={!image || loading}
              className={
                !image || loading ? "button-disabled" : "button-primary"
              }
            >
              {loading ? "Processing..." : "Extract Text"}
            </button>
          </div>

          {preview && (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="image-preview" />
            </div>
          )}

          {loading && (
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="progress-text">Processing: {progress}%</p>
            </div>
          )}
        </div>

        {cleanedText && (
          <div className="section fade-in">
            <h2 className="section-title">Extracted Text</h2>
            <div className="text-display">
              <p>{cleanedText}</p>
            </div>
            <button
              onClick={runFactCheck}
              disabled={factChecking}
              className={factChecking ? "button-disabled" : "button-primary"}
            >
              {factChecking ? "Checking Facts..." : "Verify Facts"}
            </button>
          </div>
        )}

        {summary && (
          <div className="section fade-in">
            <h2 className="section-title">Summary</h2>
            <div className="text-display">
              <p>{summary}</p>
            </div>
          </div>
        )}

        {factCheckResult && (
          <div className="section result-section fade-in">
            <h2 className="section-title">Fact Check Result</h2>
            <div className={`verdict-banner ${factCheckResult.verdict}`}>
              <span className="verdict-text">
                {factCheckResult.verdict === "factual"
                  ? "Factual"
                  : factCheckResult.verdict === "not factual"
                  ? "Unverified"
                  : "Uncertain"}
              </span>
              <span className="confidence">
                {factCheckResult.verdict === "factual"
                  ? `Confidence:  ${Math.round(
                      factCheckResult.confidence * 100
                    )}%`
                  : "Unable to verify"}
              </span>
            </div>

            <div className="sources-list">
              <h3 className="subsection-title">Sources Checked</h3>
              {factCheckResult.sources
                .filter(
                  (source) =>
                    source.verdict === "factual" ||
                    source.verdict === "not factual"
                )
                .map((source, index) => (
                  <div key={index} className={`source-item ${source.verdict}`}>
                    <h4 className="source-title">{source.title}</h4>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link"
                    >
                      {new URL(source.url).hostname}
                    </a>
                    <div className="source-verdict">
                      {source.isRelevant
                        ? `Verdict: ${
                            source.verdict === "factual"
                              ? "Supports"
                              : "Contradicts"
                          }`
                        : "Not relevant to claim"}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {error && (
          <div className="error-message slide-up">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
