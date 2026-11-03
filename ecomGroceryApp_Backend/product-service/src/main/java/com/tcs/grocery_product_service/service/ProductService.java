package com.tcs.grocery_product_service.service;

import java.util.List;

import com.tcs.grocery_product_service.dto.ProductRequest;
import com.tcs.grocery_product_service.dto.ProductResponse;

public interface ProductService {
    ProductResponse insertProduct(ProductRequest request);

    List<ProductResponse> getAllProducts();

    ProductResponse getProductById(Long productId);

    List<ProductResponse> getProductsByName(String name);

    ProductResponse updateProduct(Long productId, ProductRequest request);

    String deleteProduct(Long productId);

    ProductResponse reduceProductQuantity(Long productId, Integer quantity);
}
