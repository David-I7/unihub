package com.unihub.app.entities.content;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


@Entity
@Table(name = "attachments")
@SuperBuilder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Attachment extends Material{

    @ManyToOne
    @JoinColumn(name = "parent_material_id", nullable = false)
    private Material material;

}
