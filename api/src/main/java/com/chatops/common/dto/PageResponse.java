package com.chatops.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> data;
    private PageMeta meta;

    @Getter
    @AllArgsConstructor
    public static class PageMeta {
        private long total;
        private int page;
        private int limit;
        private int totalPages;
    }

    public static <T> PageResponse<T> of(Page<T> page, int requestPage, int requestLimit) {
        return new PageResponse<>(
            page.getContent(),
            new PageMeta(page.getTotalElements(), requestPage, requestLimit, page.getTotalPages())
        );
    }
}
