import { User } from 'src/generated/prisma/client';
 
export type JwtPayload = {
  id: User['id'];
  email: User['email'];
  username: User['username'];
};
