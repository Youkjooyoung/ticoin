package com.ticoin.service;

import com.ticoin.client.CryptoCompareClient;
import com.ticoin.client.RedditNewsClient;
import com.ticoin.dto.NewsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final CryptoCompareClient cryptoCompare;
    private final RedditNewsClient reddit;

    public List<NewsDto> getNews(String category) {
        // 1차: CryptoCompare (유료 전환됐을 수 있음)
        List<NewsDto> primary = cryptoCompare.fetchNews(category);
        if (!primary.isEmpty()) return primary;

        // 2차: Reddit r/CryptoCurrency 폴백 (무료)
        log.info("Using Reddit fallback for news (category={})", category);
        return reddit.fetchTop("CryptoCurrency");
    }
}
