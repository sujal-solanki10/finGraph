package com.fingraph.FinGraph.service;

import com.fingraph.FinGraph.client.AlphaVantageClient;
import com.fingraph.FinGraph.dao.StockDAO;
import com.fingraph.FinGraph.dao.StockPriceDAO;
import com.fingraph.FinGraph.dto.*;
import com.fingraph.FinGraph.entity.Stock;
import com.fingraph.FinGraph.entity.StockPrice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StockService {

    private final AlphaVantageClient alphaVantageClient;
    private final StockDAO stockDAO;
    private final StockPriceDAO stockPriceDAO;

    public StockService(AlphaVantageClient alphaVantageClient, StockDAO stockDAO, StockPriceDAO stockPriceDAO) {
        this.alphaVantageClient = alphaVantageClient;
        this.stockDAO = stockDAO;
        this.stockPriceDAO = stockPriceDAO;
    }

    public List<StockSearchResponseDTO> searchStocks(String query) {
        // Search in DB
        List<Stock> dbStocks = stockDAO.findBySymbolContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(query, query);
        if (!dbStocks.isEmpty()) {
            return dbStocks.stream().map(s -> StockSearchResponseDTO.builder()
                    .symbol(s.getSymbol())
                    .companyName(s.getCompanyName())
                    .exchange(s.getExchange())
                    .currency(s.getCurrency())
                    .region(s.getRegion())
                    .matchScore("1.0")
                    .build()).collect(Collectors.toList());
        }
        // Fallback to Alpha Vantage
        return alphaVantageClient.searchSymbol(query);
    }

    private Stock getOrCreateStock(String symbol) {
        Optional<Stock> stockOpt = stockDAO.findByProviderSymbol(symbol);
        if (stockOpt.isEmpty()) {
            stockOpt = stockDAO.findBySymbol(symbol);
        }

        return stockOpt.orElseGet(() -> {
            Stock newStock = new Stock();
            String internalSymbol = symbol.contains(".") ? symbol.substring(0, symbol.indexOf('.')) : symbol;
            
            newStock.setSymbol(internalSymbol);
            newStock.setProviderSymbol(symbol);
            newStock.setCompanyName(internalSymbol);

            try {
                List<StockSearchResponseDTO> searchRes = alphaVantageClient.searchSymbol(symbol);
                StockSearchResponseDTO match = searchRes.stream()
                        .filter(s -> s.getSymbol().equalsIgnoreCase(symbol))
                        .findFirst().orElse(null);

                if (match != null) {
                    newStock.setCompanyName(match.getCompanyName());
                    newStock.setCurrency(match.getCurrency());
                    newStock.setExchange(match.getExchange());
                    newStock.setRegion(match.getRegion());
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch search details during stock creation: " + e.getMessage());
            }

            return stockDAO.save(newStock);
        });
    }

    @Transactional
    public StockDetailDTO getStockDetails(String symbol) {
        Stock stock = getOrCreateStock(symbol);

        StockQuoteDTO quote = null;
        try {
            quote = getCurrentQuote(stock);
        } catch (com.fingraph.FinGraph.error.AlphaVantageException ex) {
            System.err.println("Alpha Vantage rate limit for quote: " + ex.getMessage());
        }

        return StockDetailDTO.builder()
                .symbol(stock.getSymbol())
                .companyName(stock.getCompanyName())
                .exchange(stock.getExchange())
                .currency(stock.getCurrency())
                .region(stock.getRegion())
                .quote(quote)
                .build();
    }

    public StockQuoteDTO getCurrentQuote(Stock stock) {
        List<StockPrice> latestPrices = stockPriceDAO.findTop2ByStockIdOrderByPriceDateDesc(stock.getId());
        
        if (!latestPrices.isEmpty()) {
            StockPrice latest = latestPrices.get(0);
            Double currentPrice = latest.getClosePrice();
            Double change = 0.0;
            String changePercentStr = "0.0000%";
            
            if (latestPrices.size() > 1) {
                StockPrice previous = latestPrices.get(1);
                if (previous.getClosePrice() != null && previous.getClosePrice() != 0.0) {
                    change = currentPrice - previous.getClosePrice();
                    double changePercent = (change / previous.getClosePrice()) * 100.0;
                    changePercentStr = String.format("%.4f%%", changePercent);
                }
            }
            
            return StockQuoteDTO.builder()
                    .symbol(stock.getSymbol())
                    .price(currentPrice)
                    .change(change)
                    .changePercent(changePercentStr)
                    .volume(latest.getVolume())
                    .latestTradingDay(latest.getPriceDate().toString())
                    .currency(stock.getCurrency())
                    .build();
        }

        // Fallback to AlphaVantage if no historical prices exist in DB
        String avSymbol = stock.getProviderSymbol() != null && !stock.getProviderSymbol().isEmpty() 
            ? stock.getProviderSymbol() 
            : stock.getSymbol();
        return alphaVantageClient.getGlobalQuote(avSymbol);
    }

    public StockQuoteDTO getCurrentQuote(String symbol) {
        Stock stock = stockDAO.findByProviderSymbol(symbol)
                .orElseGet(() -> stockDAO.findBySymbol(symbol).orElse(null));
        if (stock != null) {
            return getCurrentQuote(stock);
        }
        return alphaVantageClient.getGlobalQuote(symbol);
    }

    @Transactional
    public List<StockPriceDTO> getHistoricalPrices(String symbol) {
        Stock stock = getOrCreateStock(symbol);

        List<StockPriceDTO> apiPrices = null;
        try {
            String avSymbol = stock.getProviderSymbol() != null && !stock.getProviderSymbol().isEmpty() 
                ? stock.getProviderSymbol() 
                : stock.getSymbol();
            apiPrices = alphaVantageClient.getDailyTimeSeries(avSymbol);
        } catch (com.fingraph.FinGraph.error.AlphaVantageException ex) {
            System.err.println("Alpha Vantage rate limit or error: " + ex.getMessage());
        }

        if (apiPrices != null && !apiPrices.isEmpty()) {
            // Save or update in DB
            for (StockPriceDTO priceDTO : apiPrices) {
                Optional<StockPrice> existingPrice = stockPriceDAO.findByStockIdAndPriceDate(stock.getId(), priceDTO.getDate());
                StockPrice sp;
                if (existingPrice.isPresent()) {
                    sp = existingPrice.get();
                    sp.setOpenPrice(priceDTO.getOpen());
                    sp.setHighPrice(priceDTO.getHigh());
                    sp.setLowPrice(priceDTO.getLow());
                    sp.setClosePrice(priceDTO.getClose());
                    sp.setAdjustedClose(priceDTO.getAdjustedClose());
                    sp.setVolume(priceDTO.getVolume());
                } else {
                    sp = StockPrice.builder()
                            .stock(stock)
                            .priceDate(priceDTO.getDate())
                            .openPrice(priceDTO.getOpen())
                            .highPrice(priceDTO.getHigh())
                            .lowPrice(priceDTO.getLow())
                            .closePrice(priceDTO.getClose())
                            .adjustedClose(priceDTO.getAdjustedClose())
                            .volume(priceDTO.getVolume())
                            .build();
                }
                stockPriceDAO.save(sp);
            }
        }

        // Return from DB sorted by date
        List<StockPrice> dbPrices = stockPriceDAO.findByStockIdOrderByPriceDateAsc(stock.getId());
        return dbPrices.stream()
                .map(sp -> StockPriceDTO.builder()
                        .date(sp.getPriceDate())
                        .open(sp.getOpenPrice())
                        .high(sp.getHighPrice())
                        .low(sp.getLowPrice())
                        .close(sp.getClosePrice())
                        .adjustedClose(sp.getAdjustedClose())
                        .volume(sp.getVolume())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StockExploreResponseDTO getExploreData() {
        List<Stock> allStocks = stockDAO.findAll();
        List<StockCardDTO> cards = new ArrayList<>();

        for (Stock stock : allStocks) {
            List<StockPrice> latestPrices = stockPriceDAO.findTop2ByStockIdOrderByPriceDateDesc(stock.getId());
            if (!latestPrices.isEmpty()) {
                StockPrice latest = latestPrices.get(0);
                Double currentPrice = latest.getClosePrice();
                Double change = 0.0;
                Double changePercent = 0.0;

                if (latestPrices.size() > 1) {
                    StockPrice previous = latestPrices.get(1);
                    if (previous.getClosePrice() != null && previous.getClosePrice() != 0.0) {
                        change = currentPrice - previous.getClosePrice();
                        changePercent = (change / previous.getClosePrice()) * 100.0;
                    }
                }

                cards.add(StockCardDTO.builder()
                        .symbol(stock.getSymbol())
                        .companyName(stock.getCompanyName())
                        .currentPrice(currentPrice)
                        .change(change)
                        .changePercent(changePercent)
                        .volume(latest.getVolume())
                        .latestTradingDay(latest.getPriceDate().toString())
                        .source("Historical Close")
                        .currency(stock.getCurrency())
                        .build());
            }
        }

        List<StockCardDTO> topGainers = cards.stream()
                .filter(c -> c.getChangePercent() != null && c.getChangePercent() > 0)
                .sorted(Comparator.comparing(StockCardDTO::getChangePercent).reversed())
                .limit(5)
                .collect(Collectors.toList());

        List<StockCardDTO> topLosers = cards.stream()
                .filter(c -> c.getChangePercent() != null && c.getChangePercent() < 0)
                .sorted(Comparator.comparing(StockCardDTO::getChangePercent))
                .limit(5)
                .collect(Collectors.toList());

        List<StockCardDTO> mostActive = cards.stream()
                .filter(c -> c.getVolume() != null)
                .sorted(Comparator.comparing(StockCardDTO::getVolume).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // Popular stocks - just use the available universe
        List<StockCardDTO> popular = cards.stream()
                .limit(10)
                .collect(Collectors.toList());

        return StockExploreResponseDTO.builder()
                .popularStocks(popular)
                .topGainers(topGainers)
                .topLosers(topLosers)
                .mostActive(mostActive)
                .build();
    }
}
