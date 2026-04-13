const OPENALEX_BASE_URL = "https://api.openalex.org/works";
const CROSSREF_BASE_URL = "https://api.crossref.org/works";
const EUROPE_PMC_BASE_URL = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";
const EMAIL_CONTACT = "research-desk@example.com";
const MINIMUM_ENTRIES = 5;
const MIN_SUPPORTED_ITEMS_PER_ENTRY = 3;
const MAX_SUPPORTED_ITEMS_PER_ENTRY = 7;

const form = document.querySelector("#research-form");
const queryInput = document.querySelector("#query-input");
const limitInput = document.querySelector("#limit-input");
const runButton = document.querySelector("#run-button");
const resetButton = document.querySelector("#reset-button");
const statusLine = document.querySelector("#status-line");
const coreStatusNote = document.querySelector("#core-status-note");
const sourceCount = document.querySelector("#source-count");
const entryCount = document.querySelector("#entry-count");
const yearMode = document.querySelector("#year-mode");
const resultsList = document.querySelector("#results-list");
const potentialSourcesList = document.querySelector("#potential-sources-list");
const outputBox = document.querySelector("#output-box");
const copyButton = document.querySelector("#copy-button");
const citationsBox = document.querySelector("#citations-box");
const copyCitationsButton = document.querySelector("#copy-citations-button");
const apaButton = document.querySelector("#apa-button");
const mlaButton = document.querySelector("#mla-button");
const chicagoButton = document.querySelector("#chicago-button");
const sampleButtons = [...document.querySelectorAll("[data-sample-query]")];
const resultTemplate = document.querySelector("#result-template");

const state = {
  entries: [],
  potentialSources: [],
  query: "",
  usedFallbackYears: false,
  citationStyle: ""
};

const ENTRY_KIND = {
  STATISTIC: "statistic",
  SUMMARY: "summary"
};

const ABBREVIATION_MAP = {
  // General research and statistics
  AA: "Alcoholics Anonymous (AA)",
  AI: "artificial intelligence (AI)",
  ANOVA: "analysis of variance (ANOVA)",
  AOR: "adjusted odds ratio (AOR)",
  AUC: "area under the curve (AUC)",
  CI: "confidence interval (CI)",
  HR: "hazard ratio (HR)",
  IRR: "incidence rate ratio (IRR)",
  OR: "odds ratio (OR)",
  RCT: "randomized controlled trial (RCT)",
  RR: "risk ratio (RR)",
  SD: "standard deviation (SD)",
  SEM: "standard error of the mean (SEM)",
  SPSS: "Statistical Package for the Social Sciences (SPSS)",

  // Mental health and behavioral health
  ACT: "assertive community treatment (ACT)",
  ADHD: "attention-deficit/hyperactivity disorder (ADHD)",
  ASD: "autism spectrum disorder (ASD)",
  BD: "bipolar disorder (BD)",
  BDI: "Beck Depression Inventory (BDI)",
  BPD: "borderline personality disorder (BPD)",
  CBT: "cognitive behavioral therapy (CBT)",
  CMHC: "community mental health center (CMHC)",
  DBT: "dialectical behavior therapy (DBT)",
  DSM: "Diagnostic and Statistical Manual of Mental Disorders (DSM)",
  EAP: "Employee Assistance Program (EAP)",
  ECT: "electroconvulsive therapy (ECT)",
  EMDR: "eye movement desensitization and reprocessing (EMDR)",
  GAD: "generalized anxiety disorder (GAD)",
  IOP: "intensive outpatient program (IOP)",
  MDD: "major depressive disorder (MDD)",
  NIMH: "National Institute of Mental Health (NIMH)",
  OCD: "obsessive-compulsive disorder (OCD)",
  PHP: "partial hospitalization program (PHP)",
  PMHNP: "psychiatric-mental health nurse practitioner (PMHNP)",
  PTSD: "post-traumatic stress disorder (PTSD)",
  RTC: "residential treatment center (RTC)",
  SI: "suicidal ideation (SI)",
  SNRI: "serotonin-norepinephrine reuptake inhibitor (SNRI)",
  SSRI: "selective serotonin reuptake inhibitor (SSRI)",
  TBI: "traumatic brain injury (TBI)",

  // Addiction and substance use
  AOD: "alcohol and other drugs (AOD)",
  AUD: "alcohol use disorder (AUD)",
  DAST: "Drug Abuse Screening Test (DAST)",
  DUI: "driving under the influence (DUI)",
  ETOH: "alcohol (ETOH)",
  LSD: "lysergic acid diethylamide (LSD)",
  MAT: "medication-assisted treatment (MAT)",
  MDMA: "3,4-methylenedioxymethamphetamine (MDMA)",
  NA: "Narcotics Anonymous (NA)",
  SUD: "substance use disorder (SUD)",
  THC: "tetrahydrocannabinol (THC)",

  // Clinical, medical, and documentation
  ADR: "adverse drug reaction (ADR)",
  ADL: "activities of daily living (ADL)",
  ADLs: "activities of daily living (ADLs)",
  AIDS: "acquired immunodeficiency syndrome (AIDS)",
  AMA: "against medical advice (AMA)",
  APRN: "advanced practice registered nurse (APRN)",
  AST: "aspartate aminotransferase (AST)",
  BID: "twice daily (BID)",
  BMI: "body mass index (BMI)",
  BP: "blood pressure (BP)",
  BUN: "blood urea nitrogen (BUN)",
  CABG: "coronary artery bypass graft (CABG)",
  CAD: "coronary artery disease (CAD)",
  CBC: "complete blood count (CBC)",
  CHF: "congestive heart failure (CHF)",
  CNS: "central nervous system (CNS)",
  COPD: "chronic obstructive pulmonary disease (COPD)",
  CPR: "cardiopulmonary resuscitation (CPR)",
  CPAP: "continuous positive airway pressure (CPAP)",
  COVID: "coronavirus disease 2019 (COVID-19)",
  "COVID-19": "coronavirus disease 2019 (COVID-19)",
  CSF: "cerebrospinal fluid (CSF)",
  CT: "computed tomography (CT)",
  CVA: "cerebrovascular accident (CVA)",
  CXR: "chest X-ray (CXR)",
  DNR: "do not resuscitate (DNR)",
  Dx: "diagnosis (Dx)",
  ECG: "electrocardiogram (ECG)",
  EEG: "electroencephalogram (EEG)",
  EKG: "electrocardiogram (EKG)",
  EMG: "electromyogram (EMG)",
  EMR: "electronic medical record (EMR)",
  ENT: "ear, nose, and throat (ENT)",
  ER: "emergency room (ER)",
  ESR: "erythrocyte sedimentation rate (ESR)",
  FDA: "Food and Drug Administration (FDA)",
  GI: "gastrointestinal (GI)",
  HbA1c: "hemoglobin A1c (HbA1c)",
  HDL: "high-density lipoprotein (HDL)",
  HIPAA: "Health Insurance Portability and Accountability Act (HIPAA)",
  HIV: "human immunodeficiency virus (HIV)",
  HRT: "hormone replacement therapy (HRT)",
  ICU: "intensive care unit (ICU)",
  ID: "identification (ID)",
  ITP: "immune thrombocytopenia (ITP)",
  IV: "intravenous (IV)",
  LDL: "low-density lipoprotein (LDL)",
  MAOI: "monoamine oxidase inhibitor (MAOI)",
  MCV: "mean corpuscular volume (MCV)",
  MRI: "magnetic resonance imaging (MRI)",
  MS: "multiple sclerosis (MS)",
  NSAID: "nonsteroidal anti-inflammatory drug (NSAID)",
  OTC: "over the counter (OTC)",
  PRN: "as needed (PRN)",
  qd: "every day (qd)",
  qhs: "every night at bedtime (qhs)",
  qid: "four times daily (qid)",
  TID: "three times daily (TID)",
  TSH: "thyroid-stimulating hormone (TSH)",
  UTI: "urinary tract infection (UTI)",
  WBC: "white blood cell count (WBC)",
  WNL: "within normal limits (WNL)",

  // Biology and laboratory science
  ATP: "adenosine triphosphate (ATP)",
  DNA: "deoxyribonucleic acid (DNA)",
  FET: "fluoroethyltyrosine (FET)",
  PCR: "polymerase chain reaction (PCR)",
  RNA: "ribonucleic acid (RNA)",

  // Imaging and neurotechnology
  fMRI: "functional magnetic resonance imaging (fMRI)",

  // Public health, institutions, and government
  ADA: "Americans with Disabilities Act (ADA)",
  CDC: "Centers for Disease Control and Prevention (CDC)",
  DHEC: "Department of Health and Environmental Control (DHEC)",
  DOE: "Department of Energy (DOE)",
  DOJ: "Department of Justice (DOJ)",
  DOT: "Department of Transportation (DOT)",
  EPA: "Environmental Protection Agency (EPA)",
  GDP: "gross domestic product (GDP)",
  MPH: "Master of Public Health (MPH)",
  NASA: "National Aeronautics and Space Administration (NASA)",
  NCBI: "National Center for Biotechnology Information (NCBI)",
  NIH: "National Institutes of Health (NIH)",
  OED: "Oxford English Dictionary (OED)",
  OECD: "Organisation for Economic Co-operation and Development (OECD)",
  VA: "Department of Veterans Affairs (VA)",
  WHO: "World Health Organization (WHO)"
};

const decodeAbstract = (abstractIndex) => {
  if (!abstractIndex) {
    return "";
  }

  const orderedWords = Object.entries(abstractIndex)
    .flatMap(([word, positions]) => positions.map((position) => [position, word]))
    .sort((left, right) => left[0] - right[0])
    .map(([, word]) => word);

  return orderedWords.join(" ");
};

const getAbstractText = (work) => {
  if (work.abstract_text) {
    return work.abstract_text;
  }

  if (work.abstract_inverted_index) {
    return decodeAbstract(work.abstract_inverted_index);
  }

  return "";
};

const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();

const stripTrailingPunctuation = (value) => value.replace(/[.\s]+$/g, "").trim();

const ensureSentence = (value) => {
  const trimmed = stripTrailingPunctuation(normalizeWhitespace(value));
  return trimmed ? `${trimmed}.` : "";
};

const stripHtmlTags = (value) => value.replace(/<[^>]*>/g, " ");

const removeSectionLead = (value) =>
  value.replace(
    /^(abstract|background|introduction|objective|objectives|methods?|results?|conclusion|conclusions|findings?)\s*:\s*/i,
    ""
  );

const decodeHtmlEntities = (value) =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const cleanAbstractText = (value) =>
  normalizeWhitespace(stripHtmlTags(removeSectionLead(decodeHtmlEntities(value || ""))));

const expandAbbreviations = (text) => {
  let expanded = text;
  const seen = new Set();

  Object.entries(ABBREVIATION_MAP).forEach(([abbreviation, fullText]) => {
    const pattern = new RegExp(`\\b${abbreviation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
    expanded = expanded.replace(pattern, (match) => {
      const key = match.toLowerCase();
      const alreadyExpandedPattern = new RegExp(
        `${fullText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "i"
      );

      if (alreadyExpandedPattern.test(expanded)) {
        return match;
      }

      if (seen.has(key)) {
        return match;
      }

      seen.add(key);
      return fullText;
    });
  });

  return expanded
    .replace(
      /\b([A-Za-z][A-Za-z\s-]+)\s+\(\1\s+\(([A-Za-z0-9-]+)\)\)/g,
      "$1 ($2)"
    )
    .replace(
      /\b([A-Za-z][A-Za-z\s-]+)\s+\(([A-Za-z][A-Za-z\s-]+)\s+\(([A-Za-z0-9-]+)\)\)/g,
      (_, outer, inner, abbr) => {
        if (outer.trim().toLowerCase() === inner.trim().toLowerCase()) {
          return `${outer} (${abbr})`;
        }

        return `${outer} (${inner} (${abbr}))`;
      }
    );
};

const splitSentences = (text) =>
  normalizeWhitespace(text)
    .split(/(?<=[.!?;])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const BOILERPLATE_PATTERN =
  /\b(this work was supported by|supported by|funded by|financial support|grant support|conflict of interest|competing interest|author contribution|data availability|ethics approval|institutional review board|trial registration)\b/i;

const isBoilerplateEvidence = (sentence) => BOILERPLATE_PATTERN.test(sentence);

const EXACT_STATISTIC_PATTERN =
  /(\b\d+(\.\d+)?\s*(%|percent|percentage|times|x|fold|points|point|years|year|days|day|hours|hour|minutes|minute|seconds|second|kg|g|mg|mmhg|bpm|km|miles|usd|dollars|euros)\b)|(\bp\s*[<=>]\s*0?\.\d+\b)|(\b(OR|RR|HR|IRR|AOR|aOR|beta|cohen'?s d)\s*[=:]?\s*\d+(\.\d+)?\b)|(\b\d+(\.\d+)?\s*-\s*\d+(\.\d+)?\s*(%|percent|points|years|days|hours|minutes|seconds)?\b)/i;

const SAMPLE_SIZE_PATTERN =
  /\b(n|N)\s*=\s*(\d+)\b|\b(\d[\d,]*)\s+(participants|patients|respondents|subjects|adults|children|students|households|observations|records|cases|articles|studies)\b/i;

const containsExactStatistic = (sentence) => EXACT_STATISTIC_PATTERN.test(sentence);

const parseSignificantSampleSize = (sentence) => {
  const match = sentence.match(SAMPLE_SIZE_PATTERN);

  if (!match) {
    return null;
  }

  const rawValue = match[2] || match[3];
  const numericValue = Number(rawValue.replaceAll(",", ""));

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return numericValue;
};

const canUseSampleSizeAsSupportedItem = (sentence) => parseSignificantSampleSize(sentence) !== null;

const cleanSupportedItem = (sentence) =>
  expandAbbreviations(
    normalizeWhitespace(stripHtmlTags(removeSectionLead(sentence)))
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
  );

const buildQueryTokens = (query) =>
  query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);

const countQueryTokenMatches = (text, queryTokens) => {
  const lowerText = text.toLowerCase();
  return queryTokens.reduce(
    (count, token) => count + (lowerText.includes(token) ? 1 : 0),
    0
  );
};

const scoreSentence = (sentence, queryTokens) => {
  const lowerSentence = sentence.toLowerCase();
  let score = containsExactStatistic(sentence) ? 8 : 0;

  if (!score && canUseSampleSizeAsSupportedItem(sentence)) {
    score = 5;
  }

  queryTokens.forEach((token) => {
    if (lowerSentence.includes(token)) {
      score += 2;
    }
  });

  return score;
};

const scoreSummarySentence = (sentence, queryTokens) => {
  const matchCount = countQueryTokenMatches(sentence, queryTokens);
  return matchCount * 3 + (sentence.length > 80 ? 1 : 0);
};

const DATASET_STRENGTH_PATTERNS = [
  { pattern: /\bmeta-analysis\b/i, score: 12 },
  { pattern: /\bsystematic review\b/i, score: 10 },
  { pattern: /\bpopulation-based\b/i, score: 9 },
  { pattern: /\bnationwide\b/i, score: 8 },
  { pattern: /\bmulticenter\b/i, score: 8 },
  { pattern: /\blongitudinal\b/i, score: 7 },
  { pattern: /\bcohort\b/i, score: 7 },
  { pattern: /\bregistry\b/i, score: 6 },
  { pattern: /\badministrative data\b/i, score: 6 },
  { pattern: /\bdataset\b/i, score: 5 },
  { pattern: /\bpanel data\b/i, score: 5 },
  { pattern: /\bpanel study\b/i, score: 5 },
  { pattern: /\bpooled analysis\b/i, score: 5 }
];

const scoreDatasetStrength = (work, query) => {
  const queryTokens = buildQueryTokens(query);
  const abstractText = getAbstractText(work);
  const combinedText = `${work.display_name ?? ""} ${abstractText}`;
  const lowerCombinedText = combinedText.toLowerCase();
  const relevantConceptMatches = getRelevantConcepts(work, query).length;
  const citationScore = Math.min(work.cited_by_count ?? 0, 200) / 10;
  const recencyScore = Math.max(0, (work.publication_year ?? 0) - 2019);
  const queryMatchScore = queryTokens.reduce(
    (score, token) => score + (lowerCombinedText.includes(token) ? 3 : 0),
    0
  );
  const datasetSignalScore = DATASET_STRENGTH_PATTERNS.reduce(
    (score, item) => score + (item.pattern.test(combinedText) ? item.score : 0),
    0
  );

  return citationScore + recencyScore + queryMatchScore + datasetSignalScore + relevantConceptMatches * 4;
};

const pickSupportedItems = (abstractText, query) => {
  const queryTokens = buildQueryTokens(query);
  const ranked = splitSentences(abstractText)
    .map((sentence) => ({
      sentence: cleanSupportedItem(sentence),
      score: scoreSentence(sentence, queryTokens)
    }))
    .filter((item) => item.score > 0 && !isBoilerplateEvidence(item.sentence))
    .sort((left, right) => right.score - left.score);

  const exactItems = [
    ...new Set(
      ranked
        .filter(
          (item) =>
            containsExactStatistic(item.sentence) || canUseSampleSizeAsSupportedItem(item.sentence)
        )
        .map((item) => item.sentence)
    )
  ];

  return exactItems.slice(0, MAX_SUPPORTED_ITEMS_PER_ENTRY);
};

const pickSummaryItem = (abstractText, query) => {
  const queryTokens = buildQueryTokens(query);
  const ranked = splitSentences(abstractText)
    .map((sentence) => ({
      sentence: cleanSupportedItem(sentence),
      score: scoreSummarySentence(sentence, queryTokens),
      matches: countQueryTokenMatches(sentence, queryTokens)
    }))
    .filter((item) => !isBoilerplateEvidence(item.sentence))
    .filter((item) => item.matches >= Math.min(2, Math.max(1, queryTokens.length)))
    .filter((item) => !containsExactStatistic(item.sentence))
    .sort((left, right) => right.score - left.score);

  return ranked[0]?.sentence ?? "";
};

const pickSummaryItems = (abstractText, query, limit = MAX_SUPPORTED_ITEMS_PER_ENTRY) => {
  const queryTokens = buildQueryTokens(query);
  const ranked = splitSentences(abstractText)
    .map((sentence) => ({
      sentence: cleanSupportedItem(sentence),
      score: scoreSummarySentence(sentence, queryTokens),
      matches: countQueryTokenMatches(sentence, queryTokens)
    }))
    .filter((item) => !isBoilerplateEvidence(item.sentence))
    .filter((item) => item.matches >= Math.min(2, Math.max(1, queryTokens.length)))
    .filter((item) => !containsExactStatistic(item.sentence))
    .sort((left, right) => right.score - left.score);

  return [...new Set(ranked.slice(0, limit).map((item) => item.sentence))];
};

const pickOverviewSentence = (abstractText, query) => {
  const queryTokens = buildQueryTokens(query);
  const ranked = splitSentences(abstractText)
    .map((sentence) => ({
      sentence: cleanSupportedItem(sentence),
      score: scoreSummarySentence(sentence, queryTokens) + (containsExactStatistic(sentence) ? 0 : 2),
      matches: countQueryTokenMatches(sentence, queryTokens)
    }))
    .filter((item) => !isBoilerplateEvidence(item.sentence))
    .filter((item) => item.matches >= Math.min(2, Math.max(1, queryTokens.length)))
    .sort((left, right) => right.score - left.score);

  return ranked[0]?.sentence ?? "";
};

const ensureMinimumSupportedItems = (abstractText, query, items) => {
  if (items.length >= MIN_SUPPORTED_ITEMS_PER_ENTRY) {
    return items.slice(0, MAX_SUPPORTED_ITEMS_PER_ENTRY);
  }

  const fillerItems = pickSummaryItems(abstractText, query, MAX_SUPPORTED_ITEMS_PER_ENTRY)
    .filter((item) => !items.includes(item));

  return [...items, ...fillerItems].slice(0, MAX_SUPPORTED_ITEMS_PER_ENTRY);
};

const getSourceUrl = (work) =>
  work.primary_location?.landing_page_url ||
  work.best_oa_location?.landing_page_url ||
  work.doi ||
  work.ids?.doi ||
  work.id;

const getPublicationDate = (work) => work.publication_date || String(work.publication_year || "");

const getWorkTopic = (work) => {
  const primaryTopic = work.primary_topic?.display_name;

  if (primaryTopic) {
    return primaryTopic;
  }

  const title = work.display_name || "the topic";
  return title
    .replace(/^(the|a|an)\s+/i, "")
    .replace(/[:\-|].*$/, "")
    .trim();
};

const toReadableList = (items) => {
  if (!items.length) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
};

const getUniqueWorks = (entries) => {
  const seen = new Set();
  return entries
    .map((entry) => entry.work)
    .filter((work) => {
      if (!work?.id || seen.has(work.id)) {
        return false;
      }

      seen.add(work.id);
      return true;
    });
};

const getAuthorNames = (work) =>
  (work.authorships ?? [])
    .map((authorship) => authorship.author?.display_name)
    .filter(Boolean);

const splitAuthorName = (name) => {
  const parts = name.trim().split(/\s+/);
  const lastName = parts.pop() ?? "";
  return {
    firstNames: parts,
    lastName
  };
};

const formatInitials = (names) =>
  names
    .map((name) => `${name.charAt(0).toUpperCase()}.`)
    .join(" ");

const formatApaAuthors = (authors) => {
  if (!authors.length) {
    return "";
  }

  const formatted = authors.slice(0, 20).map((author) => {
    const { firstNames, lastName } = splitAuthorName(author);
    return `${lastName}, ${formatInitials(firstNames)}`.trim();
  });

  if (formatted.length === 1) {
    return formatted[0];
  }

  if (formatted.length === 2) {
    return `${formatted[0]}, & ${formatted[1]}`;
  }

  return `${formatted.slice(0, -1).join(", ")}, & ${formatted.at(-1)}`;
};

const formatMlaAuthor = (author) => {
  const { firstNames, lastName } = splitAuthorName(author);
  return `${lastName}, ${firstNames.join(" ")}`.trim();
};

const formatMlaAuthors = (authors) => {
  if (!authors.length) {
    return "";
  }

  if (authors.length === 1) {
    return formatMlaAuthor(authors[0]);
  }

  return `${formatMlaAuthor(authors[0])}, et al.`;
};

const formatChicagoAuthors = (authors) => {
  if (!authors.length) {
    return "";
  }

  if (authors.length === 1) {
    const { firstNames, lastName } = splitAuthorName(authors[0]);
    return `${lastName}, ${firstNames.join(" ")}`.trim();
  }

  const first = splitAuthorName(authors[0]);
  const rest = authors.slice(1).map((author) => {
    const { firstNames, lastName } = splitAuthorName(author);
    return `${firstNames.join(" ")} ${lastName}`.trim();
  });

  return `${first.lastName}, ${first.firstNames.join(" ")}, and ${rest.join(", ")}`.trim();
};

const formatAccessUrl = (work) => getSourceUrl(work);

const buildApaCitation = (work) => {
  const authors = formatApaAuthors(getAuthorNames(work));
  const year = work.publication_year ? `(${work.publication_year}).` : "";
  const source = work.primary_location?.source?.display_name;
  const title = work.display_name ? `${work.display_name}.` : "";
  const sourceText = source ? `${source}.` : "";
  return [authors, year, title, sourceText, formatAccessUrl(work)]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const buildMlaCitation = (work) => {
  const authors = formatMlaAuthors(getAuthorNames(work));
  const title = work.display_name ? `"${work.display_name}."` : "";
  const source = work.primary_location?.source?.display_name;
  const year = work.publication_year ? `${work.publication_year},` : "";
  return [authors, title, source ? `${source},` : "", year, formatAccessUrl(work)]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const buildChicagoCitation = (work) => {
  const authors = formatChicagoAuthors(getAuthorNames(work));
  const year = work.publication_year ? `${work.publication_year}.` : "";
  const title = work.display_name ? `"${work.display_name}."` : "";
  const source = work.primary_location?.source?.display_name ? `${work.primary_location.source.display_name}.` : "";
  return [authors, year, title, source, formatAccessUrl(work)]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const buildCitations = (style, entries) => {
  const works = getUniqueWorks(entries);

  if (!works.length) {
    return "";
  }

  const formatter =
    style === "apa"
      ? buildApaCitation
      : style === "mla"
        ? buildMlaCitation
        : buildChicagoCitation;

  return works.map((work) => formatter(work)).join("\n\n");
};

const buildPotentialSourceNote = (work, query) => {
  const topic = getWorkTopic(work);
  const concepts = getRelevantConcepts(work, query);
  const focusText =
    concepts.length && !concepts.some((concept) => concept.toLowerCase() === topic.toLowerCase())
      ? `${topic}, especially ${toReadableList(concepts)}`
      : topic;

  return `Relevant to ${query} through ${focusText}, but the abstract does not provide enough usable supported items for a structured entry.`;
};

const buildDoiUrl = (doi) => {
  if (!doi) {
    return "";
  }

  return doi.startsWith("http") ? doi : `https://doi.org/${doi}`;
};

const toAuthorships = (authors) =>
  authors.map((name) => ({
    author: {
      display_name: name
    }
  }));

const buildPublicationDate = (parts) => {
  if (!parts?.length) {
    return "";
  }

  const [year, month = 1, day = 1] = parts;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const normalizeOpenAlexWork = (work) => ({
  ...work,
  abstract_text: getAbstractText(work),
  source_hint: "OpenAlex"
});

const normalizeCrossrefWork = (item) => {
  const title = item.title?.[0] || "Untitled record";
  const doiUrl = buildDoiUrl(item.DOI);
  const dateParts =
    item["published-print"]?.["date-parts"]?.[0] ||
    item["published-online"]?.["date-parts"]?.[0] ||
    item.issued?.["date-parts"]?.[0] ||
    item.created?.["date-parts"]?.[0] ||
    [];
  const publicationDate = buildPublicationDate(dateParts);
  const authorNames = (item.author ?? [])
    .map((author) => [author.given, author.family].filter(Boolean).join(" ").trim())
    .filter(Boolean);
  const subjects = item.subject ?? [];

  return {
    id: `crossref:${item.DOI || title}`,
    display_name: title,
    abstract_text: cleanAbstractText(item.abstract || ""),
    publication_year: dateParts[0] || null,
    publication_date: publicationDate,
    primary_location: {
      landing_page_url: doiUrl || item.URL || "",
      source: {
        display_name: item["container-title"]?.[0] || item.publisher || "Crossref"
      }
    },
    best_oa_location: {
      landing_page_url: doiUrl || item.URL || ""
    },
    doi: doiUrl,
    ids: {
      doi: doiUrl
    },
    cited_by_count: item["is-referenced-by-count"] || 0,
    concepts: subjects.map((subject) => ({ display_name: subject })),
    primary_topic: subjects[0] ? { display_name: subjects[0] } : null,
    authorships: toAuthorships(authorNames),
    type_crossref: item.type || "journal-article",
    source_hint: "Crossref"
  };
};

const normalizeEuropePmcWork = (item) => {
  const doiUrl = buildDoiUrl(item.doi);
  const authorNames = (item.authorString || "")
    .split(/,\s*/)
    .map((name) => name.trim())
    .filter(Boolean);
  const keywords = (item.keywordList?.keyword || item.meshHeadingList?.meshHeading || [])
    .map((keyword) => (typeof keyword === "string" ? keyword : keyword?.descriptorName))
    .filter(Boolean);

  return {
    id: `epmc:${item.id || item.doi || item.title}`,
    display_name: item.title || "Untitled record",
    abstract_text: cleanAbstractText(item.abstractText || ""),
    publication_year: item.pubYear ? Number(item.pubYear) : null,
    publication_date: item.firstPublicationDate || String(item.pubYear || ""),
    primary_location: {
      landing_page_url: doiUrl || item.fullTextUrlList?.fullTextUrl?.[0]?.url || "",
      source: {
        display_name: item.journalTitle || item.source || "Europe PMC"
      }
    },
    best_oa_location: {
      landing_page_url: doiUrl || item.fullTextUrlList?.fullTextUrl?.[0]?.url || ""
    },
    doi: doiUrl,
    ids: {
      doi: doiUrl
    },
    cited_by_count: Number(item.citedByCount || 0),
    concepts: keywords.map((keyword) => ({ display_name: keyword })),
    primary_topic: keywords[0] ? { display_name: keywords[0] } : null,
    authorships: toAuthorships(authorNames),
    type_crossref: item.pubType || "journal-article",
    source_hint: "Europe PMC"
  };
};

const normalizeCoreWork = (item) => {
  const doiUrl = buildDoiUrl(item.doi);
  const authorNames = (item.authors ?? [])
    .map((author) => (typeof author === "string" ? author : author?.name))
    .filter(Boolean);
  const topics = item.topics ?? [];

  return {
    id: `core:${item.id || item.doi || item.title}`,
    display_name: item.title || "Untitled record",
    abstract_text: cleanAbstractText(item.abstract || ""),
    publication_year: item.year ? Number(item.year) : null,
    publication_date: String(item.year || ""),
    primary_location: {
      landing_page_url: doiUrl || item.downloadUrl || item.url || "",
      source: {
        display_name: item.publisher || "CORE"
      }
    },
    best_oa_location: {
      landing_page_url: doiUrl || item.downloadUrl || item.url || ""
    },
    doi: doiUrl,
    ids: {
      doi: doiUrl
    },
    cited_by_count: Number(item.citationCount || 0),
    concepts: topics.map((topic) => ({ display_name: topic })),
    primary_topic: topics[0] ? { display_name: topics[0] } : null,
    authorships: toAuthorships(authorNames),
    type_crossref: item.documentType || "journal-article",
    source_hint: "CORE"
  };
};

const dedupeWorks = (works) => {
  const seen = new Set();

  return works.filter((work) => {
    const key = (work.doi || work.ids?.doi || work.display_name || work.id || "")
      .toLowerCase()
      .trim();

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const getRelevantConcepts = (work, query) => {
  const queryTokens = buildQueryTokens(query);
  const concepts = (work.concepts ?? [])
    .map((concept) => concept.display_name)
    .filter(Boolean)
    .filter((concept) =>
      queryTokens.some((token) => concept.toLowerCase().includes(token))
    )
    .slice(0, 3);

  if (concepts.length) {
    return concepts;
  }

  const topic = getWorkTopic(work);
  return topic ? [topic] : [];
};

const getSourceDescriptor = (work) => {
  const type = work.type_crossref || work.type || "research source";
  return type.replaceAll("-", " ");
};

const buildEvidenceSummary = (item) =>
  stripTrailingPunctuation(
    normalizeWhitespace(stripHtmlTags(removeSectionLead(item)))
      .replace(/^["']|["']$/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );

const toSentenceLead = (text) => {
  const trimmed = stripTrailingPunctuation(text);

  if (!trimmed) {
    return "";
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const paraphraseEvidence = (text) => {
  const cleaned = buildEvidenceSummary(text)
    .replace(/\bresults?\s+the study\b/gi, "the study")
    .replace(/\bresults?\s+this study\b/gi, "this study")
    .replace(/\bresults?\s+the paper\b/gi, "the paper")
    .replace(/\bresults?\s+indicate that\b/gi, "the findings indicate that")
    .replace(/\bresults?\s+show that\b/gi, "the findings show that")
    .replace(/\bwe found that\b/gi, "the study found that")
    .replace(/\bour findings show that\b/gi, "the findings suggest that")
    .replace(/\bthis study found that\b/gi, "the study found that")
    .replace(/\bthe results showed that\b/gi, "the findings suggest that")
    .replace(/\bresults showed that\b/gi, "the findings suggest that")
    .replace(/\bresults suggest that\b/gi, "the findings suggest that")
    .replace(/\bthe results suggest that\b/gi, "the findings suggest that")
    .replace(/\bthis paper shows that\b/gi, "the paper indicates that")
    .replace(/\bwe show that\b/gi, "the analysis indicates that")
    .replace(/\bwe observed that\b/gi, "the study observed that")
    .replace(/\bthis article\b/gi, "the study")
    .replace(/\bthis paper\b/gi, "the paper")
    .replace(/\bthis research\b/gi, "the research")
    .replace(/\bthese results\b/gi, "these findings");

  return cleaned;
};

const rewriteForCitation = (text) =>
  paraphraseEvidence(text)
    .replace(/\bwas associated with\b/gi, "was linked to")
    .replace(/\bwere associated with\b/gi, "were linked to")
    .replace(/\bis associated with\b/gi, "is linked to")
    .replace(/\bare associated with\b/gi, "are linked to")
    .replace(/\bwas significantly associated with\b/gi, "was strongly linked to")
    .replace(/\bwere significantly associated with\b/gi, "were strongly linked to")
    .replace(/\bresulted in\b/gi, "was tied to")
    .replace(/\bresult in\b/gi, "lead to")
    .replace(/\bincreased\b/gi, "raised")
    .replace(/\bdecreased\b/gi, "reduced")
    .replace(/\bhigher odds of\b/gi, "greater odds of")
    .replace(/\blower odds of\b/gi, "reduced odds of")
    .replace(/\bhigher risk of\b/gi, "greater risk of")
    .replace(/\blower risk of\b/gi, "reduced risk of")
    .replace(/\bhigher rates of\b/gi, "elevated rates of")
    .replace(/\blower rates of\b/gi, "reduced rates of")
    .replace(/\bthe study found that\b/gi, "")
    .replace(/\bthe findings suggest that\b/gi, "")
    .replace(/\bthe findings indicate that\b/gi, "")
    .replace(/\bthe findings show that\b/gi, "")
    .replace(/\bthe analysis indicates that\b/gi, "")
    .replace(/\bthe paper indicates that\b/gi, "")
    .replace(/\bthe study observed that\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^that\s+/i, "");

const extractStatisticDetails = (text) => {
  const cleaned = cleanSupportedItem(text);

  const percentageMatch = cleaned.match(/\b\d+(\.\d+)?\s*(%|percent|percentage)\b/i);
  const intervalMatch = cleaned.match(/\b95%\s+confidence interval\s*\(CI\)\s*[:=]?\s*([\d.]+\s*[-to]+\s*[\d.]+|[\d.]+\s*-\s*[\d.]+)/i);
  const ratioMatch = cleaned.match(
    /\b(adjusted odds ratio|odds ratio|hazard ratio|risk ratio|incidence rate ratio|effect size|beta)\s*(\([A-Za-z]+\))?\s*[=:]?\s*([\d.]+)/i
  );
  const plainNumberMatch = cleaned.match(/\b\d+(\.\d+)?\b/);

  if (ratioMatch) {
    return {
      kind: "ratio",
      label: ratioMatch[1].toLowerCase(),
      value: ratioMatch[3],
      interval: intervalMatch?.[1] ?? ""
    };
  }

  if (percentageMatch) {
    return {
      kind: "percentage",
      value: percentageMatch[0]
    };
  }

  if (intervalMatch) {
    return {
      kind: "interval",
      value: intervalMatch[1]
    };
  }

  if (plainNumberMatch) {
    return {
      kind: "number",
      value: plainNumberMatch[0]
    };
  }

  return {
    kind: "text",
    value: stripTrailingPunctuation(rewriteForCitation(cleaned))
  };
};

const buildArticleSummary = (work, query, overviewText) => {
  const venue = work.primary_location?.source?.display_name;
  const date = getPublicationDate(work);
  const topic = getWorkTopic(work);
  const concepts = getRelevantConcepts(work, query);
  const overviewSummary = paraphraseEvidence(overviewText);
  const focusText =
    concepts.length && !concepts.some((concept) => concept.toLowerCase() === topic.toLowerCase())
      ? `${topic}, especially ${toReadableList(concepts)}`
      : topic;
  const contributionText = ensureSentence(toSentenceLead(overviewSummary));
  const focusSentence = ensureSentence(`The article focuses on ${focusText}`);
  const venueText = venue
    ? ensureSentence(`Published in ${venue} in ${date}`)
    : ensureSentence(`Published in ${date}`);

  return [ensureSentence(contributionText), focusSentence, venueText].filter(Boolean).join(" ");
};

const formatStatisticLine = (item, work) => {
  const title = work.display_name;
  const date = getPublicationDate(work);
  const url = getSourceUrl(work);
  return `   - "${item}" — *${title}* (${date}) ${url}`;
};

const buildEntryText = (entry) => {
  const lines = [
    "Statistic Entry:",
    `1. Relevant summary: ${entry.summary}`,
    `2. ${entry.kind === ENTRY_KIND.STATISTIC ? "Statistics:" : "Summary:"}`,
    ...entry.supportedItems.map((item) => formatStatisticLine(item, entry.work))
  ];

  return lines.join("\n");
};

const renderEntries = () => {
  resultsList.innerHTML = "";
  potentialSourcesList.innerHTML = "";

  if (!state.entries.length) {
    const empty = document.createElement("article");
    empty.className = "empty-card";
    empty.textContent =
      "Run a query to compile sources, extract supported statements, and generate citation-ready output.";
    resultsList.append(empty);
    outputBox.value = "";
    citationsBox.value = "";
    copyButton.disabled = true;
    copyCitationsButton.disabled = true;
    apaButton.disabled = true;
    mlaButton.disabled = true;
    chicagoButton.disabled = true;
    sourceCount.textContent = "0";
    entryCount.textContent = "0";
    yearMode.textContent = "Awaiting search";
    const emptyPotential = document.createElement("article");
    emptyPotential.className = "empty-card";
    emptyPotential.textContent =
      "Relevant review-only sources will appear here when the app finds strong matches without enough usable abstract evidence.";
    potentialSourcesList.append(emptyPotential);
    return;
  }

  const entryTexts = state.entries.map(buildEntryText);
  outputBox.value = entryTexts.join("\n\n");
  citationsBox.value = state.citationStyle ? buildCitations(state.citationStyle, state.entries) : "";
  sourceCount.textContent = String(state.entries.length);
  entryCount.textContent = String(state.entries.length);
  yearMode.textContent = state.usedFallbackYears ? "Using 2020+ fallback" : "Using 2024+ sources";
  apaButton.disabled = false;
  mlaButton.disabled = false;
  chicagoButton.disabled = false;
  copyCitationsButton.disabled = !citationsBox.value;

  if (!state.potentialSources.length) {
    const emptyPotential = document.createElement("article");
    emptyPotential.className = "empty-card";
    emptyPotential.textContent = "No additional review-only sources were surfaced for this query.";
    potentialSourcesList.append(emptyPotential);
  } else {
    state.potentialSources.forEach((source) => {
      const article = document.createElement("article");
      article.className = "potential-source";

      const titleLink = document.createElement("a");
      titleLink.className = "potential-source-title";
      titleLink.href = getSourceUrl(source.work);
      titleLink.target = "_blank";
      titleLink.rel = "noreferrer noopener";
      titleLink.textContent = source.work.display_name;

      const meta = document.createElement("p");
      meta.className = "potential-source-meta";
      meta.textContent = `${getPublicationDate(source.work)} · ${source.work.primary_location?.source?.display_name || "Source unavailable"}`;

      const note = document.createElement("p");
      note.className = "potential-source-note";
      note.textContent = source.note;

      article.append(titleLink, meta, note);
      potentialSourcesList.append(article);
    });
  }

  state.entries.forEach((entry, index) => {
    const fragment = resultTemplate.content.cloneNode(true);
    fragment.querySelector(".result-index").textContent = `Entry ${index + 1}`;
    fragment.querySelector(".result-title").textContent = entry.work.display_name;
    fragment.querySelector(".result-title-link").href = getSourceUrl(entry.work);
    fragment.querySelector(".result-meta").textContent = `${getPublicationDate(entry.work)} · ${getSourceUrl(entry.work)}`;
    fragment.querySelector(".result-rationale").textContent = entry.summary;
    fragment.querySelector(".result-kind").textContent =
      entry.kind === ENTRY_KIND.STATISTIC ? "Exact statistics" : "Relevant summary";

    const list = fragment.querySelector(".result-stats");
    entry.supportedItems.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    });

    resultsList.append(fragment);
  });
};

const updateStatus = (message, isError = false) => {
  statusLine.textContent = message;
  statusLine.dataset.state = isError ? "error" : "default";
};

const loadBackendStatus = async () => {
  try {
    const response = await fetch("/api/status");

    if (!response.ok) {
      return;
    }

    const payload = await response.json();

    if (!payload.coreConfigured) {
      coreStatusNote.hidden = false;
      coreStatusNote.textContent =
        "CORE integration is not configured on this server. OpenAlex, Crossref, and Europe PMC are still active.";
    } else {
      coreStatusNote.hidden = true;
      coreStatusNote.textContent = "";
    }
  } catch {
    coreStatusNote.hidden = true;
    coreStatusNote.textContent = "";
  }
};

const buildApiUrl = (query, yearFloor, perPage) => {
  const url = new URL(OPENALEX_BASE_URL);
  url.searchParams.set("search", query);
  url.searchParams.set("per-page", String(perPage));
  url.searchParams.set("mailto", EMAIL_CONTACT);
  url.searchParams.set(
    "filter",
    [
      `from_publication_date:${yearFloor}-01-01`,
      "has_abstract:true",
      "is_retracted:false"
    ].join(",")
  );

  return url.toString();
};

const buildCrossrefUrl = (query, yearFloor, perPage) => {
  const url = new URL(CROSSREF_BASE_URL);
  url.searchParams.set("query.bibliographic", query);
  url.searchParams.set("rows", String(perPage));
  url.searchParams.set("mailto", EMAIL_CONTACT);
  url.searchParams.set("filter", `from-pub-date:${yearFloor}-01-01`);
  return url.toString();
};

const buildEuropePmcUrl = (query, yearFloor, perPage) => {
  const url = new URL(EUROPE_PMC_BASE_URL);
  url.searchParams.set("query", `${query} FIRST_PDATE:[${yearFloor}-01-01 TO *]`);
  url.searchParams.set("format", "json");
  url.searchParams.set("pageSize", String(perPage));
  url.searchParams.set("resultType", "core");
  return url.toString();
};

const buildCoreUrl = (query, yearFloor, perPage) => {
  const url = new URL("/api/core-search", window.location.origin);
  url.searchParams.set("q", query);
  url.searchParams.set("year_floor", String(yearFloor));
  url.searchParams.set("limit", String(perPage));
  return url.toString();
};

const fetchOpenAlexWorks = async (query, yearFloor, perPage) => {
  const response = await fetch(buildApiUrl(query, yearFloor, perPage));

  if (!response.ok) {
    throw new Error(`OpenAlex lookup failed with status ${response.status}.`);
  }

  const payload = await response.json();
  return (payload.results ?? []).map(normalizeOpenAlexWork);
};

const fetchCrossrefWorks = async (query, yearFloor, perPage) => {
  const response = await fetch(buildCrossrefUrl(query, yearFloor, perPage));

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  return (payload.message?.items ?? [])
    .map(normalizeCrossrefWork)
    .filter((work) => work.display_name && work.primary_location?.landing_page_url);
};

const fetchEuropePmcWorks = async (query, yearFloor, perPage) => {
  const response = await fetch(buildEuropePmcUrl(query, yearFloor, perPage));

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  return (payload.resultList?.result ?? [])
    .map(normalizeEuropePmcWork)
    .filter((work) => work.display_name && (work.abstract_text || work.primary_location?.landing_page_url));
};

const fetchCoreWorks = async (query, yearFloor, perPage) => {
  const response = await fetch(buildCoreUrl(query, yearFloor, perPage));

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  return (payload.results ?? [])
    .map(normalizeCoreWork)
    .filter((work) => work.display_name && (work.abstract_text || work.primary_location?.landing_page_url));
};

const fetchWorks = async (query, yearFloor, perPage) => {
  const sourcePageSize = Math.max(perPage, 12);
  const results = await Promise.allSettled([
    fetchOpenAlexWorks(query, yearFloor, sourcePageSize),
    fetchCrossrefWorks(query, yearFloor, sourcePageSize),
    fetchEuropePmcWorks(query, yearFloor, sourcePageSize),
    fetchCoreWorks(query, yearFloor, sourcePageSize)
  ]);

  const [openAlexWorks, crossrefWorks, europePmcWorks, coreWorks] = results.map((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  return dedupeWorks([...openAlexWorks, ...crossrefWorks, ...europePmcWorks, ...coreWorks]);
};

const rankWorksByDatasetStrength = (works, query) =>
  [...works].sort(
    (left, right) => scoreDatasetStrength(right, query) - scoreDatasetStrength(left, query)
  );

const buildEntriesFromWorks = (works, query, limit) => {
  const seenTitles = new Set();
  const statisticEntries = [];
  const summaryEntries = [];
  const potentialSources = [];
  const queryTokens = buildQueryTokens(query);

  rankWorksByDatasetStrength(works, query).forEach((work) => {
    const titleKey = work.display_name.toLowerCase();

    if (seenTitles.has(titleKey)) {
      return;
    }

    const abstractText = getAbstractText(work);
    const rawSupportedItems = pickSupportedItems(abstractText, query);
    const supportedItems = ensureMinimumSupportedItems(abstractText, query, rawSupportedItems);
    const overviewItem = pickOverviewSentence(abstractText, query) || supportedItems[0];

    if (supportedItems.length) {
      seenTitles.add(titleKey);
      statisticEntries.push({
        kind: ENTRY_KIND.STATISTIC,
        work,
        summary: buildArticleSummary(work, query, overviewItem),
        supportedItems
      });
      return;
    }

    const summaryItems = ensureMinimumSupportedItems(
      abstractText,
      query,
      pickSummaryItems(abstractText, query, MAX_SUPPORTED_ITEMS_PER_ENTRY)
    );
    const summaryItem = summaryItems[0];

    if (!summaryItem) {
      const abstractTextForPotential = getAbstractText(work);
      if (countQueryTokenMatches(abstractTextForPotential, queryTokens) > 0) {
        potentialSources.push({
          work,
          note: buildPotentialSourceNote(work, query)
        });
      }
      return;
    }

    seenTitles.add(titleKey);
    summaryEntries.push({
      kind: ENTRY_KIND.SUMMARY,
      work,
      summary: `${buildArticleSummary(work, query, summaryItem)} No exact outcome statistic was reported in the retrieved abstract.`,
      supportedItems: summaryItems
    });
  });

  return {
    entries: [...statisticEntries, ...summaryEntries].slice(0, limit),
    potentialSources: potentialSources.slice(0, 8)
  };
};

const runResearch = async (query, requestedLimit) => {
  updateStatus("Searching 2024+ academic sources...");
  runButton.disabled = true;
  copyButton.disabled = true;

  try {
    let works = await fetchWorks(query, 2024, Math.max(requestedLimit * 4, 24));
    let resultSet = buildEntriesFromWorks(works, query, requestedLimit);
    let usedFallbackYears = false;

    if (resultSet.entries.length < MINIMUM_ENTRIES) {
      updateStatus("Not enough 2024+ evidence found. Expanding to 2020+ sources...");
      works = await fetchWorks(query, 2020, Math.max(requestedLimit * 5, 30));
      resultSet = buildEntriesFromWorks(works, query, requestedLimit);
      usedFallbackYears = true;
    }

    state.entries = resultSet.entries;
    state.potentialSources = resultSet.potentialSources;
    state.query = query;
    state.usedFallbackYears = usedFallbackYears;
    renderEntries();

    if (!resultSet.entries.length) {
      updateStatus(
        "No relevant abstract evidence was extracted. Try a narrower query or sources more likely to report numeric findings in the abstract.",
        true
      );
      return;
    }

    updateStatus(
      usedFallbackYears
        ? `Compiled ${resultSet.entries.length} entries using 2020+ fallback evidence.`
        : `Compiled ${resultSet.entries.length} entries using 2024+ evidence.`
    );
    copyButton.disabled = false;
  } catch (error) {
    state.entries = [];
    state.potentialSources = [];
    state.citationStyle = "";
    renderEntries();
    updateStatus(error.message, true);
  } finally {
    runButton.disabled = false;
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const query = normalizeWhitespace(queryInput.value);
  const requestedLimit = Number(limitInput.value) || 6;

  if (!query) {
    updateStatus("Enter a search query before running research.", true);
    return;
  }

  runResearch(query, Math.max(5, Math.min(requestedLimit, 12)));
});

resetButton.addEventListener("click", () => {
  queryInput.value = "";
  limitInput.value = "6";
  state.entries = [];
  state.potentialSources = [];
  state.query = "";
  state.usedFallbackYears = false;
  state.citationStyle = "";
  copyButton.disabled = true;
  copyCitationsButton.disabled = true;
  updateStatus("Ready for a new query.");
  renderEntries();
});

copyButton.addEventListener("click", async () => {
  if (!outputBox.value) {
    return;
  }

  await navigator.clipboard.writeText(outputBox.value);
  updateStatus("Plain-text output copied.");
});

const generateCitations = (style) => {
  if (!state.entries.length) {
    return;
  }

  state.citationStyle = style;
  citationsBox.value = buildCitations(style, state.entries);
  copyCitationsButton.disabled = !citationsBox.value;
  updateStatus(`${style.toUpperCase()} citations generated.`);
};

copyCitationsButton.addEventListener("click", async () => {
  if (!citationsBox.value) {
    return;
  }

  await navigator.clipboard.writeText(citationsBox.value);
  updateStatus("Citations copied.");
});

apaButton.addEventListener("click", () => generateCitations("apa"));
mlaButton.addEventListener("click", () => generateCitations("mla"));
chicagoButton.addEventListener("click", () => generateCitations("chicago"));

sampleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    queryInput.value = button.dataset.sampleQuery;
    queryInput.focus();
  });
});

renderEntries();
loadBackendStatus();
