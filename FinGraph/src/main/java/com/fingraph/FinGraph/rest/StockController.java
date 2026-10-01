package com.fingraph.FinGraph.rest;

import com.fingraph.FinGraph.dto.StockDetailDTO;
import com.fingraph.FinGraph.dto.StockPriceDTO;
import com.fingraph.FinGraph.dto.StockQuoteDTO;
import com.fingraph.FinGraph.dto.StockSearchResponseDTO;
import com.fingraph.FinGraph.service.StockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stocks")
@Slf4j
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/explore")
    public ResponseEntity<com.fingraph.FinGraph.dto.StockExploreResponseDTO> getExploreData() {
        log.info("Entering getExploreData()");
        com.fingraph.FinGraph.dto.StockExploreResponseDTO exploreData = stockService.getExploreData();
        log.info("Exiting getExploreData()");
        return ResponseEntity.ok(exploreData);
    }

    @GetMapping("/search")
    public ResponseEntity<List<StockSearchResponseDTO>> searchStocks(@RequestParam String query) {
        log.info("Entering searchStocks() with query: {}", query);
        List<StockSearchResponseDTO> results = stockService.searchStocks(query);
        log.info("Exiting searchStocks() with result size: {}", results.size());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<StockDetailDTO> getStockDetails(@PathVariable String symbol) {
        log.info("Entering getStockDetails() with symbol: {}", symbol);
        StockDetailDTO details = stockService.getStockDetails(symbol);
        if (details != null) {
            log.info("Exiting getStockDetails() - Found details for symbol: {}", symbol);
            return ResponseEntity.ok(details);
        }
        log.info("Exiting getStockDetails() - No details found for symbol: {}", symbol);
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{symbol}/history")
    public ResponseEntity<List<StockPriceDTO>> getHistoricalPrices(@PathVariable String symbol) {
        log.info("Entering getHistoricalPrices() with symbol: {}", symbol);
        List<StockPriceDTO> history = stockService.getHistoricalPrices(symbol);
        log.info("Exiting getHistoricalPrices() with history size: {}", history.size());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{symbol}/quote")
    public ResponseEntity<StockQuoteDTO> getCurrentQuote(@PathVariable String symbol) {
        log.info("Entering getCurrentQuote() with symbol: {}", symbol);
        StockQuoteDTO quote = stockService.getCurrentQuote(symbol);
        if (quote != null) {
            log.info("Exiting getCurrentQuote() - Found quote for symbol: {}", symbol);
            return ResponseEntity.ok(quote);
        }
        log.info("Exiting getCurrentQuote() - No quote found for symbol: {}", symbol);
        return ResponseEntity.notFound().build();
    }
}
