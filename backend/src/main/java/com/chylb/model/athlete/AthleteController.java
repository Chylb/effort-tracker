package com.chylb.model.athlete;

import com.chylb.model.activity.Activity;
import com.chylb.model.activity.ActivityRepository;
import com.chylb.model.distance.Distance;
import com.chylb.model.distance.DistanceRepository;
import com.chylb.model.effort.Effort;
import com.chylb.model.effort.EffortRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "/api/athlete")
public class AthleteController {
    private final AthleteRepository athleteRepository;
    private final ActivityRepository activityRepository;
    private final DistanceRepository distanceRepository;
    private final EffortRepository effortRepository;
    private final ObjectMapper objectMapper;

    AthleteController(AthleteRepository athleteRepository, ActivityRepository activityRepository, DistanceRepository distanceRepository, EffortRepository effortRepository, ObjectMapper objectMapper) {
        this.athleteRepository = athleteRepository;
        this.activityRepository = activityRepository;
        this.distanceRepository = distanceRepository;
        this.effortRepository = effortRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping()
    public Athlete getAthlete() {
        return athleteRepository.getAthleteById(athleteId());
    }

    @GetMapping("/summary")
    public ResponseEntity getAthleteSummary() throws JsonProcessingException {
        long id = athleteId();
        List<Distance> distances = distanceRepository.getDistancesByAthleteId(id);
        List<Activity> activities = activityRepository.getActivitiesByAthleteId(id);
        List<Effort> efforts = effortRepository.getEffortsByAthleteId(id);
        efforts = efforts.stream().filter(e -> !e.getActivity().isFlagged()).collect(Collectors.toList());

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

    private long athleteId() {
        DefaultOAuth2User user = (DefaultOAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(user.getName());
    }
}

