import { feedRepository } from '../repositories/feed.repository';
import { FeedProductItem, FeedStockTransaction } from '../types/feed.types';

export class FeedService {
  async getAllProducts(): Promise<FeedProductItem[]> {
    return feedRepository.getProducts();
  }

  async getAllTransactions(): Promise<FeedStockTransaction[]> {
    return feedRepository.getTransactions();
  }
}

export const feedService = new FeedService();
