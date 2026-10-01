import "server-only";
import { Types } from "mongoose";
import { connectDB, serialize } from "./db";
import { Revision, entityModels, type VersionedEntity } from "@/models";

type Action = "create" | "update" | "delete" | "restore";

/** Keeps the newest N versions per document so the collection stays small. */
const MAX_VERSIONS_PER_DOC = 50;

export async function recordRevision(
  entity: VersionedEntity,
  entityId: Types.ObjectId | string,
  action: Action,
  snapshot: unknown,
  label = "",
  restoredFrom: number | null = null,
) {
  await connectDB();
  const id = new Types.ObjectId(String(entityId));
  const last = await Revision.findOne({ entity, entityId: id }).sort({ version: -1 }).select("version").lean();
  const version = (last?.version ?? 0) + 1;
  await Revision.create({ entity, entityId: id, version, action, label, restoredFrom, snapshot: serialize(snapshot) });

  if (version > MAX_VERSIONS_PER_DOC) {
    await Revision.deleteMany({ entity, entityId: id, version: { $lte: version - MAX_VERSIONS_PER_DOC } });
  }
  return version;
}

/**
 * Writes a revision's snapshot back as the live document. Works for deleted
 * documents too: the document is recreated with its original id.
 */
export async function restoreRevision(revisionId: string) {
  await connectDB();
  const revision = await Revision.findById(revisionId).lean();
  if (!revision) throw new Error("Revision not found");

  const Model = entityModels[revision.entity as VersionedEntity] as unknown as typeof entityModels.project;
  const snapshot = { ...(revision.snapshot as Record<string, unknown>) };
  delete snapshot._id;
  delete snapshot.__v;
  delete snapshot.createdAt;
  delete snapshot.updatedAt;

  const restored = await Model.findOneAndReplace(
    { _id: revision.entityId },
    { ...snapshot, _id: revision.entityId },
    { upsert: true, returnDocument: "after", runValidators: true },
  ).lean();

  await recordRevision(
    revision.entity as VersionedEntity,
    revision.entityId,
    "restore",
    restored,
    revision.label,
    revision.version,
  );
  return { entity: revision.entity as VersionedEntity, entityId: String(revision.entityId) };
}
