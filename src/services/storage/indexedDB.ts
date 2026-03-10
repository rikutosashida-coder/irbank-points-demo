import Dexie, { Table } from 'dexie';
import { Note } from '../../features/notes/types/note.types';

// IndexedDBデータベースクラス
export class NotesDatabase extends Dexie {
  // Note: Table<Note> causes circular reference due to recursive Block.children type
  // Using Table without explicit type parameters to avoid TS2615
  notes!: Table;
  templates!: Table;
  decisions!: Table;
  vocabulary!: Table;
  reviews!: Table;
  metrics!: Table;
  settings!: Table;
  workspaces!: Table;
  sourceDocuments!: Table;
  fragments!: Table;
  connections!: Table;
  fragmentGroups!: Table;

  constructor() {
    super('AlphaNoteDB');

    // スキーマ定義 v1
    this.version(1).stores({
      notes: `
        id,
        title,
        createdAt,
        updatedAt,
        *freeTags,
        isFavorite,
        isArchived,
        parentId
      `,
    });

    // スキーマ定義 v2 - 新テーブル追加
    this.version(2).stores({
      notes: `
        id,
        title,
        createdAt,
        updatedAt,
        *freeTags,
        *keywords,
        templateId,
        nextReviewDate,
        isFavorite,
        isArchived,
        parentId
      `,
      templates: `
        id,
        category,
        name,
        isDefault,
        isPublic,
        usageCount
      `,
      decisions: `
        id,
        noteId,
        decisionDate,
        decisionType,
        *relatedAnalysisItemIds
      `,
      vocabulary: `
        id,
        word,
        noteId,
        createdAt
      `,
      reviews: `
        id,
        noteId,
        reviewDate,
        reviewType
      `,
      metrics: `
        userId,
        periodStart,
        periodEnd
      `,
    });

    // スキーマ定義 v3 - settings テーブル追加
    this.version(3).stores({
      notes: `
        id,
        title,
        createdAt,
        updatedAt,
        *freeTags,
        *keywords,
        templateId,
        nextReviewDate,
        isFavorite,
        isArchived,
        parentId
      `,
      templates: `
        id,
        category,
        name,
        isDefault,
        isPublic,
        usageCount
      `,
      decisions: `
        id,
        noteId,
        decisionDate,
        decisionType,
        *relatedAnalysisItemIds
      `,
      vocabulary: `
        id,
        word,
        noteId,
        createdAt
      `,
      reviews: `
        id,
        noteId,
        reviewDate,
        reviewType
      `,
      metrics: `
        userId,
        periodStart,
        periodEnd
      `,
      settings: `
        id
      `,
    });

    // スキーマ定義 v4 - noteType 追加
    this.version(4).stores({
      notes: `
        id,
        title,
        noteType,
        createdAt,
        updatedAt,
        *freeTags,
        *keywords,
        templateId,
        nextReviewDate,
        isFavorite,
        isArchived,
        parentId
      `,
      templates: `
        id,
        category,
        name,
        isDefault,
        isPublic,
        usageCount
      `,
      decisions: `
        id,
        noteId,
        decisionDate,
        decisionType,
        *relatedAnalysisItemIds
      `,
      vocabulary: `
        id,
        word,
        noteId,
        createdAt
      `,
      reviews: `
        id,
        noteId,
        reviewDate,
        reviewType
      `,
      metrics: `
        userId,
        periodStart,
        periodEnd
      `,
      settings: `
        id
      `,
    }).upgrade(tx => {
      return tx.table('notes').toCollection().modify((note: Record<string, unknown>) => {
        if (!note.noteType) {
          note.noteType = 'note';
        }
      });
    });

    // スキーマ定義 v5 - Thinking Workspace テーブル追加
    this.version(5).stores({
      notes: `
        id,
        title,
        noteType,
        createdAt,
        updatedAt,
        *freeTags,
        *keywords,
        templateId,
        nextReviewDate,
        isFavorite,
        isArchived,
        parentId
      `,
      templates: `
        id,
        category,
        name,
        isDefault,
        isPublic,
        usageCount
      `,
      decisions: `
        id,
        noteId,
        decisionDate,
        decisionType,
        *relatedAnalysisItemIds
      `,
      vocabulary: `
        id,
        word,
        noteId,
        createdAt
      `,
      reviews: `
        id,
        noteId,
        reviewDate,
        reviewType
      `,
      metrics: `
        userId,
        periodStart,
        periodEnd
      `,
      settings: `
        id
      `,
      workspaces: `
        id,
        noteId,
        createdAt,
        updatedAt
      `,
      sourceDocuments: `
        id,
        workspaceId,
        type,
        addedAt
      `,
      fragments: `
        id,
        workspaceId,
        groupId,
        createdAt
      `,
      connections: `
        id,
        workspaceId,
        createdAt
      `,
      fragmentGroups: `
        id,
        workspaceId,
        createdAt
      `,
    });
  }
}

// データベースインスタンスをエクスポート
export const db = new NotesDatabase();

// ============================================
// ヘルパー関数
// ============================================

/**
 * すべてのノートを取得
 */
export async function getAllNotes(): Promise<Note[]> {
  return await db.notes.toArray();
}

/**
 * IDでノートを取得
 */
export async function getNoteById(id: string): Promise<Note | undefined> {
  return await db.notes.get(id);
}

/**
 * ノートを作成
 */
export async function createNote(note: Note): Promise<string> {
  const id = await db.notes.add(note);
  return id;
}

/**
 * ノートを更新
 */
export async function updateNote(id: string, updates: Partial<Note>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.notes.update(id, {
    ...updates,
    updatedAt: new Date(),
  } as any);
}

/**
 * ノートを削除
 */
export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

/**
 * お気に入りのノートを取得
 */
export async function getFavoriteNotes(): Promise<Note[]> {
  return await db.notes.where('isFavorite').equals(1).toArray();
}

/**
 * アーカイブされていないノートを取得
 */
export async function getActiveNotes(): Promise<Note[]> {
  return await db.notes.where('isArchived').equals(0).toArray();
}

/**
 * タグでノートを検索
 */
export async function searchNotesByTag(tag: string): Promise<Note[]> {
  const notes = await db.notes.toArray();
  return notes.filter(note => note.freeTags.includes(tag));
}

/**
 * 子ノートを取得
 */
export async function getChildNotes(parentId: string): Promise<Note[]> {
  return await db.notes.where('parentId').equals(parentId).toArray();
}

/**
 * ルートノート(親を持たないノート)を取得
 */
export async function getRootNotes(): Promise<Note[]> {
  return await db.notes.where('parentId').equals(null as any).toArray();
}

/**
 * データベースをクリア(テスト用)
 */
export async function clearDatabase(): Promise<void> {
  await db.notes.clear();
}
