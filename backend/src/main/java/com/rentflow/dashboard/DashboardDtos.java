package com.rentflow.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class DashboardDtos {
  private DashboardDtos() {}

  public record DashboardResponse(String greeting, String ownerName, String pgName, LocalDate today, Metrics metrics, List<String> recentActivities) {}
  public record Metrics(long todayDue, long tomorrowDue, long upcoming7Days, long overdue, long totalTenants, long occupiedBeds, long vacantBeds, BigDecimal monthlyRevenue, BigDecimal collectedRevenue, BigDecimal pendingRevenue, int occupancyPercent) {}
}
