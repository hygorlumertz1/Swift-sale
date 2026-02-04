import React, { useState, useMemo, useEffect, useRef } from "react";
import { Modal, InputGroup, Form, Button, Row, Col } from "react-bootstrap";
import { BsSearch, BsPersonPlus } from "react-icons/bs";
import { Cliente } from "../../models/cliente";

interface ClientSearchModalProps {
  show: boolean;
  onHide: () => void;
  clientes: Cliente[];
  onClientSelect: (cliente: Cliente) => void;
  onCreateClient: (nome: string, sobrenome: string, cpf: string, telefone?: string) => Promise<void>;
}

function ClientSearchModal({
  show,
  onHide,
  clientes,
  onClientSelect,
  onCreateClient,
}: ClientSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoSobrenome, setNovoSobrenome] = useState("");
  const [novoCpf, setNovoCpf] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Foca o input sempre que o modal abrir
  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [show]);

  // Limpa o campo de busca ao fechar o modal
  useEffect(() => {
    if (!show) {
      setSearchTerm("");
      setShowCreateForm(false);
      setNovoNome("");
      setNovoSobrenome("");
      setNovoCpf("");
      setNovoTelefone("");
    }
  }, [show]);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clientes;
    const term = searchTerm.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(term) ||
        (c.sobrenome && c.sobrenome.toLowerCase().includes(term)) ||
        (c.cpf && c.cpf.includes(term)) ||
        (c.telefone && c.telefone.includes(term))
    );
  }, [searchTerm, clientes]);

  const handleClientClick = (cliente: Cliente) => {
    onClientSelect(cliente);
    onHide();
    setSearchTerm("");
  };

  // Formata CPF para exibição
  const formatCPF = (cpf: string | undefined) => {
    if (!cpf) return "Não informado";
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return cpf;
  };

  // Formata CPF enquanto digita
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
      } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, "$1.$2");
      }
      setNovoCpf(value);
    }
  };

  // Valida CPF básico (apenas formato)
  const isValidCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, "");
    return cleaned.length === 11;
  };

  // Formata telefone enquanto digita
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      if (value.length > 10) {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
      } else if (value.length > 6) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
      }
      setNovoTelefone(value);
    }
  };

  // Cria novo cliente
  const handleCreateClient = async () => {
    if (!novoNome.trim()) {
      alert("Por favor, informe o nome do cliente.");
      return;
    }

    if (!novoSobrenome.trim()) {
      alert("Por favor, informe o sobrenome do cliente.");
      return;
    }

    if (!isValidCPF(novoCpf)) {
      alert("Por favor, informe um CPF válido com 11 dígitos.");
      return;
    }

    setIsCreating(true);
    try {
      await onCreateClient(
        novoNome.trim(), 
        novoSobrenome.trim(),
        novoCpf.replace(/\D/g, ""),
        novoTelefone ? novoTelefone.replace(/\D/g, "") : undefined
      );
      setShowCreateForm(false);
      setNovoNome("");
      setNovoSobrenome("");
      setNovoCpf("");
      setNovoTelefone("");
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {showCreateForm ? "Cadastrar Novo Cliente" : "Buscar Cliente"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!showCreateForm ? (
          <>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <BsSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Digite o CPF ou nome do cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={inputRef}
              />
            </InputGroup>

            <div className="d-flex justify-content-end mb-3">
              <Button
                variant="success"
                size="sm"
                onClick={() => setShowCreateForm(true)}
                className="d-flex align-items-center gap-2"
              >
                <BsPersonPlus size={18} />
                Cadastrar Novo Cliente
              </Button>
            </div>

            <div 
              className="list-group" 
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {filteredClients.length > 0 ? (
                filteredClients.map((cliente) => (
                  <button
                    key={cliente.id}
                    type="button"
                    className="list-group-item list-group-item-action text-start"
                    onClick={() => handleClientClick(cliente)}
                  >
                    <div>
                      <strong>
                        {cliente.nome}
                        {cliente.sobrenome && ` ${cliente.sobrenome}`}
                      </strong>
                      <br />
                      <small className="text-muted">CPF: {formatCPF(cliente.cpf)}</small>
                      {cliente.telefone && (
                        <>
                          <br />
                          <small className="text-muted">Tel: {cliente.telefone}</small>
                        </>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-muted py-4">
                  {searchTerm 
                    ? "Nenhum cliente encontrado." 
                    : "Digite para buscar clientes..."}
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nome *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite o nome do cliente"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Sobrenome *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite o sobrenome do cliente"
                  value={novoSobrenome}
                  onChange={(e) => setNovoSobrenome(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>CPF *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="000.000.000-00"
                  value={novoCpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                />
                {novoCpf && !isValidCPF(novoCpf) && (
                  <Form.Text className="text-danger">
                    CPF deve ter 11 dígitos
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Telefone</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={novoTelefone}
                  onChange={handleTelefoneChange}
                  maxLength={15}
                />
              </Form.Group>

              <Row className="mt-4">
                <Col>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNovoNome("");
                      setNovoSobrenome("");
                      setNovoCpf("");
                      setNovoTelefone("");
                    }}
                    className="w-100"
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                </Col>
                <Col>
                  <Button
                    variant="success"
                    onClick={handleCreateClient}
                    className="w-100"
                    disabled={isCreating || !novoNome.trim() || !novoSobrenome.trim() || !isValidCPF(novoCpf)}
                  >
                    {isCreating ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ClientSearchModal;