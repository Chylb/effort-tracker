package com.chylb.model.distance;

import com.chylb.model.effort.Effort;
import com.chylb.model.effort.EffortRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/distances")
public class DistanceController {
    private final EffortRepository effortRepository;
    private final DistanceService distanceService;

    public DistanceController(EffortRepository effortRepository, DistanceService distanceService) {
        this.effortRepository = effortRepository;
        this.distanceService = distanceService;
    }

    @GetMapping()
    public List<Distance> distances() {
        return distanceService.getDistances();
    }

    @GetMapping("/{id}")
    public Distance getDistance(@PathVariable(value = "id") Long id) {
        return distanceService.getDistance(id);
    }

    @GetMapping("/{id}/efforts")
    public List<Effort> getDistanceEfforts(@PathVariable(value = "id") Long id) {
        Distance distance = distanceService.getDistance(id);
        return effortRepository.getEffortsByDistanceId(id);
    }

    @GetMapping("/{id}/seasonBest")
    public List<Effort> getSeasonBest(@PathVariable(value = "id") Long id,
                                      @RequestParam("year") int year) {
        Distance distance = distanceService.getDistance(id);
        return effortRepository.getSeasonBest(id, year);
    }

    @GetMapping("/{id}/allTimeBest")
    public List<Effort> getAllTimeBest(@PathVariable(value = "id") Long id) {
        Distance distance = distanceService.getDistance(id);
        return effortRepository.getAllTimeBest(id);
    }

    @PostMapping()
    public Distance addDistance(@RequestBody Distance newDistance) {
        return distanceService.addDistance(newDistance);
    }

    @DeleteMapping("/{id}")
    public void deleteDistance(@PathVariable Long id) {
        Distance distance = distanceService.getDistance(id);
        distanceService.deleteDistance(distance);
    }
}
