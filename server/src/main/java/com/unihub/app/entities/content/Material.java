package com.unihub.app.entities.content;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;


@Entity
@Table(name = "materials")
@SuperBuilder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Material extends Resource{

    @OneToMany(mappedBy = "material")
    private List<Attachment> attachments;

}
