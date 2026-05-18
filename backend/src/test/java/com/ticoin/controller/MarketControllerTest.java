package com.ticoin.controller;

import com.ticoin.dto.AssetDto;
import com.ticoin.service.MarketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MarketControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    MarketService marketService;

    @Test
    void feed_returns_200_with_asset_list() throws Exception {
        AssetDto sample = new AssetDto(
                "KRW-BTC", "비트코인", "CRYPTO",
                new BigDecimal("92000000"),
                new BigDecimal("1200000"),
                new BigDecimal("1.32"),
                BigDecimal.ZERO,
                new BigDecimal("210000000000"),
                new BigDecimal("93000000"),
                new BigDecimal("90000000"),
                null, List.of()
        );
        given(marketService.getFeed()).willReturn(List.of(sample));

        mockMvc.perform(get("/api/market/feed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].symbol").value("KRW-BTC"))
                .andExpect(jsonPath("$[0].name").value("비트코인"))
                .andExpect(jsonPath("$[0].type").value("CRYPTO"));
    }
}
