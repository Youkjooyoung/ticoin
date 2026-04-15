package com.ticoin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticoin.dto.PortfolioCreateRequest;
import com.ticoin.service.PortfolioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PortfolioControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean PortfolioService portfolioService;

    @Test
    void create_returns_400_when_symbol_blank() throws Exception {
        PortfolioCreateRequest invalid = new PortfolioCreateRequest(
                "", "Bitcoin", "CRYPTO", new BigDecimal("0.5"), new BigDecimal("50000")
        );

        mockMvc.perform(post("/api/portfolio")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    void create_returns_400_when_quantity_zero() throws Exception {
        PortfolioCreateRequest invalid = new PortfolioCreateRequest(
                "BTC", "Bitcoin", "CRYPTO", BigDecimal.ZERO, new BigDecimal("50000")
        );

        mockMvc.perform(post("/api/portfolio")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }
}
