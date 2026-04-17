package com.ticoin.service;

import com.ticoin.client.CryptoCompareClient;
import com.ticoin.client.GoogleNewsRssClient;
import com.ticoin.client.RedditNewsClient;
import com.ticoin.dto.NewsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private static final String DEFAULT_QUERY = "암호화폐 OR 비트코인 OR 이더리움 OR 코인 OR 블록체인";

    private final GoogleNewsRssClient googleNews;
    private final CryptoCompareClient cryptoCompare;
    private final RedditNewsClient reddit;

    public List<NewsDto> getNews(String category) {
        String query = buildQuery(category);

        List<NewsDto> korean = googleNews.search(query);
        List<NewsDto> crypto = cryptoCompare.fetchNews(category);

        List<NewsDto> merged = merge(korean, crypto);
        if (!merged.isEmpty()) return merged;

        log.info("Falling back to Reddit (category={})", category);
        return reddit.fetchTop("CryptoCurrency");
    }

    private String buildQuery(String category) {
        if (category == null || category.isBlank()) return DEFAULT_QUERY;
        String trimmed = category.trim();
        return switch (trimmed.toUpperCase()) {
            case "BTC", "BITCOIN" -> "비트코인 OR Bitcoin OR BTC";
            case "ETH", "ETHEREUM" -> "이더리움 OR Ethereum OR ETH";
            case "XRP", "RIPPLE" -> "리플 OR XRP OR Ripple";
            case "STOCK", "STOCKS" -> "주식 OR 코스피 OR 코스닥 OR 나스닥";
            default -> trimmed + " OR 암호화폐 OR 코인";
        };
    }

    private List<NewsDto> merge(List<NewsDto> primary, List<NewsDto> secondary) {
        Map<String, NewsDto> seen = new LinkedHashMap<>();
        for (NewsDto n : primary) {
            if (n == null || n.title() == null) continue;
            seen.putIfAbsent(n.title(), n);
        }
        for (NewsDto n : secondary) {
            if (n == null || n.title() == null) continue;
            seen.putIfAbsent(n.title(), n);
        }
        List<NewsDto> list = new ArrayList<>(seen.values());
        if (list.size() > 30) return list.subList(0, 30);
        return list;
    }
}
