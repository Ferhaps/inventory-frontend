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