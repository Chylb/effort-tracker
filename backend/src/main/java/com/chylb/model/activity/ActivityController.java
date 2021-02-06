package com.chylb.model.activity;

import com.chylb.AppService;
import com.chylb.model.athlete.Athlete;
import com.chylb.model.distance.Distance;
import com.chylb.model.effort.Effort;
import com.chylb.model.effort.EffortRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Setter;
import org.apache.catalina.Manager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.zip.InflaterOutputStream;

@RestController
public class ActivityController {
    @Autowired
    ActivityRepository activityRepository;
    @Autowired
    EffortRepository effortRepository;
    @Autowired
    ActivityStreamRepository streamRepository;
    @Autowired
    AppService appService;
    @Autowired
    ObjectMapper objectMapper;

    @GetMapping("/api/activities")
    public ResponseEntity<String> getActivities(@RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient client) throws JsonProcessingException {
        List<Activity> activities = activityRepository.getActivitiesByAthleteId(Long.parseLong(client.getPrincipalName()));
        return ResponseEntity.ok(objectMapper.writeValueAsString(activities));
    }

    @GetMapping("/api/activities/{id}")
    public ResponseEntity<String> getActivity(@RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient client,
                                              @PathVariable(value = "id") Long id) throws JsonProcessingException {

        Optional<Activity> activity = activityRepository.getActivityById(id);
        ResponseEntity r = validateGetRequest(client, activity);
        if (r != null) return r;

        return ResponseEntity.ok(objectMapper.writeValueAsString(activity.get()));
    }

    @GetMapping("/api/activities/{id}/efforts")
    public ResponseEntity<String> getActivityEfforts(@RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient client,
                                                     @PathVariable(value = "id") Long id) throws JsonProcessingException {

        Optional<Activity> activity = activityRepository.getActivityById(id);
        ResponseEntity r = validateGetRequest(client, activity);
        if (r != null) return r;

        List<Effort> efforts = effortRepository.getEffortsByActivityId(id);
        return ResponseEntity.ok(objectMapper.writeValueAsString(efforts));
    }

    @PatchMapping(path = "/api/activities/{id}")
    public ResponseEntity<Activity> updateActivity(@RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient client,
                                                   @PathVariable(value = "id") Long id, @RequestBody Map<String, Object> fields) throws JsonProcessingException {
        Optional<Activity> activity = activityRepository.getActivityById(id);
        ResponseEntity r = validateGetRequest(client, activity);
        if (r != null) return r;

        fields.forEach((k, v) -> {
            if (k.equals("flagged")) {
                if ((boolean) v)
                    appService.flagActivity(activity.get());
                else
                    appService.unflagActivity(activity.get());
            }
        });

        return ResponseEntity.ok(activityRepository.save(activity.get()));
    }

    private ResponseEntity<HttpStatus> validateGetRequest(OAuth2AuthorizedClient client, Optional<Activity> activity) {
        if (!activity.isPresent())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        if (activity.get().getAthlete().getId() != Long.parseLong(client.getPrincipalName()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return null;
    }
}
