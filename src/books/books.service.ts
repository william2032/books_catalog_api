import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Book } from './interfaces/book-interface';
import { CreateBookDto } from './dtos/create-book.dtos';
import { UpdateBookDto } from './dtos/update-book.dtos';

@Injectable()
export class BooksService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<Book[]> {
    try {
      const result = await this.databaseService.query(
        'SELECT * FROM books',
        [],
      );
      return result.rows;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch books');
    }
  }

  async findOne(id: number): Promise<Book> {
    try {
      const result = await this.databaseService.query(
        'SELECT * FROM books WHERE id = $1',
        [id],
      );
      if (result.rows.length == 0) {
        throw new NotFoundException('Book with ID ${id} not found');
      }
      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('ailed to fetch book');
    }
  }

  // Create a new book
  async create(createBookDto: CreateBookDto): Promise<Book> {
    try {
      const { title, author, isbn, publication_year } = createBookDto;
      const result = await this.databaseService.query(
        'INSERT INTO books (title, author, isbn, publication_year) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, author, isbn, publication_year],
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        // Unique violation (duplicate ISBN)
        throw new InternalServerErrorException('ISBN already exists');
      }
      throw new InternalServerErrorException('Failed to create book');
    }
  }

  // Update a book
  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    try {
      const existingBook = await this.findOne(id);
      const { title, author, isbn, publication_year } = updateBookDto;
      const result = await this.databaseService.query(
        `UPDATE books
         SET title            = COALESCE($1, title),
             author           = COALESCE($2, author),
             isbn             = COALESCE($3, isbn),
             publication_year = COALESCE($4, publication_year)
         WHERE id = $5 RETURNING *`,
        [
          title || existingBook.title,
          author || existingBook.author,
          isbn || existingBook.isbn,
          publication_year || existingBook.publication_year,
          id,
        ],
      );
      if (result.rows.length === 0) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.code === '23505') {
        throw new InternalServerErrorException('ISBN already exists');
      }
      throw new InternalServerErrorException('Failed to update book');
    }
  }

  // Delete a book
  async remove(id: number): Promise<void> {
    try {
      const result = await this.databaseService.query(
        'DELETE FROM books WHERE id = $1',
        [id],
      );
      if (result.rowCount === 0) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete book');
    }
  }

  // Count books by publication year using stored procedure
  async countByYear(year: number): Promise<number> {
    try {
      const result = await this.databaseService.query(
        'CALL count_books_by_year($1, NULL)',
        [year],
      );

      // Fetch the OUT parameter result
      const countResult = await this.databaseService.query(
        'SELECT $1 AS count',
        [result.rows[0]?.p_count || 0],
      );
      return countResult.rows[0].count;
    } catch (error) {
      throw new InternalServerErrorException('Failed to count books by year');
    }
  }
}
