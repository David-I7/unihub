package com.unihub.app.entities.converters;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.http.MediaType;

@Converter
public class MediaTypeConverter implements AttributeConverter<MediaType, String> {

    @Override
    public String convertToDatabaseColumn(MediaType attribute) {
        return attribute == null ? null : attribute.toString();
    }

    @Override
    public MediaType convertToEntityAttribute(String dbData) {
        return dbData == null || dbData.isBlank() ? null : MediaType.parseMediaType(dbData);
    }
}
