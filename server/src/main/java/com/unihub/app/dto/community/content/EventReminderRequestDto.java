package com.unihub.app.dto.community.content;

import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;

import java.util.List;

@Builder
public record EventReminderRequestDto(
        @NotEmpty(message = "Offset minutes list cannot be empty")
        List<Integer> offsetMinutes
) {
}
