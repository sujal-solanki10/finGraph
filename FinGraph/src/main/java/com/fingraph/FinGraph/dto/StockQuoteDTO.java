package com.fingraph.FinGraph.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StockQuoteDTO {
    private String symbol;
    private Double price;
    private Double change;
    private String changePercent;
    private Long volume;
    private String latestTradingDay;
    private String currency;
}
