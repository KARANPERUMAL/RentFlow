package com.rentflow.tenant;

import com.rentflow.tenant.TenantDtos.TenantResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {
  private final TenantRepository tenants;
  private final TenantMapper mapper;

  @GetMapping
  @Transactional(readOnly = true)
  Page<TenantResponse> list(@RequestParam(defaultValue = "") String q,
                            @RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "25") int size,
                            @RequestParam(defaultValue = "name") String sort) {
    return tenants.search(1L, q, PageRequest.of(page, size, Sort.by(sort))).map(mapper::toResponse);
  }
}
