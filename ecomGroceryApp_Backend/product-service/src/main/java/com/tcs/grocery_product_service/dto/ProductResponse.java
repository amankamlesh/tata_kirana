package com.tcs.grocery_product_service.dto;

import java.math.BigDecimal;

public class ProductResponse {

    private Long productId;
    private String productName;
    private String category;
    private String productDescription;
    private BigDecimal productPrice;
    private Integer quantity;
    private BigDecimal discount;
    private String productImage;

    public ProductResponse() {
    }

    public ProductResponse(Long productId, String productName, String category, String productDescription,
            BigDecimal productPrice,
            Integer quantity, BigDecimal discount, String productImage) {
        this.productId = productId;
        this.productName = productName;
        this.category = category;
        this.productDescription = productDescription;
        this.productPrice = productPrice;
        this.quantity = quantity;
        this.discount = discount;
        this.productImage = productImage;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }

    public BigDecimal getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(BigDecimal productPrice) {
        this.productPrice = productPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public String getProductImage() {
        return productImage;
    }

    public void setProductImage(String productImage) {
        this.productImage = productImage;
    }
}
