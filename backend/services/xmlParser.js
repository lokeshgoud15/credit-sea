import { parseStringPromise } from "xml2js";
import logger from "../logger.js";

function safeGet(obj, path) {
  if (!obj) return undefined;
  const parts = Array.isArray(path)
    ? path
    : path.split(/[\.\/]/).filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p] ?? cur[p.toLowerCase()] ?? cur[p.toUpperCase()];
  }
  return cur;
}

function firstDefined(obj, keys) {
  for (const k of keys) {
    const v = safeGet(obj, k);
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function combineIfParts(obj, firstKeys, lastKeys) {
  const first = firstDefined(obj, firstKeys);
  const last = firstDefined(obj, lastKeys);
  if (first && last) return `${first} ${last}`.trim();
  return first || last || undefined;
}


export async function parseExperianXml(xmlBuffer) {
  const xml = xmlBuffer.toString("utf8");
  let raw;
  try {
    raw = await parseStringPromise(xml, {
      explicitArray: false,
      mergeAttrs: true,
      trim: true,
    });
  } catch (err) {
    logger.error("XML parsing failed", { err: err.message });
    throw new Error("Invalid XML");
  }

  const rootCandidates = [
    safeGet(raw, "Report"),
    safeGet(raw, "ExperianReport"),
    safeGet(raw, "Current_Application"),
    safeGet(raw, "CurrentApplication"),
    safeGet(raw, "Current_Application_Details"),
    safeGet(raw, "Current_Applicant_Details"),
    raw,
  ];
  const root = rootCandidates.find((r) => r && typeof r === "object") || raw;

 
  let normalizedRoot = root;
  if (
    normalizedRoot &&
    typeof normalizedRoot === "object" &&
    !Array.isArray(normalizedRoot)
  ) {
    const keys = Object.keys(normalizedRoot);
    if (keys.length === 1 && typeof normalizedRoot[keys[0]] === "object") {
      normalizedRoot = normalizedRoot[keys[0]];
    }
  }
  const useRoot = normalizedRoot;

 
  const personCandidates = [
    useRoot.Person,
    useRoot.Current_Applicant_Details,
    useRoot.CurrentApplicantDetails,
    useRoot.Current_Application?.Current_Applicant_Details,
    useRoot.Current_Application?.CurrentApplicantDetails,
    useRoot.Applicant,
    useRoot.BasicDetails,
    useRoot.Subject,
    useRoot,
  ];
  const person = personCandidates.find((p) => p && typeof p === "object") || {};

  const name =
    combineIfParts(
      person,
      ["First_Name", "FirstName", "GivenName"],
      ["Last_Name", "LastName", "Surname"]
    ) ||
    firstDefined(person, ["Name", "FullName", "PersonName", "Full_Name"]) ||
    firstDefined(useRoot, ["Name", "FullName", "Person.Name"]);

  const mobilePhone =
    firstDefined(person, [
      "MobilePhoneNumber",
      "MobilePhone",
      "Mobile",
      "Telephone_Number_Applicant_1st",
      "Telephone",
      "Contact.Mobile",
    ]) ||
    firstDefined(useRoot, [
      "MobilePhoneNumber",
      "MobilePhone",
      "Mobile",
      "Telephone",
    ]);

  const pan =
    firstDefined(person, ["IncomeTaxPan", "PAN", "TaxId", "Identifier.PAN"]) ||
    firstDefined(useRoot, ["IncomeTaxPan", "PAN", "TaxId"]);

  const dob = firstDefined(person, [
    "Date_Of_Birth_Applicant",
    "DOB",
    "DateOfBirth",
    "Date_Of_Birth",
  ]);

  const creditScore = firstDefined(useRoot, [
    "CreditScore",
    "Score",
    "Scores.CreditScore",
  ]);

  const basic = {
    name: name ?? null,
    mobilePhone: mobilePhone ?? null,
    pan: pan ?? null,
    creditScore: creditScore ?? null,
    dob: dob ?? null,
  };

  const caisRoot =
    safeGet(useRoot, "CAIS_Account") ||
    safeGet(useRoot, "CAISAccount") ||
    safeGet(useRoot, "CAIS_Account");
  if (caisRoot) {
    const caisSummary =
      safeGet(caisRoot, "CAIS_Summary") ||
      safeGet(caisRoot, "CAIS_Summary.CAIS_Summary") ||
      {};
    const creditAccountNode = safeGet(caisSummary, "Credit_Account") || {};

    const summaryFromCais = {
      totalAccounts: toNumber(
        firstDefined(creditAccountNode, [
          "CreditAccountTotal",
          "CreditAccountActive",
        ]) ?? 0
      ),
      activeAccounts: toNumber(
        firstDefined(creditAccountNode, ["CreditAccountActive"]) ?? 0
      ),
      closedAccounts: toNumber(
        firstDefined(creditAccountNode, [
          "CreditAccountClosed",
          "CreditAccountDefault",
        ]) ?? 0
      ),
      currentBalanceAmount: toNumber(
        firstDefined(safeGet(caisSummary, "Total_Outstanding_Balance"), [
          "Outstanding_Balance_All",
        ]) ?? 0
      ),
      securedAccountsAmount: toNumber(
        firstDefined(safeGet(caisSummary, "Total_Outstanding_Balance"), [
          "Outstanding_Balance_Secured",
        ]) ?? 0
      ),
      unsecuredAccountsAmount: toNumber(
        firstDefined(safeGet(caisSummary, "Total_Outstanding_Balance"), [
          "Outstanding_Balance_UnSecured",
          "Outstanding_Balance_UnSecured",
        ]) ?? 0
      ),
      last7DaysEnquiries: toNumber(
        firstDefined(caisSummary, ["Last7DaysEnquiries"]) ?? 0
      ),
    };

    // CAIS accounts details: there may be multiple CAIS_Account_DETAILS nodes
    let caisDetails =
      safeGet(caisRoot, "CAIS_Account_DETAILS") ||
      safeGet(caisRoot, "CAIS_Account_DETAILS.CAIS_Account_DETAILS") ||
      [];
    if (
      caisDetails &&
      !Array.isArray(caisDetails) &&
      typeof caisDetails === "object"
    ) {
      // if single object, wrap into array
      caisDetails = [caisDetails];
    }

    const caisAccounts = (caisDetails || []).map((d) => {
      const subscriber =
        firstDefined(d, ["Subscriber_Name", "Subscriber_Name"]) || null;
      const accNum =
        firstDefined(d, [
          "Account_Number",
          "AccountNumber",
          "Account_Number",
        ]) || null;
      const currBal = toNumber(
        firstDefined(d, [
          "Current_Balance",
          "Current_Balance",
          "CurrentBalance",
        ]) ?? 0
      );
      const amountPastDue = toNumber(
        firstDefined(d, ["Amount_Past_Due", "AmountPastDue"]) ?? 0
      );
      const accType =
        firstDefined(d, ["Account_Type", "AccountType", "Portfolio_Type"]) ||
        null;
      // holder details may be nested
      const holder =
        firstDefined(d, ["CAIS_Holder_Details"]) ||
        firstDefined(d, ["CAIS_Holder_Details.CAIS_Holder_Details"]) ||
        d;
      const holderAddress =
        firstDefined(d, [
          "CAIS_Holder_Address_Details",
          "CAIS_Holder_Address_Details.CAIS_Holder_Address_Details",
        ]) || null;
      return {
        type: accType,
        institution: subscriber ? String(subscriber).trim() : null,
        accountNumber: accNum,
        address: holderAddress || null,
        amountOverdue: amountPastDue,
        currentBalance: currBal,
      };
    });

  
    let caisBasic = { ...basic };
    if (Array.isArray(caisDetails) && caisDetails.length > 0) {
      const firstDetail = caisDetails[0];
      const holder = firstDefined(firstDetail, ["CAIS_Holder_Details"]) || {};
      const surname =
        firstDefined(holder, [
          "Surname_Non_Normalized",
          "Surname",
          "Last_Name",
        ]) || null;
      const fname =
        firstDefined(holder, [
          "First_Name_Non_Normalized",
          "First_Name",
          "FirstName",
        ]) || null;
      const holderPan =
        firstDefined(firstDetail, [
          "CAIS_Holder_ID_Details.Income_TAX_PAN",
          "CAIS_Holder_Details.Income_TAX_PAN",
          "Income_TAX_PAN",
        ]) ||
        firstDefined(holder, ["Income_TAX_PAN", "Income_TAX_PAN"]) ||
        null;
      const holderDob =
        firstDefined(holder, [
          "Date_of_birth",
          "DateOfBirth",
          "Date_of_birth",
        ]) || null;
      const phone =
        firstDefined(firstDetail, [
          "CAIS_Holder_Phone_Details.Telephone_Number",
          "CAIS_Holder_Phone_Details.Telephone_Number",
          "Telephone_Number",
        ]) ||
        firstDefined(firstDetail, [
          "CAIS_Holder_Phone_Details.Telephone_Number",
        ]) ||
        null;
      const combinedName =
        fname && surname
          ? `${fname} ${surname}`
          : fname || surname || caisBasic.name;
      caisBasic = {
        name: combinedName || caisBasic.name,
        mobilePhone: phone || caisBasic.mobilePhone,
        pan: holderPan || caisBasic.pan,
        creditScore: creditScore || caisBasic.creditScore,
        dob: holderDob || caisBasic.dob,
      };
    }

    
    if (
      (!caisBasic.name || !caisBasic.mobilePhone || !caisBasic.pan) &&
      useRoot
    ) {
      const cad =
        safeGet(
          useRoot,
          "Current_Application.Current_Application_Details.Current_Applicant_Details"
        ) ||
        safeGet(useRoot, "Current_Application.Current_Applicant_Details") ||
        safeGet(
          useRoot,
          "Current_Application_Details.Current_Applicant_Details"
        ) ||
        safeGet(useRoot, "Current_Applicant_Details") ||
        null;
      if (cad) {
        const cfname = firstDefined(cad, ["First_Name", "FirstName"]);
        const csurname = firstDefined(cad, ["Last_Name", "LastName"]);
        const cmobile = firstDefined(cad, [
          "MobilePhoneNumber",
          "MobilePhone",
          "Mobile",
        ]);
        const cpan = firstDefined(cad, [
          "IncomeTaxPan",
          "Income_TAX_PAN",
          "PAN",
        ]);
        caisBasic.name =
          caisBasic.name ||
          (cfname && csurname
            ? `${cfname} ${csurname}`
            : cfname || csurname || caisBasic.name);
        caisBasic.mobilePhone =
          caisBasic.mobilePhone || cmobile || caisBasic.mobilePhone;
        caisBasic.pan = caisBasic.pan || cpan || caisBasic.pan;
        caisBasic.dob =
          caisBasic.dob ||
          firstDefined(cad, [
            "Date_Of_Birth_Applicant",
            "Date_of_birth",
            "DateOfBirth",
          ]) ||
          caisBasic.dob;
      }
    }

    // Score
    const scoreVal =
      firstDefined(useRoot, ["SCORE.BureauScore", "SCORE.BureauScore"]) ||
      firstDefined(useRoot, ["SCORE", "BureauScore"]) ||
      null;

    return {
      basic: caisBasic,
      summary: summaryFromCais,
      creditAccounts: caisAccounts.map((a) => ({ ...a })),
      rawRoot: useRoot,
      score: scoreVal,
    };
  }

  const rs =
    firstDefined(useRoot, ["ReportSummary", "Report_Summary", "Summary"]) || {};
  const summary = {
    totalAccounts: toNumber(
      firstDefined(rs, ["TotalAccounts", "Total_Accounts"]) ??
        firstDefined(useRoot, ["TotalAccounts", "Total_Accounts"]) ??
        0
    ),
    activeAccounts: toNumber(
      firstDefined(rs, ["ActiveAccounts", "OpenAccounts"]) ?? 0
    ),
    closedAccounts: toNumber(
      firstDefined(rs, ["ClosedAccounts", "Closed"]) ?? 0
    ),
    currentBalanceAmount: toNumber(
      firstDefined(rs, ["CurrentBalance", "Current_Balance"]) ??
        firstDefined(useRoot, ["CurrentBalance"]) ??
        0
    ),
    securedAccountsAmount: toNumber(
      firstDefined(rs, ["SecuredAmount", "Secured_Amount"]) ?? 0
    ),
    unsecuredAccountsAmount: toNumber(
      firstDefined(rs, ["UnsecuredAmount", "Unsecured_Amount"]) ?? 0
    ),
    last7DaysEnquiries: toNumber(
      firstDefined(rs, ["Last7DaysEnquiries", "Last7DaysEnquiries"]) ?? 0
    ),
  };

 
  let accountsNode =
    firstDefined(useRoot, ["Accounts", "CreditAccounts", "AccountList"]) ||
    firstDefined(useRoot, ["Accounts.Account", "Accounts.Accounts"]);
  if (!accountsNode) {
    accountsNode =
      safeGet(useRoot, "Accounts") ||
      safeGet(useRoot, "Current_Application.Accounts") ||
      safeGet(
        useRoot,
        "Current_Application.Current_Applicant_Details.Accounts"
      );
  }

  let accounts = [];
  if (Array.isArray(accountsNode)) accounts = accountsNode;
  else if (accountsNode?.Account)
    accounts = Array.isArray(accountsNode.Account)
      ? accountsNode.Account
      : [accountsNode.Account];
  else if (typeof accountsNode === "object") {
    Object.values(accountsNode).forEach((v) => {
      if (!v) return;
      if (Array.isArray(v)) accounts.push(...v);
      else if (typeof v === "object") accounts.push(v);
    });
  }


  if (accounts.length === 0) {
    try {
      const flat = JSON.stringify(root);
      if (flat.includes("AccountNumber") || flat.includes("CurrentBalance")) {
      }
    } catch (e) {
      
    }
  }

  const creditAccounts = accounts.map((acc) => {
    const type =
      firstDefined(acc, ["Type", "AccountType", "Product", "ProductType"]) ||
      null;
    const institution =
      firstDefined(acc, [
        "Bank",
        "Institution",
        "Lender",
        "Organization",
        "Issuer",
      ]) || null;
    const address = firstDefined(acc, ["Address", "Branch"]) || null;
    const accountNumber =
      firstDefined(acc, ["AccountNumber", "Number", "AccountNo"]) || null;
    const amountOverdue = toNumber(
      firstDefined(acc, ["AmountOverdue", "Overdue", "Arrears"]) ?? 0
    );
    const currentBalance = toNumber(
      firstDefined(acc, ["CurrentBalance", "Balance", "Outstanding"]) ?? 0
    );
    return {
      type,
      institution,
      address,
      accountNumber,
      amountOverdue,
      currentBalance,
    };
  });

  return { basic, summary, creditAccounts, rawRoot: useRoot };
}

function toNumber(v) {
  if (v == null || v === "") return 0;
  const n = Number(String(v).replace(/[ ,$₹]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
