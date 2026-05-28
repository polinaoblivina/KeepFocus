using KeepFocus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Infrastructure.Persistence.Configurations
{
    internal sealed class BoardConfiguration : IEntityTypeConfiguration<Board>
    {
        public void Configure(EntityTypeBuilder<Board> b)
        {
            b.ToTable("boards");

            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");

            b.Property(x => x.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            b.Property(x => x.Title)
                .HasColumnName("title")
                .HasMaxLength(200)
                .IsRequired();

            b.Property(x => x.Description)
                .HasColumnName("description")
                .HasMaxLength(2000);

            b.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at").IsRequired();

            b.HasIndex(x => x.UserId);
            b.Ignore(x => x.Lists);

            b.HasMany<Domain.Entities.List>("_lists")
                .WithOne()
                .HasForeignKey(l => l.BoardId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Navigation("_lists").UsePropertyAccessMode(PropertyAccessMode.Field);
        }
    }

    internal sealed class ListConfiguration : IEntityTypeConfiguration<Domain.Entities.List>
    {
        public void Configure(EntityTypeBuilder<Domain.Entities.List> b)
        {
            b.ToTable("lists");

            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.BoardId).HasColumnName("board_id").IsRequired();

            b.Property(x => x.Title)
                .HasColumnName("title")
                .HasMaxLength(200)
                .IsRequired();

            b.Property(x => x.Position).HasColumnName("position").IsRequired();
            b.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

            b.HasIndex(x => new { x.BoardId, x.Position });
            b.Ignore(x => x.Cards);

            b.HasMany<Card>("_cards")
                .WithOne()
                .HasForeignKey(c => c.ListId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Navigation("_cards").UsePropertyAccessMode(PropertyAccessMode.Field);
        }
    }

    internal sealed class CardConfiguration : IEntityTypeConfiguration<Card>
    {
        public void Configure(EntityTypeBuilder<Card> b)
        {
            b.ToTable("cards");

            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.ListId).HasColumnName("list_id").IsRequired();

            b.Property(x => x.Title)
                .HasColumnName("title")
                .HasMaxLength(500)
                .IsRequired();

            b.Property(x => x.Description)
                .HasColumnName("description")
                .HasMaxLength(5000);

            b.Property(x => x.Position).HasColumnName("position").IsRequired();
            b.Property(x => x.DueDate).HasColumnName("due_date");
            b.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at").IsRequired();

            b.HasIndex(x => new { x.ListId, x.Position });
            b.Ignore(x => x.Checklists);

            b.HasMany<Checklist>("_checklists")
                .WithOne()
                .HasForeignKey(c => c.CardId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Navigation("_checklists").UsePropertyAccessMode(PropertyAccessMode.Field);
        }
    }

    internal sealed class ChecklistConfiguration : IEntityTypeConfiguration<Checklist>
    {
        public void Configure(EntityTypeBuilder<Checklist> b)
        {
            b.ToTable("checklists");

            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.CardId).HasColumnName("card_id").IsRequired();

            b.Property(x => x.Title)
                .HasColumnName("title")
                .HasMaxLength(200)
                .IsRequired();

            b.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

            b.Ignore(x => x.CompletedCount);
            b.Ignore(x => x.TotalCount);
            b.Ignore(x => x.ProgressPercent);
            b.Ignore(x => x.Items);

            b.HasMany<ChecklistItem>("_items")
                .WithOne()
                .HasForeignKey(i => i.ChecklistId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Navigation("_items").UsePropertyAccessMode(PropertyAccessMode.Field);
        }
    }

    internal sealed class ChecklistItemConfiguration : IEntityTypeConfiguration<ChecklistItem>
    {
        public void Configure(EntityTypeBuilder<ChecklistItem> b)
        {
            b.ToTable("checklist_items");

            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.ChecklistId).HasColumnName("checklist_id").IsRequired();

            b.Property(x => x.Content)
                .HasColumnName("content")
                .HasMaxLength(500)
                .IsRequired();

            b.Property(x => x.IsChecked).HasColumnName("is_checked").IsRequired();
            b.Property(x => x.Position).HasColumnName("position").IsRequired();
        }
    }
}
