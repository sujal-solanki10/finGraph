package com.fingraph.FinGraph.dao;

import com.fingraph.FinGraph.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockDAO extends JpaRepository<Stock, Long> {
    Optional<Stock> findBySymbol(String symbol);
    Optional<Stock> findByProviderSymbol(String providerSymbol);
    Optional<Stock> findBySymbolAndExchange(String symbol, String exchange);
    java.util.List<Stock> findBySymbolContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(String symbol, String companyName);
}
