package com.unihub.app.controllers.community.content;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.UpdateFolderRequestDto;
import com.unihub.app.dto.community.content.response.BreadcrumbDto;
import com.unihub.app.dto.community.content.response.FolderSummaryDto;
import com.unihub.app.services.community.content.FolderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @PatchMapping("/{folderId}")
    public ResponseEntity<FolderSummaryDto> updateFolder(
            @PathVariable UUID folderId,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody UpdateFolderRequestDto requestDto
    ) {
        FolderSummaryDto updated = folderService.updateFolder(folderId, user, requestDto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{folderId}/breadcrumbs")
    public ResponseEntity<List<BreadcrumbDto>> getBreadcrumbs(@PathVariable UUID folderId) {
        List<BreadcrumbDto> breadcrumbs = folderService.getBreadcrumbs(folderId);
        return ResponseEntity.ok(breadcrumbs);
    }

    @DeleteMapping("/{folderId}")
    public ResponseEntity<Void> deleteFolder(
            @PathVariable UUID folderId,
            @AuthenticationPrincipal UserDto user
    ) {
        folderService.deleteFolder(folderId, user);
        return ResponseEntity.noContent().build();
    }
}
