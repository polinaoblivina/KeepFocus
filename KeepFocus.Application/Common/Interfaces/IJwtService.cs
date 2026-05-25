using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Common.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(Guid userId, string email);
    }
}
