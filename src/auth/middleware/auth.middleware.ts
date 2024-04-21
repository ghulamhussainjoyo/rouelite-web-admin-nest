import { Request } from 'express';
import { IUser } from 'src/interface/user.interface';

export interface ExpRequest extends Request {
  user: IUser;
}
