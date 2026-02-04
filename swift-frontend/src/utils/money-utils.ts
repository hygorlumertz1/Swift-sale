/**
 * Utilitários para formatação monetária
 * Regra: Sempre armazenar com PONTO no banco, formatar com VÍRGULA no frontend
 */

export const MoneyUtils = {
  /**
   * Formata número para exibição em Reais (com R$)
   * @param valor - Número vindo do backend (com ponto)
   * @returns String formatada "R$ 1.234,56"
   */
  formatarMoeda(valor: number | string): string {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    
    if (isNaN(numero)) {
      return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numero);
  },

  /**
   * Formata número para exibição sem símbolo R$
   * @param valor - Número vindo do backend (com ponto)
   * @returns String formatada "1.234,56"
   */
  formatarNumero(valor: number | string): string {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    
    if (isNaN(numero)) {
      return '0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numero);
  },

  /**
   * Converte string com vírgula (input do usuário) para número (backend)
   * @param valorString - String como "1.234,56" ou "1234,56"
   * @returns Número 1234.56 (pronto para enviar ao backend)
   */
  paraBackend(valorString: string): number {
    if (!valorString) return 0;
    
    // Remove pontos (separador de milhar) e substitui vírgula por ponto
    const valorLimpo = String(valorString)
      .replace(/\./g, '')
      .replace(',', '.');
    
    const numero = parseFloat(valorLimpo);
    return isNaN(numero) ? 0 : numero;
  },

  /**
   * Calcula total de um array de itens
   * @param itens - Array de itens com preço e quantidade
   * @returns Total calculado
   */
  calcularTotal(
    itens: Array<{ preco_venda: number | string; quantity: number }>
  ): number {
    return itens.reduce((total, item) => {
      const preco = typeof item.preco_venda === 'string' 
        ? parseFloat(item.preco_venda) 
        : item.preco_venda;
      
      return total + (preco * item.quantity);
    }, 0);
  }
};