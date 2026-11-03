package com.tcs.grocery_orders_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tcs.grocery_orders_service.model.Order;
import com.tcs.grocery_orders_service.model.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);

    List<Order> findByOrderStatusNot(OrderStatus status);
}

