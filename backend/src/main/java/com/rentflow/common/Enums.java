package com.rentflow.common;

public final class Enums {
  private Enums() {}

  public enum Role { OWNER, MANAGER, ACCOUNTANT, DEMO }
  public enum TenantStatus { ACTIVE, LEFT, BLOCKED }
  public enum PaymentStatus { PENDING, PAID, OVERDUE, PARTIAL, PAID_EARLY, PAID_ON_TIME, LATE }
  public enum PaymentMethod { CASH, UPI, BANK }
  public enum BedStatus { EMPTY, OCCUPIED, BLOCKED }
}
