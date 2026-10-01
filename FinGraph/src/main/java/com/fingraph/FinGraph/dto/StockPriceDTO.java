package com.fingraph.FinGraph.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class StockPriceDTO {
    private LocalDate date;
    private Double open;
    private Double high;
    private Double low;
    private Double close;
    private Double adjustedClose;
    private Long volume;
}
