package com.unihub.app.entities.content;

import com.unihub.app.entities.converters.MediaTypeConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.http.MediaType;

@Entity
@Table(name = "material_files")
@SuperBuilder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MaterialFile extends Material {

    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    @Column(name = "media_type", nullable = false)
    @Convert(converter = MediaTypeConverter.class)
    private MediaType mediaType;

    @Column(nullable = false)
    private long size;

}
