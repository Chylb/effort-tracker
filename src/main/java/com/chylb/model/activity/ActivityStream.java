package com.chylb.model.activity;

import lombok.*;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.DeflaterOutputStream;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ActivityStream {
    @Id
    private long id;

    @Lob
    private byte[] compressedActivityStream;

    public static ActivityStream fromJson(String json) {
        try {
            ActivityStream s = new ActivityStream();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            DeflaterOutputStream defl = new DeflaterOutputStream(out);

            defl.write(json.getBytes());

            defl.flush();
            defl.close();

            s.setCompressedActivityStream(out.toByteArray());
            return s;
        } catch (IOException e) {
            System.out.println(e.getMessage());
            return null;
        }
    }
}
