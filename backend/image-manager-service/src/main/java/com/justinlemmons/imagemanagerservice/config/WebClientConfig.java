package com.justinlemmons.imagemanagerservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    @Value("${huggingFace.url}")
    private String huggingFaceUrl;

    @Bean
    public WebClient webClient(){
        ExchangeStrategies strategies = ExchangeStrategies
                .builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 *1024))
                .build();

        return WebClient
                .builder()
                .baseUrl(huggingFaceUrl)
                .exchangeStrategies(strategies)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
