package com.ticoin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class TicoinApplication {
    public static void main(String[] args) {
        SpringApplication.run(TicoinApplication.class, args);
    }
}
