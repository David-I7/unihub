package com.unihub.app.utils;

import com.unihub.app.entities.community.resources.StudyYearName;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToStudyYearNameConverter implements Converter<String, StudyYearName> {

    @Override
    public StudyYearName convert(String source) {
        if (source == null || source.isBlank()) {
            return null;
        }
        String normalized = source.trim().replaceAll("[\\s-]+", "_").toUpperCase();
        try {
            return StudyYearName.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid study year name: " + source);
        }
    }
}
