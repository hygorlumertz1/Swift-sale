import { PrismaClient, unidade_medida, nivel_acesso } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

const saltRounds = 12

// 🔐 Hash de senha
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds)
}

// 🔐 Criptografia AES
const key = Buffer.from(process.env.AES_KEY!, 'hex')
const iv = Buffer.from(process.env.AES_IV!, 'hex')
const algorithm = process.env.AES_ALGORITHM!

function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ])
  return encrypted.toString('hex')
}

async function main() {
  // ===============================
  // 📦 PRODUTOS
  // ===============================
  await prisma.cad_produto.createMany({
    data: [
      {
        codigo_barras: '7891000000001',
        nome: 'Arroz Tipo 1',
        descricao: 'Arroz branco tipo 1',
        categoria: 'Grãos',
        unidade_medida: unidade_medida.KG,
        preco_venda: 5.5,
        preco_custo: 3,
        estoque_atual: 200,
        estoque_minimo: 50
      },
      {
        codigo_barras: '7891000000002',
        nome: 'Feijão Carioca',
        descricao: 'Feijão carioca tipo 1',
        categoria: 'Grãos',
        unidade_medida: unidade_medida.KG,
        preco_venda: 7,
        preco_custo: 4.5,
        estoque_atual: 150,
        estoque_minimo: 40
      },
      {
        codigo_barras: '7891000000003',
        nome: 'Café Torrado',
        descricao: 'Café torrado e moído',
        categoria: 'Bebidas',
        unidade_medida: unidade_medida.KG,
        preco_venda: 20,
        preco_custo: 12,
        estoque_atual: 100,
        estoque_minimo: 30
      },
      {
        codigo_barras: '7891000000004',
        nome: 'Óleo de Soja',
        descricao: 'Óleo de soja refinado',
        categoria: 'Óleos e Gorduras',
        unidade_medida: unidade_medida.LITRO,
        preco_venda: 6,
        preco_custo: 3.5,
        estoque_atual: 80,
        estoque_minimo: 20
      },
      {
        codigo_barras: '7891000000005',
        nome: 'Açúcar Cristal',
        descricao: 'Açúcar cristal refinado',
        categoria: 'Doces',
        unidade_medida: unidade_medida.KG,
        preco_venda: 4.5,
        preco_custo: 2.5,
        estoque_atual: 120,
        estoque_minimo: 30
      },
      {
        codigo_barras: '7891000000006',
        nome: 'Sal Refinado',
        descricao: 'Sal refinado iodado',
        categoria: 'Temperos',
        unidade_medida: unidade_medida.KG,
        preco_venda: 2,
        preco_custo: 1,
        estoque_atual: 150,
        estoque_minimo: 40
      },
      {
        codigo_barras: '7891000000007',
        nome: 'Macarrão Espaguete',
        descricao: 'Macarrão tipo espaguete',
        categoria: 'Massas',
        unidade_medida: unidade_medida.KG,
        preco_venda: 3,
        preco_custo: 1.8,
        estoque_atual: 200,
        estoque_minimo: 50
      },
      {
        codigo_barras: '7891000000008',
        nome: 'Molho de Tomate',
        descricao: 'Molho de tomate pronto',
        categoria: 'Condimentos',
        unidade_medida: unidade_medida.LITRO,
        preco_venda: 5,
        preco_custo: 3,
        estoque_atual: 100,
        estoque_minimo: 30
      },
      {
        codigo_barras: '7891000000009',
        nome: 'Farinha de Trigo',
        descricao: 'Farinha de trigo refinada',
        categoria: 'Farinha',
        unidade_medida: unidade_medida.KG,
        preco_venda: 3.5,
        preco_custo: 2,
        estoque_atual: 150,
        estoque_minimo: 40
      },
      {
        codigo_barras: '7891000000010',
        nome: 'Leite Longa Vida',
        descricao: 'Leite UHT',
        categoria: 'Laticínios',
        unidade_medida: unidade_medida.LITRO,
        preco_venda: 4,
        preco_custo: 2.5,
        estoque_atual: 120,
        estoque_minimo: 30
      }
    ]
  })

  // ===============================
  // 👤 USUÁRIO ADMIN
  // ===============================
  await prisma.cad_usuario.create({
    data: {
      nome: encrypt('Administrador'),
      username: encrypt('admin'),
      password: await hashPassword('admin123'),
      email: encrypt('admin@admin.com'),
      cargo: 'Administrador',
      nivel_acesso: nivel_acesso.ADMIN,
      ativo: true
    }
  })

  console.log('✅ Seed executado com sucesso!')
}

main()
  .catch(error => {
    console.error('❌ Erro no seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
