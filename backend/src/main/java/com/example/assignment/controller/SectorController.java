package com.example.assignment.controller;

import com.example.assignment.model.Sector;
import com.example.assignment.repository.SectorRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/sectors")
public class SectorController {
    private final SectorRepository sectorRepository;

    public SectorController(SectorRepository sectorRepository) {
        this.sectorRepository = sectorRepository;
    }

    @GetMapping
    public List<Sector> getAllSectors() {
        return sectorRepository.findAll();
    }
}
