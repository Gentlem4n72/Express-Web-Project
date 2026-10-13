import { type Request, type Response, type NextFunction } from 'express';

const logger = function (req: Request, res: Response, next: NextFunction) {
  console.log('LOGGED', req.path);
  next();
};

export default logger;