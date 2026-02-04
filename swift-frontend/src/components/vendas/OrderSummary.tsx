import React, { useState } from "react";
import { Card, Button, Modal, Form } from "react-bootstrap";
import { MoneyUtils } from "../../utils/money-utils.ts";

interface OrderSummaryProps {
  total: number;
  onVoidTransaction: () => void;
  onFinalizeSale: (paymentMethod: string) => void;
  isProcessing?: boolean;
}

function OrderSummary({
  total,
  onVoidTransaction,
  onFinalizeSale,
  isProcessing = false,
}: OrderSummaryProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("dinheiro");
  const [valorRecebido, setValorRecebido] = useState("");
  const [troco, setTroco] = useState(0);

  const handleFinalizeClick = () => {
    if (total > 0) {
      setShowPaymentModal(true);
    }
  };

  const handleConfirmPayment = () => {
    onFinalizeSale(selectedPaymentMethod);
    setShowPaymentModal(false);
    // Limpa os campos após finalizar
    setValorRecebido("");
    setTroco(0);
    setSelectedPaymentMethod("dinheiro");
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
    // Limpa o valor recebido e troco ao trocar de método
    setValorRecebido("");
    setTroco(0);
  };

  const handleValorRecebidoChange = (value: string) => {
    setValorRecebido(value);
    
    if (value) {
      const valorNumerico = MoneyUtils.paraBackend(value);
      const trocoCalculado = valorNumerico - total;
      setTroco(trocoCalculado >= 0 ? trocoCalculado : 0);
    } else {
      setTroco(0);
    }
  };

  const handleModalClose = () => {
    setShowPaymentModal(false);
    setValorRecebido("");
    setTroco(0);
    setSelectedPaymentMethod("dinheiro");
  };

  // Verifica se pode confirmar a venda
  const canConfirmSale = () => {
    if (selectedPaymentMethod === "dinheiro") {
      if (!valorRecebido) return false;
      const valorNumerico = MoneyUtils.paraBackend(valorRecebido);
      return valorNumerico >= total;
    }
    return true; // Para outros métodos, pode confirmar direto
  };

  return (
    <>
      <Card className="shadow-sm h-100">
        <Card.Body className="d-flex flex-column justify-content-between">
          <div>
            <h5 className="text-muted">Valor Total</h5>
            <div className="display-4 text-end fw-bold mb-3">
              {MoneyUtils.formatarMoeda(total)}
            </div>

            <div className="d-grid">
              <Button 
                variant="success" 
                size="lg" 
                onClick={handleFinalizeClick}
                disabled={total === 0 || isProcessing}
              >
                {isProcessing ? "Processando..." : "Finalizar"}
              </Button>
            </div>
          </div>

          <div className="d-grid gap-2 mt-3">
            <Button 
              variant="danger" 
              onClick={onVoidTransaction}
              disabled={isProcessing}
            >
              Cancelar compra
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Modal de confirmação de pagamento */}
      <Modal show={showPaymentModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Pagamento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Forma de Pagamento</Form.Label>
              <Form.Select
                value={selectedPaymentMethod}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
                <option value="pix">PIX</option>
              </Form.Select>
            </Form.Group>

            {/* Campo de valor recebido - apenas para dinheiro */}
            {selectedPaymentMethod === "dinheiro" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Valor Recebido</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex: 100,00"
                    value={valorRecebido}
                    onChange={(e) => handleValorRecebidoChange(e.target.value)}
                    autoFocus
                  />
                  <Form.Text className="text-muted">
                    Digite o valor usando vírgula (ex: 100,00)
                  </Form.Text>
                </Form.Group>

                {/* Exibe o troco se houver */}
                {valorRecebido && (
                  <div className="alert alert-info mb-3">
                    <strong>Troco: {MoneyUtils.formatarMoeda(troco)}</strong>
                  </div>
                )}

                {/* Alerta se o valor for insuficiente */}
                {valorRecebido && MoneyUtils.paraBackend(valorRecebido) < total && (
                  <div className="alert alert-warning mb-3">
                    ⚠️ Valor insuficiente
                  </div>
                )}
              </>
            )}

            <div className="text-center mb-3">
              <h4>Total: {MoneyUtils.formatarMoeda(total)}</h4>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handleConfirmPayment}
            disabled={!canConfirmSale()}
          >
            Confirmar Venda
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default OrderSummary;