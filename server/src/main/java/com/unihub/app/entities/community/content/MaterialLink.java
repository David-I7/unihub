package com.unihub.app.entities.community.content;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "material_links")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MaterialLink {

    @Id
    private UUID ID;

    @Column(nullable = false)
    private String url;

    @Column(name = "link_type", nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    private MaterialLinkType linkType;

    @OneToOne(optional = false)
    @JoinColumn(nullable = false, name = "id")
    @MapsId
    private Resource resource;

}
