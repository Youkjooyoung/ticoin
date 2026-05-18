package com.ticoin.service;

import com.ticoin.client.OpenAiClient;
import com.ticoin.dto.NewsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private static final String SYSTEM_PROMPT = """
            당신은 한국어로 답하는 가상자산 시장 분석가입니다.
            규칙:
            - 3~5문장으로 간결하게 답합니다.
            - 가격 변화, 거래대금, 최근 뉴스 맥락을 함께 봅니다.
            - 투자 권유가 아니라 정보 분석이며, 마지막에 "투자 판단은 본인의 책임입니다."를 포함합니다.
            - 과장된 확신이나 보장 표현을 쓰지 않습니다.
            """;

    private final OpenAiClient openAi;
    private final NewsService newsService;

    public Map<String, Object> status() {
        return Map.of("enabled", openAi.isEnabled(), "provider", "OpenAI");
    }

    @Cacheable(value = "ai-analysis", key = "#symbol + ':' + #price + ':' + #changePct")
    public Map<String, Object> analyze(String symbol, double price, double changePct) {
        if (!openAi.isEnabled()) {
            return Map.of(
                    "enabled", false,
                    "provider", "OpenAI",
                    "summary", "AI 분석 기능이 비활성화되어 있습니다. 백엔드에 OPENAI_API_KEY 환경 변수를 설정해 주세요.",
                    "symbol", symbol
            );
        }

        List<NewsDto> news = newsService.getNews(symbol);
        String newsContext = news.stream()
                .limit(5)
                .map(n -> "- " + n.title() + " (" + n.source() + ")")
                .reduce("", (a, b) -> a + b + "\n");

        String userPrompt = """
                다음 자산의 시장 상황을 한국어로 분석해 주세요.

                심볼: %s
                현재가: %.2f
                24시간 변동률: %+.2f%%

                최근 뉴스:
                %s

                위 정보를 바탕으로 핵심 요약을 작성해 주세요.
                """.formatted(symbol, price, changePct, newsContext.isBlank() ? "관련 뉴스 없음" : newsContext);

        String result = openAi.complete(SYSTEM_PROMPT, userPrompt);
        if (result == null || result.isBlank()) {
            return Map.of(
                    "enabled", true,
                    "provider", "OpenAI",
                    "summary", "AI 분석 응답을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.",
                    "symbol", symbol
            );
        }

        return Map.of(
                "enabled", true,
                "provider", "OpenAI",
                "symbol", symbol,
                "summary", result.trim(),
                "newsCount", news.size()
        );
    }
}
