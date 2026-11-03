package com.tcs.grocery_orders_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tcs.grocery_orders_service.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}

