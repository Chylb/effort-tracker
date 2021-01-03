package com.chylb.model.activity;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ActivityStreamRepository extends JpaRepository<ActivityStream, Long> {
    Optional<ActivityStream> getActivityStreamById(long id);
}
