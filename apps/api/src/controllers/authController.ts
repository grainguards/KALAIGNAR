import { Request, Response, NextFunction } from 'express';
import { db } from '../services/database';

export const requestOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    res.json({ message: 'OTP sent successfully', mockOtp: '1234' });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp } = req.body;
    if (otp !== '1234') {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    let user = db.findUserByPhone(phone);
    if (!user) {
      user = db.createUser(phone);
    }

    const token = `mock_jwt_token_for_${user.id}`;
    res.json({ token, user });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = db.findUserById(id) || Array.from(db.users.values())[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, preferred_language, preferred_theme } = req.body;
    const effectiveId = userId || 'demo_user';
    const user = db.updateUserPreferences(effectiveId, { preferred_language, preferred_theme });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

