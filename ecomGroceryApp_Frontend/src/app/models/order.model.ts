export interface OrderItemRequest {
    productId: number;
    quantity: number;
    price: number;
}

export interface OrderItemResponse {
    orderItemId: number;
    productId: number;
    quantity: number;
    price: number;
}

export interface OrderRequest {
    customerId: number;
    address: string;
    orderItems: OrderItemRequest[];
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderResponse {
    orderId: number;
    customerId: number;
    address: string;
    totalPrice: number;
    orderStatus: OrderStatus;
    orderDate: string;
    orderItems: OrderItemResponse[];
}
