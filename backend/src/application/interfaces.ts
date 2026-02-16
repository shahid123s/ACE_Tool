/**
 * Generic Use Case Interface
 * @template I Input DTO
 * @template O Output DTO
 */
export interface IUseCase<I, O> {
    execute(input: I): Promise<O>;
}
