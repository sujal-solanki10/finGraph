package com.fingraph.FinGraph.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StockSearchResponseDTO {
    private String symbol;
    private String companyName;
    private String exchange;
    private String currency;
    private String region;
    private String matchScore;
}
