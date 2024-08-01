import { IDomain } from '../../../../domain/abstract.domain'

export abstract class AbstractRepository<T extends IDomain> {
  public abstract create(toCreate: T): Promise<T>;

  public abstract delete(id: string): Promise<boolean>;

  public abstract list(query: any): Promise<T[]>

  public update?(id: { pk: string, sk?: string }, toUpdate: T): Promise<T> {
    throw new Error('No yet implemented !!')
  }

  public get?(id: { pk: string, sk?: string }): Promise<T | null> {
    throw new Error('No yet implemented !!')
  }
}