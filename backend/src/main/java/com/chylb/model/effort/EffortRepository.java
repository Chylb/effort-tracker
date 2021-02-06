package com.chylb.model.effort;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.List;

public interface EffortRepository extends PagingAndSortingRepository<Effort, Long> {
    List<Effort> getEffortsByActivityId(long id);

    @Query(value = "SELECT * FROM effort e JOIN activity a ON e.activity_id = a.id JOIN distance d ON e.distance_id = d.id WHERE d.id = :id AND a.flagged = FALSE "
            , nativeQuery = true)
    List<Effort> getEffortsByDistanceId(long id);

    @Query(value = "SELECT * FROM effort e JOIN activity a ON e.activity_id = a.id JOIN athlete ath ON a.athlete_id = ath.id WHERE ath.id = :id AND a.flagged = FALSE "
            , nativeQuery = true)
    List<Effort> getEffortsByAthleteId(long id);

    @Query(value = "SELECT * FROM effort e JOIN activity a ON e.activity_id = a.id AND EXTRACT(YEAR FROM a.date) = :year JOIN " +
            "(SELECT min(time) as min_time, EXTRACT(MONTH FROM a.date) AS month FROM effort e INNER JOIN activity a ON e.activity_id = a.id WHERE e.distance_id = :id AND a.flagged = FALSE AND EXTRACT(YEAR FROM a.date) = :year group by month) " +
            "AS k ON EXTRACT(MONTH FROM a.date) = k.month AND e.time = k.min_time AND e.distance_id = :id ORDER BY k.month ASC "
            , nativeQuery = true)
    List<Effort> getSeasonBest(Long id, int year);

    @Query(value = "SELECT * FROM effort e JOIN activity a ON e.activity_id = a.id JOIN " +
            "(SELECT min(time) as min_time, EXTRACT(YEAR FROM a.date) AS year FROM effort e INNER JOIN activity a ON e.activity_id = a.id  WHERE e.distance_id = :id AND a.flagged = FALSE group by year ) " +
            "AS k ON EXTRACT(YEAR FROM a.date) = k.year AND e.time = k.min_time WHERE e.distance_id = :id ORDER BY k.year ASC "
            , nativeQuery = true)
    List<Effort> getAllTimeBest(Long id);
}

