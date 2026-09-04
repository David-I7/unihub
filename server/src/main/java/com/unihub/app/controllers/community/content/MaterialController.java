package com.unihub.app.controllers.community.content;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.UpdateMaterialRequestDto;
import com.unihub.app.dto.community.content.response.BreadcrumbDto;
import com.unihub.app.dto.community.content.response.DownloadUrlResponseDto;
import com.unihub.app.dto.community.content.response.MaterialResponseDto;
import com.unihub.app.services.community.content.MaterialFileService;
import com.unihub.app.services.community.content.ResourceService;
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
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final ResourceService resourceService;
    private final MaterialFileService materialFileService;

    @GetMapping("/{materialId}")
    public ResponseEntity<MaterialResponseDto> getMaterial(@PathVariable UUID materialId) {
        MaterialResponseDto material = resourceService.getMaterialById(materialId);
        return ResponseEntity.ok(material);
    }

    @GetMapping("/{materialId}/download-url")
    public ResponseEntity<DownloadUrlResponseDto> getDownloadUrl(@PathVariable UUID materialId) {
        DownloadUrlResponseDto downloadUrl = materialFileService.getDownloadUrl(materialId);
        return ResponseEntity.ok(downloadUrl);
    }

    @GetMapping("/{materialId}/breadcrumbs")
    public ResponseEntity<List<BreadcrumbDto>> getBreadcrumbs(@PathVariable UUID materialId) {
        List<BreadcrumbDto> breadcrumbs = resourceService.getBreadcrumbs(materialId);
        return ResponseEntity.ok(breadcrumbs);
    }

    @PatchMapping("/{materialId}")
    public ResponseEntity<MaterialResponseDto> updateMaterial(
            @PathVariable UUID materialId,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody UpdateMaterialRequestDto requestDto
    ) {
        MaterialResponseDto updated = resourceService.updateMaterial(materialId, user, requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{materialId}")
    public ResponseEntity<Void> deleteMaterial(
            @PathVariable UUID materialId,
            @AuthenticationPrincipal UserDto user
    ) {
        resourceService.deleteMaterial(materialId, user);
        return ResponseEntity.noContent().build();
    }
}
