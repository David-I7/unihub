package com.unihub.app.entities.community.content;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "material_links")
@SuperBuilder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MaterialLink extends Resource {

    @Column(nullable = false)
    private String url;

    @Column(name = "link_type", nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    private MaterialLinkType linkType;

}
