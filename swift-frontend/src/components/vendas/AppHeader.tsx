import React, { useRef, useEffect } from "react";
import { Card, Button, Form, InputGroup, Badge } from "react-bootstrap";
import { BsSearch, BsPerson, BsX } from "react-icons/bs";
import { Cliente } from "../../models/cliente";

interface AppHeaderProps {
  onSearchClick: () => void;
  onClientClick: () => void;
  onBarcodeEnter: (codigoBarras: string) => void;
  clienteSelecionado: Cliente | null;
  onRemoveCliente: () => void;
}

function AppHeader({ 
  onSearchClick, 
  onClientClick,
  onBarcodeEnter,
  clienteSelecionado,
  onRemoveCliente
}: AppHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Foca o input quando o header carregar
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputRef.current?.value) {
      onBarcodeEnter(inputRef.current.value);
      inputRef.current.value = "";
    }
  };

  // Formata CPF para exibição
  const formatCPF = (cpf: string | undefined) => {
    if (!cpf) return "";
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return cpf;
  };

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body className="p-2">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          {/* Input direto para código de barras */}
          <InputGroup style={{ maxWidth: "300px" }}>
            <Form.Control
              ref={inputRef}
              placeholder="Digite o código de barras..."
              onKeyPress={handleKeyPress}
            />
            <Button
              variant="outline-primary"
              onClick={() => {
                if (inputRef.current?.value) {
                  onBarcodeEnter(inputRef.current.value);
                  inputRef.current.value = "";
                  inputRef.current.focus();
                }
              }}
            >
              Adicionar
            </Button>
          </InputGroup>

          <div className="d-flex gap-2 align-items-center">
            {/* Exibe cliente selecionado */}
            {clienteSelecionado && (
              <Badge 
                bg="success" 
                className="d-flex align-items-center gap-2 py-2 px-3"
                style={{ fontSize: "0.9rem" }}
              >
                <BsPerson size={18} />
                <span>
                  {clienteSelecionado.nome}
                  {clienteSelecionado.sobrenome && ` ${clienteSelecionado.sobrenome}`}
                  {clienteSelecionado.cpf && (
                    <small className="ms-2 opacity-75">
                      CPF: {formatCPF(clienteSelecionado.cpf)}
                    </small>
                  )}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="text-white p-0 ms-1"
                  onClick={onRemoveCliente}
                  title="Remover cliente"
                >
                  <BsX size={20} />
                </Button>
              </Badge>
            )}

            {/* Botão para buscar produto por nome */}
            <Button
              variant="outline-primary"
              onClick={onSearchClick}
              className="d-flex align-items-center"
            >
              <BsSearch size={20} className="me-2" />
              <span>Buscar Produto</span>
            </Button>

            {/* Botão para buscar cliente */}
            <Button
              variant="outline-success"
              onClick={onClientClick}
              className="d-flex align-items-center"
            >
              <BsPerson size={20} className="me-2" />
              <span>Buscar Cliente</span>
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default AppHeader;