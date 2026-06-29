namespace LibraryManagementApi.DTOs;

public record UpdateBookDto(
    string? Title,
    string? Author,
    string? Publisher,
    string? Category,
    string? Language,
    string? ShelfLocation,
    string? Description,
    DateTime? PublishedDate,
    int? TotalCopies,
    int? AvailableCopies
);
