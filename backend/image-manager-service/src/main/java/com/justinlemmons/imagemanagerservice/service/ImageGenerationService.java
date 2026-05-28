package com.justinlemmons.imagemanagerservice.service;

import com.justinlemmons.imagemanagerservice.dto.ImageGenerationRequest;
import com.justinlemmons.imagemanagerservice.dto.ImageGenerationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Base64;

@Service
@Slf4j
public class ImageGenerationService {

    @Value("${huggingFace.token}")
    private String hfToken;

    @Value("${huggingFace.model}")
    private String model;

    @Value("${huggingFace.uri}")
    private String uri;

    @Value("${huggingFace.retry.maxAttempts:2}")
    private long maxRetryAttempts;

    @Value("${huggingFace.retry.backoffSeconds:3}")
    private long retryBackoffSeconds;

    private final WebClient webClient;

    public ImageGenerationService(WebClient webClient){
        this.webClient = webClient;
    }

    public Mono<byte[]> generateImage(String prompt) {
        ImageGenerationRequest request = new ImageGenerationRequest(prompt, model, "b64_json");


        return webClient.post()
                .uri(uri)
                .header("Authorization", "Bearer " + hfToken)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .doOnNext(body -> log.error("HF Error: {}", body))
                                .flatMap(body -> Mono.error(new RuntimeException("HF API failed: " + body))))
                .bodyToMono(ImageGenerationResponse.class)
                .map(response -> Base64.getDecoder().decode(response.images().get(0).base64_json()))
                .retryWhen(Retry.backoff(maxRetryAttempts, Duration.ofSeconds(retryBackoffSeconds))
                        .filter(throwable -> !(throwable instanceof RuntimeException
                                && throwable.getMessage().startsWith("HF API failed")))
                        .doBeforeRetry(signal -> log.warn("Retrying HuggingFace request, attempt {}", signal.totalRetries() + 1))
                        .onRetryExhaustedThrow((spec, signal) -> signal.failure()))
                .doOnError(err -> log.error("Image generation failed: {}", err.getMessage()));
        }
}
