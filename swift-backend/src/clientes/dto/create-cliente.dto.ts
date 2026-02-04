import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateClientesDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'Sobrenome é obrigatório' })
  sobrenome: string;

  @IsString()
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  cpf: string;

  @IsString()
  @IsOptional()
  telefone?: string;
}