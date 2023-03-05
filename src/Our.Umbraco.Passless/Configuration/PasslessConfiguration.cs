using System.ComponentModel.DataAnnotations;

namespace Our.Umbraco.Passless.Configuration;

public class PasslessConfiguration
{
    public bool DenyLocalLogin { get; set; } = false;
}
