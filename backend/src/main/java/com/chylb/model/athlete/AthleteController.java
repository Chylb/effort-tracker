package com.chylb.model.athlete;

import com.chylb.model.activity.Activity;
import com.chylb.model.activity.ActivityController;
import com.chylb.model.activity.ActivityRepository;
import com.chylb.model.activity.ActivityStreamRepository;
import com.chylb.model.distance.Distance;
import com.chylb.model.distance.DistanceRepository;
import com.chylb.model.effort.Effort;
import com.chylb.model.effort.EffortRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class AthleteController {

    @Autowired
    AthleteRepository athleteRepository;
    @Autowired
    ActivityRepository activityRepository;
    @Autowired
    DistanceRepository distanceRepository;
    @Autowired
    EffortRepository effortRepository;
    @Autowired
    ObjectMapper objectMapper;

    @GetMapping("/api/athlete")
    public ResponseEntity getAthlete(
            final @RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient client) throws JsonProcessingException {

        Athlete athlete = athleteRepository.getAthleteById(Long.parseLong(client.getPrincipalName())).get();
        return ResponseEntity.ok(objectMapper.writeValueAsString(athlete));
    }

    @GetMapping("/api/athlete/summary")
    public ResponseEntity getAthleteSummary(
            final @RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient client) throws JsonProcessingException {

        long id = Long.parseLong(client.getPrincipalName());
        List<Distance> distances = distanceRepository.getDistancesByAthleteId(id);
        List<Activity> activities = activityRepository.getActivitiesByAthleteId(id);
        List<Effort> efforts = effortRepository.getEffortsByAthleteId(id);
        efforts = efforts.stream().filter( e -> !e.getActivity().isFlagged()).collect(Collectors.toList());

        int bestPace = 0;
        if (distances.size() > 0)
            bestPace = (int) Math.ceil(distances.get(0).getBestTime() / distances.get(0).getLength() * 1000);

        ObjectNode summary = objectMapper.createObjectNode();
        summary.put("distances", distances.size());
        summary.put("activities", activities.size());
        summary.put("efforts", efforts.size());
        summary.put("bestPace", bestPace);

        return ResponseEntity.ok(objectMapper.writeValueAsString(summary));
    }
}

