using System;
using System.Diagnostics.CodeAnalysis;

namespace LibraryManagementApi.Entities
{
    public class Book
    {
        public required string Id { get; init; }
        public required string Title { get; set; }
        public required string Author { get; set; }
        public required string Isbn { get; init; }
        public required string Publisher { get; set; }
        public required string Category { get; set; }
        public required string Language { get; set; }
        public required string ShelfLocation { get; set; }
        public required string Description { get; set; }

        public DateTime PublishedDate { get; set; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; private set; }

        public int TotalCopies { get; set; }
        public int AvailableCopies { get; set; }

        [SetsRequiredMembers]
        public Book(
            string id,
            string title,
            string author,
            string isbn,
            string publisher,
            string category,
            string language,
            string shelfLocation,
            string description,
            DateTime publishedDate,
            DateTime createdAt,
            DateTime updatedAt,
            int totalCopies,
            int availableCopies
        )
        {
            Id = id;
            Title = title;
            Author = author;
            Isbn = isbn;
            Publisher = publisher;
            Category = category;
            Language = language;
            ShelfLocation = shelfLocation;
            Description = description;
            PublishedDate = publishedDate;
            CreatedAt = createdAt;
            UpdatedAt = updatedAt;
            TotalCopies = totalCopies;
            AvailableCopies = availableCopies;
        }
    }
}
