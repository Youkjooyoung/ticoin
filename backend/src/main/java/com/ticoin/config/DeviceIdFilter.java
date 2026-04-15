package com.ticoin.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Order(1)
@Component
public class DeviceIdFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Device-Id";
    public static final String ATTR = "deviceId";
    public static final String ANON = "anonymous";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String deviceId = request.getHeader(HEADER);
        if (deviceId == null || deviceId.isBlank()) deviceId = ANON;
        request.setAttribute(ATTR, deviceId);
        MDC.put(ATTR, deviceId);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove(ATTR);
        }
    }
}
