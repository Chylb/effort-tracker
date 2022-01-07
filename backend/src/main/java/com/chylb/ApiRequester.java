package com.chylb;

import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.*;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.File;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.springframework.security.oauth2.client.web.reactive.function.client.ServletOAuth2AuthorizedClientExchangeFilterFunction.oauth2AuthorizedClient;

@Component
@Lazy
@AllArgsConstructor
public class ApiRequester {
    private final WebClient webClient;

    public String sendGetRequest(
            final OAuth2AuthorizedClient client,
            String url) {

        return webClient.get()
                .uri(url)
                .attributes(oauth2AuthorizedClient(client))
                .retrieve()
                .bodyToMono(String.class)
                .block();

//        //url = url.replace("https://www.strava.com", "http://localhost:9000");
//        try {
//            String fileName = "./savedRequests/" + url.replaceAll("[\\\\/:*?\"<>|]", "");
//            File file = new File(fileName);
//
//            if (file.exists()) {
//                return Files.readString(Path.of(file.getPath()), StandardCharsets.UTF_8);
//            } else {
//                System.out.println(url);
//                String response = webClient.get()
//                        .uri(url)
//                        .attributes(oauth2AuthorizedClient(client))
//                        .retrieve()
//                        .bodyToMono(String.class)
//                        .block();
//
//                PrintWriter writer = new PrintWriter(file);
//                writer.print(response);
//                writer.close();
//
//                return response;
//            }
//        } catch (Exception e) {
//            System.out.println(e.getMessage());
//            return null;
//        }
    }

    public ResponseEntity<String> sendPutRequest(
            final OAuth2AuthorizedClient client,
            final String url,
            final String body) {

        final RestTemplate restTemplate = new RestTemplate();

        final HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(client.getAccessToken().getTokenValue());
        headers.setContentType(MediaType.APPLICATION_JSON);
        final HttpEntity<String> entity = new HttpEntity<String>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
        return response;
    }
}

