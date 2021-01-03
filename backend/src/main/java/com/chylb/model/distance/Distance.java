package com.chylb.model.distance;

import com.chylb.model.athlete.Athlete;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@JsonIgnoreProperties(value = { "athlete" })
public class Distance {
    @Id
    @GeneratedValue
    private long id;

    private String name;

    private float length;

    private int bestTime;

    private int effortCount = 0;

    @ManyToOne
    Athlete athlete;
}
