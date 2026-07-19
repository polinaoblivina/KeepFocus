using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Common.Interfaces
{
    public interface IJwtService
    {
        string GenerateAccessToken(Guid userId, string email);
        string GenerateRefreshToken();
        string HashRefreshToken(string rawToken);
    }
}
