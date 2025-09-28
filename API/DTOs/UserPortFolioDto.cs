using System;

namespace API.DTOs;

public class UserPortFolioDto
{
    public List<PurchaseResponseDTO> Purchases { get; set; } = new();
    public decimal TotalInvested { get; set; }
    public int TotalPositions { get; set; }


}
