
"use client";

import { useEffect, useRef, useState } from "react";
import mammoth from "mammoth";
import DOMPurify from "dompurify";

interface RiskFinding {
  category: string;
  severity: string;
  matched_phrases: string[];
  clause: string;
  clause_number: number;
  explanation: string;
}

interface AnalysisResponse {
  status: string;
  filename: string;
  file_type: string;
  character_count: number;
  truncated: boolean;
  extracted_text: string;
  total_findings: number;
  findings: RiskFinding[];
}

export default function ContractUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [docxHtml, setDocxHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [extractedText, setExtractedText] = useState("");

  useEffect(() => {
    if (!selectedFile || selectedFile.type !== "application/pdf") {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  useEffect(() => {
    let cancelled = false;

    async function renderDocx() {
      if (!selectedFile || !selectedFile.name.toLowerCase().endsWith(".docx")) {
        setDocxHtml("");
        setPreviewLoading(false);
        setPreviewError("");
        return;
      }

      setPreviewLoading(true);
      setPreviewError("");
      setDocxHtml("");

      try {
        const arrayBuffer = await selectedFile.arrayBuffer();

        const conversion = await mammoth.convertToHtml({
          arrayBuffer,
        });

        const sanitizedHtml = DOMPurify.sanitize(conversion.value);

        if (!cancelled) {
          setDocxHtml(sanitizedHtml);
        }
      } catch {
        if (!cancelled) {
          setPreviewError(
            "Unable to preview this document. Please check that it is a valid DOCX file."
          );
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    }

    renderDocx();

    return () => {
      cancelled = true;
    };
  }, [selectedFile]);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (
      !allowedTypes.includes(file.type) ||
      !["pdf", "docx"].includes(extension ?? "")
    ) {
      setError("Please select a valid PDF or DOCX file.");
      setSelectedFile(null);
      setResult(null);
      setExtractedText("");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be 10 MB or less.");
      setSelectedFile(null);
      setResult(null);
      setExtractedText("");
      event.target.value = "";
      return;
    }

    setError("");
    setResult(null);
    setExtractedText("");
    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select a contract first.");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);
    setExtractedText("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "http://127.0.0.1:8000/analyze-contract",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "The contract could not be analyzed."
        );
      }

      if (
        typeof data.filename !== "string" ||
        !Array.isArray(data.findings) ||
        typeof data.total_findings !== "number"
      ) {
        throw new Error(
          "The backend response is missing analysis fields. Restart the updated FastAPI server and try again."
        );
      }

      const analysisData: AnalysisResponse = {
        status: data.status ?? "success",
        filename: data.filename,
        file_type:
          typeof data.file_type === "string"
            ? data.file_type
            : selectedFile.name.split(".").pop()?.toLowerCase() ?? "unknown",
        character_count:
          typeof data.character_count === "number"
            ? data.character_count
            : typeof data.extracted_text === "string"
              ? data.extracted_text.length
              : 0,
        truncated: Boolean(data.truncated),
        extracted_text:
          typeof data.extracted_text === "string" ? data.extracted_text : "",
        total_findings: data.total_findings,
        findings: data.findings,
      };

      setResult(analysisData);
      setExtractedText(analysisData.extracted_text);
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message === "Failed to fetch"
            ? "Cannot connect to the backend. Make sure FastAPI is running."
            : err.message
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setUploading(false);
    }
  }

  function getSeverityClasses(severity: string) {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";

      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";

      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";

      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-4xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] md:p-10">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
        <div>
          <p className="font-serif text-xl font-semibold">
            Your contract workspace
          </p>

          <p className="mt-1 text-sm text-[var(--muted)]">
            A clearer way to review agreements.
          </p>
        </div>

        <span className="rounded-full bg-[#f1e7e5] px-3 py-1 text-xs font-medium text-[var(--primary)]">
          Preview
        </span>
      </div>

      <div className="mt-8 rounded-xl border-2 border-dashed border-[var(--border)] px-5 py-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1e7e5] text-2xl text-[var(--primary)]">
          ↑
        </div>

        <h2 className="mt-5 font-serif text-2xl font-semibold">
          Start with an agreement
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
          Select a contract to begin reviewing its clauses and identifying
          terms that may need your attention.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-6 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Choose a contract
        </button>

        {selectedFile && (
          <div className="mt-5">
            <p className="break-all text-sm font-medium text-[var(--foreground)]">
              Selected: {selectedFile.name}
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading
                ? "Analyzing contract..."
                : "Analyze contract"}
            </button>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-5 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}

        {result && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-[#c8d9cc] bg-[#f0f6f1] p-5 text-left"
          >
            <p className="font-semibold text-[var(--success)]">
              Contract analyzed successfully
            </p>

            <p className="mt-2 break-all text-sm text-[var(--foreground)]">
              {result.filename}
            </p>

            <p className="mt-1 text-sm text-[var(--muted)]">
              File type: {selectedFile?.name.split(".").pop()?.toUpperCase() ?? "UNKNOWN"}
            </p>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Extracted characters:{" "}
              {result.character_count.toLocaleString()}
            </p>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Preliminary flags found: {result.total_findings}
            </p>

            {result.truncated && (
              <p className="mt-3 text-sm text-[var(--primary)]">
                The extracted text was shortened to the current processing
                limit of 100,000 characters.
              </p>
            )}
          </div>
        )}

        <p className="mt-5 text-xs text-[var(--muted)]">
          PDF or DOCX · Maximum file size: 10 MB
        </p>
      </div>

      {previewUrl && (
        <div className="mt-8 overflow-hidden rounded-xl border border-[var(--border)] bg-white text-left">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div>
              <p className="font-medium text-[var(--foreground)]">
                Document preview
              </p>

              <p className="mt-1 text-xs text-[var(--muted)]">
                {selectedFile?.name}
              </p>
            </div>

            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[var(--primary)] hover:underline"
            >
              Open in new tab ↗
            </a>
          </div>

          <iframe
            src={previewUrl}
            title="PDF document preview"
            className="h-[650px] w-full"
          />
        </div>
      )}

      {selectedFile?.name.toLowerCase().endsWith(".docx") && (
        <div className="mt-8 overflow-hidden rounded-xl border border-[var(--border)] bg-white text-left">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <p className="font-medium text-[var(--foreground)]">
              Document preview
            </p>

            <p className="mt-1 break-all text-xs text-[var(--muted)]">
              {selectedFile.name}
            </p>
          </div>

          {previewLoading && (
            <p className="p-8 text-center text-sm text-[var(--muted)]">
              Preparing document preview...
            </p>
          )}

          {previewError && (
            <p role="alert" className="p-8 text-sm text-[var(--danger)]">
              {previewError}
            </p>
          )}

          {!previewLoading && !previewError && docxHtml && (
            <div
              className="prose max-w-none overflow-x-auto p-6 text-[var(--foreground)] md:p-10 [&_h1]:mb-4 [&_h1]:font-serif [&_h1]:text-3xl [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:font-serif [&_h2]:text-2xl [&_p]:mb-4 [&_p]:leading-7 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[var(--border)] [&_td]:p-2 [&_th]:border [&_th]:border-[var(--border)] [&_th]:bg-[var(--background)] [&_th]:p-2"
              dangerouslySetInnerHTML={{ __html: docxHtml }}
            />
          )}
        </div>
      )}

      {uploading && (
        <div className="mt-8 rounded-xl border border-[var(--border)] p-6">
          <p className="text-sm text-[var(--muted)]">
            Extracting contract text and checking clauses for potential risks...
          </p>
        </div>
      )}

      {result && result.findings.length > 0 && (
        <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 text-left md:p-8">
          <div className="mb-6 border-b border-[var(--border)] pb-5">
            <h3 className="font-serif text-2xl font-semibold">
              Potential Risk Findings
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              The following clauses matched Ghost Contracts' preliminary
              rule-based checks. Review the full context before drawing
              conclusions.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f1e7e5] px-3 py-1 text-xs font-medium text-[var(--primary)]">
                {result.total_findings}{" "}
                {result.total_findings === 1 ? "finding" : "findings"}
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {result.findings.map((finding, index) => (
              <article
                key={`${finding.category}-${finding.clause_number}-${index}`}
                className="rounded-xl border border-[var(--border)] p-5 md:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                      Clause {finding.clause_number}
                    </p>

                    <h4 className="mt-1 font-serif text-lg font-semibold text-[var(--foreground)]">
                      {finding.category}
                    </h4>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getSeverityClasses(
                      finding.severity
                    )}`}
                  >
                    {finding.severity} severity
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Flagged clause
                  </p>

                  <blockquote className="mt-2 border-l-4 border-[var(--primary)] bg-[var(--background)] p-4 text-sm leading-7 text-[var(--foreground)]">
                    {finding.clause}
                  </blockquote>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Matched phrases
                  </p>

                  <div className="flex flex-wrap gap-2">
  {finding.matched_phrases.map((phrase, phraseIndex) => (
    <span
      key={`${phrase}-${phraseIndex}`}
      className="rounded-md bg-[#f1e7e5] px-3 py-1.5 text-xs font-medium text-[var(--primary)]"
    >
      {phrase}
    </span>
  ))}
</div>
                </div>

                <div className="mt-5 rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Why this was flagged
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                    {finding.explanation}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {result && result.findings.length === 0 && (
        <section className="mt-8 rounded-xl border border-[var(--border)] bg-white p-6 text-left">
          <h3 className="font-serif text-xl font-semibold">
            No matching risk patterns found
          </h3>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Ghost Contracts did not find clauses matching its current
            rule-based checks. This does not guarantee that the contract
            contains no risks.
          </p>
        </section>
      )}

      {extractedText && (
        <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 text-left md:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="font-serif text-xl font-semibold">
                Extracted Contract Text
              </h3>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Text extracted by Ghost Contracts
              </p>
            </div>

            <span className="rounded-full bg-[#f1e7e5] px-3 py-1 text-xs font-medium text-[var(--primary)]">
              {extractedText.length.toLocaleString()} characters
            </span>
          </div>

          <div className="max-h-[500px] overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-[var(--background)] p-5 text-sm leading-7 text-[var(--foreground)]">
            {extractedText}
          </div>
        </section>
      )}

      <p className="mt-6 text-center text-xs leading-5 text-[var(--muted)]">
        Ghost Contracts provides preliminary automated flags for informational
        purposes only. It does not provide legal advice or replace review
        by a qualified legal professional.
      </p>
    </div>
  );
}