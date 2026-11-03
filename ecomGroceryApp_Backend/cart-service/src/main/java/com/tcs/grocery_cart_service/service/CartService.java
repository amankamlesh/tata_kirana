package com.tcs.grocery_cart_service.service;

import com.tcs.grocery_cart_service.dto.CartRequest;
import com.tcs.grocery_cart_service.dto.CartResponse;

public interface CartService {
    CartResponse addToCart(CartRequest request);

    CartResponse getCartByCustomerId(Long customerId);

    CartResponse updateCartItem(Long itemId, Integer quantity);

    CartResponse removeCartItem(Long itemId);

    CartResponse clearCartByCustomerId(Long customerId);
}
