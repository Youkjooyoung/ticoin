package com.ticoin.service;

import com.ticoin.client.ClaudeClient;
import com.ticoin.dto.NewsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private static final String SYSTEM_PROMPT = """
            당신은 한국어로 답변하는 금융 시장 분석가입니다.
            규칙:
            - 3~5문장의 간결한 한국어 요약만 출력
            - 구체적 수치 포함 (가격, 변동률, 주요 뉴스 키워드)
            - 투자 권유 금지. 마지막에 '이 분석은 참고용이며 투자 권유가 아닙니다.'를 반드시 포함
            - 확실하지 않은 내용은 언급하지 말 것
            """;

    private final ClaudeClient claude;
    private final NewsService newsService;

    public Map<String, Object> status() {
        return Map.of("enabled", claude.isEnabled());
    }

    @Cacheable(value = "ai-analysis", key = "#symbol + ':' + #price + ':' + #changePct")
    public Map<String, Object> analyze(String symbol, double price, double changePct) {
        if (!claude.isEnabled()) {
            return Map.of(
                    "enabled", false,
                    "summary", "AI 분석 기능이 비활성화되어 있습니다. 백엔드에 ANTHROPIC_API_KEY 환경 변수를 설정해 주세요.",
                    "symbol", symbol
            );
        }

        List<NewsDto> news = newsService.getNews(symbol);
        String newsContext = news.stream()
                .limit(5)
                .map(n -> "- " + n.title() + " (" + n.source() + ")")
                .reduce("", (a, b) -> a + b + "\n");

        String userPrompt = """
                다음 자산에 대한 시장 분석 요약을 한국어로 작성해 주세요.

                심볼: %s
                현재가: $%.2f
                변동률: %+.2f%%

                최근 뉴스 헤드라인:
                %s

                위 정보를 바탕으로 3~5문장의 간결한 한국어 요약을 작성해 주세요.
                """.formatted(symbol, price, changePct, newsContext.isBlank() ? "관련 뉴스 없음" : newsContext);

        String result = claude.complete(SYSTEM_PROMPT, userPrompt);
        if (result == null || result.isBlank()) {
            return Map.of(
                    "enabled", true,
                    "summary", "AI 분석을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
                    "symbol", symbol
            );
        }

        return Map.of(
                "enabled", true,
                "symbol", symbol,
                "summary", result.trim(),
                "newsCount", news.size()
        );
    }
}
