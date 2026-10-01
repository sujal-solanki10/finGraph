package com.fingraph.FinGraph.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
    name = "stock_prices",
    uniqueConstraints = @UniqueConstraint(columnNames = {"stock_id", "price_date"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    @ToString.Exclude
    private Stock stock;

    @Column(name = "price_date", nullable = false)
    private LocalDate priceDate;

    @Column(name = "open_price")
    private Double openPrice;
    
    @Column(name = "high_price")
    private Double highPrice;
    
    @Column(name = "low_price")
    private Double lowPrice;
    
    @Column(name = "close_price")
    private Double closePrice;
    
    @Column(name = "adjusted_close")
    private Double adjustedClose;
    
    @Column(name = "volume")
    private Long volume;
}
