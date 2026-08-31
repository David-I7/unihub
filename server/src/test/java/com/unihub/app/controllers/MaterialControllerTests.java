package com.unihub.app.controllers;

import com.unihub.app.BaseIntegrationTest;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.UpdateMaterialRequestDto;
import com.unihub.app.dto.community.content.response.DownloadUrlResponseDto;
import com.unihub.app.dto.community.content.response.MaterialFileDto;
import com.unihub.app.dto.community.content.response.MaterialResponseDto;
import com.unihub.app.entities.community.content.ResourceType;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.content.MaterialFileService;
import com.unihub.app.services.community.content.ResourceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
public class MaterialControllerTests extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private ResourceService resourceService;

    @MockitoBean
    private MaterialFileService materialFileService;

    @MockitoBean
    private AuthorizationService authorizationService;

    private UUID userId;
    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        userDto = new UserDto(userId, "david@example.com", "david", false, RoleType.ADMIN);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(authorizationService.safeRequireAuthentication()).thenReturn(auth);
    }

    @Test
    @DisplayName("GET /api/v1/materials/{materialId} returns material")
    public void testGetMaterial_Success() throws Exception {
        UUID materialId = UUID.randomUUID();
        MaterialFileDto fileDto = MaterialFileDto.builder()
                .id(materialId)
                .title("Test File")
                .mediaType("application/pdf")
                .size(1024L)
                .createdAt(OffsetDateTime.now())
                .build();
        MaterialResponseDto responseDto = MaterialResponseDto.builder()
                .type(ResourceType.MATERIAL_FILE)
                .file(fileDto)
                .build();

        when(resourceService.getMaterialById(materialId)).thenReturn(responseDto);

        mockMvc.perform(get("/api/v1/materials/" + materialId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("MATERIAL_FILE"))
                .andExpect(jsonPath("$.file.title").value("Test File"));
    }

    @Test
    @DisplayName("GET /api/v1/materials/{materialId}/download-url returns download url")
    public void testGetDownloadUrl_Success() throws Exception {
        UUID materialId = UUID.randomUUID();
        DownloadUrlResponseDto responseDto = DownloadUrlResponseDto.builder()
                .downloadUrl("http://localhost:8080/download")
                .build();

        when(materialFileService.getDownloadUrl(materialId)).thenReturn(responseDto);

        mockMvc.perform(get("/api/v1/materials/" + materialId + "/download-url"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.downloadUrl").value("http://localhost:8080/download"));
    }

    @Test
    @DisplayName("PATCH /api/v1/materials/{materialId} updates material")
    public void testUpdateMaterial_Success() throws Exception {
        UUID materialId = UUID.randomUUID();
        UpdateMaterialRequestDto requestDto = new UpdateMaterialRequestDto("Updated Title", null, null, null, null, null);
        MaterialFileDto fileDto = MaterialFileDto.builder()
                .id(materialId)
                .title("Updated Title")
                .createdAt(OffsetDateTime.now())
                .build();
        MaterialResponseDto responseDto = MaterialResponseDto.builder()
                .type(ResourceType.MATERIAL_FILE)
                .file(fileDto)
                .build();

        when(resourceService.updateMaterial(eq(materialId), any(UserDto.class), any(UpdateMaterialRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(patch("/api/v1/materials/" + materialId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.file.title").value("Updated Title"));
    }

    @Test
    @DisplayName("DELETE /api/v1/materials/{materialId} deletes material")
    public void testDeleteMaterial_Success() throws Exception {
        UUID materialId = UUID.randomUUID();
        doNothing().when(resourceService).deleteMaterial(eq(materialId), any(UserDto.class));

        mockMvc.perform(delete("/api/v1/materials/" + materialId))
                .andExpect(status().isNoContent());
    }
}
