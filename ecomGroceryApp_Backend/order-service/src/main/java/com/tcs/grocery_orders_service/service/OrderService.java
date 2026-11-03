package com.tcs.grocery_orders_service.service;

import java.util.List;

import com.tcs.grocery_orders_service.dto.OrderRequest;
import com.tcs.grocery_orders_service.dto.OrderResponse;
import com.tcs.grocery_orders_service.model.OrderStatus;

public interface OrderService {
    OrderResponse placeOrder(OrderRequest request);

    List<OrderResponse> getAllOrders();

    OrderResponse getOrderById(Long orderId);

    List<OrderResponse> getOrdersByCustomerId(Long customerId);
    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);

    String cancelOrder(Long orderId);
}

