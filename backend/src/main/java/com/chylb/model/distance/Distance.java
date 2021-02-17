package com.chylb.model.distance;

import com.chylb.model.athlete.Athlete;
import com.chylb.model.effort.Effort;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class Distance {
    @Id
    @GeneratedValue
    private long id;

    private String name;

    private float length;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @OneToOne
    private Effort bestEffort;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private int effortCount = 0;

    @JsonIgnore
    @ManyToOne
    Athlete athlete;
}
