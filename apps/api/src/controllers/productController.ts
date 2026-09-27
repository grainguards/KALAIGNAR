import { Request, Response, NextFunction } from 'express';
import { db } from '../services/database';

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, name, title, price, suggestedPriceMin, suggestedPriceMax, quantity, category, material, tags, descriptionEn } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const product = db.createProduct({
      userId,
      name: name || title || 'Untitled Product',
      price: parseFloat(price) || undefined,
      suggestedPriceMin: suggestedPriceMin || undefined,
      suggestedPriceMax: suggestedPriceMax || undefined,
      quantity: parseInt(quantity) || 1,
      category: category || undefined,
      material: material || undefined,
      tags: tags || undefined,
      descriptionEn: descriptionEn || undefined,
      status: 'PUBLISHED',
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;
    const products = userId
      ? db.getProductsByUser(String(userId))
      : db.getAllProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
};
