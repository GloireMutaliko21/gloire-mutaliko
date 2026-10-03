import "server-only";
import { db, must } from "./supabase/server";
import { fromRow, toRow } from "./rows";
import type { VersionedEntity } from "./types";

type Action = "create" | "update" | "delete" | "restore";

export const ENTITY_TABLES: Record<VersionedEntity, string> = {
  profile: "profile",
  skill: "skills",
  experience: "experiences",
  project: "projects",
};

/** Keeps the newest N versions per item so the table stays small. */
const MAX_VERSIONS_PER_ITEM = 50;

/** Stores the item as the app sees it (camelCase), so a snapshot reads like the form. */
export async function recordRevision(
  entity: VersionedEntity,
  entityId: string,
  action: Action,
  row: Record<string, unknown>,
  label = "",
  restoredFrom: number | null = null,
) {
  const last = must(
    await db()
      .from("revisions")
      .select("version")
      .eq("entity", entity)
      .eq("entity_id", entityId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),
  );
  const version = (last?.version ?? 0) + 1;
  must(
    await db().from("revisions").insert({
      entity,
      entity_id: entityId,
      version,
      action,
      label,
      restored_from: restoredFrom,
      snapshot: fromRow(row),
    }),
  );
  if (version > MAX_VERSIONS_PER_ITEM) {
    must(
      await db()
        .from("revisions")
        .delete()
        .eq("entity", entity)
        .eq("entity_id", entityId)
        .lte("version", version - MAX_VERSIONS_PER_ITEM),
    );
  }
  return version;
}

/**
 * Writes a revision's snapshot back as the live row. Works for deleted items
 * too: the row is recreated with its original id.
 */
export async function restoreRevision(revisionId: string) {
  const revision = must(await db().from("revisions").select("*").eq("id", revisionId).maybeSingle());
  if (!revision) throw new Error("Version introuvable");

  const entity = revision.entity as VersionedEntity;
  const snapshot = { ...(revision.snapshot as Record<string, unknown>) };
  delete snapshot.createdAt;
  delete snapshot.updatedAt;

  const restored = must(
    await db()
      .from(ENTITY_TABLES[entity])
      .upsert({ ...toRow(snapshot), id: revision.entity_id })
      .select()
      .single(),
  );
  await recordRevision(entity, revision.entity_id, "restore", restored, revision.label, revision.version);
  return { entity, entityId: revision.entity_id as string };
}
