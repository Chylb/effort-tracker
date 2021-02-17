package com.chylb.model.effort;

import com.chylb.model.activity.Activity;
import com.chylb.model.distance.Distance;
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

public class Effort {
    @Id
    @GeneratedValue
    private long id;

    @ManyToOne
    private Activity activity;

    @JsonIgnoreProperties("bestEffort")
    @ManyToOne
    private Distance distance;

    private int time;
}
