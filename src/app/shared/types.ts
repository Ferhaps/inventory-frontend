export type UserRole = 'ADMIN' | 'OPERATOR';

export type User = {
  id: number;
  email: string;
  role: UserRole;
};

export type LoggedUserInfo = {
  token: string;
  user: User;
}

export type PopupState = 'default' | 'loading';

export type Product = {
  id: number;
  name: string;
  quantity: number;
  categoryId: number;
};

export type Category = {
  id: number;
  name: string;
};

export type TableDataSource<T> = {
  actions: string[];
} & T;