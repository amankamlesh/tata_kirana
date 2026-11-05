import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductRequest, ProductResponse } from '../../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
private readonly API = 'https://api-gateway-u3au.onrender.com/api/products';

    constructor(private http: HttpClient) { }

    getAllProducts(): Observable<ProductResponse[]> {
        return this.http.get<ProductResponse[]>(this.API);
    }

    getProductById(id: number): Observable<ProductResponse> {
        return this.http.get<ProductResponse>(`${this.API}/${id}`);
    }

    searchByName(name: string): Observable<ProductResponse[]> {
        const params = new HttpParams().set('name', name);
        return this.http.get<ProductResponse[]>(this.API, { params });
    }

    addProduct(req: ProductRequest): Observable<ProductResponse> {
        return this.http.post<ProductResponse>(`${this.API}/add`, req);
    }

    updateProduct(id: number, req: ProductRequest): Observable<ProductResponse> {
        return this.http.put<ProductResponse>(`${this.API}/${id}`, req);
    }

    deleteProduct(id: number): Observable<any> {
        return this.http.delete(`${this.API}/${id}`);
    }
}
