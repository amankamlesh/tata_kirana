package com.tcs.grocery_product_service.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tcs.grocery_product_service.dto.ProductRequest;
import com.tcs.grocery_product_service.dto.ProductResponse;
import com.tcs.grocery_product_service.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
@Validated
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/add")
    public ResponseEntity<ProductResponse> addProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.insertProduct(request));
    }

    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(value = "id", required = false) Long id,
            @RequestParam(value = "name", required = false) String name) {
        if (id != null) {
            return ResponseEntity.ok(productService.getProductById(id));
        }
        if (name != null && !name.isBlank()) {
            return ResponseEntity.ok(productService.getProductsByName(name));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductByPath(@PathVariable("id") Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable("id") Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable("id") Long id) {
        String message = productService.deleteProduct(id);
        Map<String, Object> body = new HashMap<>();
        body.put("productId", id);
        body.put("message", message);
        return ResponseEntity.ok(body);
    }

    @PutMapping("/{id}/reduce-quantity")
    public ResponseEntity<ProductResponse> reduceQuantity(
            @PathVariable("id") Long id,
            @RequestParam("quantity") Integer quantity) {
        return ResponseEntity.ok(productService.reduceProductQuantity(id, quantity));
    }
}
