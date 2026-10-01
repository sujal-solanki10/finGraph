package com.fingraph.FinGraph.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RecommendationDTO {
    private String action;
    private String symbol;
    private String reasoning;
    private LocalDateTime recommendationDate;
}
