using Microsoft.EntityFrameworkCore;
using ProductivityApp.API.Models;


namespace ProductivityApp.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) 
        { 
        }

        public DbSet<TaskItem> Tasks => Set<TaskItem>();
        public DbSet<FocusSession> FocusSessions => Set<FocusSession>();
        public DbSet<FocusType> FocusTypes => Set<FocusType>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<FocusType>().HasData(
                new FocusType { Id = "01", Name = "工作" },
                new FocusType { Id = "02", Name = "學習" },
                new FocusType { Id = "03", Name = "日常" },
                new FocusType { Id = "04", Name = "創作" },
                new FocusType { Id = "05", Name = "健康" },
                new FocusType { Id = "06", Name = "休閒" }
            );
        }

    }
}
