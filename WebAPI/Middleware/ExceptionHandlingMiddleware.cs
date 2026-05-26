using FluentValidation;
using KeepFocus.Domain.Exceptions;
using System.Text.Json;

namespace KeepFocus.WebAPI.Middleware
{
    public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            int statusCode;
            string message;
            string[] errors;

            switch (exception)
            {
                case ValidationException ve:
                    statusCode = StatusCodes.Status400BadRequest;
                    message = "Validation failed.";
                    errors = ve.Errors.Select(e => e.ErrorMessage).ToArray();
                    break;

                case EntityNotFoundException dne:
                    statusCode = StatusCodes.Status404NotFound;
                    message = dne.Message;
                    errors = Array.Empty<string>();
                    break;

                case DomainException de:
                    statusCode = StatusCodes.Status400BadRequest;
                    message = de.Message;
                    errors = Array.Empty<string>();
                    break;

                default:
                    statusCode = StatusCodes.Status500InternalServerError;
                    message = "An unexpected error occurred.";
                    errors = Array.Empty<string>();
                    break;
            }

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var response = new{status = statusCode, message, errors = errors.Length > 0 ? errors : null};
            await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions{PropertyNamingPolicy = JsonNamingPolicy.CamelCase}));
        }
    }
}