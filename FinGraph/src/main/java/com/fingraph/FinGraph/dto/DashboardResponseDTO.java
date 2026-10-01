package com.fingraph.FinGraph.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class DashboardResponseDTO {
    private BigDecimal portfolioValue = BigDecimal.ZERO;
    private BigDecimal cashBalance = BigDecimal.ZERO;
    private BigDecimal investedAmount = BigDecimal.ZERO;
    private BigDecimal profitLoss = BigDecimal.ZERO;
    
    private List<HoldingDTO> currentHoldings = new ArrayList<>();
    private List<TransactionDTO> recentTransactions = new ArrayList<>();
    
    private RiskHighlightDTO riskHighlights;
    private FinGraphHighlightDTO finGraphHighlights;
    private RecommendationDTO latestRecommendation;
}
