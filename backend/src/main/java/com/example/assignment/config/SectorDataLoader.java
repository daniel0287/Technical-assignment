package com.example.assignment.config;

import com.example.assignment.model.Sector;
import com.example.assignment.repository.SectorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Component
public class SectorDataLoader implements CommandLineRunner {
    private final SectorRepository sectorRepository;
    private final ResourceLoader resourceLoader;
    private static final Logger logger = LoggerFactory.getLogger(SectorDataLoader.class);

    public SectorDataLoader(SectorRepository sectorRepository, ResourceLoader resourceLoader) {
        this.sectorRepository = sectorRepository;
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void run(String... args) throws Exception {
        if (sectorRepository.count() == 0) {
            loadInitialSectorData();
        }
    }

    private void loadInitialSectorData() {
        String htmlContent = "";
        try {
            Resource resource = resourceLoader.getResource("classpath:data/sectors.html");
            htmlContent = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("Error reading sectors HTML file: {}", e.getMessage(), e);
            return;
        }

        Pattern optionPattern = Pattern.compile("<option value=\"(\\d+)\">(.*?)</option>");
        Matcher matcher = optionPattern.matcher(htmlContent);

        Map<Integer, Long> lastParentIdAtLevel = new HashMap<>();

        while(matcher.find()) {
            Long htmlValueId = Long.parseLong(matcher.group(1));
            String rawName = matcher.group(2);
            int level = 0;
            String nbspString = "&nbsp;&nbsp;&nbsp;&nbsp;";
            String tempName = rawName;

            while (tempName.startsWith(nbspString)) {
                level++;
                tempName = tempName.substring(nbspString.length());
            }
            String name = tempName.replace("&amp;", "&").trim();

            Long parentId = null;
            if (level > 0) {
                parentId = lastParentIdAtLevel.get(level - 1);
            }
            Sector sector = new Sector(htmlValueId, name, parentId, level);
            sectorRepository.save(sector);

            lastParentIdAtLevel.put(level, sector.getId());
        }
    }
}
