import { IntentRepository, ListIntentsParams } from '@/application/ports/intent-repository'
import { IntentDTO, IntentMapper } from '@/application/dto/intent-dto'
import { IntentStatus } from '@/domain/entities/intent'

export interface ListIntentsInput {
  status?: IntentStatus
  page?: number
  pageSize?: number
}

export interface ListIntentsOutput {
  items: IntentDTO[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export class ListIntentsUseCase {
  constructor(private readonly intentRepository: IntentRepository) {}

  async execute(input: ListIntentsInput): Promise<ListIntentsOutput> {
    const params: ListIntentsParams = {
      status: input.status,
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 20,
    }

    const { items, total } = await this.intentRepository.list(params)

    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const totalPages = Math.ceil(total / pageSize)

    return {
      items: items.map(IntentMapper.toDTO),
      total,
      page,
      pageSize,
      totalPages,
    }
  }
}
