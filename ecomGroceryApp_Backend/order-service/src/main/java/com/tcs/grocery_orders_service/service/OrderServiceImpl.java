package com.tcs.grocery_orders_service.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tcs.grocery_orders_service.client.ProductClient;
import com.tcs.grocery_orders_service.client.ProductClient.ProductSummary;
import com.tcs.grocery_orders_service.dto.OrderItemResponse;
import com.tcs.grocery_orders_service.dto.OrderRequest;
import com.tcs.grocery_orders_service.dto.OrderResponse;
import com.tcs.grocery_orders_service.exception.OrderNotFoundException;
import com.tcs.grocery_orders_service.model.Order;
import com.tcs.grocery_orders_service.model.OrderItem;
import com.tcs.grocery_orders_service.model.OrderStatus;
import com.tcs.grocery_orders_service.repository.OrderItemRepository;
import com.tcs.grocery_orders_service.repository.OrderRepository;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductClient productClient;

    public OrderServiceImpl(OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductClient productClient) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productClient = productClient;
    }

    @Override
    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setAddress(request.getAddress());
        order.setOrderStatus(OrderStatus.PLACED);
        order.setOrderDate(LocalDateTime.now());

        BigDecimal[] total = { BigDecimal.ZERO };
        List<OrderItem> items = request.getOrderItems().stream().map(itemReq -> {
            ProductSummary product = productClient.getProductById(itemReq.getProductId());

            // Deduct stock synchronously
            productClient.reduceQuantity(itemReq.getProductId(), itemReq.getQuantity());

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(itemReq.getProductId());
            item.setQuantity(itemReq.getQuantity());

            BigDecimal discount = product.getDiscount() != null ? product.getDiscount() : BigDecimal.ZERO;
            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(discount.divide(BigDecimal.valueOf(100)));
            BigDecimal effectivePrice = product.getProductPrice().multiply(discountMultiplier);

            item.setPrice(effectivePrice);

            BigDecimal sub = effectivePrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total[0] = total[0].add(sub);
            return item;
        }).toList();

        BigDecimal finalTotal = total[0];
        if (finalTotal.compareTo(new BigDecimal("499")) < 0) {
            finalTotal = finalTotal.add(new BigDecimal("49"));
        }
        order.setTotalPrice(finalTotal);
        Order savedOrder = orderRepository.save(order);
        for (OrderItem item : items) {
            item.setOrder(savedOrder);
        }
        List<OrderItem> savedItems = orderItemRepository.saveAll(items);
        savedOrder.setOrderItems(savedItems);
        return toResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findByOrderStatusNot(OrderStatus.CANCELLED)
                .stream()
                .map(OrderServiceImpl::toResponse)
                .toList();
    }

    @Override
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));
        return toResponse(order);
    }

    @Override
    public List<OrderResponse> getOrdersByCustomerId(Long customerId) {
        return orderRepository.findByCustomerId(customerId)
                .stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .map(OrderServiceImpl::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public String cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));
        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return "Order cancelled successfully";
    }
    @Override
@Transactional
public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

    if (order.getOrderStatus() == OrderStatus.CANCELLED) {
        throw new IllegalStateException("Cancelled orders cannot be updated");
    }
    order.setOrderStatus(status);
    return toResponse(orderRepository.save(order));
}
    private static OrderResponse toResponse(Order order) {
        OrderResponse resp = new OrderResponse();
        resp.setOrderId(order.getOrderId());
        resp.setCustomerId(order.getCustomerId());
        resp.setAddress(order.getAddress());
        resp.setTotalPrice(order.getTotalPrice());
        resp.setOrderStatus(order.getOrderStatus());
        resp.setOrderDate(order.getOrderDate());
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getOrderItemId(),
                        i.getProductId(),
                        i.getQuantity(),
                        i.getPrice()))
                .toList();
        resp.setOrderItems(items);
        return resp;
    }
}
