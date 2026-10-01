package com.fingraph.FinGraph.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fingraph.FinGraph.dto.StockPriceDTO;
import com.fingraph.FinGraph.dto.StockQuoteDTO;
import com.fingraph.FinGraph.dto.StockSearchResponseDTO;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Component
public class AlphaVantageClient {

    @Value("${alphavantage.api.url}")
    private String apiUrl;

    @Value("${alphavantage.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AlphaVantageClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    private @Nullable JsonNode fetchAndParse(String url) {
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    url, 
                    org.springframework.http.HttpMethod.GET, 
                    entity, 
                    String.class
            );
            
            if (response.getBody() == null) {
                return null;
            }
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch from AlphaVantage: " + e.getMessage(), e);
        }
    }

    private void checkErrors(JsonNode body) {
        if (body != null) {
            if (body.has("Information")) {
                throw new com.fingraph.FinGraph.error.AlphaVantageException(body.get("Information").asText());
            }
            if (body.has("Error Message")) {
                throw new com.fingraph.FinGraph.error.AlphaVantageException(body.get("Error Message").asText());
            }
            if (body.has("Note")) {
                throw new com.fingraph.FinGraph.error.AlphaVantageException(body.get("Note").asText());
            }
        }
    }

    public List<StockSearchResponseDTO> searchSymbol(String query) {
        String url = String.format("%s?function=SYMBOL_SEARCH&outputsize=compact&keywords=%s&apikey=%s", apiUrl, query, apiKey);
        JsonNode body = fetchAndParse(url);
        checkErrors(body);

        List<StockSearchResponseDTO> results = new ArrayList<>();
        if (body != null && body.has("bestMatches")) {
            JsonNode matches = body.get("bestMatches");
            for (JsonNode match : matches) {
                results.add(StockSearchResponseDTO.builder()
                        .symbol(match.path("1. symbol").asText())
                        .companyName(match.path("2. name").asText())
                        .exchange(match.path("4. region").asText()) // Using region as exchange or use type
                        .currency(match.path("8. currency").asText())
                        .region(match.path("4. region").asText())
                        .matchScore(match.path("9. matchScore").asText())
                        .build());
            }
        }
        return results;
    }

    public StockQuoteDTO getGlobalQuote(String symbol) {
        String url = String.format("%s?function=GLOBAL_QUOTE&symbol=%s&apikey=%s", apiUrl, symbol, apiKey);
        JsonNode body = fetchAndParse(url);
        checkErrors(body);

        if (body != null && body.has("Global Quote")) {
            JsonNode quote = body.get("Global Quote");
            if (!quote.isEmpty()) {
                return StockQuoteDTO.builder()
                        .symbol(quote.path("01. symbol").asText())
                        .price(quote.path("05. price").asDouble())
                        .change(quote.path("09. change").asDouble())
                        .changePercent(quote.path("10. change percent").asText())
                        .volume(quote.path("06. volume").asLong())
                        .latestTradingDay(quote.path("07. latest trading day").asText())
                        .build();
            }
        }
        return null;
    }

    public List<StockPriceDTO> getDailyTimeSeries(String symbol) {
        String url = String.format("%s?function=TIME_SERIES_DAILY&symbol=%s&outputsize=compact&apikey=%s", apiUrl, symbol, apiKey);
        JsonNode body = fetchAndParse(url);
        checkErrors(body);

        List<StockPriceDTO> prices = new ArrayList<>();
        if (body != null && body.has("Time Series (Daily)")) {
            JsonNode timeSeries = body.get("Time Series (Daily)");
            Iterator<Map.Entry<String, JsonNode>> fields = timeSeries.fields();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                LocalDate date = LocalDate.parse(field.getKey(), formatter);
                JsonNode data = field.getValue();
                
                prices.add(StockPriceDTO.builder()
                        .date(date)
                        .open(data.path("1. open").asDouble())
                        .high(data.path("2. high").asDouble())
                        .low(data.path("3. low").asDouble())
                        .close(data.path("4. close").asDouble())
                        .adjustedClose(data.path("5. adjusted close").isMissingNode() ? data.path("4. close").asDouble() : data.path("5. adjusted close").asDouble())
                        .volume(data.path("6. volume").asLong())
                        .build());
            }
        }
        return prices;
    }
}
