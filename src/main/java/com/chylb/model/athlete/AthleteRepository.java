package com.chylb.model.athlete;

import com.chylb.model.activity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AthleteRepository extends JpaRepository<Athlete,Long> {
    Optional<Athlete> getAthleteById(long id);
}
