package com.chylb.model.activity;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity,Long> {
    Activity getActivityById(long id);
    List<Activity> getActivitiesByAthleteId(long id);
}

