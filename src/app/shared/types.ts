export type UserRole = 'ADMIN' | 'OPERATOR';

export type User = {
	id: string;
	email: string;
	role: UserRole;
	createdAt: string;
	updatedAt: string;
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
	newQuantity: number;
	categoryId: string;
	createdAt: string;
	updatedAt: string;
};

export type CreateProductBody = {
	name: string;
	categoryId: string;
	quantity: number;
};

export type Category = {
	id: string;
	name: string;
	updatedAt: string;
	createdAt: string;
};

export type TableDataSource<T> = {
	actions: string[];
} & T;

export type Log = {
	id: string;
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
	details?: string;
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
