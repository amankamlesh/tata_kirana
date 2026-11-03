package com.tcs.grocery_cart_service.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CartResponse {

    private Long cartId;
    private Long customerId;
    private List<CartItemResponse> cartItems = new ArrayList<>();
    private BigDecimal totalAmount;
    private String message;

    public CartResponse() {
    }

    public CartResponse(Long cartId, Long customerId, List<CartItemResponse> cartItems, BigDecimal totalAmount,
            String message) {
        this.cartId = cartId;
        this.customerId = customerId;
        this.cartItems = cartItems;
        this.totalAmount = totalAmount;
        this.message = message;
    }

    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public List<CartItemResponse> getCartItems() {
        return cartItems;
    }

    public void setCartItems(List<CartItemResponse> cartItems) {
        this.cartItems = cartItems;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

