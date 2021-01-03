package com.chylb.model.distance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DistanceRepository extends JpaRepository<Distance, Long> {
    Optional<Distance> getDistanceById(Long id);

    @Query(value = "SELECT * FROM distance d INNER JOIN athlete a ON d.athlete_id = a.id WHERE a.id = :id ORDER BY d.length ASC "
            , nativeQuery = true)
    List<Distance> getDistancesByAthleteId(Long id);
}
