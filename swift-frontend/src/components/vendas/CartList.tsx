import React from "react";
import { Card, Table, Button } from "react-bootstrap";
import { Produto } from "../../models/produto";
import { MoneyUtils } from "../../utils/money-utils.ts";

interface CartListProps {
  items: (Produto & { quantity: number })[];
  onRemoveItem: (codigoBarras: string) => void;
}

function CartList({ items, onRemoveItem }: CartListProps) {
  const CartItem = ({ item }: { item: Produto & { quantity: number } }) => {
    const precoVenda = Number(item.preco_venda);
    const subtotal = precoVenda * item.quantity;
    
    return (
      <tr>
        <td>{item.nome}</td>
        <td className="text-end">{MoneyUtils.formatarMoeda(precoVenda)}</td>
        <td className="text-center">{item.quantity}</td>
        <td className="text-end fw-bold">{MoneyUtils.formatarMoeda(subtotal)}</td>
        <td className="text-center">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onRemoveItem(item.codigo_barras)}
          >
            X
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <Table hover responsive>
          <thead>
            <tr>
              <th>Produto</th>
              <th className="text-end">Preço Unit.</th>
              <th className="text-center">Qtd.</th>
              <th className="text-end">Subtotal</th>
              <th className="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-5">
                  O carrinho está vazio.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <CartItem key={item.codigo_barras} item={item} />
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default CartList;