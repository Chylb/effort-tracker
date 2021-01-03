package com.chylb.model.athlete;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;


import javax.persistence.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Athlete {
    @Id
    private long id;

    private String name;

    private String profilePicture;

    @JsonIgnore
    private long lastActivitySync;
}
