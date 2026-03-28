using FluentValidation;
using MovieSocial.Api.Models.DTOs;

namespace MovieSocial.Api.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .Length(3, 30)
            .Matches(@"^[a-zA-Z0-9_]+$")
            .WithMessage("Username chỉ được chứa chữ cái, số và dấu gạch dưới (3–30 ký tự).");

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .WithMessage("Email không hợp lệ.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches(@"[A-Z]").WithMessage("Mật khẩu phải có ít nhất 1 chữ hoa.")
            .Matches(@"[0-9]").WithMessage("Mật khẩu phải có ít nhất 1 chữ số.");

        RuleFor(x => x.DisplayName)
            .NotEmpty()
            .MaximumLength(50);
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Username).NotEmpty();
        RuleFor(x => x.Password).NotEmpty();
    }
}
