package com.rentflow.tenant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TenantRepository extends JpaRepository<Tenant, Long> {
  @Query("""
    select t from Tenant t
    left join t.bed b
    left join b.room r
    left join r.floor f
    where t.property.id = :propertyId
    and (
      lower(t.name) like lower(concat('%', :q, '%'))
      or t.phone like concat('%', :q, '%')
      or t.aadharNumber like concat('%', :q, '%')
      or r.roomNumber like concat('%', :q, '%')
      or cast(f.floorNumber as string) like concat('%', :q, '%')
    )
  """)
  Page<Tenant> search(@Param("propertyId") Long propertyId, @Param("q") String query, Pageable pageable);
}
