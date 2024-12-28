export type UserRole = 'ADMIN' | 'OPERATOR';

export type User = {
  id: string;
  email: string;
  role: UserRole;
};

export type LoggedUserInfo = {
  token: string;
  user: User;
};

export type PopupState = 'default' | 'loading';

export type Product = {
  id: string;
  name: string;
  quantity: number;
  categoryId: string;
};

export type Category = {
  id: string;
  name: string;
};

export type TableDataSource<T> = {
  actions: string[];
} & T;

export type Log = {
  id: number;
  timestamp: string;
  event: string;
  user?: {
    id: string;
    email: string;
  };
  product?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
};

export type LogBody = {
  pageSize: number;
  user?: string;
  product?: string;
  category?: string;
  event?: string;
  startDate?: Date;
  endDate?: Date;
};