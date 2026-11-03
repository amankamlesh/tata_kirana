export interface ProductRequest {
    productName: string;
    category: string;
    productDescription: string;
    productPrice: number;
    quantity: number;
    discount: number;
    productImage: string;
}

export interface ProductResponse {
    productId: number;
    productName: string;
    category: string;
    productDescription: string;
    productPrice: number;
    quantity: number;
    discount: number;
    productImage: string;
}
