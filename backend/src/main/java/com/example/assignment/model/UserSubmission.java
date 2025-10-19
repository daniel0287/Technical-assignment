package com.example.assignment.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Set;

@Entity
@Table(name = "user_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be empty")
    @Column(nullable = false)
    private String name;

    @Size(min = 1, message = "At least one sector must be selected")
    @ManyToMany
    @JoinTable(
        name = "user_submission_sectors",
        joinColumns = @JoinColumn(name = "user_submission_id"),
        inverseJoinColumns = @JoinColumn(name = "sector_id")
    )
    private Set<Sector> selectedSectors;

    @AssertTrue(message = "You must agree to the terms and conditions")
    @Column(nullable = false)
    private boolean agreeToTerms;
}
