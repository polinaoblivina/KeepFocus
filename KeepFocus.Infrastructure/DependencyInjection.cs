using KeepFocus.Domain.Interfaces;
using KeepFocus.Infrastructure.BackgroundJobs;
using KeepFocus.Infrastructure.Persistence;
using KeepFocus.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace KeepFocus.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services,IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("Postgres")
                ?? throw new InvalidOperationException("Connection string 'Postgres' is missing from configuration.");

            services.AddDbContext<AppDbContext>(options =>
                options
                    .UseNpgsql(connectionString)
                    .UseSnakeCaseNamingConvention());

            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IBoardRepository, BoardRepository>();
            services.AddScoped<IFocusSessionRepository, FocusSessionRepository>();

            services.AddHostedService<AbandonStaleSessionsJob>();

            return services;
        }
    }
}
