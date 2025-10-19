package com.example.assignment.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "sectors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sector {

    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    private Long parentId;

    @Column(nullable = false)
    private int level;
}