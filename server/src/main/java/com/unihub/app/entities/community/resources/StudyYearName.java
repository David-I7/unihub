package com.unihub.app.entities.community.resources;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum StudyYearName {
    YEAR_1, YEAR_2, YEAR_3, YEAR_4;

    @JsonCreator
    public static StudyYearName from(String source) {
        if (source == null || source.isBlank()) {
            return null;
        }
        String normalized = source.trim().replace('-', '_').
                toUpperCase();
        try {
            return StudyYearName.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid study year name: " + source);
        }
    }

    @JsonValue
    public String toValue() {
        return toString();
    }

    @Override
    public String toString() {
        return Arrays.stream(toTitleCase(name()).split("_"))
                .reduce((s1, s2) -> s1 + " " + s2)
                .orElseThrow(() -> new IllegalArgumentException("Invalid study year name: " + name()));
    }

    private String toTitleCase(String name){
        return name.toLowerCase().substring(0, 1).toUpperCase() + name.toLowerCase().substring(1);
    }
}
