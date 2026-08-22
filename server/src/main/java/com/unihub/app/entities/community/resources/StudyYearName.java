package com.unihub.app.entities.community.resources;

import java.util.Arrays;

public enum StudyYearName {
    YEAR_1, YEAR_2, YEAR_3, YEAR_4;

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
