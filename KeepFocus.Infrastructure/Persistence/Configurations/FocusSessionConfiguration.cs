using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Value_Objects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Infrastructure.Persistence.Configurations
{
    internal sealed class FocusSessionConfiguration : IEntityTypeConfiguration<FocusSession>
    {
        public void Configure(EntityTypeBuilder<FocusSession> b)
        {
            b.ToTable("focus_sessions");

            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");

            b.Property(x => x.UserId).HasColumnName("user_id").IsRequired();
            b.Property(x => x.CardId).HasColumnName("card_id");

            b.Property(x => x.Type)
                .HasColumnName("type")
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            b.Property(x => x.Mode)
                .HasColumnName("mode")
                .HasConversion<string>()
                .HasMaxLength(10)
                .IsRequired();

            b.Property(x => x.PlannedDuration)
                .HasColumnName("planned_duration_sec")
                .IsRequired()
                .HasConversion(
                    d => d.Seconds,
                    sec => Duration.Create(sec));

            b.Property(x => x.AccumulatedSeconds)
                .HasColumnName("accumulated_sec")
                .IsRequired();

            b.Property(x => x.LastResumedAt)
                .HasColumnName("last_resumed_at")
                .IsRequired();

            b.Property(x => x.Status)
                .HasColumnName("status")
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            b.Property(x => x.StartedAt).HasColumnName("started_at").IsRequired();
            b.Property(x => x.EndedAt).HasColumnName("ended_at");

            b.HasIndex(x => x.UserId);

            b.HasIndex(x => new { x.UserId, x.Status })
                .HasFilter("status = 'Active'")
                .HasDatabaseName("ix_focus_sessions_user_active");

            b.HasMany<TabEvent>("_tabEvents")
                .WithOne()
                .HasForeignKey(e => e.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Navigation("_tabEvents").UsePropertyAccessMode(PropertyAccessMode.Field);

            b.HasMany<SessionBreak>("_breaks")
                .WithOne()
                .HasForeignKey(br => br.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Navigation("_breaks").UsePropertyAccessMode(PropertyAccessMode.Field);
        }
    }

    internal sealed class TabEventConfiguration : IEntityTypeConfiguration<TabEvent>
    {
        public void Configure(EntityTypeBuilder<TabEvent> b)
        {
            b.ToTable("tab_events");

            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.SessionId).HasColumnName("session_id").IsRequired();

            b.Property(x => x.EventType)
                .HasColumnName("event_type")
                .HasConversion<string>()
                .HasMaxLength(10)
                .IsRequired();

            b.Property(x => x.DurationSeconds).HasColumnName("duration_sec").IsRequired();
            b.Property(x => x.OccurredAt).HasColumnName("occurred_at").IsRequired();

            b.HasIndex(x => x.SessionId);
        }
    }

    internal sealed class SessionBreakConfiguration : IEntityTypeConfiguration<SessionBreak>
    {
        public void Configure(EntityTypeBuilder<SessionBreak> b)
        {
            b.ToTable("session_breaks");

            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.SessionId).HasColumnName("session_id").IsRequired();

            b.Property(x => x.BreakType)
                .HasColumnName("break_type")
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            b.Property(x => x.DurationSeconds).HasColumnName("duration_sec").IsRequired();
            b.Property(x => x.StartedAt).HasColumnName("started_at").IsRequired();

            b.HasIndex(x => x.SessionId);
        }
    }
}