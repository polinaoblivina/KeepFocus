namespace KeepFocus.Application.Common.Errors 
{
    public sealed class Error
    {
        public string Code { get; }
        public string Message { get; }
        public ErrorType Type { get; }
        private Error(string code, string message, ErrorType type)
        {
            Code = code;
            Message = message;
            Type = type;
        }

        public static Error NotFound(string message, string code = "NOT_FOUND") => new(code, message, ErrorType.NotFound);
        public static Error Validation(string message, string code = "VALIDATION") => new(code, message, ErrorType.Validation);
        public static Error Conflict(string message, string code = "CONFLICT") => new(code, message, ErrorType.Conflict);
        public static Error Unauthorized(string message, string code = "UNAUTHORIZED") => new(code, message, ErrorType.Unauthorized);
        public static Error Forbidden(string message, string code = "FORBIDDEN") => new(code, message, ErrorType.Forbidden);
        public override string ToString() => $"[{Code}] {Message}";
    }

    public enum ErrorType
    {
        NotFound,
        Validation,
        Conflict,
        Unauthorized,
        Forbidden
    }
}

