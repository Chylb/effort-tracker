package com.chylb.model.activity;

import com.chylb.model.effort.Effort;
import com.chylb.model.effort.EffortRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(path = "/api/activities")
public class ActivityController {
    private final EffortRepository effortRepository;
    private final ActivityService activityService;

    public ActivityController(EffortRepository effortRepository, ActivityService activityService) {
        this.effortRepository = effortRepository;
        this.activityService = activityService;
    }

    @GetMapping("")
    public List<Activity> getActivities() {
        return activityService.getActivities();
    }

    @GetMapping("/{id}")
    public Activity getActivity(@PathVariable(value = "id") Long id) {
        return activityService.getActivity(id);
    }

    @GetMapping("/{id}/streams")
    public String getActivityStreams(@PathVariable(value = "id") Long id) {
        return activityService.getActivityStreams(id);
    }

    @GetMapping("/{id}/efforts")
    public List<Effort> getActivityEfforts(@PathVariable(value = "id") Long id) {
        Activity activity = activityService.getActivity(id);
        return effortRepository.getEffortsByActivityId(id);
    }

    @PatchMapping("/{id}")
    public Activity updateActivity(@PathVariable(value = "id") Long id, @RequestBody Map<String, Object> fields) {
        Activity activity = activityService.getActivity(id);

        fields.forEach((k, v) -> {
            if (k.equals("flagged")) {
                activityService.setFlagged(activity, (boolean) v);
            }
        });

        return activity;
    }

    @PostMapping("")
    public void dev_generateActivity() {
        Activity activity = new Activity();

        float length = (float) (500 + Math.random() * 10000);
        int pace = (int) ((25 + Math.random() * 10) * Math.log(length));
        int time = (int) (length * pace / 1000f);
        float speed = length / (float) time;

        LinkedList<Integer> streamTime = new LinkedList();
        for (int i = 0; i < time; i++)
            streamTime.add(i);
        List<Float> streamDistance = new LinkedList<>();

        float curveFactor = (float) (0.1f + Math.random() * 0.3f);
        for (int i = 0; i < time; i++) {
            float pos = (float) ((1f + curveFactor * Math.cos(i / (float) time * Math.PI / 2f)) * i * speed);
            streamDistance.add(pos);
        }

        ObjectMapper objectMapper = new ObjectMapper();
        ObjectNode timeData = objectMapper.createObjectNode();
        ArrayNode timeArray = objectMapper.valueToTree(streamTime);
        timeData.put("data", timeArray);
        ObjectNode distanceData = objectMapper.createObjectNode();
        ArrayNode distanceArray = objectMapper.valueToTree(streamDistance);
        distanceData.put("data", distanceArray);
        ObjectNode streamData = objectMapper.createObjectNode();
        streamData.put("time", timeData);
        streamData.put("distance", distanceData);
        activity.setActivityStreamJson(streamData.toString());

        activity.setDistance(length);
        activity.setType("Run");

        Date date = new Date(1000L * (1415590669L + (long) (Math.random() * 195572868f)));
        activity.setDate(date);

        activityService.addGeneratedActivity(activity);
    }
}
