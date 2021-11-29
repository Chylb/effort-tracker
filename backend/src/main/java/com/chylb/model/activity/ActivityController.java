package com.chylb.model.activity;

import com.chylb.model.effort.Effort;
import com.chylb.model.effort.EffortRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
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
            float pos = (float) ((1f + curveFactor * -0.5 * Math.cos(i / (float) time * Math.PI * 3f)) * i * speed);
            streamDistance.add(pos);
        }

        LinkedList<List<Float>> streamLatlng = new LinkedList<>();
        double lat0 = 50.061693f + 0.2f * Math.random();
        double lng0 = 19.937369f + 0.2f * Math.random();
        float angle = (float) (Math.random() * 2 * Math.PI);
        float mapDistance = (float) (1.5e-5 * length);
        for (int i = 0; i < time; i++) {
            double x = mapDistance * i / (float) time;
            double y = mapDistance * 0.1f * Math.sin(i / (float) time * Math.PI * 2f);

            double lat = lat0 + x * Math.cos(angle) - y * Math.sin(angle);
            double lng = lng0 + x * Math.sin(angle) + y * Math.cos(angle);
            List<Float> pos = new LinkedList();
            pos.add((float) lat);
            pos.add((float) lng);
            streamLatlng.add(pos);
        }

        LinkedList<Float> streamAltitude = new LinkedList<>();
        for (int i = 0; i < time; i++) {
            double altitude = 200 + 20 * Math.sin(i / (float) time * Math.PI * 3f + Math.PI);
            streamAltitude.add((float) altitude);
        }

        ObjectMapper objectMapper = new ObjectMapper();

        ObjectNode timeData = objectMapper.createObjectNode();
        ArrayNode timeArray = objectMapper.valueToTree(streamTime);
        timeData.put("data", timeArray);
        timeData.put("original_size", time);

        ObjectNode distanceData = objectMapper.createObjectNode();
        ArrayNode distanceArray = objectMapper.valueToTree(streamDistance);
        distanceData.put("data", distanceArray);
        distanceData.put("original_size", time);

        ObjectNode latlngData = objectMapper.createObjectNode();
        ArrayNode latlngArray = objectMapper.valueToTree(streamLatlng);
        latlngData.put("data", latlngArray);
        latlngData.put("original_size", time);

        ObjectNode altitudeData = objectMapper.createObjectNode();
        ArrayNode altitudeArray = objectMapper.valueToTree(streamAltitude);
        altitudeData.put("data", altitudeArray);
        altitudeData.put("original_size", time);

        ObjectNode streamData = objectMapper.createObjectNode();
        streamData.put("time", timeData);
        streamData.put("distance", distanceData);
        streamData.put("latlng", latlngData);
        streamData.put("altitude", altitudeData);

        activity.setActivityStreamJson(streamData.toString().getBytes());

        activity.setDistance(length);
        activity.setType("Run");

        Date date = new Date(1000L * (1415590669L + (long) (Math.random() * 195572868f)));
        activity.setDate(date);

        activityService.addGeneratedActivity(activity);
    }
}
