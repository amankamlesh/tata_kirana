package com.tcs.grocery_cart_service.controller;

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

import com.tcs.grocery_cart_service.dto.CartRequest;
import com.tcs.grocery_cart_service.dto.CartResponse;
import com.tcs.grocery_cart_service.service.CartService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
@Validated
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody CartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(request));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<CartResponse> viewCart(@PathVariable("customerId") Long customerId) {
        return ResponseEntity.ok(cartService.getCartByCustomerId(customerId));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<CartResponse> updateQuantity(@PathVariable("itemId") Long itemId,
            @RequestParam("quantity") Integer quantity) {
        return ResponseEntity.ok(cartService.updateCartItem(itemId, quantity));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable("itemId") Long itemId) {
        return ResponseEntity.ok(cartService.removeCartItem(itemId));
    }

    @DeleteMapping("/clear/{customerId}")
    public ResponseEntity<CartResponse> clearCart(@PathVariable("customerId") Long customerId) {
        return ResponseEntity.ok(cartService.clearCartByCustomerId(customerId));
    }
}
