import { IsNumber, IsOptional, Min } from 'class-validator';
import { Collection, Document, Filter, WithId } from 'mongodb';
import { StringToNumber } from 'src/common/transforms/transforms';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  results: T[];
  pagination: PaginationMeta;
}

export class PaginationQueryDto {
  @IsOptional()
  @StringToNumber()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @StringToNumber()
  @IsNumber()
  @Min(1)
  pageSize?: number;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  total: number;
  totalResults?: number; // Total de resultados individuales (opcional para mantener compatibilidad)
  page: number;
  pageSize: number;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;

export function getPaginationParams(params: PaginationParams = {}): Required<PaginationParams> {
  return {
    page: Math.max(1, params.page || DEFAULT_PAGE),
    limit: Math.max(1, params.limit || DEFAULT_LIMIT),
  };
}

export function getSkipTake(params: Required<PaginationParams>) {
  return {
    skip: (params.page - 1) * params.limit,
    take: params.limit,
  };
}

export function getPaginationMeta(
  params: Required<PaginationParams>,
  total: number,
): PaginationMeta {
  return {
    page: params.page,
    limit: params.limit,
    total,
    pages: Math.ceil(total / params.limit),
  };
}

export async function paginateQuery<T extends Document>(
  collection: Collection<T>,
  filter: Filter<T>,
  params: PaginationParams = {},
): Promise<PaginatedResponse<WithId<T>>> {
  const pagination = getPaginationParams(params);
  const { skip, take } = getSkipTake(pagination);

  // Get total before applying pagination
  const total = await collection.countDocuments(filter);

  // Apply pagination and get results
  const results = await collection.find(filter).skip(skip).limit(take).toArray();

  return {
    results,
    pagination: getPaginationMeta(pagination, total),
  };
}

export function toApiPaginatedResponse<T>(
  internalResponse: PaginatedResponse<T>,
): ApiPaginatedResponse<T> {
  return {
    data: internalResponse.results,
    total: internalResponse.pagination.total,
    page: internalResponse.pagination.page,
    pageSize: internalResponse.pagination.limit,
  };
}
