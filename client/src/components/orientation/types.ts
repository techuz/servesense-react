/* ============================================================================
   Shared types for PDF-fed orientation modules (SOW §3.1–§3.6).

   Every orientation module's mock data store gets a `sourcePdf` field that
   tracks which document the visible data was extracted from. The manager
   uploads a PDF per module; the portal renders the extracted content
   read-only.
   ============================================================================ */

export interface OrientationSource {
  /** Original PDF filename. */
  filename: string;
  /** ISO timestamp when the PDF was uploaded (and parsed). */
  uploadedAt: string;
  /** Total pages in the source PDF — surfaced in the banner. */
  pageCount: number;
}

export interface OrientationModuleMeta {
  /** Module label used in upload UI copy: "your <label> document". */
  label: string;
  /** Helper line above the drop zone. */
  hint: string;
  /** SOW reference shown in the banner eyebrow. */
  sowRef: string;
}
