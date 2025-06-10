import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Book } from './interfaces/book-interface';
import { BooksService } from './books.service';
import { CreateBookDto } from './dtos/create-book.dtos';
import { UpdateBookDto } from './dtos/update-book.dtos';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  /**
   * Get
   * /books
   * @returns
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Book[]> {
    return await this.booksService.findAll();
  }

  /**
   * Get
   * /books/:id
   * @param id
   * @returns
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Book> {
    return await this.booksService.findOne(parseInt(id));
  }

  /**
   * Post
   * /books
   * @param createBookDto
   * @returns
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return await this.booksService.create(createBookDto);
  }

  /**
   * Patch
   * /books/:id
   * @param id
   * @param updateBookDto
   * @returns
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return await this.booksService.update(parseInt(id), updateBookDto);
  }

  /**
   * Delete
   * /books/:id
   * @param id
   * @returns
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.booksService.remove(parseInt(id));
    return { message: 'Book deleted successfully' };
  }

  /**
   * Get
   * /books/count/:year
   * @param year
   * @returns
   */
  @Get('count/:year')
  async countByYear(@Param('year') year: string): Promise<{ count: number }> {
    const count = await this.booksService.countByYear(parseInt(year));
    return { count };
  }
}
