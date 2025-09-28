using System;

namespace API.DTOs;

public class CreateAlertDto
{
    public int StockId { get; set; }
    public decimal TargetPrice { get; set; }
    public string? AlertType { get; set; }
}
