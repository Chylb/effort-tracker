package com.chylb.model.activity;

import com.chylb.model.effort.Effort;
import com.chylb.model.effort.EffortRepository;
import org.springframework.web.bind.annotation.*;

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
}
