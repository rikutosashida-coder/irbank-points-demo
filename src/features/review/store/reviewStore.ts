import { create } from 'zustand';
import { Review } from '../types/review.types';
import { db } from '../../../services/storage/indexedDB';
import { v4 as uuidv4 } from 'uuid';

interface ReviewStore {
  reviews: Review[];
  isLoaded: boolean;

  // アクション
  loadReviews: () => Promise<void>;
  getReviewById: (id: string) => Review | undefined;
  getReviewsByNoteId: (noteId: string) => Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<Review>;
  updateReview: (id: string, updates: Partial<Review>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  getLatestReviewByNoteId: (noteId: string) => Review | undefined;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviews: [],
  isLoaded: false,

  // レビュー読み込み
  loadReviews: async () => {
    try {
      const reviews = await db.reviews.toArray();
      set({ reviews, isLoaded: true });
    } catch (error) {
      console.error('レビュー読み込みエラー:', error);
      set({ isLoaded: true });
    }
  },

  // ID でレビュー取得
  getReviewById: (id: string) => {
    return get().reviews.find(r => r.id === id);
  },

  // ノートIDでレビュー取得
  getReviewsByNoteId: (noteId: string) => {
    return get().reviews
      .filter(r => r.noteId === noteId)
      .sort((a, b) => b.reviewDate.getTime() - a.reviewDate.getTime());
  },

  // レビュー追加
  addReview: async (reviewData) => {
    const newReview: Review = {
      ...reviewData,
      id: uuidv4(),
      createdAt: new Date(),
    };

    await db.reviews.add(newReview);
    set(state => ({
      reviews: [...state.reviews, newReview]
    }));

    return newReview;
  },

  // レビュー更新
  updateReview: async (id, updates) => {
    await db.reviews.update(id, updates);

    set(state => ({
      reviews: state.reviews.map(r =>
        r.id === id ? { ...r, ...updates } : r
      )
    }));
  },

  // レビュー削除
  deleteReview: async (id) => {
    await db.reviews.delete(id);
    set(state => ({
      reviews: state.reviews.filter(r => r.id !== id)
    }));
  },

  // ノートの最新レビュー取得
  getLatestReviewByNoteId: (noteId: string) => {
    const reviews = get().getReviewsByNoteId(noteId);
    return reviews.length > 0 ? reviews[0] : undefined;
  },
}));
