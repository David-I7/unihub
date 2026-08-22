package com.unihub.app.entities.community.content;

import com.unihub.app.entities.converters.MediaTypeConverter;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.http.MediaType;

import java.util.UUID;

@Entity
@Table(name = "material_files")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MaterialFile {

    @Id
    private UUID id;

    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    @Column(name = "media_type", nullable = false)
    @Convert(converter = MediaTypeConverter.class)
    private MediaType mediaType;

    @Column(nullable = false)
    private long size;

    @OneToOne(optional = false)
    @JoinColumn(name = "id", nullable = false)
    @MapsId
    private Resource resource;

}
