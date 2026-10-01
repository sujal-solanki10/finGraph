package com.fingraph.FinGraph.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class HoldingDTO {
    private String symbol;
    private Integer quantity;
    private BigDecimal currentPrice;
    private BigDecimal value;
    private BigDecimal profitLoss;
    private BigDecimal allocation;
    private String currency;
}
