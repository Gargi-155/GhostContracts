
import re


RISK_RULES = [
    {
        "category": "Automatic Renewal",
        "severity": "Medium",
        "patterns": [
            r"\bautomatically renew\w*\b",
            r"\bautomatic(?:ally)? renewal\b",
            r"\brenewal term\b",
            r"\bsuccessive terms\b",
        ],
        "explanation": (
            "This clause may renew the agreement automatically. "
            "Review the renewal period, notice requirements, "
            "and available cancellation rights."
        ),
    },
    {
        "category": "Termination",
        "severity": "High",
        "patterns": [
            r"\bnon-cancellable\b",
            r"\bnon-cancelable\b",
            r"\btermination fee\b",
            r"\bterminate only for cause\b",
            r"\bwithout the right to terminate\b",
            r"\bno right to terminate\b",
            r"\bearly termination penalty\b",
            r"\bpayable upon termination\b",
        ],
        "explanation": (
            "This clause may restrict termination rights "
            "or impose charges or obligations when the "
            "agreement ends. Review the notice period, "
            "permitted grounds, and financial consequences."
        ),
    },
    {
        "category": "Indemnity",
        "severity": "High",
        "patterns": [
            r"\bindemnif\w*\b",
            r"\bhold harmless\b",
            r"\bdefend and indemnify\b",
        ],
        "explanation": (
            "This clause may require one party to cover certain "
            "losses, claims, or liabilities. Review the scope "
            "of covered claims, responsible parties, and "
            "any applicable exceptions."
        ),
    },
    {
        "category": "Limitation of Liability",
        "severity": "High",
        "patterns": [
            r"\bunlimited liability\b",
            r"\bliability cap\b",
            r"\blimitation of liability\b",
            r"\bliability\b.{0,100}\bshall not exceed\b",
            r"\bconsequential damages\b",
            r"\bindirect damages\b",
            r"\bexclude.*liability\b",
        ],
        "explanation": (
            "This clause addresses the extent or limits of "
            "a party's liability. Review applicable liability "
            "caps, excluded damages, and exceptions."
        ),
    },
    {
        "category": "Unilateral Changes",
        "severity": "Medium",
        "patterns": [
            r"\bsole discretion\b",
            r"\bmodify these terms\b",
            r"\bchange these terms\b",
            r"\bwithout prior notice\b",
            r"\bat any time without notice\b",
        ],
        "explanation": (
            "This clause may allow one party to change terms "
            "or exercise discretion. Review any notice, consent, "
            "or termination rights."
        ),
    },
    {
        "category": "Payment Penalties",
        "severity": "Medium",
        "patterns": [
            r"\blate payment fee\b",
            r"\blate payment penalty\b",
            r"\bnon-refundable\b",
            r"\bnonrefundable\b",
            r"\binterest on overdue\b",
            r"\boverdue payment\b",
            r"\bpayment shall bear interest\b",
        ],
        "explanation": (
            "This clause may impose payment penalties, "
            "restrict refunds, or establish additional "
            "payment obligations. Review the applicable "
            "rates, deadlines, and refund conditions."
        ),
    },
]


def split_into_clauses(text: str) -> list[str]:
    normalized_text = re.sub(r"\r\n?", "\n", text).strip()

    if not normalized_text:
        return []

    clauses = re.split(
        r"(?m)(?=^\s*(?:"
        r"\d+(?:\.\d+)*[.)]?\s+"
        r"|(?:CLAUSE|SECTION|ARTICLE)\s+"
        r"\d+\b"
        r"))",
        normalized_text,
        flags=re.IGNORECASE,
    )

    result = []

    for clause in clauses:
        cleaned_clause = re.sub(
            r"\s+",
            " ",
            clause,
        ).strip()

        if cleaned_clause:
            result.append(cleaned_clause)

    return result


def extract_clause_number(clause: str, fallback: int) -> str:
    match = re.match(
        r"^\s*(\d+(?:\.\d+)*)(?:[.)])?\s+",
        clause,
    )

    if match:
        return match.group(1)

    return str(fallback)


def is_explicitly_negated(category: str, clause: str) -> bool:
    text = clause.lower()

    negation_rules = {
        "Automatic Renewal": [
            r"\bno automatic(?:ally)? renewal\b",
            r"\bno automatic renewal\b",
            r"\bno successive terms?\b",
            r"\bwill not automatically renew\b",
            r"\bshall not automatically renew\b",
            r"\bdoes not automatically renew\b",
            r"\bwithout automatic renewal\b",
        ],

        "Payment Penalties": [
            r"\bno\s+(?:late payment fee|late payment penalty)\b",
            r"\bno\s+.*?\b(?:late payment fee|late payment penalty)\b",
            r"\bno\s+.*?\binterest on overdue\b",
            r"\bno\s+.*?\bnon-refundable\b",
            r"\bno\s+.*?\bnonrefundable\b",
            r"\bno\s+.*?\boverdue payment\b",
            r"\bno\s+.*?\bpayment shall bear interest\b",
            r"\bno\s+.*?\bpenalt(?:y|ies)\b",
            r"\bno late fees?\b",
            r"\bno interest is imposed\b",
            r"\bno penalty is imposed\b",
            r"\bno fees? (?:are|is) imposed\b",
            r"\bdoes not impose\b",
            r"\bshall not impose\b",
            r"\bwill not impose\b",
            r"\bno additional charges?\b",
        ],

        "Termination": [
            r"\bno\s+.*?\btermination fee\b",
            r"\bno\s+.*?\bearly termination penalty\b",
            r"\bno\s+.*?\bpayment in lieu of notice\b",
            r"\bno termination fee\b",
            r"\bno early termination penalty\b",
            r"\bno right to terminate\b",
            r"\bwithout a termination fee\b",
            r"\bwithout an early termination penalty\b",
            r"\bno payment in lieu of notice\b",
            r"\bnot required to pay\b",
            r"\bno termination charge\b",
        ],

        "Unilateral Changes": [
            r"\bneither party\b.{0,150}\bsole discretion\b",
            r"\bneither party\b.{0,150}\bunilaterally\b",
            r"\bneither party may\b.{0,150}\bchange\b",
            r"\bneither party can\b.{0,150}\bchange\b",
            r"\bonly through\b.{0,100}\bboth parties\b",
            r"\bonly with\b.{0,100}\bmutual\b",
            r"\bwithout\b.{0,100}\bprior written consent\b",
        ],

        "Limitation of Liability": [
            r"\bdoes not establish\b.{0,150}\bliability cap\b",
            r"\bdoes not establish\b.{0,150}\bcap\b",
            r"\bdoes not\b.{0,150}\bliability shall not exceed\b",
            r"\bdoes not\b.{0,150}\bexclude\b.{0,100}\bdamages\b",
            r"\bdoes not exclude\b.{0,100}\b(?:consequential|indirect) damages\b",
            r"\bdoes not limit\b.{0,100}\bliability\b",
            r"\bno liability cap\b",
            r"\bno limitation of liability\b",
            r"\bdoes not impose\b.{0,100}\bliability cap\b",
        ],
    }

    patterns = negation_rules.get(category, [])

    return any(
        re.search(pattern, text, flags=re.IGNORECASE)
        for pattern in patterns
    )


def analyze_contract(text: str) -> dict:
    if not isinstance(text, str) or not text.strip():
        return {
            "status": "success",
            "total_findings": 0,
            "findings": [],
        }

    clauses = split_into_clauses(text)

    findings = []
    seen_findings = set()

    for clause_index, clause in enumerate(clauses):
        for rule in RISK_RULES:
            category = rule["category"]

            if is_explicitly_negated(category, clause):
                continue

            matched_phrases = []

            for pattern in rule["patterns"]:
                matches = re.finditer(
                    pattern,
                    clause,
                    flags=re.IGNORECASE,
                )

                for match in matches:
                    matched_phrases.append(match.group(0))

            if not matched_phrases:
                continue

            if category == "Unilateral Changes":
                change_action = re.search(
                    r"\b(amend\w*|modif\w*|chang\w*|revis\w*|alter\w*)\b",
                    clause,
                    flags=re.IGNORECASE,
                )

                unilateral_authority = re.search(
                    r"\b(sole discretion|without consent|"
                    r"without prior notice|without notice)\b",
                    clause,
                    flags=re.IGNORECASE,
                )

                if not (
                    change_action
                    and unilateral_authority
                ):
                    continue

            unique_phrases = list(
                dict.fromkeys(
                    phrase.lower()
                    for phrase in matched_phrases
                )
            )

            finding_key = (
                category,
                clause.lower(),
            )

            if finding_key in seen_findings:
                continue

            seen_findings.add(finding_key)

            findings.append({
                "category": category,
                "severity": rule["severity"],
                "matched_phrases": unique_phrases,
                "clause": clause,
                "clause_number": extract_clause_number(
                    clause,
                    clause_index + 1,
                ),
                "explanation": rule["explanation"],
            })

    return {
        "status": "success",
        "total_findings": len(findings),
        "findings": findings,
    }