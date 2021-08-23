package com.chylb.model.activity;

import com.chylb.model.athlete.Athlete;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;

import javax.persistence.*;
import java.io.IOException;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JsonIgnoreProperties(value = {"athlete", "streamTime", "streamDistance", "manual"})
public class Activity {
    @Id
    private long id;
    private String name;
    private float distance;
    private String type;

    @Lob
    private String polyline;

    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date date;

    @ManyToOne
    private Athlete athlete;

    private boolean flagged;

    @Lob
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String activityStreamJson;

    @Transient
    private List<Integer> streamTime;

    @Transient
    private List<Float> streamDistance;

    @Transient
    private boolean manual;

    public static Activity fromJson(JsonNode node) {
        Activity a = new Activity();
        a.setId(node.get("id").asLong());
        a.setName(node.get("name").asText());
        a.setDistance((float) node.get("distance").asDouble());
        a.setType(node.get("type").asText());
        a.setPolyline(node.get("map").get("summary_polyline").asText());
        a.setManual(node.get("manual").asBoolean());
        a.setFlagged(false);

        TemporalAccessor ta = DateTimeFormatter.ISO_INSTANT.parse(node.get("start_date_local").asText());
        Instant i = Instant.from(ta);
        a.setDate(Date.from(i));
        return a;
    }

    public void loadActivityStream() {
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            final JsonNode node = objectMapper.readTree(activityStreamJson);

            streamTime = new LinkedList<>();
            streamDistance = new LinkedList<>();

            for (final JsonNode n : node.get("time").get("data"))
                streamTime.add(n.asInt());

            for (final JsonNode n : node.get("distance").get("data"))
                streamDistance.add((float) n.asDouble());

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}


