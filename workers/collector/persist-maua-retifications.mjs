import { archiveMauaOfficialDocument } from "./archive-maua-document.mjs";
import { MAUA_CP_01_2025_RETIFICATIONS } from "./maua-cp-01-retifications.mjs";
import { collectAndPersistMaua } from "./run-maua-supabase.mjs";
import { createServerReviewPipeline } from "./review-pipeline.mjs";
import { createSupabaseRestClient } from "./supabase-persistence.mjs";

function first(rows, message) {
  const row = rows?.[0];
  if (!row) throw new Error(message);
  return row;
}

/**
 * Persiste somente as duas retificações oficiais já identificadas no portal de
 * Mauá. As versões entram como candidatas e jamais atualizam a versão pública
 * nem os fatos do cargo sem decisão de editor.
 */
export async function persistMauaCp01Retifications({
  client = createSupabaseRestClient(),
  fetchPage = fetch,
  now = () => new Date(),
  archiveOptions,
  collect = collectAndPersistMaua,
  archive = archiveMauaOfficialDocument,
} = {}) {
  const collection = await collect();
  const originSnapshotId = collection.saved?.snapshotId;
  if (!originSnapshotId) throw new Error("O snapshot oficial de Mauá é obrigatório antes de persistir retificações.");

  const source = await client.findOne("sources", { canonical_url: MAUA_CP_01_2025_RETIFICATIONS[0].sourceUrl }, { select: "id,canonical_url" });
  if (!source) throw new Error("O edital de abertura de Mauá deve ser persistido antes das retificações.");
  const notice = await client.findOne("notices", { source_id: source.id, external_reference: MAUA_CP_01_2025_RETIFICATIONS[0].noticeExternalReference }, { select: "id" });
  if (!notice) throw new Error("O edital de abertura de Mauá deve ser persistido antes das retificações.");

  const capturedAt = now().toISOString();
  const results = [];
  for (const record of MAUA_CP_01_2025_RETIFICATIONS) {
    const { verified, archived } = await archive(record.documentUrl, { fetchPage, archiveOptions });
    let version = await client.findOne("notice_versions", { notice_id: notice.id, content_hash: verified.contentHash }, { select: "id,notice_id,version_number,content_hash,origin_snapshot_id" });
    let versionCreated = false;
    if (!version) {
      const versions = await client.list("notice_versions", { filters: { notice_id: `eq.${notice.id}` }, select: "id,version_number,content_hash", order: "version_number.desc", limit: 20 });
      version = first(await client.insert("notice_versions", {
        notice_id: notice.id,
        version_number: (versions[0]?.version_number ?? 0) + 1,
        source_url: record.sourceUrl,
        document_url: verified.canonicalUrl,
        content_hash: verified.contentHash,
        captured_at: capturedAt,
        publication_date: record.publicationDate,
        editorial_status: "pending_review",
        change_summary: `${record.title}. O documento não altera automaticamente fatos do cargo de Odontologia.`,
        origin_snapshot_id: originSnapshotId,
        document_storage_bucket: archived.bucket,
        document_storage_path: archived.path,
        document_content_type: archived.contentType,
        document_byte_length: archived.byteLength,
      }), "Não foi possível criar a versão candidata da retificação.");
      versionCreated = true;
    }

    const existingEvidence = await client.list("evidence", { filters: { notice_version_id: `eq.${version.id}` }, select: "id,page_number,excerpt", limit: 20 });
    for (const item of record.evidence) {
      if (!existingEvidence.some((row) => row.page_number === item.page && row.excerpt === item.excerpt)) {
        await client.insert("evidence", {
          notice_version_id: version.id,
          source_url: verified.canonicalUrl,
          content_hash: verified.contentHash,
          page_number: item.page,
          excerpt: item.excerpt,
          captured_at: capturedAt,
          extraction_method: "pdf_text",
          editorial_status: "pending_review",
        });
      }
    }

    const comparableVersions = await client.list("notice_versions", { filters: { notice_id: `eq.${notice.id}` }, select: "id,version_number,content_hash", order: "version_number.desc", limit: 20 });
    const previous = comparableVersions.find((row) => row.id !== version.id) ?? null;
    const review = await createServerReviewPipeline({ client }).review({
      noticeId: notice.id,
      originSnapshotId,
      previousPublishedVersion: previous,
      candidateVersion: { id: version.id, contentHash: verified.contentHash, originSnapshotId },
      previousFacts: [],
      candidateFacts: [],
      comparisonReliable: true,
    });
    results.push({ externalReference: record.externalReference, versionId: version.id, versionCreated, evidenceCount: record.evidence.length, storagePath: archived.path, classification: review.outcome.classification, queueId: review.persisted.queueId });
  }
  return { originSnapshotId, noticeId: notice.id, retifications: results };
}
