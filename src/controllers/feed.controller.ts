import { Request, Response } from 'express';
import { feedService } from '../services/feed.service';

export class FeedController {
  async getProducts(req: Request, res: Response): Promise<void> {
    const products = await feedService.getAllProducts();
    res.status(200).json({ success: true, message: 'Feed products retrieved successfully', data: products });
  }

  async getTransactions(req: Request, res: Response): Promise<void> {
    const transactions = await feedService.getAllTransactions();
    res.status(200).json({ success: true, message: 'Feed transactions retrieved successfully', data: transactions });
  }
}

export const feedController = new FeedController();
