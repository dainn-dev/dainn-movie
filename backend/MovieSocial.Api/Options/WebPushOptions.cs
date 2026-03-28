namespace MovieSocial.Api.Options;

public class WebPushOptions
{
    public const string SectionName = "WebPush";

    /// <summary>mailto: or https: contact for VAPID (RFC requirement).</summary>
    public string Subject { get; set; } = "mailto:admin@localhost";

    public string PublicKey { get; set; } = "";
    public string PrivateKey { get; set; } = "";

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(PublicKey)
        && !string.IsNullOrWhiteSpace(PrivateKey)
        && !string.IsNullOrWhiteSpace(Subject);
}
