package com.fingraph.FinGraph.dao;

import com.fingraph.FinGraph.entity.StockPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockPriceDAO extends JpaRepository<StockPrice, Long> {
    List<StockPrice> findByStockIdOrderByPriceDateAsc(Long stockId);
    List<StockPrice> findTop2ByStockIdOrderByPriceDateDesc(Long stockId);
    Optional<StockPrice> findByStockIdAndPriceDate(Long stockId, LocalDate priceDate);
}
