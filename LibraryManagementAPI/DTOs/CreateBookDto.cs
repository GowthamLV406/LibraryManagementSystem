namespace LibraryManagementApi.DTOs;

public record CreateBookDto(
    string Title,
    string Author,
    string Isbn,
    string Publisher,
    string Category,
    string Language,
    string ShelfLocation,
    string Description,
    DateTime PublishedDate,
    int TotalCopies
);
