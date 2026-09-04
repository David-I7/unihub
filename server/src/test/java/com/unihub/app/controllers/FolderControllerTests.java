package com.unihub.app.controllers;

import com.unihub.app.BaseIntegrationTest;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.UpdateFolderRequestDto;
import com.unihub.app.dto.community.content.response.BreadcrumbDto;
import com.unihub.app.dto.community.content.response.FolderSummaryDto;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.content.FolderService;
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
import java.util.List;
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
public class FolderControllerTests extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private FolderService folderService;

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
    @DisplayName("PATCH /api/v1/folders/{folderId} updates folder")
    public void testUpdateFolder_Success() throws Exception {
        UUID folderId = UUID.randomUUID();
        UpdateFolderRequestDto requestDto = new UpdateFolderRequestDto("Updated Name", null, null);
        FolderSummaryDto responseDto = FolderSummaryDto.builder()
                .id(folderId)
                .name("Updated Name")
                .createdAt(OffsetDateTime.now())
                .build();

        when(folderService.updateFolder(eq(folderId), any(UserDto.class), any(UpdateFolderRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(patch("/api/v1/folders/" + folderId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(folderId.toString()))
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    @DisplayName("DELETE /api/v1/folders/{folderId} deletes folder")
    public void testDeleteFolder_Success() throws Exception {
        UUID folderId = UUID.randomUUID();
        doNothing().when(folderService).deleteFolder(eq(folderId), any(UserDto.class));

        mockMvc.perform(delete("/api/v1/folders/" + folderId))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/v1/folders/{folderId}/breadcrumbs returns breadcrumbs list")
    public void testGetBreadcrumbs_Success() throws Exception {
        UUID folderId = UUID.randomUUID();
        List<BreadcrumbDto> responseDtos = List.of(
                BreadcrumbDto.builder().id(folderId).name("Examene").type("FOLDER").build()
        );

        when(folderService.getBreadcrumbs(folderId)).thenReturn(responseDtos);

        mockMvc.perform(get("/api/v1/folders/" + folderId + "/breadcrumbs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(folderId.toString()))
                .andExpect(jsonPath("$[0].name").value("Examene"))
                .andExpect(jsonPath("$[0].type").value("FOLDER"));
    }
}
