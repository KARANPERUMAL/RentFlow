package com.rentflow.property;

import com.rentflow.property.PropertyDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties/current")
@RequiredArgsConstructor
public class PropertyController {
  private final FloorRepository floors;

  @GetMapping("/floors")
  @Transactional(readOnly = true)
  List<FloorResponse> floors() {
    return floors.findByPropertyIdOrderByFloorNumber(1L).stream().map(floor -> new FloorResponse(
        floor.getId(),
        floor.getFloorNumber(),
        floor.getRooms().stream().map(room -> {
          long occupied = room.getBeds().stream().filter(bed -> bed.getTenant() != null).count();
          return new RoomResponse(
              room.getId(),
              room.getRoomNumber(),
              room.getCapacity(),
              occupied,
              room.getCapacity() - occupied,
              room.getBeds().stream().map(bed -> new BedResponse(
                  bed.getId(),
                  bed.getLabel(),
                  bed.getStatus().name(),
                  bed.getTenant() == null ? null : bed.getTenant().getName()
              )).toList()
          );
        }).toList()
    )).toList();
  }
}
