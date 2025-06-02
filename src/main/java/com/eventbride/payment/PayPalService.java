package com.eventbride.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;


import java.util.*;

@Service
public class PayPalService {

    @Value("${paypal.client.id}")
    private String clientId;

    @Value("${paypal.client.secret}")
    private String clientSecret;

    @Value("${paypal.api.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String createPayment(Double amount, String currency, String description, String returnUrl, String cancelUrl) {
        try {
            String accessToken = getAccessToken();
    
            ObjectMapper objectMapper = new ObjectMapper();
    
            Map<String, Object> amountMap = Map.of(
                "currency_code", currency,
                "value", String.format(Locale.US, "%.2f", amount) 
            );            
    
            Map<String, Object> purchaseUnit = new HashMap<>();
            purchaseUnit.put("amount", amountMap);
            purchaseUnit.put("description", description);
    
            Map<String, Object> applicationContext = new HashMap<>();
            applicationContext.put("return_url", returnUrl);
            applicationContext.put("cancel_url", cancelUrl);
    
            Map<String, Object> body = new HashMap<>();
            body.put("intent", "CAPTURE");
            body.put("purchase_units", List.of(purchaseUnit));
            body.put("application_context", applicationContext);
    
            String jsonBody = objectMapper.writeValueAsString(body);
    
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
    
            HttpEntity<String> request = new HttpEntity<>(jsonBody, headers);
    
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    baseUrl + "/v2/checkout/orders", request, Map.class);
    
            List<Map<String, String>> links = (List<Map<String, String>>) response.getBody().get("links");
    
            return links.stream()
                    .filter(link -> "approve".equals(link.get("rel")))
                    .map(link -> link.get("href"))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No se encontró URL de aprobación"));
    
        } catch (Exception e) {
            throw new RuntimeException("Error creando el pago en PayPal: " + e.getMessage(), e);
        }
    }
    
    

    public Map<String, Object> capturePayment(String orderId) {
        String accessToken = getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>("{}", headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                baseUrl + "/v2/checkout/orders/" + orderId + "/capture",
                request,
                Map.class
        );

        return response.getBody();
    }

    private String getAccessToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(clientId, clientSecret);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> request = new HttpEntity<>("grant_type=client_credentials", headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                baseUrl + "/v1/oauth2/token", request, Map.class);

        return (String) response.getBody().get("access_token");
    }
}