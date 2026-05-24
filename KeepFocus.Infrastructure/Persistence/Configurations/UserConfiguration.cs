using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Value_Objects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Infrastructure.Persistence.Configurations
{
    internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> b)
        {
            b.ToTable("users");

            b.HasKey(u => u.Id);
            b.Property(u => u.Id).HasColumnName("id");

            b.Property(u => u.Email)
                .HasColumnName("email")
                .HasMaxLength(320)
                .IsRequired()
                .HasConversion(
                    email => email.Value,
                    raw => Email.Create(raw));

            b.HasIndex(u => u.Email).IsUnique();

            b.Property(u => u.PasswordHash)
                .HasColumnName("password_hash")
                .HasMaxLength(128)
                .IsRequired();

            b.Property(u => u.MagicLinkToken)
                .HasColumnName("magic_link_token")
                .HasMaxLength(128);

            b.Property(u => u.MagicLinkExpiresAt)
                .HasColumnName("magic_link_expires_at");

            b.Property(u => u.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();
        }
    }
}
