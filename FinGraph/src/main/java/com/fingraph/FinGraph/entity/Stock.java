package com.fingraph.FinGraph.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "stocks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"symbol", "exchange"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String symbol;

    @Column(name = "company_name")
    private String companyName;

    private String exchange;
    
    private String sector;
    
    private String industry;

    private String currency;

    private String region;
    
    @Column(name = "provider_symbol")
    private String providerSymbol;
    
    private String status;

    @OneToMany(mappedBy = "stock", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockPrice> historicalPrices;
}
