package com.ticoin.client;

import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import static org.assertj.core.api.Assertions.assertThat;

class OpenAiClientTest {

    @Test
    void client_is_disabled_without_api_key() {
        OpenAiClient client = new OpenAiClient(WebClient.builder(), "http://localhost:1", "", "gpt-5-mini");

        assertThat(client.isEnabled()).isFalse();
        assertThat(client.complete("지침", "입력")).isNull();
    }
}
