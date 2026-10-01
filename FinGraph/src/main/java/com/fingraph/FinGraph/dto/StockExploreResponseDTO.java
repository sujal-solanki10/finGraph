package com.fingraph.FinGraph.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StockExploreResponseDTO {
    private List<StockCardDTO> popularStocks;
    private List<StockCardDTO> topGainers;
    private List<StockCardDTO> topLosers;
    private List<StockCardDTO> mostActive;
}
