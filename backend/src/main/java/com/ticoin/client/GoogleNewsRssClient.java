package com.ticoin.client;

import com.ticoin.dto.NewsDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Google News RSS 기반 한국어 뉴스 클라이언트.
 * <p>
 * Google News는 Naver, Daum, Chosun, Hankyung 등 주요 국내 언론사 기사를 취합해
 * 단일 RSS 피드로 제공한다. {@code source} 필드에 실제 언론사 이름이 담긴다.
 */
@Slf4j
@Component
public class GoogleNewsRssClient {

    private static final DateTimeFormatter RFC_1123 = DateTimeFormatter.RFC_1123_DATE_TIME;

    private final WebClient webClient;
    private final String baseUrl;

    public GoogleNewsRssClient(WebClient.Builder builder,
                               @Value("${ticoin.api.google-news.base-url:https://news.google.com}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.webClient = builder
                .baseUrl(baseUrl)
                .defaultHeader("Accept", MediaType.APPLICATION_XML_VALUE + ",application/rss+xml,text/xml")
                .defaultHeader("User-Agent", "Mozilla/5.0 (compatible; ticoin/1.0; +https://ticoin.app)")
                .build();
    }

    @Cacheable(value = "google-news", key = "#query")
    public List<NewsDto> search(String query) {
        try {
            String xml = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/rss/search")
                            .queryParam("q", query)
                            .queryParam("hl", "ko")
                            .queryParam("gl", "KR")
                            .queryParam("ceid", "KR:ko")
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (xml == null || xml.isBlank()) return List.of();
            return parseRss(xml);
        } catch (Exception e) {
            log.warn("Google News RSS fetch failed for '{}': {}", query, e.getMessage());
            return List.of();
        }
    }

    private List<NewsDto> parseRss(String xml) {
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
            dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            dbf.setXIncludeAware(false);
            dbf.setExpandEntityReferences(false);
            DocumentBuilder db = dbf.newDocumentBuilder();
            var doc = db.parse(new InputSource(new StringReader(xml)));

            NodeList items = doc.getElementsByTagName("item");
            List<NewsDto> out = new ArrayList<>();
            int limit = Math.min(items.getLength(), 20);

            for (int i = 0; i < limit; i++) {
                Node node = items.item(i);
                if (!(node instanceof Element item)) continue;
                NewsDto dto = toDto(item, i);
                if (dto != null) out.add(dto);
            }
            return List.copyOf(out);
        } catch (Exception e) {
            log.warn("Failed to parse Google News RSS: {}", e.getMessage());
            return List.of();
        }
    }

    private NewsDto toDto(Element item, int index) {
        String title = textOf(item, "title");
        String link = textOf(item, "link");
        if (title == null || link == null) return null;

        String pubDate = textOf(item, "pubDate");
        Instant publishedAt = parseDate(pubDate);

        String source = textOf(item, "source");
        if (source == null || source.isBlank()) source = "Google News";

        String description = stripHtml(textOf(item, "description"));

        String guid = textOf(item, "guid");
        String id = "gn-" + (guid != null ? Integer.toHexString(guid.hashCode()) : index);

        return new NewsDto(
                id,
                title.trim(),
                description,
                link.trim(),
                source.trim(),
                null, // Google News RSS does not expose article images
                publishedAt,
                "crypto"
        );
    }

    private String textOf(Element parent, String tag) {
        NodeList list = parent.getElementsByTagName(tag);
        if (list.getLength() == 0) return null;
        String raw = list.item(0).getTextContent();
        return raw == null ? null : raw;
    }

    private Instant parseDate(String raw) {
        if (raw == null || raw.isBlank()) return Instant.now();
        try {
            return ZonedDateTime.parse(raw.trim(), RFC_1123.withLocale(Locale.ENGLISH)).toInstant();
        } catch (DateTimeParseException e) {
            return Instant.now();
        }
    }

    private String stripHtml(String html) {
        if (html == null) return "";
        return html
                .replaceAll("<[^>]+>", " ")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("&quot;", "\"")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
