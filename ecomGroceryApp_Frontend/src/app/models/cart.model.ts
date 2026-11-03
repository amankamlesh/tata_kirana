export interface CartRequest {
    customerId: number;
    productId: number;
    productName: string;
    productPrice: number;
    quantity: number;
}

export interface CartItemResponse {
    itemId: number;
    productId: number;
    productName: string;
    productPrice: number;
    quantity: number;
    subtotal: number;
}

export interface CartResponse {
    cartId: number;
    customerId: number;
    cartItems: CartItemResponse[];
    totalAmount: number;
    message: string;
}
