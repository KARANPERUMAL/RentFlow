package com.rentflow.property;

import java.util.List;

public final class PropertyDtos {
  private PropertyDtos() {}

  public record FloorResponse(Long id, Integer floorNumber, List<RoomResponse> rooms) {}
  public record RoomResponse(Long id, String roomNumber, Integer capacity, long occupied, long available, List<BedResponse> beds) {}
  public record BedResponse(Long id, String label, String status, String tenantName) {}
}
