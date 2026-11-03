package com.tcs.grocery_cart_service.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tcs.grocery_cart_service.dto.CartItemResponse;
import com.tcs.grocery_cart_service.dto.CartRequest;
import com.tcs.grocery_cart_service.dto.CartResponse;
import com.tcs.grocery_cart_service.exception.BadRequestException;
import com.tcs.grocery_cart_service.exception.CartNotFoundException;
import com.tcs.grocery_cart_service.model.Cart;
import com.tcs.grocery_cart_service.model.CartItem;
import com.tcs.grocery_cart_service.repository.CartItemRepository;
import com.tcs.grocery_cart_service.repository.CartRepository;
import com.tcs.grocery_cart_service.client.ProductClient;
import com.tcs.grocery_cart_service.client.ProductClient.ProductSummary;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductClient productClient;

    public CartServiceImpl(CartRepository cartRepository, CartItemRepository cartItemRepository,
            ProductClient productClient) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productClient = productClient;
    }

    @Override
    @Transactional
    public CartResponse addToCart(CartRequest request) {
        Cart cart = cartRepository.findByCustomerId(request.getCustomerId())
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setCustomerId(request.getCustomerId());
                    return cartRepository.save(c);
                });

        CartItem item = cartItemRepository.findByCart_CartIdAndProductId(cart.getCartId(), request.getProductId())
                .orElseGet(() -> {
                    CartItem ci = new CartItem();
                    ci.setCart(cart);
                    ci.setProductId(request.getProductId());
                    ci.setProductName(request.getProductName());
                    ci.setProductPrice(request.getProductPrice());
                    ci.setQuantity(0);
                    return ci;
                });

        int newQty = item.getQuantity() + request.getQuantity();
        if (newQty <= 0) {
            throw new BadRequestException("Quantity must be > 0");
        }

        ProductSummary product = productClient.getProductById(request.getProductId());
        if (newQty > product.getQuantity()) {
            throw new IllegalArgumentException("Cannot add more than available stock: " + product.getQuantity());
        }

        item.setQuantity(newQty);
        item.setProductName(request.getProductName());
        item.setProductPrice(request.getProductPrice());

        cartItemRepository.save(item);
        return buildResponse(cart, "Item added to cart");
    }

    @Override
    public CartResponse getCartByCustomerId(Long customerId) {
        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new CartNotFoundException("Cart not found for customerId: " + customerId));
        return buildResponse(cart, "Cart fetched successfully");
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(Long itemId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Quantity must be > 0");
        }
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new CartNotFoundException("Cart item not found with itemId: " + itemId));

        ProductSummary product = productClient.getProductById(item.getProductId());
        if (quantity > product.getQuantity()) {
            throw new BadRequestException(
                    "Cannot update quantity to " + quantity + ", available stock is " + product.getQuantity());
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return buildResponse(item.getCart(), "Cart item quantity updated");
    }

    @Override
    @Transactional
    public CartResponse removeCartItem(Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new CartNotFoundException("Cart item not found with itemId: " + itemId));
        Cart cart = item.getCart();
        cartItemRepository.delete(item);
        return buildResponse(cart, "Cart item removed");
    }

    @Override
    @Transactional
    public CartResponse clearCartByCustomerId(Long customerId) {
        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new CartNotFoundException("Cart not found for customerId: " + customerId));

        List<CartItem> items = cartItemRepository.findByCart_CartId(cart.getCartId());
        cartItemRepository.deleteAll(items);

        return buildResponse(cart, "Cart cleared successfully");
    }

    private CartResponse buildResponse(Cart cart, String message) {
        List<CartItem> items = cartItemRepository.findByCart_CartId(cart.getCartId());
        List<CartItemResponse> itemResponses = items.stream().map(CartServiceImpl::toItemResponse).toList();
        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartResponse resp = new CartResponse();
        resp.setCartId(cart.getCartId());
        resp.setCustomerId(cart.getCustomerId());
        resp.setCartItems(itemResponses);
        resp.setTotalAmount(total);
        resp.setMessage(message);
        return resp;
    }

    private static CartItemResponse toItemResponse(CartItem item) {
        BigDecimal subtotal = item.getProductPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new CartItemResponse(
                item.getItemId(),
                item.getProductId(),
                item.getProductName(),
                item.getProductPrice(),
                item.getQuantity(),
                subtotal);
    }
}
