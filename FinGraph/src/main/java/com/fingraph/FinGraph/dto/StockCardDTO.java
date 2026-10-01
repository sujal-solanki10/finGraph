package com.fingraph.FinGraph.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StockCardDTO {
    private String symbol;
    private String companyName;
    private Double currentPrice;
    private Double change;
    private Double changePercent;
    private Long volume;
    private String latestTradingDay;
    private String source;
    private String currency;
}
