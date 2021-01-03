package com.chylb.model.distance;

import com.chylb.AppService;
import com.chylb.model.activity.ActivityRepository;
import com.chylb.model.activity.ActivityController;
import com.chylb.model.athlete.Athlete;
import com.chylb.model.athlete.AthleteRepository;
import com.chylb.model.effort.Effort;
import com.chylb.model.effort.EffortRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class DistanceController {
    @Autowired
    DistanceRepository distanceRepository;
    @Autowired
    ActivityRepository activityRepository;
    @Autowired
    AthleteRepository athleteRepository;
    @Autowired
    EffortRepository effortRepository;
    @Autowired
    ActivityController activityController;
    @Autowired
    AppService appService;
    @Autowired
    ObjectMapper objectMapper;

    @GetMapping("/api/distances")
    public ResponseEntity distances(
            final @RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient client) throws JsonProcessingException {
        List<Distance> distances = distanceRepository.getDistancesByAthleteId(Long.parseLong(client.getPrincipalName()));
        return ResponseEntity.ok(objectMapper.writeValueAsString(distances));
    }

    @GetMapping("/api/distances/{id}")
    public ResponseEntity<String> getDistance(@RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient client,
                                              @PathVariable(value = "id") Long id) throws JsonProcessingException {
        Optional<Distance> distance = distanceRepository.getDistanceById(id);
        ResponseEntity r = validateGetRequest(client, distance);
        if (r != null) return r;

        return ResponseEntity.ok(objectMapper.writeValueAsString(distance.get()));
    }

    @GetMapping("/api/distances/{id}/efforts")
    public ResponseEntity<String> getDistanceEfforts(@RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient client,
                                                     @PathVariable(value = "id") Long id) throws JsonProcessingException {
        Optional<Distance> distance = distanceRepository.getDistanceById(id);
        ResponseEntity r = validateGetRequest(client, distance);
        if (r != null) return r;

        List<Effort> efforts = effortRepository.getEffortsByDistanceId(id);
        return ResponseEntity.ok(objectMapper.writeValueAsString(efforts));
    }

    @GetMapping("/api/distances/{id}/seasonBest")
    public ResponseEntity<String> getSeasonBest(@RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient client,
                                                @PathVariable(value = "id") Long id,
                                                @RequestParam("year") int year) throws JsonProcessingException {
        Optional<Distance> distance = distanceRepository.getDistanceById(id);
        ResponseEntity r = validateGetRequest(client, distance);
        if (r != null) return r;

        List<Effort> efforts = effortRepository.getSeasonBest(id, year);
        return ResponseEntity.ok(objectMapper.writeValueAsString(efforts));
    }

    @GetMapping("/api/distances/{id}/allTimeBest")
    public ResponseEntity<String> getAllTimeBest(@RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient client,
                                                 @PathVariable(value = "id") Long id) throws JsonProcessingException {
        Optional<Distance> distance = distanceRepository.getDistanceById(id);
        ResponseEntity r = validateGetRequest(client, distance);
        if (r != null) return r;

        List<Effort> efforts = effortRepository.getAllTimeBest(id);
        return ResponseEntity.ok(objectMapper.writeValueAsString(efforts));
    }

    @PostMapping("/api/distances")
    public ResponseEntity addDistance(
            @RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient client,
            @RequestBody Distance newDistance)
            throws JsonProcessingException {

        if (newDistance.getLength() <= 0 || newDistance.getName().length() == 0)
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).build();

        Athlete athlete = athleteRepository.getAthleteById(Long.parseLong(client.getPrincipalName())).get();
        String name = newDistance.getName();
        List<Distance> distances = distanceRepository.getDistancesByAthleteId(Long.parseLong(client.getPrincipalName()));
        if (distances.stream().map(Distance::getName).collect(Collectors.toList()).contains(name)) //no 2 distances with the same name
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).build();

        newDistance.setAthlete(athlete);

        Distance savedDistance = appService.addDistance(newDistance);

        return ResponseEntity.ok(objectMapper.writeValueAsString(savedDistance));
    }

    @DeleteMapping(value = "/api/distances/{id}")
    public ResponseEntity<Long> deleteDistance(@RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient client, @PathVariable Long id) {
        Optional<Distance> distance = distanceRepository.getDistanceById(id);
        if (distance.isPresent()) {
            if (distance.get().getAthlete().getId() == Long.parseLong(client.getPrincipalName())) {
                appService.deleteDistance(distance.get());
                return ResponseEntity.ok(id);
            } else
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    private ResponseEntity<HttpStatus> validateGetRequest(OAuth2AuthorizedClient client, Optional<Distance> distance) {
        if (!distance.isPresent())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        if (distance.get().getAthlete().getId() != Long.parseLong(client.getPrincipalName()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return null;
    }
}
