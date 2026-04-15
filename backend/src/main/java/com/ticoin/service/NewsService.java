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
        List<NewsDto> primary = cryptoCompare.fetchNews(category);
        if (!primary.isEmpty()) return primary;

        log.info("Using Reddit fallback for news (category={})", category);
        return reddit.fetchTop("CryptoCurrency");
    }
}
