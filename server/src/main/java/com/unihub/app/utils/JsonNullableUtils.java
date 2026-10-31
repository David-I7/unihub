package com.unihub.app.utils;

import org.openapitools.jackson.nullable.JsonNullable;

public final class JsonNullableUtils {

    private JsonNullableUtils() {
    }

    public static JsonNullable<String> trim(JsonNullable<String> nullable) {
        if (nullable == null) {
            return JsonNullable.undefined();
        }
        return nullable.map(s -> s == null ? null : s.trim());
    }

    public static JsonNullable<String> trimToLowerCase(JsonNullable<String> nullable) {
        if (nullable == null) {
            return JsonNullable.undefined();
        }
        return nullable.map(s -> s == null ? null : s.trim().toLowerCase());
    }
}
