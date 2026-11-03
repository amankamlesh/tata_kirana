package com.tcs.grocery_product_service.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tcs.grocery_product_service.dto.ProductRequest;
import com.tcs.grocery_product_service.dto.ProductResponse;
import com.tcs.grocery_product_service.exception.ProductNotFoundException;
import com.tcs.grocery_product_service.model.Product;
import com.tcs.grocery_product_service.repository.ProductRepository;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public ProductResponse insertProduct(ProductRequest request) {
        Product product = new Product();
        apply(product, request);
        return toResponse(productRepository.save(product));
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream().map(ProductServiceImpl::toResponse).toList();
    }

    @Override
    public ProductResponse getProductById(Long productId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        return toResponse(p);
    }

    @Override
    public List<ProductResponse> getProductsByName(String name) {
        return productRepository.findByProductNameContainingIgnoreCase(name)
                .stream()
                .map(ProductServiceImpl::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long productId, ProductRequest request) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        apply(p, request);
        return toResponse(productRepository.save(p));
    }

    @Override
    @Transactional
    public String deleteProduct(Long productId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        productRepository.delete(p);
        return "Product deleted successfully";
    }

    @Override
    @Transactional
    public ProductResponse reduceProductQuantity(Long productId, Integer quantity) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));

        if (p.getQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for product id: " + productId);
        }

        p.setQuantity(p.getQuantity() - quantity);
        return toResponse(productRepository.save(p));
    }

    private static void apply(Product product, ProductRequest request) {
        product.setProductName(request.getProductName());
        product.setCategory(request.getCategory());
        product.setProductDescription(request.getProductDescription());
        product.setProductPrice(request.getProductPrice());
        product.setQuantity(request.getQuantity());
        product.setDiscount(request.getDiscount());
        product.setProductImage(request.getProductImage());
    }

    private static ProductResponse toResponse(Product p) {
        return new ProductResponse(
                p.getProductId(),
                p.getProductName(),
                p.getCategory(),
                p.getProductDescription(),
                p.getProductPrice(),
                p.getQuantity(),
                p.getDiscount(),
                p.getProductImage());
    }
}
