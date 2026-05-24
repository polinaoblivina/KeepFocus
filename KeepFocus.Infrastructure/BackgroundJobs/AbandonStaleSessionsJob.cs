using KeepFocus.Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace KeepFocus.Infrastructure.BackgroundJobs
{
    public sealed class AbandonStaleSessionsJob( IServiceScopeFactory scopeFactory, ILogger<AbandonStaleSessionsJob> logger) : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromSeconds(0);

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await RunAsync(stoppingToken);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    logger.LogError(ex, "Error in {Job}", nameof(AbandonStaleSessionsJob));
                }

                await Task.Delay(Interval, stoppingToken);
            }
        }

        private async Task RunAsync(CancellationToken ct)
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var repo = scope.ServiceProvider.GetRequiredService<IFocusSessionRepository>();

            var staleSessions = await repo.GetTimedOutSessionsAsync(ct);

            if (staleSessions.Count == 0) return;

            logger.LogInformation("Abandoning {Count} stale focus session(s)", staleSessions.Count);

            foreach (var session in staleSessions)
                session.Abandon();

            await repo.SaveChangesAsync(ct);
        }
    }
}
