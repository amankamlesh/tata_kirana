import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRequest } from '../../models/order.model';



export interface OrderItemResponse {
  orderItemId: number;
  productId: number;
  quantity: number;
  price: number;
}
export interface OrderResponse {
  orderId: number;
  customerId: number;
  address: string;
  totalPrice: number;
  orderStatus: string;
  orderDate: string;
  orderItems: OrderItemResponse[];
}


@Injectable({ providedIn: 'root' })
export class OrderService {
    private readonly API = '/api/orders';

    constructor(private http: HttpClient) { }

    placeOrder(req: OrderRequest): Observable<OrderResponse> {
        return this.http.post<OrderResponse>(`${this.API}/add`, req);
    }

    getAllOrders(): Observable<OrderResponse[]> {
        return this.http.get<OrderResponse[]>(`${this.API}/get-all-orders`);
    }

    getOrderById(orderId: number): Observable<OrderResponse> {
        return this.http.get<OrderResponse>(`${this.API}/${orderId}`);
    }
    updateStatus(orderId: number, status: string): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`/api/orders/${orderId}/status`, null, { params: { status } });
  }

    getOrdersByCustomer(customerId: number): Observable<OrderResponse[]> {
        return this.http.get<OrderResponse[]>(`${this.API}/customer/${customerId}`);
    }

    cancelOrder(orderId: number): Observable<any> {
        return this.http.delete(`${this.API}/${orderId}`);
    }
}
