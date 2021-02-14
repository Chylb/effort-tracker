package com.chylb.model.activity;

import com.chylb.model.athlete.Athlete;
import com.chylb.model.distance.Distance;
import com.chylb.model.effort.Effort;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.*;
import java.util.zip.DeflaterOutputStream;
import java.util.zip.InflaterOutputStream;

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

    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date date;

    @ManyToOne
    private Athlete athlete;

    private boolean flagged;

    @JsonIgnore
    @Lob
    private byte[] activityStreamJson;
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

    public Effort calculateEffort(Distance distance) {
        if (distance.getLength() > this.distance)
            return null;

        Iterator<Integer> tIt0 = streamTime.listIterator();
        Iterator<Float> dIt0 = streamDistance.listIterator();
        Iterator<Integer> tIt = streamTime.listIterator();
        Iterator<Float> dIt = streamDistance.listIterator();

        float d0 = dIt0.next();
        float d1 = dIt.next();
        int t0 = tIt0.next();
        int t1 = tIt.next();

        int time;
        int bestTime = Integer.MAX_VALUE;

        while (dIt.hasNext()) {
            while (dIt.hasNext() && d1 - d0 < distance.getLength()) {
                d1 = dIt.next();
                t1 = tIt.next();
            }

            if (!dIt.hasNext())
                break;

            time = t1 - t0;
            if (time < bestTime)
                bestTime = time;

            d0 = dIt0.next();
            t0 = tIt0.next();
        }

        if (bestTime == Integer.MAX_VALUE)
            bestTime = streamTime.get(streamTime.size() - 1);

        Effort effort = new Effort();
        effort.setDistance(distance);
        effort.setActivity(this);
        effort.setTime(bestTime);
        return effort;
    }
}


