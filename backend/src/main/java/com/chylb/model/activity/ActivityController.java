package com.chylb.model.activity;

import com.chylb.AppService;
import com.chylb.exceptions.ForbiddenException;
import com.chylb.exceptions.NotFoundException;
import com.chylb.exceptions.UnprocessableEntityException;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
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
    AppService appService;
    @Autowired
    ObjectMapper objectMapper;

    @GetMapping("/api/activities")
    public ResponseEntity<String> getActivities() throws JsonProcessingException {
        List<Activity> activities = activityRepository.getActivitiesByAthleteId(athleteId());
        return ResponseEntity.ok(objectMapper.writeValueAsString(activities));
    }

    @GetMapping("/api/activities/{id}")
    public ResponseEntity<String> getActivity(@PathVariable(value = "id") Long id) throws JsonProcessingException {
        Optional<Activity> activity = activityRepository.getActivityById(id);
        validateGetRequest(athleteId(), activity);

        return ResponseEntity.ok(objectMapper.writeValueAsString(activity.get()));
    }

    @GetMapping("/api/activities/{id}/efforts")
    public ResponseEntity<String> getActivityEfforts(@PathVariable(value = "id") Long id) throws JsonProcessingException {

        Optional<Activity> activity = activityRepository.getActivityById(id);
        validateGetRequest(athleteId(), activity);

        List<Effort> efforts = effortRepository.getEffortsByActivityId(id);
        return ResponseEntity.ok(objectMapper.writeValueAsString(efforts));
    }

    @PatchMapping(path = "/api/activities/{id}")
    public ResponseEntity<Activity> updateActivity(@PathVariable(value = "id") Long id, @RequestBody Map<String, Object> fields) throws JsonProcessingException {
        Optional<Activity> activity = activityRepository.getActivityById(id);
        validateGetRequest(athleteId(), activity);

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

    private void validateGetRequest(long athleteId, Optional<Activity> activity) {
        if (!activity.isPresent())
            throw new NotFoundException("Activity not found");
        if (activity.get().getAthlete().getId() != athleteId)
            throw new ForbiddenException("Access denied");
    }

    private long athleteId() {
        DefaultOAuth2User user = (DefaultOAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(user.getName());
    }
}
