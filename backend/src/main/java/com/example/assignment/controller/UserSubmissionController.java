package com.example.assignment.controller;
import com.example.assignment.model.Sector;
import com.example.assignment.model.UserSubmission;
import com.example.assignment.repository.SectorRepository;
import com.example.assignment.repository.UserSubmissionRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/submissions")
public class UserSubmissionController {
    private final UserSubmissionRepository userSubmissionRepository;
    private final SectorRepository sectorRepository;

    public UserSubmissionController(UserSubmissionRepository userSubmissionRepository, SectorRepository sectorRepository) {
        this.userSubmissionRepository = userSubmissionRepository;
        this.sectorRepository = sectorRepository;
    }

    @PostMapping
    public UserSubmission save(@Valid @RequestBody UserSubmission userSubmission) {
        manageSectors(userSubmission, userSubmission);
        return userSubmissionRepository.save(userSubmission);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserSubmission> getSubmissionById(@PathVariable Long id) {
        Optional<UserSubmission> submission = userSubmissionRepository.findById(id);

        if (submission.isPresent()) {
            return ResponseEntity.ok(submission.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserSubmission> updateSubmission(@PathVariable Long id, @Valid @RequestBody UserSubmission userSubmission) {
        Optional<UserSubmission> existingSubmission = userSubmissionRepository.findById(id);

        if (existingSubmission.isPresent()) {
            UserSubmission submissionToUpdate = existingSubmission.get();
            submissionToUpdate.setName(userSubmission.getName());
            submissionToUpdate.setAgreeToTerms(userSubmission.isAgreeToTerms());

            manageSectors(userSubmission, submissionToUpdate);
            UserSubmission updatedSubmission = userSubmissionRepository.save(submissionToUpdate);
            return ResponseEntity.ok(updatedSubmission);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    private void manageSectors(UserSubmission userSubmission, UserSubmission submissionToUpdate) {
        Set<Sector> incomingSectors = userSubmission.getSelectedSectors();
        Set<Sector> managedSectors = new HashSet<>();

        if (incomingSectors != null && !incomingSectors.isEmpty()) {
            Set<Long> sectorIds = new HashSet<>();
            for (Sector sector : incomingSectors) {
                sectorIds.add(sector.getId());
            }

            List<Sector> foundSectors = sectorRepository.findAllById(sectorIds);
            managedSectors.addAll(foundSectors);
        }
        submissionToUpdate.setSelectedSectors(managedSectors);
    }
}
