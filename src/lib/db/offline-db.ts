'use client';

import { Dexie, type EntityTable } from 'dexie';

import { appError, type AppError } from '@/lib/core/result';
import type {
  Patient,
  Referral,
  SyncableEntity,
  SyncJournalEntry,
  TriageRecord,
} from '@/lib/db/types';

export const DB_NAME = 'DiagnoVerseWorkerDB';
export const DB_SCHEMA_VERSION = 1;

/**
 * Index design notes:
 *  - `[sync_status+next_attempt_at]` is the hot path for the sync engine: it
 *    lets us fetch only pending rows that are past their backoff window
 *    without a full table scan (matters at 10k+ rows on a low-end handset).
 *  - `abha_id` is indexed for duplicate detection during intake.
 *  - `*symptoms` is a multi-entry index enabling symptom-based recall offline.
 */
const SCHEMA_V1 = {
  patients:
    'id, name, abha_id, phone, gender, dob, created_at, sync_status, [sync_status+next_attempt_at]',
  triage_records:
    'id, patient_id, risk_level, timestamp, sync_status, *symptoms, [sync_status+next_attempt_at], [patient_id+timestamp]',
  referrals:
    'id, patient_id, target_facility, urgency, status, timestamp, sync_status, [sync_status+next_attempt_at], [patient_id+timestamp]',
  sync_journal: '++seq, entity, entity_id, action, occurred_at, [entity+entity_id]',
} as const;

export class OfflineWorkerDB extends Dexie {
  declare patients: EntityTable<Patient, 'id'>;
  declare triage_records: EntityTable<TriageRecord, 'id'>;
  declare referrals: EntityTable<Referral, 'id'>;
  declare sync_journal: EntityTable<SyncJournalEntry, 'seq'>;

  public constructor() {
    super(DB_NAME, { autoOpen: true });
    this.version(DB_SCHEMA_VERSION).stores(SCHEMA_V1);
  }
}

export function isIndexedDbAvailable(): boolean {
  return typeof globalThis !== 'undefined' && typeof globalThis.indexedDB !== 'undefined';
}

export function storageUnavailableError(): AppError {
  return appError(
    'STORAGE_UNAVAILABLE',
    'IndexedDB is unavailable (server render, private-mode restriction, or blocked storage).',
  );
}

let instance: OfflineWorkerDB | null = null;

/**
 * Lazy singleton. Throws instead of returning a half-usable handle, so callers
 * are forced to deal with the "no storage" case explicitly.
 */
export function getOfflineDb(): OfflineWorkerDB {
  if (!isIndexedDbAvailable()) {
    throw new Error(storageUnavailableError().message);
  }
  instance ??= new OfflineWorkerDB();
  return instance;
}

export function tryGetOfflineDb(): OfflineWorkerDB | null {
  return isIndexedDbAvailable() ? getOfflineDb() : null;
}

export const SYNCABLE_TABLES: readonly SyncableEntity[] = [
  'patients',
  'triage_records',
  'referrals',
] as const;

/** Count of rows awaiting upload, across every syncable table. */
export async function countPending(db: OfflineWorkerDB = getOfflineDb()): Promise<number> {
  const counts = await Promise.all(
    SYNCABLE_TABLES.map((table) => db[table].where('sync_status').equals('pending').count()),
  );
  return counts.reduce((total, current) => total + current, 0);
}

export async function appendJournal(
  db: OfflineWorkerDB,
  entry: Omit<SyncJournalEntry, 'seq'>,
): Promise<void> {
  await db.sync_journal.add(entry);
}
