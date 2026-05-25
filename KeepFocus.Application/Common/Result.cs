using KeepFocus.Application.Common.Errors;

namespace KeepFocus.Application.Common 
{
    public sealed class Result<T>
    {
        public T? Value { get; }
        public Error? Error { get; }
        public bool IsSuccess { get; }
        public bool IsFailure => !IsSuccess;

        private Result(T value)
        {
            Value = value;
            IsSuccess = true;
        }

        private Result(Error error)
        {
            Error = error;
            IsSuccess = false;
        }

        public static Result<T> FromValue(T value) => new(value);
        public static implicit operator Result<T>(T value) => new(value);
        public static implicit operator Result<T>(Error error) => new(error);
    }
    public sealed class Result
    {
        public Error? Error { get; }
        public bool IsSuccess { get; }
        public bool IsFailure => !IsSuccess;
        private Result() => IsSuccess = true;
        private Result(Error error)
        {
            Error = error;
            IsSuccess = false;
        }

        public static readonly Result Ok = new();
        public static Result Fail(Error error) => new(error);

        public static implicit operator Result(Error error) => new(error);
    }
}


