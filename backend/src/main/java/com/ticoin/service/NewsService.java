package com.ticoin.service;

import com.ticoin.client.CryptoCompareClient;
import com.ticoin.dto.NewsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final CryptoCompareClient cryptoCompare;

    public List<NewsDto> getNews(String category) {
        return cryptoCompare.fetchNews(category);
    }
}
