package com.chylb;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class ApiRequester {
    public ResponseEntity<String> sendGetRequest(
            final OAuth2AuthorizedClient client,
            final String url) {

        final RestTemplate restTemplate = new RestTemplate();

        final HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(client.getAccessToken().getTokenValue());
        final HttpEntity<String> entity =
                new HttpEntity<String>("parameters", headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

        return response;

//        try {
//            String fileName = "./savedRequests/" + url.replaceAll("[\\\\/:*?\"<>|]", "");
//            File file = new File(fileName);
//
//            if (file.exists()) {
//                String content = Files.readString(Path.of(file.getPath()), StandardCharsets.UTF_8);
//                return ResponseEntity.ok().body(content);
//            } else {
//                System.out.println(url);
//                final RestTemplate restTemplate = new RestTemplate();
//
//                final HttpHeaders headers = new HttpHeaders();
//                headers.setBearerAuth(client.getAccessToken().getTokenValue());
//                final HttpEntity<String> entity =
//                        new HttpEntity<String>("parameters", headers);
//
//                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
//
//                PrintWriter writer = new PrintWriter(file);
//                writer.print(response.getBody());
//                writer.close();
//
//                return response;
//            }
//        } catch (Exception e) {
//            System.out.println(e.getMessage());
//            return null;
//        }
    }
}

