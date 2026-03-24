using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace BE_PetWeb_API.Models;

public class PetWebContext : DbContext
{
    public PetWebContext(DbContextOptions<PetWebContext> options)
        : base(options)
    {
    }
    
    public DbSet<StaffSchedule> StaffSchedules { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<BlogPost> BlogPosts { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<MedicalRecord> MedicalRecords { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Pet> Pets { get; set; }
    public DbSet<PetCareReminder> PetCareReminders { get; set; }
    public DbSet<PetGallery> PetGalleries { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Staff> Staff { get; set; }
    public DbSet<StaffService> StaffServices { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Vaccination> Vaccinations { get; set; }
    public DbSet<TemporaryReservation> TemporaryReservations { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Appointments
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.AppointmentId);
            entity.Property(e => e.AppointmentDate).HasColumnType("datetime");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.EndTime).HasColumnType("datetime");
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("Scheduled");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Pet).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.PetId)
                .OnDelete(DeleteBehavior.ClientSetNull);
            entity.HasOne(d => d.Service).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull);
            entity.HasOne(d => d.Staff).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.StaffId);
            entity.HasOne(d => d.User).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // BlogPosts
        modelBuilder.Entity<BlogPost>(entity =>
        {
            entity.HasKey(e => e.PostId);
            entity.Property(e => e.Category)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.FeaturedImage).HasMaxLength(255);
            entity.Property(e => e.PublishDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("Draft");
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ViewCount).HasDefaultValue(0);

            entity.HasOne(d => d.User).WithMany(p => p.BlogPosts)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // Comments
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.CommentId);
            entity.Property(e => e.CommentDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.IsApproved).HasDefaultValue(true);

            entity.HasOne(d => d.Post).WithMany(p => p.Comments)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull);
            entity.HasOne(d => d.User).WithMany(p => p.Comments)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // MedicalRecords
        modelBuilder.Entity<MedicalRecord>(entity =>
        {
            entity.HasKey(e => e.RecordId);
            entity.Property(e => e.Diagnosis).IsRequired();
            entity.Property(e => e.RecordDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Pet).WithMany(p => p.MedicalRecords)
                .HasForeignKey(d => d.PetId)
                .OnDelete(DeleteBehavior.ClientSetNull);
            entity.HasOne(d => d.Staff).WithMany(p => p.MedicalRecords)
                .HasForeignKey(d => d.StaffId);
        });

        // Notifications
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.Message).IsRequired();
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.Type)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // Orders
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId);
            entity.Property(e => e.OrderDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.PaymentMethod)
                .IsRequired()
                .HasMaxLength(20);
            entity.Property(e => e.PaymentStatus)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("Pending");
            entity.Property(e => e.ShippingAddress).IsRequired();
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("Pending");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // OrderItems
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.OrderItemId);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Subtotal).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull);
            entity.HasOne(d => d.Product).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // Pets
        modelBuilder.Entity<Pet>(entity =>
        {
            entity.HasKey(e => e.PetId);
            entity.Property(e => e.Breed).HasMaxLength(100);
            entity.Property(e => e.Color).HasMaxLength(50);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Gender)
                .IsRequired()
                .HasMaxLength(10);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Photo).HasMaxLength(255);
            entity.Property(e => e.Species)
                .IsRequired()
                .HasMaxLength(20);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Weight).HasColumnType("decimal(5, 2)");

            entity.HasOne(d => d.User).WithMany(p => p.Pets)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // PetCareReminders
        modelBuilder.Entity<PetCareReminder>(entity =>
        {
            entity.HasKey(e => e.ReminderId);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Frequency)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("Once");
            entity.Property(e => e.ReminderDate).HasColumnType("datetime");
            entity.Property(e => e.ReminderType)
                .IsRequired()
                .HasMaxLength(20);
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("Active");
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasOne(d => d.Pet).WithMany(p => p.PetCareReminders)
                .HasForeignKey(d => d.PetId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // PetGallery
        modelBuilder.Entity<PetGallery>(entity =>
        {
            entity.HasKey(e => e.GalleryId);
            entity.ToTable("PetGallery");
            entity.Property(e => e.ImageUrl)
                .IsRequired()
                .HasMaxLength(255);
            entity.Property(e => e.UploadDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Pet).WithMany(p => p.PetGalleries)
                .HasForeignKey(d => d.PetId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // Products
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId);
            entity.Property(e => e.Brand).HasMaxLength(100);
            entity.Property(e => e.Category)
                .IsRequired()
                .HasMaxLength(20);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.Photo).HasMaxLength(255);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
        });

        // Reviews
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId);
            entity.Property(e => e.ReviewDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Appointment).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.AppointmentId);
            entity.HasOne(d => d.Order).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.OrderId);
            entity.HasOne(d => d.Product).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.ProductId);
            entity.HasOne(d => d.Service).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.ServiceId);
            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // Services — bảng có trigger cập nhật UpdatedAt; phải khai báo để EF không dùng OUTPUT (lỗi khi INSERT/UPDATE)
        modelBuilder.Entity<Service>(entity =>
        {
            entity.ToTable("Services", t => t.HasTrigger("trg_Services_UpdatedAt"));
            entity.HasKey(e => e.ServiceId);
            entity.Property(e => e.ServiceId).UseIdentityColumn();
            entity.Property(e => e.Category)
                .IsRequired()
                .HasMaxLength(20);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.Photo).HasMaxLength(255);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.BookingCount)
                .ValueGeneratedNever();
            entity.Property(e => e.ViewCount)
                .ValueGeneratedNever();
        });

        // Staff
        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasKey(e => e.StaffId);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Rating)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(3, 2)");
            entity.Property(e => e.Specialization)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.User).WithOne(p => p.Staff)
                .HasForeignKey<Staff>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // StaffSchedules  
        modelBuilder.Entity<StaffSchedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId);
            entity.Property(e => e.Notes).IsRequired();

            entity.HasOne(d => d.Staff).WithMany()
                .HasForeignKey(d => d.StaffId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // StaffServices
        modelBuilder.Entity<StaffService>(entity =>
        {
            entity.HasKey(e => e.StaffServiceId);
            entity.HasIndex(e => new { e.StaffId, e.ServiceId }).IsUnique();

            entity.HasOne(d => d.Service).WithMany(p => p.StaffServices)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull);
            entity.HasOne(d => d.Staff).WithMany(p => p.StaffServices)
                .HasForeignKey(d => d.StaffId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // Users
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Avatar).HasMaxLength(255);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.FullName)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Password)
                .IsRequired()
                .HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Role)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("Customer");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Username)
                .IsRequired()
                .HasMaxLength(50);
        });

        // Vaccinations
        modelBuilder.Entity<Vaccination>(entity =>
        {
            entity.HasKey(e => e.VaccinationId);
            entity.Property(e => e.VaccineName)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasOne(d => d.AdministeredByNavigation).WithMany(p => p.Vaccinations)
                .HasForeignKey(d => d.AdministeredBy);
            entity.HasOne(d => d.Pet).WithMany(p => p.Vaccinations)
                .HasForeignKey(d => d.PetId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // TemporaryReservations
        modelBuilder.Entity<TemporaryReservation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SessionId).IsRequired();
            entity.Property(e => e.UserName).IsRequired();

            entity.HasOne(d => d.Service).WithMany()
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(d => d.Staff).WithMany()
                .HasForeignKey(d => d.StaffId);
        });
    }
}