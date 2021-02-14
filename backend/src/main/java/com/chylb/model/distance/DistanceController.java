package com.chylb.model.distance;

import com.chylb.AppService;
import com.chylb.exceptions.ForbiddenException;
import com.chylb.exceptions.NotFoundException;
import com.chylb.exceptions.UnprocessableEntityException;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
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
    public ResponseEntity distances() throws JsonProcessingException {
        List<Distance> distances = distanceRepository.getDistancesByAthleteId(athleteId());
        return ResponseEntity.ok(objectMapper.writeValueAsString(distances));
    }

    @GetMapping("/api/distances/{id}")
    public ResponseEntity<String> getDistance(@PathVariable(value = "id") Long id) throws JsonProcessingException {
        Optional<Distance> distance = distanceRepository.getDistanceById(id);
        validateGetRequest(athleteId(), distance);

        return ResponseEntity.ok(objectMapper.writeValueAsString(distance.get()));
    }

    @GetMapping("/api/distances/{id}/efforts")
    public ResponseEntity<String> getDistanceEfforts(@PathVariable(value = "id") Long id) throws JsonProcessingException {
        Optional<Distance> distance = distanceRepository.getDistanceById(id);
        validateGetRequest(athleteId(), distance);

        List<Effort> efforts = effortRepository.getEffortsByDistanceId(id);
        return ResponseEntity.ok(objectMapper.writeValueAsString(efforts));
    }

    @GetMapping("/api/distances/{id}/seasonBest")
    public ResponseEntity<String> getSeasonBest(@PathVariable(value = "id") Long id,
                                                @RequestParam("year") int year) throws JsonProcessingException {
        Optional<Distance> distance = distanceRepository.getDistanceById(id);
        validateGetRequest(athleteId(), distance);

        List<Effort> efforts = effortRepository.getSeasonBest(id, year);
        return ResponseEntity.ok(objectMapper.writeValueAsString(efforts));
    }

    @GetMapping("/api/distances/{id}/allTimeBest")
    public ResponseEntity<String> getAllTimeBest(@PathVariable(value = "id") Long id) throws JsonProcessingException {
        Optional<Distance> distance = distanceRepository.getDistanceById(id);
        validateGetRequest(athleteId(), distance);

        List<Effort> efforts = effortRepository.getAllTimeBest(id);
        return ResponseEntity.ok(objectMapper.writeValueAsString(efforts));
    }

    @PostMapping("/api/distances")
    public ResponseEntity addDistance(@RequestBody Distance newDistance)
            throws JsonProcessingException {

        if (newDistance.getLength() <= 0 || newDistance.getName().length() == 0)
            throw new UnprocessableEntityException("Bad distance");

        Athlete athlete = athleteRepository.getAthleteById(athleteId()).get();
        String name = newDistance.getName();
        List<Distance> distances = distanceRepository.getDistancesByAthleteId(athleteId());
        if (distances.stream().map(Distance::getName).collect(Collectors.toList()).contains(name)) //no 2 distances with the same name
            throw new UnprocessableEntityException("Name already occupied");

        newDistance.setAthlete(athlete);

        Distance savedDistance = appService.addDistance(newDistance);

        return ResponseEntity.ok(objectMapper.writeValueAsString(savedDistance));
    }

    @DeleteMapping(value = "/api/distances/{id}")
    public ResponseEntity<Long> deleteDistance(@PathVariable Long id) {
        Optional<Distance> distance = distanceRepository.getDistanceById(id);
        if (distance.isPresent()) {
            if (distance.get().getAthlete().getId() == athleteId()) {
                appService.deleteDistance(distance.get());
                return ResponseEntity.ok(id);
            } else
                throw new ForbiddenException("Access denied");
        } else {
            throw new ForbiddenException("Distance not found");
        }
    }

    private void validateGetRequest(long athleteId, Optional<Distance> distance) {
        if (!distance.isPresent())
            throw new NotFoundException("Distance not found");
        if (distance.get().getAthlete().getId() != athleteId)
            throw new ForbiddenException("Access denied");
    }

    private long athleteId() {
        DefaultOAuth2User user = (DefaultOAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(user.getName());
    }
}
