package com.unihub.app.utils;

import com.unihub.app.entities.community.resources.StudyYearName;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

public class StringToStudyYearNameConverterTests {

    private final StringToStudyYearNameConverter converter = new StringToStudyYearNameConverter();

    @ParameterizedTest
    @CsvSource({
            "year-1, YEAR_1",
            "year-2, YEAR_2",
            "year-3, YEAR_3",
            "year-4, YEAR_4",
            "YEAR-1, YEAR_1",
            "YEAR_1, YEAR_1",
            "year_1, YEAR_1",
            "  year-2  , YEAR_2"
    })
    @DisplayName("convert converts kebab-case, snake_case, and whitespace strings to StudyYearName enum")
    public void testConvert_ValidInputs(String input, StudyYearName expected) {
        StudyYearName result = converter.convert(input);
        assertEquals(expected, result);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    @DisplayName("convert returns null for null, empty, or blank string")
    public void testConvert_NullOrBlank(String input) {
        assertNull(converter.convert(input));
    }

    @Test
    @DisplayName("convert throws IllegalArgumentException for invalid input")
    public void testConvert_InvalidInput() {
        assertThrows(IllegalArgumentException.class, () -> converter.convert("year-5"));
    }
}
